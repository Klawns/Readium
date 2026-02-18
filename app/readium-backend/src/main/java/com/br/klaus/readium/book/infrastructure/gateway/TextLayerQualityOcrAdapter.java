package com.br.klaus.readium.book.infrastructure.gateway;

import com.br.klaus.readium.book.Book;
import com.br.klaus.readium.book.OcrGatewayResult;
import com.br.klaus.readium.book.domain.port.OcrGatewayPort;
import com.br.klaus.readium.exception.StorageException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@Slf4j
public class TextLayerQualityOcrAdapter implements OcrGatewayPort {

    @Value("${app.ocr.sample-pages:10}")
    private int samplePages;

    @Value("${app.ocr.engine:HEURISTIC}")
    private String ocrEngine;

    @Value("${app.ocr.ocrmypdf.command:ocrmypdf}")
    private String ocrmypdfCommand;

    @Value("${app.ocr.ocrmypdf.languages:eng}")
    private String ocrmypdfLanguages;

    @Value("${app.ocr.ocrmypdf.timeout-seconds:1800}")
    private long ocrmypdfTimeoutSeconds;

    @Value("${app.storage.path:data/books}")
    private String storagePath;

    @Override
    public OcrGatewayResult process(Book book) {
        if (book.getBookFormat() == Book.BookFormat.EPUB) {
            return new OcrGatewayResult(null, 100.0);
        }

        if (book.getBookFormat() != Book.BookFormat.PDF) {
            return new OcrGatewayResult(null, 0.0);
        }

        File inputFile = new File(book.getFilePath());
        if (!inputFile.exists()) {
            throw new StorageException("Arquivo do livro nao encontrado para OCR: " + book.getFilePath());
        }

        String processedFilePath = null;
        String scoreFilePath = book.getFilePath();

        if ("OCRMYPDF".equalsIgnoreCase(ocrEngine)) {
            processedFilePath = runOcrmypdf(inputFile.toPath());
            if (processedFilePath != null) {
                scoreFilePath = processedFilePath;
            }
        }

        double score = computePdfTextLayerScore(scoreFilePath);
        return new OcrGatewayResult(processedFilePath, score);
    }

    private String runOcrmypdf(Path inputPath) {
        try {
            Path outputDir = Paths.get(storagePath, "ocr");
            Files.createDirectories(outputDir);

            Path outputPath = outputDir.resolve(UUID.randomUUID() + ".pdf");

            List<String> command = new ArrayList<>(tokenizeCommand(ocrmypdfCommand));
            if (command.isEmpty()) {
                command.add("ocrmypdf");
            }
            command.add("--skip-text");
            command.add("--rotate-pages");
            command.add("--deskew");
            command.add("--optimize");
            command.add("1");
            if (ocrmypdfLanguages != null && !ocrmypdfLanguages.isBlank()) {
                command.add("-l");
                command.add(ocrmypdfLanguages.trim());
            }
            command.add(inputPath.toString());
            command.add(outputPath.toString());

            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);

            Process process = pb.start();
            boolean finished = process.waitFor(ocrmypdfTimeoutSeconds, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                log.warn("OCRmyPDF timeout excedido para arquivo {}", inputPath);
                return null;
            }

            int exitCode = process.exitValue();
            if (exitCode != 0) {
                log.warn("OCRmyPDF retornou codigo {} para arquivo {}", exitCode, inputPath);
                return null;
            }

            if (!Files.exists(outputPath)) {
                log.warn("OCRmyPDF finalizou sem gerar arquivo de saida: {}", outputPath);
                return null;
            }

            return outputPath.toAbsolutePath().toString();
        } catch (IOException e) {
            log.warn("OCRmyPDF nao disponivel ou falhou ao iniciar: {}", e.getMessage());
            return null;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("OCRmyPDF interrompido para arquivo {}", inputPath);
            return null;
        }
    }

    private double computePdfTextLayerScore(String pdfPath) {
        File file = new File(pdfPath);
        if (!file.exists()) {
            throw new StorageException("Arquivo PDF nao encontrado para analise de OCR: " + pdfPath);
        }

        try (PDDocument document = Loader.loadPDF(file)) {
            int totalPages = document.getNumberOfPages();
            if (totalPages <= 0) {
                return 0.0;
            }

            int pagesToInspect = Math.min(Math.max(samplePages, 1), totalPages);
            int pagesWithText = 0;
            PDFTextStripper stripper = new PDFTextStripper();

            for (int page = 1; page <= pagesToInspect; page++) {
                stripper.setStartPage(page);
                stripper.setEndPage(page);
                String pageText = stripper.getText(document);
                int textLength = pageText == null ? 0 : pageText.replaceAll("\\s+", "").length();
                if (textLength >= 20) {
                    pagesWithText++;
                }
            }

            double score = ((double) pagesWithText / pagesToInspect) * 100.0;
            return round(score);
        } catch (IOException e) {
            log.error("Falha ao calcular score de qualidade de texto para PDF {}", pdfPath, e);
            throw new StorageException("Erro ao analisar PDF para OCR", e);
        }
    }

    private double round(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private List<String> tokenizeCommand(String rawCommand) {
        List<String> tokens = new ArrayList<>();
        if (rawCommand == null || rawCommand.isBlank()) {
            return tokens;
        }

        Matcher matcher = Pattern.compile("\"([^\"]+)\"|(\\S+)").matcher(rawCommand.trim());
        while (matcher.find()) {
            if (matcher.group(1) != null) {
                tokens.add(matcher.group(1));
            } else {
                tokens.add(matcher.group(2));
            }
        }
        return tokens;
    }
}
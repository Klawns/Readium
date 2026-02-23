package com.br.klaus.readium.book.infrastructure.gateway;

import com.br.klaus.readium.book.domain.model.Book;
import com.br.klaus.readium.book.domain.model.OcrGatewayResult;
import com.br.klaus.readium.book.domain.port.OcrGatewayPort;
import com.br.klaus.readium.exception.StorageException;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.File;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@Slf4j
public class TextLayerQualityOcrAdapter implements OcrGatewayPort {

    private static final int MIN_OCR_TIMEOUT_SECONDS = 60;
    private static final int MAX_PROCESS_OUTPUT_CHARS = 12000;

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
            scoreFilePath = processedFilePath;
        }

        double score = computePdfTextLayerScore(scoreFilePath);
        return new OcrGatewayResult(processedFilePath, score);
    }

    private String runOcrmypdf(Path inputPath) {
        Instant start = Instant.now();
        try {
            Path outputDir = Paths.get(storagePath, "ocr");
            Files.createDirectories(outputDir);

            Path outputPath = outputDir.resolve(UUID.randomUUID() + ".pdf");
            List<String> command = buildOcrmypdfCommand(inputPath, outputPath);

            long timeoutSeconds = Math.max(ocrmypdfTimeoutSeconds, MIN_OCR_TIMEOUT_SECONDS);
            log.info("Executando OCRmyPDF para {} com timeout={}s e idiomas='{}'", inputPath, timeoutSeconds, ocrmypdfLanguages);
            log.debug("Comando OCRmyPDF: {}", command);

            ProcessBuilder pb = new ProcessBuilder(command);
            pb.redirectErrorStream(true);

            Process process = pb.start();
            StringBuilder outputBuffer = new StringBuilder();
            Thread outputReader = startOutputReader(process, outputBuffer);

            boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                process.waitFor(10, TimeUnit.SECONDS);
                joinOutputReader(outputReader);
                String outputTail = summarizeOutput(outputBuffer);
                throw new StorageException("OCRmyPDF timeout apos " + timeoutSeconds + "s. Saida: " + outputTail);
            }

            joinOutputReader(outputReader);
            int exitCode = process.exitValue();
            if (exitCode != 0) {
                String outputTail = summarizeOutput(outputBuffer);
                throw new StorageException("OCRmyPDF finalizou com codigo " + exitCode + ". Saida: " + outputTail);
            }

            if (!Files.exists(outputPath)) {
                String outputTail = summarizeOutput(outputBuffer);
                throw new StorageException("OCRmyPDF finalizou sem arquivo de saida. Saida: " + outputTail);
            }

            long elapsed = Duration.between(start, Instant.now()).toSeconds();
            log.info("OCRmyPDF concluido para {} em {}s", inputPath, elapsed);
            return outputPath.toAbsolutePath().toString();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new StorageException("Processamento OCR interrompido.", e);
        } catch (IOException e) {
            throw new StorageException("Falha ao iniciar OCRmyPDF. Verifique APP_OCRMYPDF_COMMAND.", e);
        }
    }

    private List<String> buildOcrmypdfCommand(Path inputPath, Path outputPath) {
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
        return command;
    }

    private Thread startOutputReader(Process process, StringBuilder outputBuffer) {
        Thread reader = new Thread(() -> {
            try (BufferedReader bufferedReader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = bufferedReader.readLine()) != null) {
                    appendOutput(outputBuffer, line);
                }
            } catch (IOException ignored) {
                // Sem acao necessaria; processo ja esta sendo tratado no fluxo principal.
            }
        }, "ocrmypdf-output-reader");
        reader.setDaemon(true);
        reader.start();
        return reader;
    }

    private void joinOutputReader(Thread outputReader) {
        try {
            outputReader.join(2000);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
        }
    }

    private void appendOutput(StringBuilder outputBuffer, String line) {
        if (outputBuffer.length() >= MAX_PROCESS_OUTPUT_CHARS) {
            return;
        }

        int remaining = MAX_PROCESS_OUTPUT_CHARS - outputBuffer.length();
        if (line.length() >= remaining) {
            outputBuffer.append(line, 0, Math.max(0, remaining));
            return;
        }
        outputBuffer.append(line).append(System.lineSeparator());
    }

    private String summarizeOutput(StringBuilder outputBuffer) {
        if (outputBuffer.length() == 0) {
            return "(sem saida do processo)";
        }

        String output = outputBuffer.toString().trim().replaceAll("\\s+", " ");
        if (output.length() <= 400) {
            return output;
        }
        return output.substring(output.length() - 400);
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


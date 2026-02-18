package com.br.klaus.readium.storage;

import com.br.klaus.readium.exception.StorageException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.nio.file.StandardOpenOption;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.storage.path}")
    private String uploadDir;
    
    private Path coversDir;

    @PostConstruct
    public void init() {
        try {
            Path root = Paths.get(uploadDir);
            this.coversDir = root.resolve("covers");
            Files.createDirectories(root);
            Files.createDirectories(coversDir);
        } catch (IOException e) {
            throw new StorageException("Não foi possível inicializar o diretório de armazenamento", e);
        }
    }

    public record StoredFile(String path, String sha256, long sizeBytes) {}

    public String save(MultipartFile file) {
        return saveWithChecksum(file).path();
    }

    public StoredFile saveWithChecksum(MultipartFile file) {
        Path destinationFile = null;
        try {
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String extension = "";
            if (originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String storageFilename = UUID.randomUUID() + extension;

            Path root = Paths.get(uploadDir);
            if (!Files.exists(root)) {
                 Files.createDirectories(root);
            }

            destinationFile = root.resolve(storageFilename).normalize().toAbsolutePath();

            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            long sizeBytes;
            try (InputStream inputStream = file.getInputStream();
                 DigestInputStream digestInputStream = new DigestInputStream(inputStream, digest);
                 OutputStream outputStream = Files.newOutputStream(
                         destinationFile,
                         StandardOpenOption.CREATE_NEW,
                         StandardOpenOption.WRITE
                 )) {
                sizeBytes = digestInputStream.transferTo(outputStream);
            }

            String sha256 = HexFormat.of().formatHex(digest.digest());
            return new StoredFile(destinationFile.toString(), sha256, sizeBytes);

        } catch (NoSuchAlgorithmException e) {
            throw new StorageException("Algoritmo de hash SHA-256 nao disponivel", e);
        } catch (IOException e) {
            if (destinationFile != null) {
                try {
                    Files.deleteIfExists(destinationFile);
                } catch (IOException ignored) {
                    // keep original exception
                }
            }
            throw new StorageException("Erro ao salvar arquivo", e);
        }
    }
    
    public String saveCover(byte[] imageBytes, String extension) {
        try {
            String storageFilename = UUID.randomUUID() + "." + extension;
            Path destinationFile = coversDir.resolve(storageFilename).normalize().toAbsolutePath();
            Files.write(destinationFile, imageBytes);
            return destinationFile.toString();
        } catch (IOException e) {
            throw new StorageException("Erro ao salvar capa", e);
        }
    }

    public UrlResource load(String path) {
        try {
            Path filePath = Paths.get(path);
            if (!Files.exists(filePath)) {
                throw new StorageException("Arquivo não encontrado");
            }
            return new UrlResource(filePath.toUri());
        } catch (MalformedURLException e) {
            throw new StorageException("Erro ao carregar arquivo", e);
        }
    }

    public void delete(String path) {
        if (path == null) return;
        try {
            Files.deleteIfExists(Paths.get(path));
        } catch (IOException e) {
            throw new StorageException("Erro ao deletar arquivo", e);
        }
    }
}

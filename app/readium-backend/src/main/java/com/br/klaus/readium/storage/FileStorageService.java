package com.br.klaus.readium.storage;

import com.br.klaus.readium.exception.StorageException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.security.DigestInputStream;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@Slf4j
public class FileStorageService {
    private static final Pattern SAFE_EXTENSION_PATTERN = Pattern.compile("[a-z0-9]{1,10}");
    private static final String DEFAULT_COVER_EXTENSION = "jpg";

    @Value("${app.storage.path}")
    private String uploadDir;

    private Path storageRoot;
    private Path coversDir;

    @PostConstruct
    public void init() {
        try {
            this.storageRoot = Paths.get(uploadDir).normalize().toAbsolutePath();
            this.coversDir = storageRoot.resolve("covers").normalize().toAbsolutePath();
            Files.createDirectories(storageRoot);
            Files.createDirectories(coversDir);
        } catch (IOException e) {
            throw new StorageException("Nao foi possivel inicializar o diretorio de armazenamento", e);
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
            destinationFile = resolvePathInsideStorageRoot(storageFilename);
            Files.createDirectories(storageRoot);

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
                    // Keep original exception
                }
            }
            throw new StorageException("Erro ao salvar arquivo", e);
        }
    }

    public String saveCover(byte[] imageBytes, String extension) {
        try {
            String storageFilename = UUID.randomUUID() + "." + sanitizeCoverExtension(extension);
            Path destinationFile = resolvePathInsideStorageRoot(coversDir.resolve(storageFilename));
            Files.write(destinationFile, imageBytes);
            return destinationFile.toString();
        } catch (IOException e) {
            throw new StorageException("Erro ao salvar capa", e);
        }
    }

    public UrlResource load(String path) {
        try {
            Path filePath = resolveStoredPath(path);
            if (!Files.exists(filePath)) {
                throw new StorageException("Arquivo nao encontrado");
            }
            return new UrlResource(filePath.toUri());
        } catch (MalformedURLException e) {
            throw new StorageException("Erro ao carregar arquivo", e);
        }
    }

    public void delete(String path) {
        if (!StringUtils.hasText(path)) {
            return;
        }

        try {
            Path filePath = resolveStoredPath(path);
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            throw new StorageException("Erro ao deletar arquivo", e);
        }
    }

    private Path resolveStoredPath(String rawPath) {
        Path raw = Paths.get(rawPath);
        Path resolved = raw.isAbsolute()
                ? raw.normalize().toAbsolutePath()
                : storageRoot.resolve(raw).normalize().toAbsolutePath();
        return resolvePathInsideStorageRoot(resolved);
    }

    private Path resolvePathInsideStorageRoot(String relativePath) {
        return resolvePathInsideStorageRoot(storageRoot.resolve(relativePath).normalize().toAbsolutePath());
    }

    private Path resolvePathInsideStorageRoot(Path candidatePath) {
        Path normalized = candidatePath.normalize().toAbsolutePath();
        if (!normalized.startsWith(storageRoot)) {
            log.warn("Tentativa de acesso fora do diretorio de storage: {}", normalized);
            throw new StorageException("Caminho de arquivo invalido");
        }
        return normalized;
    }

    private String sanitizeCoverExtension(String extension) {
        if (!StringUtils.hasText(extension)) {
            return DEFAULT_COVER_EXTENSION;
        }

        String normalized = extension.trim().toLowerCase(Locale.ROOT).replace(".", "");
        if (!SAFE_EXTENSION_PATTERN.matcher(normalized).matches()) {
            return DEFAULT_COVER_EXTENSION;
        }
        return normalized;
    }
}

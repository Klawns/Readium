package com.br.klaus.readium.storage;

import com.br.klaus.readium.exception.StorageException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    public String save(MultipartFile file) {
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

            Path destinationFile = root.resolve(storageFilename).normalize().toAbsolutePath();
            file.transferTo(destinationFile);

            return destinationFile.toString();

        } catch (IOException e) {
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

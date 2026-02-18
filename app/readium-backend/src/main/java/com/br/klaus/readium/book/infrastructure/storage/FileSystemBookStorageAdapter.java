package com.br.klaus.readium.book.infrastructure.storage;

import com.br.klaus.readium.book.domain.port.BookStoragePort;
import com.br.klaus.readium.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

@Component
@RequiredArgsConstructor
public class FileSystemBookStorageAdapter implements BookStoragePort {

    private final FileStorageService fileStorageService;

    @Override
    public StoredFile saveWithChecksum(MultipartFile file) {
        FileStorageService.StoredFile storedFile = fileStorageService.saveWithChecksum(file);
        return new StoredFile(storedFile.path(), storedFile.sha256(), storedFile.sizeBytes());
    }

    @Override
    public String saveCover(byte[] imageBytes, String extension) {
        return fileStorageService.saveCover(imageBytes, extension);
    }

    @Override
    public Resource load(String path) {
        return fileStorageService.load(path);
    }

    @Override
    public void delete(String path) {
        fileStorageService.delete(path);
    }
}
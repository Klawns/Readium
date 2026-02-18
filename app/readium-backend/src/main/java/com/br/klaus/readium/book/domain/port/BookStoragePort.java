package com.br.klaus.readium.book.domain.port;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface BookStoragePort {

    StoredFile saveWithChecksum(MultipartFile file);

    String saveCover(byte[] imageBytes, String extension);

    Resource load(String path);

    void delete(String path);

    record StoredFile(String path, String sha256, long sizeBytes) {
    }
}
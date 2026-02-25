package com.br.klaus.readium.sync.application;

import com.br.klaus.readium.sync.domain.port.IdempotentOperationRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class IdempotentOperationRetentionService {

    private final IdempotentOperationRepositoryPort repository;

    @Transactional
    public int purgeOlderThanDays(long retentionDays) {
        if (retentionDays < 1) {
            throw new IllegalArgumentException("Retencao invalida para idempotencia. Use pelo menos 1 dia.");
        }

        LocalDateTime threshold = LocalDateTime.now().minusDays(retentionDays);
        return repository.deleteCreatedBefore(threshold);
    }
}

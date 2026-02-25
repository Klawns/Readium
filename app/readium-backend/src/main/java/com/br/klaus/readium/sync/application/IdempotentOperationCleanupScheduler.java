package com.br.klaus.readium.sync.application;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class IdempotentOperationCleanupScheduler {

    private final IdempotentOperationRetentionService retentionService;

    @Value("${app.sync.idempotency.cleanup.enabled:true}")
    private boolean cleanupEnabled;

    @Value("${app.sync.idempotency.cleanup.retention-days:15}")
    private long retentionDays;

    @Scheduled(fixedDelayString = "${app.sync.idempotency.cleanup.fixed-delay-ms:1296000000}")
    public void cleanupExpiredIdempotentOperations() {
        if (!cleanupEnabled) {
            return;
        }

        int deletedCount = retentionService.purgeOlderThanDays(retentionDays);
        if (deletedCount > 0) {
            log.info(
                    "Limpeza de idempotencia removeu {} registro(s) com mais de {} dia(s).",
                    deletedCount,
                    retentionDays
            );
        }
    }
}

package com.br.klaus.readium.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

@Configuration
public class AsyncExecutorConfig {

    @Bean(name = "ocrTaskExecutor")
    public Executor ocrTaskExecutor(
            @Value("${app.ocr.async.core-pool-size:1}") int corePoolSize,
            @Value("${app.ocr.async.max-pool-size:2}") int maxPoolSize,
            @Value("${app.ocr.async.queue-capacity:8}") int queueCapacity
    ) {
        return buildExecutor("ocr-worker-", corePoolSize, maxPoolSize, queueCapacity);
    }

    @Bean(name = "metadataTaskExecutor")
    public Executor metadataTaskExecutor(
            @Value("${app.metadata.async.core-pool-size:1}") int corePoolSize,
            @Value("${app.metadata.async.max-pool-size:2}") int maxPoolSize,
            @Value("${app.metadata.async.queue-capacity:16}") int queueCapacity
    ) {
        return buildExecutor("metadata-worker-", corePoolSize, maxPoolSize, queueCapacity);
    }

    private Executor buildExecutor(
            String threadNamePrefix,
            int corePoolSize,
            int maxPoolSize,
            int queueCapacity
    ) {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setThreadNamePrefix(threadNamePrefix);
        executor.setCorePoolSize(Math.max(1, corePoolSize));
        executor.setMaxPoolSize(Math.max(1, maxPoolSize));
        executor.setQueueCapacity(Math.max(0, queueCapacity));
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}

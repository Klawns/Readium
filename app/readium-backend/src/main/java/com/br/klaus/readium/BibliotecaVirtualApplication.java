package com.br.klaus.readium;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

import java.io.File;

@EnableAsync
@EnableCaching
@SpringBootApplication
public class BibliotecaVirtualApplication {

    public static void main(String[] args) {
        createDirectories();
        SpringApplication.run(BibliotecaVirtualApplication.class, args);
    }

    private static void createDirectories() {
        new File("data/db").mkdirs();
        new File("data/books").mkdirs();
    }

}

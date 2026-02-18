package com.br.klaus.readium;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;

class ModularityVerificationTests {

    @Test
    void shouldVerifyApplicationModuleBoundaries() {
        ApplicationModules.of(BibliotecaVirtualApplication.class).verify();
    }
}

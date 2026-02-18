@org.springframework.modulith.ApplicationModule(
        displayName = "Annotations",
        allowedDependencies = {
                "book::api",
                "book::events",
                "exception"
        }
)
package com.br.klaus.readium.annotations;

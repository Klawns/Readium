@org.springframework.modulith.ApplicationModule(
        displayName = "Annotations",
        allowedDependencies = {
                "book::api",
                "book::events",
                "exception",
                "sync::api"
        }
)
package com.br.klaus.readium.annotations;

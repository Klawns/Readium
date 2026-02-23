@org.springframework.modulith.ApplicationModule(
        displayName = "Collections",
        allowedDependencies = {
                "book::api",
                "book::events",
                "exception"
        }
)
package com.br.klaus.readium.collection;


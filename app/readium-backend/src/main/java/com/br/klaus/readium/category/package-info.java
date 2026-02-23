@org.springframework.modulith.ApplicationModule(
        displayName = "Categories",
        allowedDependencies = {
                "book::api",
                "book::events",
                "exception"
        }
)
package com.br.klaus.readium.category;

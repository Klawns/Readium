@org.springframework.modulith.ApplicationModule(
        displayName = "Books",
        allowedDependencies = {
                "exception",
                "storage",
                "sync::api"
        }
)
package com.br.klaus.readium.book;

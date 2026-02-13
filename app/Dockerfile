# syntax=docker/dockerfile:1.7

# ========================
# Stage 1 - Build Frontend
# ========================
FROM node:20-alpine AS frontend-build
WORKDIR /frontend

COPY readium-frontend/package.json readium-frontend/package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

COPY readium-frontend .
RUN npm run build

# ========================
# Stage 2 - Build Backend
# ========================
FROM maven:3.9.6-eclipse-temurin-21-alpine AS backend-build
WORKDIR /backend

COPY readium-backend/pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -B -DskipTests dependency:go-offline
COPY readium-backend .
RUN --mount=type=cache,target=/root/.m2 mvn -B clean package -DskipTests

# ========================
# Stage 3 - Runtime Common
# ========================
FROM eclipse-temurin:21-jre-jammy AS runtime-common
WORKDIR /app

RUN groupadd --system spring && useradd --system --gid spring --create-home spring

COPY --from=backend-build /backend/target/*.jar app.jar
COPY --from=frontend-build /frontend/dist /app/static

RUN mkdir -p /app/data/db /app/data/books /app/data/books/ocr && \
    chown -R spring:spring /app

EXPOSE 7717

# ========================
# Stage 4a - Runtime Base
# ========================
FROM runtime-common AS runtime-base
ENV APP_OCR_ENGINE=HEURISTIC
USER spring
ENTRYPOINT ["java", "-jar", "app.jar"]

# ========================
# Stage 4b - Runtime OCR
# ========================
FROM runtime-common AS runtime-ocr
RUN apt-get update && apt-get install -y --no-install-recommends \
    ocrmypdf \
    tesseract-ocr \
    tesseract-ocr-eng \
    tesseract-ocr-por \
    ghostscript && \
    rm -rf /var/lib/apt/lists/*

ENV APP_OCR_ENGINE=OCRMYPDF
ENV APP_OCRMYPDF_COMMAND=ocrmypdf
ENV APP_OCRMYPDF_LANGUAGES=eng+por

USER spring
ENTRYPOINT ["java", "-jar", "app.jar"]

# Readium Backend

API Spring Boot (self-hosted) para biblioteca de livros, anotações, traduções e OCR.

## O que faz

- Upload/listagem de livros (PDF/EPUB)
- Progresso e status de leitura
- Anotações por página
- Tradução persistida + tradução automática (`/api/translations/auto`)
- OCR assíncrono por livro (`/api/books/{id}/ocr`)

## Rodar local

```powershell
cd D:\Projetos\Readium\app\readium-backend
.\mvnw spring-boot:run
```

API em `http://localhost:7717` (base `/api`).

## Testes

```powershell
cd D:\Projetos\Readium\app\readium-backend
.\mvnw test
```

## Variáveis de ambiente

Arquivo de exemplo: `readium-backend/.env.example`.

Principais:

- `APP_PORT`
- `APP_DATABASE_URL`
- `APP_STORAGE_PATH`
- `APP_TRANSLATION_PROVIDER` (`MYMEMORY` ou `LIBRETRANSLATE`)
- `APP_OCR_ENGINE` (`HEURISTIC` ou `OCRMYPDF`)
- `APP_OCRMYPDF_COMMAND`
- `APP_OCRMYPDF_LANGUAGES`

## Contrato da API

- OpenAPI: `readium-backend/openapi.yaml`

## Auth

- Sem autenticação por padrão (self-hosted).

## Docker (raiz do workspace)

O Dockerfile da raiz gera duas imagens finais:

- `runtime-base` (sem OCR pesado)
- `runtime-ocr` (com OCRmyPDF + Tesseract + Ghostscript)

Build:

```powershell
cd D:\Projetos\Readium\app
docker build --target runtime-base -t readium-backend:base .
docker build --target runtime-ocr -t readium-backend:ocr .
```

Compose:

```powershell
cd D:\Projetos\Readium\app
docker compose up --build
```

Com OCR:

```powershell
cd D:\Projetos\Readium\app
$env:READIUM_DOCKER_TARGET="runtime-ocr"
docker compose up --build
```

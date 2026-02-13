# Readium

Readium e uma aplicacao self-hosted para biblioteca digital, leitura no navegador e apoio de OCR/traducao.

## Funcionalidades
- Biblioteca de livros com upload, busca, filtro e status de leitura.
- Leitor PDF no navegador com sincronizacao de progresso por pagina.
- Anotacoes por selecao de texto e pagina.
- Traducao automatica e traducao persistida por livro.
- OCR sob demanda para melhorar a camada de texto em PDFs.

## Stack
- Backend: Java 21, Spring Boot 4, Spring Data JPA, SQLite.
- Frontend: React 18, TypeScript, Vite, TanStack Query, Tailwind CSS.
- Infra: Docker e Docker Compose.

## Estrutura
- `app/readium-backend`: API e regras de negocio.
- `app/readium-frontend`: interface web.
- `app/Dockerfile`: build multi-stage (base e OCR).
- `app/docker-compose.yml`: orquestracao local.

## Como rodar

### Opcao 1: Docker Compose (recomendado)
1. Criar o arquivo `app/.env` com base em `app/.env.example`.
2. Subir os servicos:

```bash
cd app
docker compose up -d --build
```

Acesso:
- Aplicacao: `http://localhost:7717`

Parar:

```bash
cd app
docker compose down
```

### Opcao 2: Desenvolvimento local

Backend:

```bash
cd app/readium-backend
./mvnw spring-boot:run
```

Windows:

```bash
cd app/readium-backend
.\mvnw.cmd spring-boot:run
```

Frontend:

```bash
cd app/readium-frontend
npm install
npm run dev
```

Acesso local:
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:7717`

## Variaveis de ambiente

As variaveis abaixo sao usadas no fluxo com Docker Compose (`app/.env`).

| Variavel | Padrao | Descricao |
|---|---|---|
| `READIUM_DOCKER_TARGET` | `runtime-base` | Target da imagem Docker (`runtime-base` ou `runtime-ocr`). |
| `APP_PORT` | `7717` | Porta HTTP da aplicacao. |
| `APP_DATABASE_URL` | `jdbc:sqlite:data/db/library.db` | URL de conexao SQLite. |
| `APP_STORAGE_PATH` | `data/books` | Diretorio de armazenamento de livros e artefatos. |
| `APP_TRANSLATION_PROVIDER` | `MYMEMORY` | Provider de traducao (`MYMEMORY` ou `LIBRETRANSLATE`). |
| `APP_TRANSLATION_MYMEMORY_URL` | `https://api.mymemory.translated.net/get` | Endpoint do provider MyMemory. |
| `APP_TRANSLATION_LIBRE_URL` | `http://localhost:5000/translate` | Endpoint do provider LibreTranslate. |
| `APP_TRANSLATION_LIBRE_API_KEY` | vazio | Chave de API do LibreTranslate (opcional). |
| `APP_TRANSLATION_TIMEOUT_MS` | `5000` | Timeout das chamadas de traducao. |
| `APP_TRANSLATION_CACHE_TTL_SECONDS` | `86400` | TTL do cache de traducao automatica. |
| `APP_TRANSLATION_CACHE_MAX_ENTRIES` | `5000` | Limite de entradas no cache de traducao. |
| `APP_TRANSLATION_MIN_INTERVAL_MS` | `150` | Rate limit minimo por chave de texto. |
| `APP_OCR_ENGINE` | `HEURISTIC` | Engine de OCR (`HEURISTIC` ou `OCRMYPDF`). |
| `APP_OCR_SAMPLE_PAGES` | `10` | Numero de paginas amostradas no modo heuristico. |
| `APP_OCR_ASYNC_CORE_POOL_SIZE` | `1` | Threads base do executor de OCR. |
| `APP_OCR_ASYNC_MAX_POOL_SIZE` | `2` | Limite maximo de threads de OCR. |
| `APP_OCR_ASYNC_QUEUE_CAPACITY` | `8` | Capacidade da fila de jobs de OCR. |
| `APP_OCRMYPDF_COMMAND` | `ocrmypdf` | Comando executavel do OCRmyPDF. |
| `APP_OCRMYPDF_LANGUAGES` | `eng+por` | Idiomas usados pelo OCRmyPDF/Tesseract. |
| `APP_OCRMYPDF_TIMEOUT_SECONDS` | `1800` | Timeout maximo de um job OCR. |

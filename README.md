# Readium

Readium e uma aplicacao self-hosted para biblioteca digital e leitura de livros. O projeto nasceu no contexto de vibe coding, mas com esforco continuo para manter qualidade de engenharia: DDD, SOLID (com prioridade para SRP) e camadas claras no frontend.

## Status atual (checado em 2026-02-25)

- GitHub: repositorio remoto configurado (`origin`) e branch principal `main`.
- CI/CD automatizado: `.github/workflows/ci.yml` roda `./mvnw test` no backend e `npm run test -- --run` + `npm run build` no frontend para pushes e pull requests.
- Backend: testes Maven passando (`mvnw.cmd test`).
- Frontend web: bundle/Vitest garantidos (`npm run build`, `npm run test -- --run`).

## CI/CD

- [`ci.yml`](.github/workflows/ci.yml) dispara em push/pull para `main` e roda `backend-tests` (Java 21 + cache Maven) seguido do job `frontend` (Node 20 + `npm ci`, `npm run test -- --run`, `npm run build`).
- Para reproduzir localmente: execute `./mvnw test` dentro de `app/readium-backend` e, em `app/readium-frontend`, rode `npm ci && npm run test -- --run && npm run build`.

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
docker compose pull
docker compose up -d
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
| `READIUM_IMAGE_REPOSITORY` | `klawns/readium` | Repositorio Docker Hub da imagem do Readium. |
| `READIUM_IMAGE_TAG` | `base-v1` | Tag da imagem (`base-v1` ou `ocr-v1`). |
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
| `APP_TRANSLATION_LIST_CACHE_TTL_SECONDS` | `300` | TTL do cache de listagem de traducoes por livro. |
| `APP_TRANSLATION_LIST_CACHE_MAX_ENTRIES` | `2000` | Limite de entradas do cache de listagem de traducoes. |
| `APP_ANNOTATIONS_CACHE_TTL_SECONDS` | `120` | TTL do cache de consultas de anotacoes. |
| `APP_ANNOTATIONS_CACHE_MAX_ENTRIES` | `5000` | Limite de entradas do cache de anotacoes. |
| `APP_OCR_ENGINE` | `HEURISTIC` | Engine de OCR (`HEURISTIC` ou `OCRMYPDF`). |
| `APP_OCR_SAMPLE_PAGES` | `10` | Numero de paginas amostradas no modo heuristico. |
| `APP_OCR_ASYNC_CORE_POOL_SIZE` | `1` | Threads base do executor de OCR. |
| `APP_OCR_ASYNC_MAX_POOL_SIZE` | `2` | Limite maximo de threads de OCR. |
| `APP_OCR_ASYNC_QUEUE_CAPACITY` | `8` | Capacidade da fila de jobs de OCR. |
| `APP_OCRMYPDF_COMMAND` | `ocrmypdf` | Comando executavel do OCRmyPDF. |
| `APP_OCRMYPDF_LANGUAGES` | `eng+por` | Idiomas usados pelo OCRmyPDF/Tesseract. |
| `APP_OCRMYPDF_TIMEOUT_SECONDS` | `1800` | Timeout maximo de um job OCR. |

### Troca rapida entre `base` e `ocr`
- `base` (padrao):
  - `READIUM_IMAGE_TAG=base`
  - `APP_OCR_ENGINE=HEURISTIC`
- `ocr`:
  - `READIUM_IMAGE_TAG=ocr`
  - `APP_OCR_ENGINE=OCRMYPDF`

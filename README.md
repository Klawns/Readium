# Readium

## O que faz
- Biblioteca virtual self-hosted para livros PDF.
- Upload e organizacao de livros com busca, filtro e status de leitura.
- Leitor de PDF no navegador com salvamento de progresso por pagina.
- Anotacoes e traducao de trechos.
- OCR sob demanda para melhorar a camada de texto dos PDFs.

## Stack
- Frontend: React 18, TypeScript, Vite, Tailwind CSS, TanStack Query.
- Backend: Java 21, Spring Boot 4, Spring Data JPA.
- Banco de dados: SQLite.
- Infraestrutura: Docker e Docker Compose.
- Codex, Gemini: usei muita IA, tu é doido.

## Como instalar

### Opcao 1: Docker Compose (recomendado)
Pre-requisitos:
- Docker
- Docker Compose

Configurar ENV (Docker Compose):
1. Crie `app/.env` com base em `app/.env.example`.
2. Adicione no mesmo arquivo:
```env
READIUM_DOCKER_TARGET=runtime-base
```

Escolhas principais de ENV:
- OCR simples (mais leve): `READIUM_DOCKER_TARGET=runtime-base` e `APP_OCR_ENGINE=HEURISTIC`.
- OCR completo (melhor para PDF escaneado): `READIUM_DOCKER_TARGET=runtime-ocr` e `APP_OCR_ENGINE=OCRMYPDF`.
- Traducao sem infraestrutura local: `APP_TRANSLATION_PROVIDER=MYMEMORY`.
- Traducao com servico proprio: `APP_TRANSLATION_PROVIDER=LIBRETRANSLATE` e configure `APP_TRANSLATION_LIBRE_URL` (+ `APP_TRANSLATION_LIBRE_API_KEY` se necessario).
- Idiomas do OCR: `APP_OCRMYPDF_LANGUAGES=eng+por` (ajuste conforme necessidade).

Comandos:
```bash
cd app
docker compose up -d --build
```

Acesso:
- Aplicacao/API: `http://localhost:7717`

Persistencia de dados:
- `data/db`
- `data/books`

Para parar:
```bash
cd app
docker compose down
```

### Opcao 2: Desenvolvimento local
Pre-requisitos:
- Java 21
- Node.js 20+
- npm

Backend:
```bash
cd app/readium-backend
./mvnw spring-boot:run
```
No Windows:
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

Ambiente local:
- Frontend: `http://localhost:3000`
- Backend/API: `http://localhost:7717`

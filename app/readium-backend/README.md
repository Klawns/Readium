# Readium Backend

API da aplicacao Readium responsavel pela gestao da biblioteca, leitura, anotacoes, traducao e OCR.

## Escopo funcional
- Cadastro e listagem de livros em PDF/EPUB.
- Controle de status de leitura e progresso por pagina.
- CRUD de anotacoes por livro e pagina.
- Traducao persistida por contexto de livro.
- Traducao automatica com provider configuravel.
- OCR sob demanda com processamento assincrono.
- Cache com Spring Cache + Caffeine para consultas e traducao automatica.

## Contextos de dominio
- `book`: upload, listagem, status, progresso, capa, arquivo e status de OCR.
- `annotations`: criacao, atualizacao, consulta e remocao de anotacoes.
- `translation`: traducao manual persistida e traducao automatica.
- `event`: eventos de dominio e listeners para processamento assincrono.


## Fluxos principais
1. Upload de livro:
   `POST /api/books` cria entidade e publica evento de livro criado.
2. Pos-processamento:
   listener extrai metadados, numero de paginas e capa.
3. OCR sob demanda:
   `POST /api/books/{id}/ocr` enfileira processamento assincrono.
4. Leitura:
   arquivo via `GET /api/books/{id}/file` e progresso via `PATCH /api/books/{id}/progress`.
5. Anotacoes e traducao:
   APIs de anotacao e traducao atendem o leitor com persistencia por livro/pagina.

## Contrato
- Swagger UI: `/swagger-ui/index.html`
- OpenAPI JSON gerado em runtime: `/v3/api-docs`

## Cache
- Implementacao via `Spring Cache` com provider `Caffeine`.
- Cache de traducao automatica (antes manual, agora por `@Cacheable`).
- Cache de listagem de traducoes por livro.
- Cache de consultas de anotacoes por livro e por pagina.
- Invalidacao de cache nas operacoes de create/update/delete para manter consistencia.

## OCR troubleshooting
- Verifique o engine ativo no log de startup: `ocrEngine=...`.
- Consulte status detalhado por livro em `GET /api/books/{id}/ocr-status`.
- Campos relevantes de diagnostico:
  - `status`: `PENDING`, `RUNNING`, `DONE`, `FAILED`
  - `updatedAt`: ultima atualizacao do job
  - `details`: motivo de falha/estado atual do OCR
- Ajustes de timeout e recuperacao:
  - `APP_OCRMYPDF_TIMEOUT_SECONDS` (timeout do processo OCRmyPDF)
  - `APP_OCR_RUNNING_TIMEOUT_SECONDS` (limite para RUNNING estagnado)
  - `APP_OCR_RECOVERY_FIXED_DELAY_MS` (intervalo do watchdog de recuperacao)

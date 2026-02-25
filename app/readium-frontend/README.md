# Readium Frontend

Aplicacao web do Readium para navegacao da biblioteca e experiencia de leitura no navegador.

## Escopo funcional
- Biblioteca com listagem paginada, busca e filtro por status.
- Upload de livros e atualizacao de estado de leitura.
- Leitor PDF com navegacao por pagina e sincronizacao de progresso.
- Destaque/anotacao de selecao de texto por pagina.
- Edicao de anotacao ao clicar no highlight e remocao no popup.
- Preload de highlights da pagina atual, anterior e proxima.
- Navegacao por links/referencias internas do PDF.
- Copia de texto selecionado no leitor.
- Exibicao e persistencia de traducoes no contexto de leitura.
- Acionamento de OCR e exibicao de status/qualidade de camada de texto.

## Organizacao por camadas
- `domain`: modelos e portas (contratos).
- `application`: casos de uso.
- `infrastructure`: repositorios HTTP/providers.
- `ui`: hooks, componentes e paginas.

## Modulos principais
- `features/library`: experiencia de biblioteca, upload e filtros.
- `features/reader`: leitor PDF, anotacoes, traducao e OCR.
- `services/http`: cliente HTTP e integracao com API.

## Mobile (Fase 1 - Capacitor)
- Objetivo atual: abrir o app Android com a mesma UI web e consumir a API por IP/URL configuravel da LAN.
- Base URL mobile padrao: `http://192.168.31.168:7717/api` (pode ser alterada em `Configuracoes > Servidor mobile`).

### Setup
1. Copie `app/readium-frontend/.env.mobile.example` para `app/readium-frontend/.env.mobile`.
2. Gere os assets mobile: `npm run build:mobile`.
3. Sincronize o projeto Android: `npm run cap:sync:android`.
4. Abra no Android Studio: `npm run cap:open:android`.

### Observacoes
- Em ambiente web local o frontend continua usando proxy por `VITE_API_BASE_URL=/api`.
- O Android foi configurado com `usesCleartextTraffic=true` para permitir HTTP na rede local.
- Se o IP do servidor mudar, ajuste pelo app em `Configuracoes > Servidor mobile`.

## Mobile (Fase 2 - Offline PDF)
- Acao de download offline disponivel em cada card da biblioteca.
- Arquivos PDF salvos no storage local do app via `@capacitor/filesystem`.
- Metadados dos downloads persistidos em IndexedDB (`dexie`).
- Leitor prioriza arquivo local quando o livro ja foi baixado.
- Tela dedicada de downloads em `/books/downloads` com remocao e uso total de espaco.

## Mobile (Fase 3 - Banco local + fila de sync)
- Novas stores locais: `books_offline`, `reading_progress_local`, `annotations_local`, `sync_queue`.
- Progresso de leitura agora usa estrategia offline-first:
  se offline, salva localmente e enfileira; se online, sincroniza e marca como `SYNCED`.
- Anotacoes agora usam repositorio offline-first:
  CRUD local com enfileiramento em falha/offline e tentativa remota imediata quando online.
- Sincronizacao automatica da fila ao abrir o app e quando a rede reconecta (`online` event).

## Mobile (Fase 4 - Engine de sincronizacao)
- Trigger de sync em abertura do app, reconexao de rede e retorno de visibilidade (`visibilitychange`).
- Retry exponencial para falhas na fila (`PENDING`/`FAILED` + `nextRetryAt`).
- Idempotencia por `operationId` enviada no header `X-Operation-Id` nas operacoes sincronizadas.
- Logs de diagnostico em `offline-sync` com inicio/fim de ciclo e sucesso/falha por operacao.

## Mobile (Fase 5 - Distribuicao Android)
- Build de APK debug (teste interno): `npm run apk:debug`.
- Build de APK release (unsigned): `npm run apk:release`.
- Versionamento Android via propriedades:
  - `READIUM_VERSION_CODE` (inteiro)
  - `READIUM_VERSION_NAME` (string)
- Checklist de release: `app/readium-frontend/MOBILE_RELEASE_CHECKLIST.md`.

## Diretrizes
- UI desacoplada da infraestrutura via interfaces/ports.
- Regras de negocio concentradas em use-cases e hooks de feature.
- Componentes focados em composicao e renderizacao.

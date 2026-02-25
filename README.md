# Readium

Readium e uma aplicacao self-hosted para biblioteca digital e leitura de livros. O projeto nasceu no contexto de vibe coding, mas com esforco continuo para manter qualidade de engenharia: DDD, SOLID (com prioridade para SRP) e camadas claras no frontend.

## Status atual (checado em 2026-02-25)

- GitHub: repositorio remoto configurado (`origin`) e branch principal `main`.
- CI/CD automatizado: `.github/workflows/ci.yml` roda `./mvnw test` no backend e `npm run test -- --run` + `npm run build` no frontend para pushes e pull requests.
- Backend: testes Maven passando (`mvnw.cmd test`).
- Frontend web: bundle/Vitest garantidos (`npm run build`, `npm run test -- --run`).
- Docker: `app/Dockerfile` construindo os estagios `runtime-base` e `runtime-ocr`, com publicacao automatizada no Docker Hub via workflow.

## CI/CD

- [`ci.yml`](.github/workflows/ci.yml) dispara em push/pull para `main` e roda `backend-tests` (Java 21 + cache Maven) seguido do job `frontend` (Node 20 + `npm ci`, `npm run test -- --run`, `npm run build`).
- [`publish-dockerhub.yml`](.github/workflows/publish-dockerhub.yml) publica `klawns/readium:base` e `klawns/readium:ocr` quando a `main` e atualizada ou via `workflow_dispatch`; o job exige os segredos `DOCKERHUB_USERNAME` e `DOCKERHUB_TOKEN`.
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

## Web

### Rodar com Docker (recomendado para uso)

1. Copie `app/.env.example` para `app/.env`.
2. Ajuste variaveis se necessario (principalmente `READIUM_IMAGE_TAG` e `APP_OCR_ENGINE`).
3. Suba os servicos:

```bash
cd app
docker compose pull
docker compose up -d
```

Acesso padrao:

- App/API: `http://localhost:7717`

Parar:

```bash
cd app
docker compose down
```

### Rodar em desenvolvimento local (web)

Backend:

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

## GitHub: commit e push

Hoje o fluxo esta pronto para uso manual:

```bash
git status
git add <arquivos>
git commit -m "feat: sua mudanca"
git push origin main
```

Boas praticas antes de push:

- Rodar testes/build locais.
- Evitar commit de arquivos locais (`.env`, banco SQLite, dados da pasta `data/`).
- Revisar `git diff --staged` para nao subir artefatos temporarios.

O workflow [`ci.yml`](.github/workflows/ci.yml) roda `./mvnw test` + `npm run test -- --run` + `npm run build` para cada push/PR na `main`, entao confira a aba Actions antes de mandar o push e mantenha os mesmos comandos em um ambiente local para evitar regressoes.

## Docker Hub: build e publish

1. Login:

```bash
docker login
```

2. Build das duas variantes:

```bash
cd app
docker build -f Dockerfile --target runtime-base -t klawns/readium:base .
docker build -f Dockerfile --target runtime-ocr -t klawns/readium:ocr .
```

3. Push:

```bash
docker push klawns/readium:base
docker push klawns/readium:ocr
```

4. Em quem vai consumir a imagem, ajuste `app/.env`:

- `READIUM_IMAGE_REPOSITORY=klawns/readium`
- `READIUM_IMAGE_TAG=base` ou `ocr`

5. Automacao GitHub Actions:

- O workflow [`publish-dockerhub.yml`](.github/workflows/publish-dockerhub.yml) executa os mesmos builds e pushs com cache via `docker/build-push-action@v5`. Ele roda automaticamente em pushes para `main` ou manualmente (`workflow_dispatch`) e usa os segredos `DOCKERHUB_USERNAME`/`DOCKERHUB_TOKEN` armazenados no repositorio.

## Riscos e como mitigar

- CI/CD automatizado:
  - Risco: mesmo com `ci.yml` e `publish-dockerhub.yml`, uma falha silenciosa ou segredo expirado deixa commits sem validacao ou deploy.
  - Mitigacao: mantenha os workflows atualizados, verifique a aba Actions antes de mergear e rode `./mvnw test` + `npm run test -- --run && npm run build` no local.
- Docker Hub secrets:
  - Risco: `DOCKERHUB_USERNAME`/`DOCKERHUB_TOKEN` usados pelos workflows podem vazar se o controle de acesso for frouxo.
  - Mitigacao: limite acesso as secrets no GitHub, de a elas escopo minimo e rotacione-as periodicamente.
- `docker-compose.yml` usa `pull_policy: always`:
  - Risco: depender de imagem publicada para subir com compose.
  - Mitigacao: publicar tags de release sempre que houver mudanca relevante ou manter um compose de desenvolvimento com `build:`.
- Mobile com `usesCleartextTraffic=true`:
  - Risco: trafego HTTP sem TLS em rede nao confiavel.
  - Mitigacao: para producao, usar HTTPS e restringir `allowNavigation`.
- Integracao com servicos externos de traducao:
  - Risco: enviar trechos de texto para provedores externos.
  - Mitigacao: documentar privacidade e permitir configuracao de provider interno.
- Repositorio atualmente com muitas mudancas locais:
  - Risco: commit acidental de alteracoes nao relacionadas.
  - Mitigacao: usar commits pequenos e `git add` seletivo.

## Direcao tecnica

Mesmo sendo um projeto com iteracao rapida (vibe coding), a direcao e manter:

- contexto de dominio claro (`book`, `annotations`, `translation`, `event`);
- SRP no backend (controller orquestra, service concentra regra, repositorio persiste);
- frontend desacoplado por `domain/application/infrastructure/ui`;
- evolucao incremental com validacao pratica (build, teste e release previsivel).

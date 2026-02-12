# Readium Frontend

Frontend React + Vite para biblioteca e leitor de PDF.

## O que faz

- Lista de livros com filtros/busca
- Upload de PDF/EPUB
- Leitor PDF com progresso, anotações e tradução
- Ação de OCR no reader (status e score)

## Rodar local

```powershell
cd D:\Projetos\Readium\app\readium-frontend
npm install
npm run dev
```

App em `http://localhost:3000` com proxy `/api` para `http://localhost:7717`.

## Build

```powershell
cd D:\Projetos\Readium\app\readium-frontend
npm run build
```

## Testes/checagem

```powershell
cd D:\Projetos\Readium\app\readium-frontend
npm run test
npx tsc --noEmit
```

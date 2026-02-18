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

## Diretrizes
- UI desacoplada da infraestrutura via interfaces/ports.
- Regras de negocio concentradas em use-cases e hooks de feature.
- Componentes focados em composicao e renderizacao.

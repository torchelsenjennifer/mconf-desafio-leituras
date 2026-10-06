# Biblioteca coletiva

Uma estante pública onde pessoas autenticadas adicionam livros encontrados na OpenLibrary. O catálogo é aberto, ordenado da adição mais recente para a mais antiga e pode ser filtrado por autor, gênero e ano.

## Tecnologias e decisões

- **Rails 8 + PostgreSQL** para persistência e regras de domínio.
- **React + TypeScript + Inertia + Vite** para páginas SPA sem criar uma API duplicada.
- **Devise** para cadastro, login e recuperação de senha; **Pundit** para garantir que somente o dono do livro o altere ou remova.
- A busca consulta `search.json` da **OpenLibrary** no servidor. Só os dados selecionados são persistidos, para que o catálogo continue disponível mesmo se a API externa estiver indisponível.
- A paginação é feita no banco, com 12 livros por página. Filtros são aplicados antes da paginação.

### Decisões diante dos cenários abertos

- **Livro duplicado:** uma mesma pessoa só pode adicionar uma obra da OpenLibrary uma vez. A identidade usada é `open_library_key`; a regra é validada no Rails e reforçada por índice único no PostgreSQL. Pessoas diferentes podem adicionar a mesma obra à estante coletiva.
- **OpenLibrary vazia ou indisponível:** a busca retorna uma lista vazia e a interface orienta a pessoa a tentar outro termo ou tentar novamente. Não há cadastro manual de dados, para preservar a regra de que título, autoria e ano vêm da OpenLibrary.
- **`/books.json`:** é público, como o catálogo da home. Devolve os livros da página atual, os filtros aplicados e os metadados de paginação em JSON.

## Executar com Docker

Pré-requisito: Docker Engine com Docker Compose v2.

```bash
docker compose up --build
```

Abra [http://localhost:3000](http://localhost:3000). O serviço `web` executa `db:prepare` ao iniciar e o Vite fica disponível em `http://localhost:3036` durante o desenvolvimento.

O catálogo em JSON está disponível em [http://localhost:3000/books.json](http://localhost:3000/books.json), aceitando os mesmos filtros da tela, por exemplo: `?author=Butler&year=1979`.

Para encerrar:

```bash
docker compose down
```

Para reiniciar o banco local do Compose, inclusive dados:

```bash
docker compose down -v
```

## Uso

1. Crie uma conta ou entre pelos modais da tela inicial.
2. Clique em **Adicionar livro**, pesquise um título e selecione um resultado da OpenLibrary.
3. Use autor, gênero e ano para filtrar o catálogo; a paginação preserva os filtros.
4. Os links de editar e remover aparecem apenas em livros criados pela conta atual. A autorização também é aplicada no servidor.

## Testes e qualidade

Com a stack em execução:

```bash
docker compose exec web bundle exec rspec
docker compose exec web bundle exec rubocop
docker compose exec vite npm run build
```

As specs cobrem validações e filtros de `Book`, requests do catálogo e autorização, e o adaptador OpenLibrary. A integração HTTP externa é simulada com WebMock: a suíte não faz chamadas reais à API.

## Uso de IA

IA foi usada como apoio para estruturar o projeto, identificar problemas de integração Docker/Vite e acelerar o primeiro rascunho de telas e testes. As decisões de arquitetura, revisão do código, tratamento de autorização e validação final foram verificadas manualmente com build, testes e lint.

Um exemplo de sugestão incompleta foi renderizar `BooksController#index` somente com Inertia: apesar de `/books.json` responder com status 200, ele devolvia HTML. A correção foi declarar uma resposta JSON explícita no controller e cobri-la com uma request spec.

## Com mais tempo

- adicionar testes de sistema para o fluxo completo de login e seleção da busca;
- cachear respostas da OpenLibrary e apresentar mensagens de indisponibilidade;
- melhorar acessibilidade, estados de carregamento e feedback de erros no frontend;
- disponibilizar filtros por valores sugeridos e imagens com fallback;
- configurar CI para executar Compose, RSpec, RuboCop e o build do Vite em cada pull request.

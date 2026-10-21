# Kurio — Marketplace de NFTs

Implementação parcial do [Desafio Frontend — Marketplace de NFTs](https://github.com/junglegaming/frontend-challenge#desafio-frontend--marketplace-de-nfts), desenvolvida com React, TypeScript e a stack obrigatória definida no enunciado.

> **Status da entrega:** parcial. A Home e a infraestrutura de dados simulados estão em desenvolvimento. Os fluxos visuais de detalhe, conta, carrinho e compra, os testes E2E, as auditorias Lighthouse e o deploy público ainda não foram concluídos. Consulte [Estado da implementação](#estado-da-implementação) e [Limitações conhecidas](#limitações-conhecidas).

## Links da entrega

- Repositório: este repositório.
- Aplicação publicada: **não disponível**.
- Layout de referência: [Figma do desafio](https://www.figma.com/design/PC4lfFG1NXcqoy1oGOSgfu/Frontend-Challenge--Copy-).

O deploy é obrigatório no desafio, mas não foi realizado nesta versão.

## Stack

- React 19 e TypeScript;
- Vite;
- TanStack Router;
- TanStack Query;
- Axios;
- Tailwind CSS;
- shadcn/ui e Radix UI;
- MSW para REST e WebSocket;
- Socket.IO Client com `@mswjs/socket.io-binding`;
- Zod para contratos e validação;
- Decimal.js para valores monetários;
- bcryptjs para senhas dos mocks.

Playwright e Lighthouse fazem parte dos requisitos, mas ainda não foram instalados ou configurados.

## Requisitos locais

- Node.js 20 ou superior;
- npm, usando o `package-lock.json` versionado;
- navegador com suporte a Service Worker e `localStorage`.

## Setup

Clone o repositório e instale exatamente as versões do lockfile:

```bash
git clone <URL_DO_REPOSITORIO>
cd jungle_gaming_test
npm ci
```

Crie o arquivo local de ambiente a partir do exemplo:

```bash
cp .env.example .env
```

No PowerShell, o comando equivalente é:

```powershell
Copy-Item .env.example .env
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

Acesse `http://localhost:5173`.

## Variáveis de ambiente

O arquivo `.env.example` contém as variáveis necessárias:

| Variável | Valor de desenvolvimento | Finalidade |
| --- | --- | --- |
| `VITE_API_BASE_URL` | `/api` | Prefixo usado pelo cliente Axios. |
| `VITE_ENABLE_MOCKS` | `true` | Ativa o Service Worker do MSW. |

O projeto não depende de backend privado. Com `VITE_ENABLE_MOCKS=true`, REST e Socket.IO são simulados no navegador. Segredos pessoais e chaves usadas durante o desenvolvimento não são necessários para executar a aplicação e não devem ser versionados.

## Comandos

| Comando | Descrição | Estado |
| --- | --- | --- |
| `npm run dev` | Executa o Vite com os mocks configurados pelo `.env`. | Disponível |
| `npm run build` | Executa `tsc -b` e gera o build otimizado. | Disponível |
| `npm run preview` | Serve localmente o conteúdo de `dist`. | Disponível |
| `npm run lint` | Executa o ESLint. | Disponível |
| `npm exec tsc -- -b` | Verifica os tipos por meio dos projetos TypeScript. | Disponível |
| `npm run test:e2e` | Testes Playwright. | **Não configurado** |
| `npm run lighthouse` | Auditoria Lighthouse. | **Não configurado** |

Antes de avaliar o código disponível, execute:

```bash
npm run lint
npm run build
```

## Credenciais fictícias

O banco inicial possui duas contas isoladas:

| Nome | E-mail | Observação |
| --- | --- | --- |
| Ana Costa | `ana@kurio.test` | Possui carteiras iniciais próprias. |
| Leo Martins | `leo@kurio.test` | Possui dados isolados dos dados de Ana. |

As senhas das contas iniciais estão armazenadas somente como hashes bcrypt e o texto original não está documentado nesta versão. Para criar uma credencial conhecida durante a avaliação, abra o console do navegador na aplicação e execute:

```js
await fetch("/api/auth/register", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "Pessoa Avaliadora",
    email: "avaliador@kurio.test",
    password: "Kurio123!",
  }),
}).then(async (response) => ({
  status: response.status,
  body: await response.json(),
}));
```

Esse cadastro também cria a sessão simulada. A tela visual de cadastro ainda é um placeholder.

## Mocks, persistência e reset

O MSW roda no navegador, portanto os endpoints de cenário devem ser chamados pela própria aplicação ou pelo console DevTools aberto em `localhost`. Chamadas feitas com `curl` não passam pelo Service Worker.

O banco simulado é persistido em:

```text
localStorage["kurio:mock-database:v1"]
```

Ele guarda contas, sessão, favoritos, carrinhos, alterações de NFTs, carteiras, cotações, pedidos e registros de idempotência. Dados privados são separados por `userId`; o carrinho visitante usa o proprietário `guest`.

Para restaurar integralmente os fixtures iniciais:

```js
await fetch("/api/mock/reset", { method: "POST" });
location.reload();
```

Também é possível apagar manualmente a chave no painel Application do DevTools, mas o endpoint acima é o caminho recomendado.

## Cenários reproduzíveis

Execute os exemplos no console do navegador. Cada endpoint que configura a "próxima" operação volta ao comportamento padrão depois de consumido.

### Expirar a sessão ativa

```js
await fetch("/api/mock/session/expire", { method: "POST" });
```

A próxima consulta protegida responde `401 SESSION_EXPIRED`.

### Recusar a próxima conexão de carteira

```js
await fetch("/api/mock/wallet-connection/refuse-next", { method: "POST" });
```

### Recusar o próximo pagamento

```js
await fetch("/api/mock/checkout/decline-next", { method: "POST" });
```

Um pedido aceito fica `PENDING` e é resolvido como `DECLINED` depois de aproximadamente 1,2 segundo.

### Falhar temporariamente no próximo checkout

```js
await fetch("/api/mock/checkout/transient-error-next", { method: "POST" });
```

A próxima tentativa responde `503 TRANSIENT_ERROR`; a seguinte volta ao cenário confirmado. A mesma chave de idempotência recupera o mesmo pedido quando ele já foi criado.

### Alterar o preço de um NFT em tempo real

```js
await fetch("/api/mock/nfts/emerald-ape-042/price", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ amount: "2.49" }),
});
```

O mock persiste a alteração e emite `nft.updated`.

### Esgotar uma edição em tempo real

```js
await fetch(
  "/api/mock/nfts/emerald-ape-042/editions/emerald-1-of-1/availability",
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ available: 0 }),
  },
);
```

### Cupons

- `KURIO10`: válido, com 10% de desconto;
- `EXPIRADO10`: expirado;
- qualquer outro código: inválido.

Há ainda endpoints auxiliares para expirar uma cotação e resolver manualmente um pedido:

```text
POST /api/mock/quotes/:quoteId/expire
POST /api/mock/orders/:orderId/resolve
```

## Contratos REST

Os schemas Zod em `src/contracts` são compartilhados pela API simulada e pelos consumidores. Valores em ETH trafegam como strings decimais e os cálculos usam Decimal.js.

| Recurso | Operações implementadas no mock |
| --- | --- |
| Saúde | `GET /api/health` |
| Autenticação | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/session`, `POST /api/auth/logout` |
| NFTs | `GET /api/nfts`, `GET /api/nfts/:nftId` |
| Favoritos | `GET /api/favorites`, `POST /api/favorites/:nftId`, `DELETE /api/favorites/:nftId` |
| Carrinho | `GET /api/cart`, `POST /api/cart/items`, `PATCH /api/cart/items`, `DELETE /api/cart/items/:nftId/:editionId` |
| Cupom | `POST /api/cart/coupon`, `DELETE /api/cart/coupon` |
| Cotação | `POST /api/quotes` |
| Checkout | `POST /api/checkout` |
| Pedidos | `GET /api/orders`, `GET /api/orders/:orderId` |
| Perfil | `GET /api/profile`, `PATCH /api/profile`, `POST /api/profile/password` |
| Carteiras | `GET /api/wallets`, `POST /api/wallets`, `PATCH /api/wallets/:walletId`, `POST /api/wallets/connect`, `POST /api/wallets/:walletId/disconnect` |

Os handlers cobrem validação, autenticação, sessão expirada, recurso inexistente, conflito, indisponibilidade, limite de estoque, falha transitória e conflito de idempotência. A interface para consumir a maior parte dessas operações ainda está pendente.

## Sessão e dados privados

- O cadastro e o login criam uma sessão com validade de uma hora.
- `GET /api/auth/session` recupera a sessão após refresh.
- A expiração é validada em operações protegidas.
- Senhas são comparadas e gravadas com bcrypt; não são persistidas em texto claro.
- Favoritos, carrinhos, carteiras, cotações, pedidos e idempotência são isolados por usuário no banco simulado.
- No mock, o login mescla o carrinho visitante no carrinho do usuário autenticado.
- A integração desses comportamentos com telas e guards do Router ainda não foi concluída.

## Estado do carrinho, cotação e pedido

- O carrinho aceita inclusão, alteração e remoção por NFT e edição, sem duplicar a mesma combinação.
- Quantidade, disponibilidade e limite por pedido são revalidados.
- Subtotal, desconto, taxa de rede e total são calculados no mock.
- A cotação pode ser `VALID`, `CHANGED` ou `UNAVAILABLE` e registra mudanças de preço, estoque, cupom e taxa.
- O checkout exige cotação válida, carteira conectada, rede compatível e chave de idempotência.
- O pedido nasce `PENDING` e termina em `CONFIRMED` ou `DECLINED`; pedidos confirmados recebem referência de transação simulada.
- O recibo usa um snapshot dos itens e valores do momento da compra.
- Essas regras estão implementadas nos contratos e handlers, mas as telas de carrinho, checkout e pedido continuam pendentes.

## Cache e sincronização em tempo real

O TanStack Query usa atualmente:

- `staleTime` global de 30 segundos;
- uma nova tentativa automática (`retry: 1`);
- chaves do catálogo compostas pelos parâmetros validados da URL;
- chaves separadas para listas e detalhes.

O cliente Socket.IO conecta por WebSocket na mesma origem. O MSW adapta a conexão pelo `@mswjs/socket.io-binding` e emite:

| Evento | Payload principal | Comportamento existente |
| --- | --- | --- |
| `realtime.ready` | `version` | Handshake do mock. |
| `nft.updated` | `nftId`, preço, edições e `version` | Atualiza detalhe em cache e invalida listas do catálogo. |
| `order.updated` | `orderId`, estado, `version` e `updatedAt` | Emissão e cliente tipado prontos; integração com uma tela de pedido está pendente. |

As alterações do mock são persistidas antes da emissão, de modo que uma nova consulta REST lê o mesmo estado. A reconciliação explícita após reconexão, o descarte completo de eventos antigos/duplicados e a limpeza por troca de sessão ainda precisam ser finalizados na camada de interface.

## Estado da implementação

### Concluído

- configuração de React, TypeScript, Vite, Tailwind e shadcn/ui;
- tokens visuais, fonte Roboto Mono e assets locais dos NFTs;
- TanStack Router com Home, rotas previstas e página 404;
- cliente Axios e TanStack Query;
- contratos Zod de API, autenticação, NFT, catálogo, favoritos, carrinho, cotação, pedido, perfil, carteira e tempo real;
- banco MSW persistente, resetável e isolado por usuário;
- handlers REST dos recursos listados acima;
- autenticação simulada com bcrypt e expiração de sessão;
- regras simuladas de favoritos, carrinho, cupom, carteiras, cotação e checkout idempotente;
- simulação Socket.IO de `nft.updated` e `order.updated`;
- consulta do catálogo integrada com Axios e TanStack Query;
- Home responsiva parcial com cabeçalho, busca mobile, hero, abas e cards;
- catálogo desktop com ordenação, categorias, faixa de preço, rede e paginação na URL;
- estados de loading, erro e resultado vazio no grid do catálogo.

### Em andamento

- fidelidade pixel a pixel da Home desktop e mobile;
- card lateral de NFT em destaque;
- ajustes finais do grid e de responsividade;
- busca e filtros mobile: a busca envia o termo pela URL, mas o botão de filtros ainda não abre uma interface;
- integração visual dos contratos e handlers já prontos.

### Pendente

- tela funcional de detalhes do NFT, galeria, edição, quantidade, favoritos e compra;
- telas funcionais de carrinho, checkout e confirmação/recusa do pedido;
- telas funcionais de login, cadastro, perfil e carteiras;
- proteção das rotas privadas e retomada visual do fluxo após login/expiração;
- navegação mobile completa, filtros mobile e paginação mobile definida pelo design;
- atualização otimista com rollback na interface;
- estados de skeleton nas telas além do catálogo;
- auditoria completa de acessibilidade, foco, teclado e movimento reduzido;
- testes Playwright, baselines de regressão visual, relatório HTML e traces;
- configuração e relatórios Lighthouse;
- `ARCHITECTURE.md` solicitado no enunciado;
- estratégia de fallback para refresh de rotas no provedor de hospedagem;
- deploy público.

## Estrutura principal

```text
src/
├── api/          # chamadas Axios
├── app/          # providers, QueryClient e sincronização em tempo real
├── components/   # componentes visuais e de layout
├── contracts/    # schemas Zod e tipos inferidos
├── lib/          # clientes HTTP/Socket.IO e utilitários
├── mocks/        # fixtures, handlers, banco persistente e WebSocket
├── queries/      # query options e query keys
└── routes/       # rotas e páginas
```

## Decisões de implementação

- A URL é a fonte do estado do catálogo: aba, texto, categoria, coleção, rede, faixa de preço, ordenação e página.
- Os contratos Zod ficam separados dos handlers para evitar respostas fictícias dentro de componentes.
- Valores monetários permanecem strings nas fronteiras e usam Decimal.js nos cálculos.
- O mock funciona na camada de rede e persiste um banco versionado em `localStorage`.
- As imagens e fontes necessárias para a Home são locais.
- As senhas simuladas usam bcrypt, mesmo sendo um ambiente somente de demonstração.

## Limitações conhecidas

- A entrega não satisfaz todo o escopo obrigatório do desafio e não deve ser interpretada como concluída.
- Apenas a Home possui interface desenvolvida; as demais rotas exibem placeholders.
- A Home ainda não contém todas as seções e navegações do Figma.
- Os handlers de domínio foram testados manualmente no navegador, mas não possuem uma suíte automatizada entregue.
- Não há simulação geral configurável de latência variável, respostas fora de ordem e indisponibilidade de rede.
- Não existe evidência versionada de metas Lighthouse.
- O bundle principal ainda gera aviso de chunk acima de 500 kB no build e precisa de divisão por rotas.
- Não há URL pública nesta versão.

## Verificação manual sugerida

1. Execute `npm ci`, copie `.env.example` para `.env` e rode `npm run dev`.
2. Abra a Home em 390 px e 1440 px.
3. Teste abas, busca, categorias, preço, rede, ordenação e paginação.
4. Confirme que os parâmetros permanecem na URL após refresh e histórico do navegador.
5. Dispare `nft.updated` pelo endpoint documentado e observe a revalidação do catálogo.
6. Execute o reset do mock e confirme o retorno ao estado inicial.
7. Execute `npm run lint` e `npm run build`.

## Observação sobre o desafio

O objetivo deste repositório foi organizar primeiro contratos, consistência dos mocks e regras de negócio antes de conectar todas as telas. Essa base está presente, mas o tempo disponível não permitiu concluir a experiência visual, os testes e a publicação exigidos pelo enunciado.

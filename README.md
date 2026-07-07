# Motoboy App

Backend NestJS da plataforma de logística de entregas Motoboy App. O código atual cobre autenticação de lojas, cadastro e gestão de lojas, cadastro e gestão de entregadores e persistência com Prisma/PostgreSQL.

## Visão geral

O projeto expõe API HTTP com Swagger em `/docs` e usa JWT para autenticação. Pelo código-fonte, os módulos implementados são:

- `auth`: login de loja, refresh de token e logout;
- `store`: criação, listagem, consulta, atualização e remoção de lojas;
- `courier`: criação, listagem, consulta, atualização e remoção de entregadores;
- `prisma`, `hash`, `guards` e `jwt`: infraestrutura compartilhada.

O schema do Prisma também contém `Order` e `Tenant`, mas não há módulo de pedidos implementado em `src/`.

## Stack técnica

- NestJS 11
- TypeScript 5.7
- Prisma 6.19
- PostgreSQL
- JWT
- bcrypt
- Swagger
- Zod

## Requisitos

- Node.js instalado
- npm instalado
- Banco PostgreSQL acessível via `DATABASE_URL`

## Configuração

Crie um arquivo `.env` na raiz do projeto com as variáveis usadas pelo código:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/motoboy_app?schema=public"
JWT_SECRET="sua_chave_secreta_jwt"
SALT_ROUNDS=10
PORT=3000
```

O arquivo `.env.example` não existe no repositório atual.

## Instalação

```bash
npm install
npx prisma generate
npx prisma migrate dev
```

## Execução

Desenvolvimento:

```bash
npm run start:dev
```

Produção:

```bash
npm run build
npm run start:prod
```

## Swagger

Depois de iniciar a aplicação, a documentação interativa fica disponível em:

```text
http://localhost:3000/docs
```

## Rotas disponíveis

### Auth

- `POST /auth/login/store`
- `POST /auth/refresh`
- `POST /auth/logout`

### Store

- `POST /store`
- `GET /store`
- `GET /store/:id`
- `PATCH /store/:id`
- `DELETE /store/:id`

### Courier

- `POST /courier`
- `GET /courier`
- `GET /courier/:id`
- `PATCH /courier`
- `DELETE /courier/:id`

As rotas protegidas usam `AuthGuard` e exigem `Authorization: Bearer <token>`. O login de loja usa `x-refresh-token` para refresh e logout.

## Testes

```bash
npm run test
npm run test:e2e
npm run test:cov
```

## Documentação técnica

Para ver a análise completa da arquitetura, módulos, endpoints, variáveis de ambiente e débitos técnicos, consulte [DOCUMENTATION.md](DOCUMENTATION.md).

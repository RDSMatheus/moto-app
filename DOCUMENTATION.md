# DOCUMENTATION.md

## 1. Visão Geral do Produto

O projeto `motoboy-app` é um backend NestJS para uma plataforma de logística de entregas. Pelo código-fonte, ele cobre três áreas principais:

- autenticação de loja (`auth`), com login, renovação e logout de refresh token;
- cadastro e gestão de lojas (`store`), incluindo criação de tenant associado;
- cadastro e gestão de entregadores (`courier`).

As entidades persistidas no Prisma são `Store`, `Courier`, `Order` e `Tenant`. O modelo `Order` existe no schema, mas não foi encontrado nenhum módulo, controller, service ou repository de pedidos em `src/`.

O `README.md` cita um lado “Despacha” e menciona rota `/order`, mas isso não aparece implementado no código analisado. Portanto, essa parte não pode ser confirmada como funcional apenas com base no repositório atual.

## 2. Stack Técnica

### Dependências e ferramentas declaradas em `package.json`

| Tecnologia | Versão declarada | Onde aparece |
|---|---:|---|
| NestJS core/common/platform-express | `^11.0.1` | `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express` |
| NestJS CLI/schematics/testing | `^11.0.0` / `^11.0.1` | `@nestjs/cli`, `@nestjs/schematics`, `@nestjs/testing` |
| NestJS JWT | `^11.0.2` | `@nestjs/jwt` |
| NestJS Swagger | `^11.4.5` | `@nestjs/swagger` |
| Prisma Client | `^6.19.3` | `@prisma/client` |
| Prisma CLI | `^6.19.3` | `prisma` |
| bcrypt | `^6.0.0` | `bcrypt` |
| RxJS | `^7.8.1` | `rxjs` |
| Zod | `^4.4.3` | `zod` |
| TypeScript | `^5.7.3` | `typescript` |
| Jest | `^30.0.0` | `jest`, `@types/jest` |
| Supertest | `^7.0.0` | `supertest`, `@types/supertest` |
| Prettier | `^3.4.2` | `prettier` |
| ESLint | `^9.18.0` | `eslint`, `@eslint/js`, `@eslint/eslintrc`, `typescript-eslint` |

### Infra declarada no `prisma/schema.prisma`

| Elemento | Valor no schema |
|---|---|
| Datasource | `provider = "postgresql"` |
| Generator principal | `provider = "prisma-client-js"` |
| Generator customizado | `provider = "prisma-client"`, `output = "../generated/prisma"` |

Observação: o schema não traz versão de pacote, apenas a configuração do datasource e dos generators.

## 3. Arquitetura

### Camadas observadas

O projeto segue a ideia de Controller → Service → Repository → Prisma nos módulos de domínio que têm persistência própria.

| Módulo | Controller | Service | Repository | Prisma direto | Observação |
|---|---|---|---|---|---|
| `store` | Sim | Sim | Sim | Sim, via `PrismaService` | Cadeia completa de camadas |
| `courier` | Sim | Sim | Sim | Sim, via `PrismaService` | Cadeia completa de camadas |
| `auth` | Sim | Sim | Não | Indireto, via `StoreService` e `JwtService` | Depende de `StoreService`, `HashService` e JWT |
| `prisma` | Não | Sim (`PrismaService`) | Não | Sim | Camada de infraestrutura |
| `hash` | Não | Sim | Não | Não | Serviço utilitário de bcrypt |
| `guards` / `jwt` | Não | Não | Não | Não | Infra de autenticação |

### Estrutura de pastas real de `src/` até 3 níveis

```text
src/
├── app.controller.ts
├── app.module.ts
├── app.service.ts
├── main.ts
├── auth/
│   ├── auth.controller.ts
│   ├── auth.module.ts
│   ├── auth.service.ts
│   └── dtos/
│       └── auth.dto.ts
├── common/
│   ├── guards/
│   │   ├── auth.guard.module.ts
│   │   └── auth.guard.ts
│   ├── hash/
│   │   ├── hash.module.ts
│   │   └── hash.service.ts
│   └── jwt/
│       └── jwt-config.module.ts
├── courier/
│   ├── courier.controller.ts
│   ├── courier.module.ts
│   ├── courier.repository.ts
│   ├── courier.service.ts
│   └── dtos/
│       ├── create-courier.dto.ts
│       └── update-courier.dto.ts
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── store/
    ├── store.controller.ts
    ├── store.module.ts
    ├── store.repository.ts
    ├── store.service.ts
    ├── dtos/
    │   ├── create-store.dto.ts
    │   └── update-store.dto.ts
    └── entity/
        └── store.entity.ts
```

### Fluxo de autenticação

O fluxo de autenticação encontrado no código é baseado em JWT com dois tipos de token:

- `accessToken`: expiração de `15m`.
- `refreshToken`: expiração de `1h`.

O secret é lido de `process.env.JWT_SECRET`. Porém, há inconsistência:

- `JwtConfigModule` registra o `JwtModule` global com `secret: process.env.JWT_SECRET`.
- `AuthService` assina tokens com `secret: process.env.JWT_SECRET || 'secret'`.
- `AuthGuard` valida token com `secret: process.env.JWT_SECRET || 'secret'`.

O payload gerado no login de loja é:

```ts
{
  sub: store.id,
  tenant: store.tenantId,
  store,
}
```

O refresh token é emitido com este formato:

```ts
{
  type: 'refresh',
  storeId: store.id,
}
```

No refresh, o token recebido no header `x-refresh-token` é decodificado, o `storeId` é extraído, o hash salvo no banco é comparado com `bcrypt`, e somente então novos tokens são emitidos.

O guard extrai o token do header `Authorization` no formato `Bearer <token>`, chama `verifyAsync()` do `JwtService` e grava o payload em `request['user']`.

O guard não foi aplicado globalmente. Ele aparece apenas com `@UseGuards(AuthGuard)` em rotas específicas de `store` e `courier`.

### Arquitetura de real-time

Não identificado no código-fonte.

Não foram encontrados `@WebSocketGateway`, `@SubscribeMessage`, `WebSocketServer`, `emit()` nem dependências de Socket.IO no repositório analisado.

## 4. Módulos Existentes

### `AppModule`

```ts
@Module({
  imports: [
    StoreModule,
    PrismaModule,
    HashModule,
    AuthGuardModule,
    JwtConfigModule,
    CourierModule,
  ],
  providers: [PrismaService],
})
```

- Nome do módulo: `AppModule`
- Imports: `[StoreModule, PrismaModule, HashModule, AuthGuardModule, JwtConfigModule, CourierModule]`
- Providers: `[PrismaService]`
- Exports: não declarado
- Responsabilidade: composição raiz da aplicação e agregação dos módulos de feature/infra.

### `AuthModule`

```ts
@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtService],
  imports: [JwtModule, StoreModule, HashModule],
  exports: [AuthService],
})
```

- Nome do módulo: `AuthModule`
- Imports: `[JwtModule, StoreModule, HashModule]`
- Controllers: `[AuthController]`
- Providers: `[AuthService, JwtService]`
- Exports: `[AuthService]`
- Responsabilidade: autenticação de lojas, emissão de tokens, refresh e logout.

Observação: este módulo existe, mas não foi encontrado em `AppModule`.

### `StoreModule`

```ts
@Module({
  imports: [PrismaModule, HashModule, AuthGuardModule],
  controllers: [StoreController],
  providers: [StoreService, StoreRepository],
  exports: [StoreService, StoreRepository],
})
```

- Nome do módulo: `StoreModule`
- Imports: `[PrismaModule, HashModule, AuthGuardModule]`
- Controllers: `[StoreController]`
- Providers: `[StoreService, StoreRepository]`
- Exports: `[StoreService, StoreRepository]`
- Responsabilidade: CRUD de lojas e criação de tenant associado.

### `CourierModule`

```ts
@Module({
  imports: [PrismaModule, HashModule],
  controllers: [CourierController],
  providers: [CourierService, CourierRepository],
  exports: [CourierService, CourierRepository],
})
```

- Nome do módulo: `CourierModule`
- Imports: `[PrismaModule, HashModule]`
- Controllers: `[CourierController]`
- Providers: `[CourierService, CourierRepository]`
- Exports: `[CourierService, CourierRepository]`
- Responsabilidade: CRUD de entregadores.

### `PrismaModule`

```ts
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
```

- Nome do módulo: `PrismaModule`
- Imports: não declarado
- Controllers: não declarado
- Providers: `[PrismaService]`
- Exports: `[PrismaService]`
- Responsabilidade: disponibilizar o client Prisma conectado ao banco.

### `HashModule`

```ts
@Module({
  providers: [HashService],
  exports: [HashService],
})
```

- Nome do módulo: `HashModule`
- Imports: não declarado
- Controllers: não declarado
- Providers: `[HashService]`
- Exports: `[HashService]`
- Responsabilidade: encapsular hash e comparação de senhas com bcrypt.

### `AuthGuardModule`

```ts
@Module({
  imports: [JwtModule],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
```

- Nome do módulo: `AuthGuardModule`
- Imports: `[JwtModule]`
- Controllers: não declarado
- Providers: `[AuthGuard]`
- Exports: `[AuthGuard]`
- Responsabilidade: fornecer o guard usado nas rotas protegidas.

### `JwtConfigModule`

```ts
@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  exports: [JwtModule],
})
```

- Nome do módulo: `JwtConfigModule`
- Imports: `JwtModule.registerAsync(...)`
- Controllers: não declarado
- Providers: não declarado
- Exports: `[JwtModule]`
- Responsabilidade: configurar o `JwtModule` globalmente para a aplicação.

## 5. Endpoints da API

### `AppController`

| Método | Rota | Auth | Parâmetros | Retorno |
|---|---|---|---|---|
| `GET` | `/` | Não | Nenhum | String `Hello World!` |

Observação: o controller existe em `src/app.controller.ts`, mas não foi registrado em `AppModule`.

### `AuthController`

| Método | Rota | Auth | Parâmetros | Retorno |
|---|---|---|---|---|
| `POST` | `/auth/login/store` | Não | Body `LoginDto`: `email`, `password` | `{ accessToken, refreshToken }` |
| `POST` | `/auth/refresh` | Não | Header `x-refresh-token` | `{ accessToken, refreshToken }` |
| `POST` | `/auth/logout` | Não | Header `x-refresh-token` | `{ message: 'Logout realizado com sucesso' }` |

Observação: o módulo `AuthModule` não aparece importado em `AppModule`, então o registro real dessas rotas não fica garantido pela composição principal da aplicação.

### `StoreController`

| Método | Rota | Auth | Parâmetros | Retorno |
|---|---|---|---|---|
| `POST` | `/store` | Sim (`AuthGuard`) | Body `CreateStoreDto`: `name`, `cpfCnpj`, `email`, `phone`, `address`, `password`, `confirmPassword` | `Store` criado |
| `GET` | `/store` | Sim (`AuthGuard`) | Nenhum | `Store[]` |
| `GET` | `/store/:id` | Sim (`AuthGuard`) | Parâmetro `id` | `Store` |
| `PATCH` | `/store/:id` | Sim (`AuthGuard`) | Parâmetro `id` + Body `UpdateStoreDto` (`id`, `name?`, `cpfCnpj?`, `email?`, `phone?`, `address?`, `refreshToken?`) | `Store` atualizado |
| `DELETE` | `/store/:id` | Sim (`AuthGuard`) | Parâmetro `id` | `Store` removido |

### `CourierController`

| Método | Rota | Auth | Parâmetros | Retorno |
|---|---|---|---|---|
| `POST` | `/courier` | Não | Body `CreateCourierDto`: `name`, `email`, `password`, `confirmPassword`, `cpf`, `phone` | `Courier` criado |
| `GET` | `/courier` | Sim (`AuthGuard`) | Nenhum | `Courier[]` |
| `GET` | `/courier/:id` | Sim (`AuthGuard`) | Parâmetro `id` | `Courier` |
| `PATCH` | `/courier` | Sim (`AuthGuard`) | Body `UpdateCourierDto`: `id`, `name?`, `email?`, `phone?`, `password?`, `cpf?` | `Courier` atualizado |
| `DELETE` | `/courier/:id` | Sim (`AuthGuard`) | Parâmetro `id` | Sem payload explícito; o service retorna `void` |

## 6. Eventos Socket.IO

Não identificado no código-fonte.

- Não existem gateways em `src/`.
- Não existem eventos `@SubscribeMessage`.
- Não existem chamadas `emit(...)` em `src/`.

## 7. Variáveis de Ambiente

| Variável | Arquivo(s) | Uso | Default no código |
|---|---|---|---|
| `DATABASE_URL` | `prisma/schema.prisma` | Fonte de dados PostgreSQL do Prisma | Não |
| `JWT_SECRET` | `src/common/jwt/jwt-config.module.ts`, `src/auth/auth.service.ts`, `src/common/guards/auth.guard.ts` | Secret para assinatura/verificação de JWT | Sim em `auth.service.ts` e `auth.guard.ts` (`'secret'`); não em `jwt-config.module.ts` |
| `SALT_ROUNDS` | `src/common/hash/hash.service.ts` | Número de rounds do bcrypt | Sim, `10` |
| `PORT` | `src/main.ts` | Porta do servidor HTTP | Sim, `3000` |

Não identifiquei arquivo `.env.example` no repositório.

## 8. Débitos Técnicos / TODOs

- `src/app.module.ts` (~linha 1-14): `AppController` não é registrado no `AppModule`, então o endpoint `GET /` existe no arquivo, mas não sobe com a aplicação atual.
- `src/auth/auth.module.ts` (~linhas 1-14) e `src/app.module.ts` (~linhas 1-15): `AuthModule` existe, mas não foi importado em `AppModule`, então o registro das rotas de auth não fica garantido pela composição principal.
- `src/store/store.repository.ts` (~linha 43): `update()` está tipado com `Prisma.CourierUncheckedUpdateInput` em um repositório de `Store`; o tipo está desalinhado com a entidade e pode mascarar erro de modelagem.
- `src/auth/auth.service.ts` (~linhas 19-25, 28-55, 70-114): há `console.log` em fluxo de autenticação/refresh e o fallback hardcoded do JWT secret é `'secret'`, o que cria divergência com `JwtConfigModule` e enfraquece a configuração.
- `src/common/guards/auth.guard.ts` (~linhas 12-33): o `catch` converte qualquer falha em `UnauthorizedException`, inclusive erros de infraestrutura ou de configuração, o que reduz a observabilidade do problema real.
- `src/store/store.service.ts` (~linhas 19-77) e `src/courier/courier.service.ts` (~linhas 19-80): a validação de unicidade existe na criação, mas não na atualização; conflito com `email`, `cpf` ou `cpfCnpj` pode estourar direto do Prisma.
- `src/courier/courier.repository.ts` (~linhas 28-46) e `src/courier/courier.service.ts` (~linhas 50-68): existem métodos para `updateLocation` e `updateStatus`, mas não há rota, service ativo ou gateway para usar esses fluxos; os campos `isOnline`, `latitude` e `longitude` no schema ainda não estão integrados à API.
- `README.md` (~linha 106): o documento menciona `/order`, mas não há implementação correspondente em `src/`.
- `src/auth/auth.controller.ts`, `src/store/store.controller.ts`, `src/courier/courier.controller.ts` e os DTOs em `src/*/dtos/*.ts`: os schemas Zod existem, mas não há `ValidationPipe` ou parser visível ligando validação em runtime aos controllers.

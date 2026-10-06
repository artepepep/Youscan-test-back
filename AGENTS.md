# AGENTS.md

## Project Architecture

This project uses **NestJS + Drizzle ORM + TypeScript**.

Follow the existing project architecture and conventions before introducing new patterns.

For each domain entity, prefer the following structure:

```text
src/
  {entity}/
    {entity}.module.ts
    {entity}.controller.ts
    {entity}.service.ts
    {entity}.repository.ts

    entities/
      {entity}.entity.ts

    dtos/
      create-{entity}.dto.ts
      update-{entity}.dto.ts
```

The standard dependency flow is:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Drizzle / Database
```

### Controller

`SomeEntityController` is responsible for the HTTP/API layer.

Controllers should:

- define routes
- extract request parameters
- accept validated DTOs
- obtain authentication context
- invoke services
- return responses

Controllers must not contain database queries or substantial business logic.

### Service

`SomeEntityService` contains application/business logic.

Services should:

- implement business rules
- coordinate repositories
- coordinate external services
- manage application-level workflows
- throw appropriate application/domain exceptions

Services should not contain raw Drizzle queries when a repository abstraction exists for the entity.

### Repository

`SomeEntityRepository` is responsible for database access.

Repositories should:

- contain Drizzle queries
- encapsulate persistence logic
- expose domain-oriented database operations
- hide query implementation details from services

Prefer:

```ts
usersService
  -> usersRepository
      -> Drizzle
```

instead of:

```ts
usersService
  -> Drizzle directly
```

---

## Drizzle

Use **Drizzle ORM** for database access.

Do not introduce another ORM or persistence abstraction unless explicitly requested.

Database queries belonging to a specific entity should normally live in that entity's repository.

Example:

```ts
@Injectable()
export class UserRepository {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: DrizzleDatabase,
  ) {}

  async findById(id: string) {
    // Drizzle query
  }
}
```

Follow the existing project's Drizzle initialization, injection, schema, and migration conventions.

For schema changes:

1. update/create the appropriate Drizzle schema/entity
2. generate or create the required migration
3. update the repository
4. update tests
5. verify the migration

Do not manually bypass the project's migration system.

---

## Entities / Models

Every new entity/model belonging to a domain must be placed under:

```text
src/{entity}/entities/
```

Example:

```text
src/users/entities/user.entity.ts
src/orders/entities/order.entity.ts
src/payments/entities/payment.entity.ts
```

Do not place entity-specific models inside `shared/`.

`shared/` is reserved for functionality genuinely reused across multiple domains.

---

## DTOs

Entity-specific DTOs must be placed under:

```text
src/{entity}/dtos/
```

Example:

```text
src/users/dtos/create-user.dto.ts
src/users/dtos/update-user.dto.ts
src/users/dtos/user-response.dto.ts
```

DTOs that are genuinely generic and reused across multiple domains belong in:

```text
src/shared/dtos/
```

Examples:

```text
src/shared/dtos/pagination.dto.ts
src/shared/dtos/sort.dto.ts
```

Do not move a DTO into `shared/` merely because it might theoretically be reusable in the future.

Start entity-specific and move to `shared/` only when there is actual cross-domain reuse.

---

## Shared Code

The `src/shared/` directory contains functionality that is reused across the application and does not belong to one specific domain.

Examples:

```text
src/shared/
  dtos/
  helpers/
  guards/
  interceptors/
  middlewares/
  decorators/
  filters/
  pipes/
  constants/
  types/
```

Use the appropriate subdirectory.

Examples:

```text
src/shared/helpers/
src/shared/middlewares/
src/shared/guards/
src/shared/interceptors/
```

### Helpers

Generic functions used across the project must be placed in:

```text
src/shared/helpers/
```

For example:

```text
src/shared/helpers/date.helper.ts
src/shared/helpers/pagination.helper.ts
src/shared/helpers/string.helper.ts
```

Do not put entity-specific business logic into `shared/helpers`.

Bad:

```text
shared/helpers/calculate-order-price.helper.ts
```

if the logic belongs exclusively to the orders domain.

Prefer:

```text
orders/helpers/calculate-order-price.helper.ts
```

or keep it inside the appropriate service/domain component.

### Shared Rule

Something belongs in `shared/` only when it is genuinely cross-domain.

For example:

```text
Used only by Users
→ src/users/...

Used only by Orders
→ src/orders/...

Used by Users, Orders, Payments, etc.
→ src/shared/...
```

Do not prematurely move code into `shared/`.

---

## TypeScript Types

Prefer `type` over `interface`.

Use:

```ts
type User = {
  id: string;
  email: string;
};
```

instead of:

```ts
interface User {
  id: string;
  email: string;
}
```

Use `interface` only when there is a concrete technical reason that requires interface-specific behavior.

For unions, mappings, compositions, and application data structures, use `type`.

Shared types belong in:

```text
src/shared/types/
```

Entity-specific types should remain inside the entity/domain directory.

---

## Tests

Tests are required for new functionality.

When implementing or modifying business logic:

- add tests for the new behavior
- update existing tests when behavior changes
- test success paths
- test relevant error paths
- test important edge cases

Follow the project's existing testing framework and conventions.

Prefer testing observable behavior rather than implementation details.

Do not remove or weaken existing tests merely to make a change pass.

---

## E2E Tests

E2E tests must be placed under:

```text
e2e/tests/
```

Example:

```text
e2e/
  tests/
    users.e2e-spec.ts
    orders.e2e-spec.ts
    auth.e2e-spec.ts
```

Before adding E2E tests, inspect whether the project already has an E2E test harness.

If no E2E infrastructure exists, create the required test harness first.

The harness should handle, as appropriate:

- Nest application initialization
- test configuration
- test database connection
- database cleanup/reset
- migrations
- authentication helpers
- application shutdown
- reusable HTTP client/setup
- global test lifecycle

Prefer reusable infrastructure instead of repeating application setup in every E2E test.

A possible structure is:

```text
e2e/
  setup/
    create-test-app.ts
    database.ts
    global-setup.ts
    global-teardown.ts

  helpers/
    auth.helper.ts
    request.helper.ts

  tests/
    users.e2e-spec.ts
    orders.e2e-spec.ts
```

Use the project's existing structure if one already exists.

E2E tests should exercise the application through its public API whenever possible:

```text
HTTP request
    ↓
Controller
    ↓
Service
    ↓
Repository
    ↓
Test database
```

Do not mock the repository/database in E2E tests unless there is a specific reason to do so.

---

## Feature Implementation

When implementing a new entity feature, the expected architecture is normally:

```text
src/
  users/
    users.module.ts
    users.controller.ts
    users.service.ts
    users.repository.ts

    entities/
      user.entity.ts

    dtos/
      create-user.dto.ts
      update-user.dto.ts
```

The dependency direction should remain:

```text
Controller
    ↓
Service
    ↓
Repository
    ↓
Drizzle
```

When implementing a feature:

1. inspect similar existing features
2. determine affected entities and modules
3. create/update entities
4. create/update DTOs
5. implement repository persistence
6. implement service/business logic
7. expose functionality through the controller
8. register dependencies in the NestJS module
9. create migrations when necessary
10. add unit/integration tests
11. add E2E tests when applicable
12. run relevant tests
13. run lint/typecheck/build
14. inspect the final diff

---

## Existing Code Takes Precedence

Before creating something new, search the repository for an existing implementation.

Before creating:

```text
Repository    → inspect existing repositories
Service       → inspect existing services
Controller    → inspect existing controllers
DTO           → inspect existing DTOs
Guard         → inspect shared/guards
Interceptor   → inspect shared/interceptors
Middleware    → inspect shared/middlewares
Helper        → inspect shared/helpers
Type          → inspect existing types
E2E setup     → inspect e2e/
```

Follow established project conventions whenever they exist.

Do not create duplicate abstractions.

---

## Definition of Done

A backend feature is not complete until:

- Controller → Service → Repository separation is respected
- Drizzle access is placed in the appropriate repository
- new entities/models are placed under `src/{entity}/entities/`
- entity-specific DTOs are placed under `src/{entity}/dtos/`
- generic DTOs are placed under `src/shared/dtos/`
- reusable helpers are placed under `src/shared/helpers/`
- globally reused guards/interceptors/middlewares/etc. are placed under `src/shared/`
- `type` is preferred over `interface`
- tests are added or updated
- E2E tests are added when applicable
- E2E infrastructure exists before E2E tests are introduced
- database migrations are included when required
- TypeScript compiles
- relevant tests pass
- lint/build checks pass when configured
- no unrelated changes are included

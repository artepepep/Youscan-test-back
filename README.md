# Dashboard API

NestJS API for persistent dashboard widgets, backed by PostgreSQL and Drizzle
ORM.

## Setup

Requirements: Node.js 20+, Yarn, and PostgreSQL.

```bash
cp .env.example .env
yarn install
docker compose up -d
yarn start:dev
```

Docker Compose waits for PostgreSQL to become healthy, then runs migrations and
the idempotent initial-data seed in the one-shot `db-setup` service.

The API is served at `http://localhost:3000/api`. The frontend origin defaults
to `http://localhost:5173`; use the comma-separated `CORS_ORIGIN` environment
variable to allow other origins.

## Initial data

Place the task's supplied `.xlsx` and `.csv` files in `data/` (or set
`DATA_DIRECTORY`), then run `yarn db:seed`. When the widgets table is empty, the
command parses both files and creates the required line, pie, and stacked-bar
widgets. If widgets already exist, the command safely skips seeding. Values are
always parsed from the files and are not present in source code.

The XLSX/CSV parser is also exposed through the import endpoint, so additional
datasets can be stored later.

## Endpoints

| Method   | Path                  | Purpose                                               |
| -------- | --------------------- | ----------------------------------------------------- |
| `GET`    | `/api`                | Health check                                          |
| `GET`    | `/api/widgets`        | List widgets in dashboard order                       |
| `GET`    | `/api/widgets/:id`    | Get one widget                                        |
| `POST`   | `/api/widgets`        | Create a widget; chart data is randomized server-side |
| `POST`   | `/api/widgets/import` | Import a chart from CSV/XLSX multipart data           |
| `PATCH`  | `/api/widgets/:id`    | Update a title or text-widget content                 |
| `DELETE` | `/api/widgets/:id`    | Delete a widget                                       |

Create a widget:

```bash
curl -X POST http://localhost:3000/api/widgets \
  -H 'Content-Type: application/json' \
  -d '{"type":"bar","title":"New chart"}'
```

Supported types are `line`, `bar`, `stacked-bar`, `pie`, and `text`.

Import a dataset:

```bash
curl -X POST http://localhost:3000/api/widgets/import \
  -F 'type=stacked-bar' \
  -F 'title=Imported traffic' \
  -F 'file=@data/traffic.csv'
```

CSV and XLSX files must contain a header row and at least one numeric column.
The first column becomes the category label. Line, bar, and stacked-bar imports
retain all following numeric series; pie imports use the first numeric series.
For workbooks with multiple sheets, an optional `sheet` form field selects a
worksheet by name. Otherwise a sheet matching the chart type is preferred, with
the first sheet used as fallback. Uploads are limited to 5 MB.

## Database and checks

```bash
yarn db:generate  # generate migrations after schema changes
yarn db:migrate
yarn db:seed
yarn lint
yarn test --runInBand
yarn build
```

Database access follows `Controller -> Service -> Repository -> Drizzle`.
The generated SQL migrations are committed under `drizzle/`.

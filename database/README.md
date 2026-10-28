# TraceIntel Database

This folder is the human-facing database boundary for TraceIntel AG-1.

## Source of truth

Flyway migrations are kept with the backend because Spring Boot loads them from the classpath:

- `backend/src/main/resources/db/migration/V1__init_schema.sql`
- `backend/src/main/resources/db/migration/V2__seed_demo_data.sql`

Do not duplicate these SQL files here. A second copy would make schema changes easy to miss during application startup.

## Local PostgreSQL configuration

The development configuration uses:

- Host: `localhost`
- Port: `5432`
- Database: `traceintel`
- Username: `postgres`
- Password: `postgres`

## Verification commands

From the repository root:

```powershell
cd backend
mvn test
mvn spring-boot:run
```

Flyway applies pending migrations automatically when the backend starts.

To inspect migration status with PostgreSQL:

```powershell
$env:PGPASSWORD = "postgres"
psql -U postgres -h localhost -d traceintel -c "SELECT version, success FROM flyway_schema_history ORDER BY installed_rank;"
```

## Data responsibilities

- `V1__init_schema.sql` defines the normalized schema and constraints.
- `V2__seed_demo_data.sql` provides clearly labeled local demo data.
- Application code owns runtime writes through repositories and services.
- Database changes must be introduced as a new Flyway migration; do not edit an applied migration.

## Verified local seed snapshot

The current PostgreSQL database was rebuilt from V1 and V2 and verified against
the data plan:

| Dataset | Rows |
|---|---:|
| Roles | 5 |
| Users | 6 |
| Suppliers | 5 |
| Customers | 6 |
| Machines | 6 |
| Parts | 16 |
| BOM items | 12 |
| Material lots | 10 |
| Production batches | 8 |
| Batch-material links | 10 |
| Serial numbers | 50 |
| Scan events | 1,293 |
| Shipments | 3 |
| Shipment items | 5 |
| Vehicle links | 10 |
| Quality holds | 1 |
| Trace runs | 1 |
| Audit logs | 5 |

The demo scenarios are present: one `ON_HOLD` lot, accepted and blocked scans,
pre-linked VINs, shipments, and an approved two-person quality hold.

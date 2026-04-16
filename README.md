## tacos TA Calculation System

## Build & Run

* go into src/tacos.mvc

### install dependencies

* `dotnet restore`

* `npm install`

### one time setup

* set your user secrets `dotnet user-secrets set Common:IetWsKey <askmeforkey>`

### run

* `npm run debug`

## EF Core Migrations

* restore the repo-pinned EF CLI tool with `dotnet tool restore`
* add a migration with `dotnet ef migrations add <Name> --project src/tacos.core/tacos.core.csproj --startup-project src/tacos.mvc/tacos.mvc.csproj`
* apply migrations with `dotnet ef database update --project src/tacos.core/tacos.core.csproj --startup-project src/tacos.mvc/tacos.mvc.csproj`
* validate EF wiring with `dotnet ef dbcontext info --project src/tacos.core/tacos.core.csproj --startup-project src/tacos.mvc/tacos.mvc.csproj`
* use `dotnet build src/tacos.core/tacos.core.csproj` and `dotnet build src/tacos.mvc/tacos.mvc.csproj` for CLI validation; `dotnet build tacos.sln` still fails because the legacy `src/tacos.sql` project requires SSDT targets

### Existing Production Database Baseline

* the first EF migration is `20260416212924_InitialCreate`
* do not run that initial migration directly against an already-existing production database
* instead, run [20260416212924_InitialCreate.baseline.sql](/Users/postit/Documents/github/tacos/src/tacos.core/Migrations/20260416212924_InitialCreate.baseline.sql) once to create `__EFMigrationsHistory` if needed and record the initial migration as already applied
* after that baseline step, normal EF migrations can be applied by startup or by `dotnet ef database update`

### Annual Refresh

Run SQL Server Agent Job on Db: `Load AZURE Tacos`

Reset exceptions to default using `/System/ManageSubmissions`

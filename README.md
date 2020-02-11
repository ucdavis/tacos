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

### Annual Refresh

Run SQL Server Agent Job on Db: `Load AZURE Tacos`

Reset exceptions to default (script TODO)

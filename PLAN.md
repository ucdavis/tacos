# Split Requests Into TA and Reader Tracks

## Summary
The current request model assumes a course request has one support type, one calculated total, and one annualized total, with `RequestType` indicating whether that single set of numbers represents TA or Reader support. The target structure is one request row per course that can store both TA and Reader values at the same time.

This plan is intentionally phased. Phase 1 expands the schema and backfills existing data without cutting the application over yet. Later phases update the server, client, and formula pipeline to read and write the new split fields end to end.

## Status
- Phase 1: Complete
- Phase 2: Complete
- Phase 3: Complete
- Phase 4: Complete
- Phase 5: In progress
- Phase 6: Complete

### Completed in Phase 1
- Added split TA/Reader storage fields to the EF models in `src/tacos.core/Data/Request.cs` and `src/tacos.core/Data/RequestHistory.cs`.
- Generated EF Core migration `20260416213915_SplitTaReaderPhase1`.
- Updated the EF model snapshot to include the new columns.
- Added migration backfill SQL inside the EF migration so existing `TA` rows populate TA columns and existing `READ` rows populate Reader columns in both `Requests` and `RequestHistory`.
- Preserved legacy fields for compatibility with the current application code until Phase 2.
- Verified the affected .NET projects build successfully:
  - `dotnet build src/tacos.core/tacos.core.csproj`
  - `dotnet build src/tacos.mvc/tacos.mvc.csproj`

## Target Data Contract
The final request shape should remove row-level `RequestType` and replace all unlabeled support totals with explicit TA and Reader fields.

### Split support fields
- `CalculatedTaTotal`
- `CalculatedReaderTotal`
- `AnnualizedTaTotal`
- `AnnualizedReaderTotal`
- `ExceptionTaTotal`
- `ExceptionReaderTotal`
- `ExceptionAnnualizedTaTotal`
- `ExceptionAnnualizedReaderTotal`

### Shared row-level fields that remain
- `Exception`
- `ExceptionReason`
- `ExceptionAnnualCount`
- `Approved`
- `ApprovedComment`

### Computed approval fields to replace generic totals
- `ApprovedTaTotal`
- `ApprovedReaderTotal`
- `ApprovedAnnualizedTaTotal`
- `ApprovedAnnualizedReaderTotal`

Any consumer that still needs a combined number should compute `TA + Reader` explicitly at the usage site and label it clearly as a combined total.

## Phase 1 — Schema Expansion and Backfill
### Goal
Add the new TA/Reader columns to `Requests` and `RequestHistory`, preserve the old columns temporarily, and backfill existing rows so the database can hold the new shape without breaking the current application.

### Status
Complete.

### Changes
- Add new split columns to the EF-backed `Requests` table:
  - `CalculatedTaTotal`
  - `CalculatedReaderTotal`
  - `AnnualizedTaTotal`
  - `AnnualizedReaderTotal`
  - `ExceptionTaTotal`
  - `ExceptionReaderTotal`
  - `ExceptionAnnualizedTaTotal`
  - `ExceptionAnnualizedReaderTotal`
- Add the same split columns to `RequestHistory`.
- Keep these legacy columns in place for now:
  - `RequestType`
  - `CalculatedTotal`
  - `AnnualizedTotal`
  - `ExceptionTotal`
  - `ExceptionAnnualizedTotal`
- Add an EF Core migration that maps existing rows using the old `RequestType`:
  - `TA` rows populate only TA columns
  - `READ` rows populate only Reader columns
  - the opposite type is set to `0`
- Apply the same backfill logic to `RequestHistory`.
- Leave the application on the legacy single-value fields until later phases cut over read/write behavior.

### Deliverables
- Updated EF models for `Request` and `RequestHistory`.
- EF migration `20260416213915_SplitTaReaderPhase1`.
- Updated `TacoDbContextModelSnapshot`.
- Existing rows backfilled when the EF migration is applied.

### Notes
- Phase 1 does not remove legacy columns.
- Phase 1 does not update the application to read or write the new columns yet.
- New rows written by the old application after Phase 1 deployment will still use the legacy columns until Phase 2 is deployed.
- This phase was implemented through EF Core migrations, not through the SSDT SQL project.

## Phase 2 — Domain Model and Server Cutover
### Goal
Update the C# domain model and controller layer so the application stops depending on `RequestType` and starts reading and writing the split TA/Reader fields.

### Status
Complete.

### Completed
- Added split TA/Reader properties to `src/tacos.mvc/Models/RequestModel.cs`, then removed the legacy request-type and aggregate payload fields once the client cutover landed.
- Added per-type approval computed properties in `src/tacos.core/Data/Request.cs`:
  - `ApprovedTaTotal`
  - `ApprovedReaderTotal`
  - `ApprovedAnnualizedTaTotal`
  - `ApprovedAnnualizedReaderTotal`
- Updated `RequestsController.Save` to persist split TA/Reader values as the server-side source of truth.
- Updated request submission history creation in `RequestsController` to capture the split TA/Reader fields.
- Updated approval history creation in `ApprovalController` to capture the split TA/Reader fields.
- Removed active controller dependence on `RequestType` and aggregate fallback/synchronization once the split client payload shipped.
- Removed server-side dependence on `CourseInfo.Requests`.
- Added controller coverage for:
  - persisting split TA/Reader fields on save
  - capturing split TA/Reader fields in request history on submit
- Verified:
  - `dotnet build src/tacos.core/tacos.core.csproj`
  - `dotnet build src/tacos.mvc/tacos.mvc.csproj`
  - `dotnet test Test/Test.csproj --filter RequestsControllerTests`

### Changes
- Update `src/tacos.core/Data/Request.cs`:
  - remove `RequestType`
  - add split TA/Reader totals
  - replace `ApprovedTotal` and `ApprovedAnnualizedTotal` with per-type computed properties
- Update `src/tacos.core/Data/RequestHistory.cs` to match.
- Update `src/tacos.mvc/Models/RequestModel.cs` to match the new payload shape.
- Update `RequestsController.Save` to persist the split fields.
- Update `RequestsController.Submit` and request history creation to use the split fields.
- Update `ApprovalController` history snapshot creation to use the split fields.
- Remove server-side dependence on `CourseInfo.Requests`.

### Deliverables
- Server payloads and persistence use split fields only.
- History snapshots preserve TA and Reader values explicitly.

## Phase 3 — Review, Approval, Details, and Notification Surfaces
### Goal
Update server-rendered pages and emails so all request data is displayed with separate TA and Reader values.

### Status
Complete.

### Completed
- Updated `src/tacos.mvc/Views/Requests/Details.cshtml` to show separate TA and Reader values for:
  - suggested per-course support
  - exception per-course support
  - approved per-course support
  - approved annualized support
- Updated the request history table in the details view to display split TA and Reader values.
- Updated `src/tacos.mvc/Views/Review/Index.cshtml` to remove row-level request type display and show separate TA/Reader exception, approved, and annualized totals.
- Updated `src/tacos.mvc/Views/Approval/Index.cshtml` to remove row-level request type display and show separate TA/Reader exception, approved, and annualized totals.
- Updated `src/tacos.mvc/Emails/SubmissionNotification.cshtml` to show separate TA and Reader exception amounts.
- Updated `src/tacos.mvc/Emails/ApprovalNotification.cshtml` to show separate approved TA and Reader amounts.
- Updated the request details view so any combined approved annualized total is computed explicitly in the view from the split TA and Reader values.
- Verified `dotnet build src/tacos.mvc/tacos.mvc.csproj` after the Razor and email-template changes.

### Changes
- Update request details to show:
  - calculated TA and Reader per-offering values
  - exception TA and Reader values
  - approved TA and Reader values
  - annualized approved TA and Reader values
- Update request history tables to show separate TA and Reader values.
- Update review and approval pages to remove the request type column and replace it with labeled TA and Reader totals.
- Update footer summaries to show separate TA and Reader annualized totals, with a combined total only if still useful and explicitly labeled.
- Update submission and approval notification emails to include labeled TA and Reader values instead of one generic amount.

### Deliverables
- No user-facing review or detail page depends on `RequestType`.
- All rendered totals are labeled as TA, Reader, or combined.

## Phase 4 — React State and Editing UI Restructure
### Goal
Reshape the React editing flow so each course request row can edit both TA and Reader values.

### Status
Complete.

### Completed
- Updated `src/tacos.mvc/ClientApp/models/IRequest.ts` to carry split TA/Reader support fields.
- Updated `src/tacos.mvc/ClientApp/containers/SubmissionContainer.tsx` to:
  - maintain split TA and Reader totals in client state
  - calculate and submit split TA/Reader payload values
  - validate exceptions using split TA/Reader exception amounts
  - show separate TA and Reader summary totals
- Updated `src/tacos.mvc/ClientApp/components/RequestsTable.tsx` to:
  - remove the request type column and filter
  - display separate TA and Reader calculated totals
  - display separate annualized TA and Reader totals
  - wire exception editing to split TA and Reader values
- Updated `src/tacos.mvc/ClientApp/components/ExceptionDetail.tsx` to edit:
  - TA exception amount
  - Reader exception amount
  - shared annual count
  - shared reason
- Updated `src/tacos.mvc/ClientApp/components/Summary.tsx` to display separate TA and Reader totals.
- Removed the unused client-side `RequestType` component.
- Updated the focused React tests:
  - `ClientApp/containers/SubmissionContainer.test.tsx`
  - `ClientApp/components/RequestsTable.test.tsx`

### Changes
- Update `src/tacos.mvc/ClientApp/models/IRequest.ts`:
  - remove `requestType`
  - add the split TA/Reader fields
- Remove `src/tacos.mvc/ClientApp/components/RequestType.tsx`.
- Remove request type filters, columns, help text, and tests from `RequestsTable`.
- Update `SubmissionContainer`:
  - request initialization
  - recalculation
  - validation
  - summary totals
  - submit/save payloads
- Update `RequestsTable` to show:
  - TA % per course offering
  - Reader % per course offering
  - annualized TA FTE
  - annualized Reader FTE
- Update `ExceptionDetail` to collect:
  - `ExceptionTaTotal`
  - `ExceptionReaderTotal`
  - shared `ExceptionAnnualCount`
  - shared `ExceptionReason`
- Update validation so an exception requires:
  - `ExceptionAnnualCount > 0`
  - at least one positive exception amount between TA and Reader
- Update summary UI to show split TA and Reader totals instead of one unlabeled request total.

### Deliverables
- The edit UI can store and submit TA and Reader values on the same row.
- No client state or UI logic depends on `requestType`.

## Phase 5 — Formula Pipeline Reshape
### Goal
Refactor the formula layer so course-type formulas can produce both TA and Reader values, even if Reader allocation policy is still temporary.

### Status
Complete.

### Completed
- Updated `src/tacos.mvc/ClientApp/util/formulas.ts` so formulas now return a structured support result:
  - `taPerOffering`
  - `readerPerOffering`
- Added an annualization helper that converts split per-offering support into split annualized totals.
- Moved every-other-year annualization handling into the shared helper.
- Kept a temporary compatibility adapter by mapping the current formula output to TA-only support and `0` Reader support.
- Updated `ClientApp/util/formulas.test.ts` to validate the new structured formula return shape.
- Verified:
  - `npm run build` in `src/tacos.mvc`
  - `npx vitest run ClientApp/util/formulas.test.ts ClientApp/components/RequestsTable.test.tsx ClientApp/containers/SubmissionContainer.test.tsx` in `src/tacos.mvc`

### Changes
- Change the formula contract from `calculate(course) => number` to a structured result, for example:
  - `calculate(course) => { taPerOffering, readerPerOffering }`
- Add a dedicated annualization helper that converts per-offering support into:
  - `annualizedTaTotal`
  - `annualizedReaderTotal`
- Move the every-other-year course adjustment logic into the annualization helper.
- Introduce a temporary compatibility adapter so existing formula logic can feed:
  - `taPerOffering = legacyValue`
  - `readerPerOffering = 0`
- Keep the adapter isolated so final Reader formulas can later replace only the formula implementation layer.

### Deliverables
- Formula output is structurally compatible with split TA/Reader storage.
- Every-other-year logic applies per support type.

### Remaining work in Phase 5
- Replace the temporary TA-only compatibility adapter with final Reader allocation rules once that policy is decided.
- Decide whether any formula cases should produce Reader support instead of TA support in the final business rules.

## Phase 6 — Legacy Cleanup
### Goal
Remove the legacy single-value fields and all remaining request-type behavior after the application has fully cut over.

### Status
In progress.

### Completed so far
- Removed `RequestType` from the active EF/domain models:
  - `src/tacos.core/Data/Request.cs`
  - `src/tacos.core/Data/RequestHistory.cs`
- Removed `RequestType` from the server request payload model in `src/tacos.mvc/Models/RequestModel.cs`.
- Removed server-side `RequestType` handling and fallback logic from:
  - `src/tacos.mvc/Controllers/RequestsController.cs`
  - `src/tacos.mvc/Controllers/ApprovalController.cs`
- Removed the obsolete `CourseInfo.Requests` dictionary from `src/tacos.core/Resources/CourseInfo.cs`.
- Added EF migration `20260416220720_RemoveRequestType` to drop `RequestType` from `Requests` and `RequestHistory`.
- Removed the stored aggregate support columns from the active EF/domain models and replaced them with computed combined properties:
  - this was transitional and has since been removed from the active runtime models
- Removed controller persistence/history writes for those stored aggregate columns.
- Added EF migration `20260416220911_RemoveAggregateSupportColumns` to drop the aggregate support columns from `Requests` and `RequestHistory`.
- Removed the aggregate support fields from the active request payload contract in `src/tacos.mvc/Models/RequestModel.cs`.
- Removed the aggregate support fields from the active client request model in `src/tacos.mvc/ClientApp/models/IRequest.ts`.
- Removed aggregate-field fallback/synchronization from:
  - `src/tacos.mvc/Controllers/RequestsController.cs`
  - `src/tacos.mvc/ClientApp/containers/SubmissionContainer.tsx`
- Removed the last runtime combined convenience properties from:
  - `src/tacos.core/Data/Request.cs`
  - `src/tacos.core/Data/RequestHistory.cs`
- Updated `src/tacos.mvc/Views/Requests/Details.cshtml` to compute the combined approved annualized total explicitly at the point of use.
- Updated the SSDT project artifacts to match the EF-backed split schema:
  - `src/tacos.sql/dbo/Tables/Requests.sql`
  - `src/tacos.sql/dbo/Tables/RequestHistory.sql`
  - `src/tacos.sql/dbo/Stored Procedures/usp_ResetRequests.sql`
- Updated focused frontend tests to stop depending on aggregate payload fields.
- Updated controller tests to stop depending on `RequestType`.
- Verified:
  - `dotnet build src/tacos.core/tacos.core.csproj`
  - `dotnet build src/tacos.mvc/tacos.mvc.csproj`
  - `dotnet test Test/Test.csproj --filter RequestsControllerTests`
  - `npm run build` in `src/tacos.mvc`
  - `npx vitest run ClientApp/util/formulas.test.ts ClientApp/components/RequestsTable.test.tsx ClientApp/containers/SubmissionContainer.test.tsx` in `src/tacos.mvc`

### Changes
- Remove from SQL:
  - `RequestType`
  - `CalculatedTotal`
  - `AnnualizedTotal`
  - `ExceptionTotal`
  - `ExceptionAnnualizedTotal`
- Remove the same legacy fields from C# and TypeScript models.
- Remove `CourseInfo.Requests`.
- Remove any lingering filters, labels, tests, and rendered output that assume one request row has one support type.

### Deliverables
- The system stores only split TA and Reader values.
- No code path depends on row-level request type.

## Testing and Verification
### Phase 1
- Verify the EF migration adds the new columns to both tables.
- Verify existing TA rows backfill into TA columns only.
- Verify existing Reader rows backfill into Reader columns only.
- Verify `RequestHistory` receives the same mapping.
- Verify `src/tacos.core` and `src/tacos.mvc` build successfully after the model and migration updates.

### Later phases
- Add controller tests for save, submit, approval, and history creation with split TA/Reader values.
- Update React tests for the new table columns, split summaries, and split exception editing.
- Update formula tests to assert the new structured formula output and annualization behavior.
- Add regression checks for review pages, detail pages, and emails so all values remain correctly labeled.

## Assumptions
- One request row will hold both TA and Reader values for the same course.
- Exception and approval stay shared at the course-row level.
- `ExceptionAnnualCount` stays shared at the course-row level.
- Existing data is migrated strictly by the old `RequestType`.
- Combined totals remain derived values and are not stored as unlabeled data.
- Reader formula policy is intentionally deferred; this plan only makes the system structurally capable of carrying Reader values end to end.

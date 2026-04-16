# Split Requests Into TA and Reader Tracks

## Summary
The current request model assumes a course request has one support type, one calculated total, and one annualized total, with `RequestType` indicating whether that single set of numbers represents TA or Reader support. The target structure is one request row per course that can store both TA and Reader values at the same time.

This plan is intentionally phased. Phase 1 expands the schema and backfills existing data without cutting the application over yet. Later phases update the server, client, and formula pipeline to read and write the new split fields end to end.

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

### Changes
- Add new split columns to `dbo.Requests`:
  - `CalculatedTaTotal`
  - `CalculatedReaderTotal`
  - `AnnualizedTaTotal`
  - `AnnualizedReaderTotal`
  - `ExceptionTaTotal`
  - `ExceptionReaderTotal`
  - `ExceptionAnnualizedTaTotal`
  - `ExceptionAnnualizedReaderTotal`
- Add the same split columns to `dbo.RequestHistory`.
- Keep these legacy columns in place for now:
  - `RequestType`
  - `CalculatedTotal`
  - `AnnualizedTotal`
  - `ExceptionTotal`
  - `ExceptionAnnualizedTotal`
- Add a deployment-time backfill script that maps existing rows using the old `RequestType`:
  - `TA` rows populate only TA columns
  - `READ` rows populate only Reader columns
  - the opposite type is set to `0`
- Apply the same backfill logic to `RequestHistory`.
- Make the backfill safe to rerun in lower environments.

### Deliverables
- Updated SQL table definitions in the SSDT project.
- A post-deploy SQL script included in the SQL project.
- Existing rows backfilled during deployment.

### Notes
- Phase 1 does not remove legacy columns.
- Phase 1 does not update the application to read or write the new columns yet.
- New rows written by the old application after Phase 1 deployment will still use the legacy columns until Phase 2 is deployed.

## Phase 2 — Domain Model and Server Cutover
### Goal
Update the C# domain model and controller layer so the application stops depending on `RequestType` and starts reading and writing the split TA/Reader fields.

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

## Phase 6 — Legacy Cleanup
### Goal
Remove the legacy single-value fields and all remaining request-type behavior after the application has fully cut over.

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
- Verify the SSDT project includes the new post-deploy script.
- Verify existing TA rows backfill into TA columns only.
- Verify existing Reader rows backfill into Reader columns only.
- Verify `RequestHistory` receives the same mapping.

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

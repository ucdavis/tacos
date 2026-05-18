# Tacos Course Data

Tacos uses catalog and offering data to help departments plan course support requests.

## Language

**Course Offering**:
An enrollment and section summary for a course in a specific academic term.
_Avoid_: DESII course

**CourseOfferingsRaw**:
The canonical local source of raw course offering rows used to rebuild the course list.
_Avoid_: DESII_Courses

**CourseDescription**:
The local source of active course catalog data used during a course rebuild.
_Avoid_: Rebuild output

**Academic Term Code**:
The Banner term identifier for a specific academic term, such as `202410`.
_Avoid_: Quarter suffix when identifying a full term

**Processing Term Set**:
The explicit set of **Academic Term Codes** selected for a course rebuild.
_Avoid_: Implicit last-two-year window

**Processing Window**:
Exactly two complete academic years of selected terms used to rebuild the course list.
_Avoid_: Arbitrary term subset

**Available Term Code**:
An **Academic Term Code** present in **CourseOfferingsRaw** and therefore eligible for a rebuild selection.
_Avoid_: Manually typed term code

**Academic Year Span**:
A human-readable label composed from the `AcademicYear` values in **CourseOfferingsRaw**, such as `2024-25 and 2025-26`.
_Avoid_: Ending-year-only label

**Most Recent Academic Year**:
The later academic year inside the selected **Processing Window**.
_Avoid_: Current calendar year

**Every-Other-Year Course**:
A course that appears in exactly one academic year inside the selected **Processing Window**.
_Avoid_: Inferred rotation without offering data

**Catalog-Only Course**:
An active catalog course with no matching offerings inside the selected **Processing Window**.
_Avoid_: Missing course

**Course List**:
The derived set of courses available for request workflows after a rebuild.
_Avoid_: Source course data

**Course Number**:
The canonical uppercase, no-space course identifier used as the course key, such as `MAT110`.
_Avoid_: Spaced key such as `MAT 110`

**Cross-Listed Course**:
A catalog course that is listed together with one or more other subject/course numbers.
_Avoid_: Duplicate course

## Relationships

- A **Course Offering** belongs to exactly one academic term.
- **CourseOfferingsRaw** contains many **Course Offerings**.
- **CourseOfferingsRaw** is populated by an external process outside the course rebuild workflow.
- **CourseDescription** is populated by an external process outside the course rebuild workflow.
- The **Course List** is rebuilt from **CourseOfferingsRaw** rows whose academic terms are in the **Processing Window** and from active catalog data.
- The frontend may group **Academic Term Codes** by academic year or quarter, but processing uses the exact **Processing Term Set** provided by the user.
- A valid **Processing Window** contains exactly two academic years, each with the required `10`, `01`, and `03` terms.
- Users select **Available Term Codes** directly or choose an **Academic Year Span** helper that derives the six-code **Processing Window**.
- The frontend previews the six **Academic Term Codes** represented by each **Academic Year Span** selection.
- The frontend lists **Academic Year Span** helpers derived from **CourseOfferingsRaw** `AcademicYear` values for the selected term codes.
- When users choose an **Academic Year Span**, the underlying processing key remains the later year in the two-year **Processing Window**.
- An **Academic Year Span** helper is valid only when all six implied **Academic Term Codes** are present in **CourseOfferingsRaw**.
- `WasCourseTaughtInMostRecentYear` is true when a course appears in the **Most Recent Academic Year**.
- `IsCourseTaughtOnceEveryTwoYears` is true when a course is an **Every-Other-Year Course**.
- **Catalog-Only Courses** remain selectable in the **Course List** with zero offering metrics.
- Each rebuild transactionally replaces the entire **Course List**.
- The **Course List** uses **Course Number** as its stable course key.
- `Courses.Number` and `CourseDescription.Course` both use the canonical **Course Number** format.
- Each **Cross-Listed Course** remains a distinct selectable row in the **Course List**.
- A **Cross-Listed Course** uses combined enrollment across its cross-listing group for support calculations.

## Example Dialogue

> **Dev:** "Should the processor read from DESII_Courses?"
> **Domain expert:** "No. DESII_Courses is legacy language. The local source is CourseOfferingsRaw."
>
> **Dev:** "Does the rebuild workflow load CourseOfferingsRaw?"
> **Domain expert:** "No. CourseOfferingsRaw is populated separately; the rebuild only consumes it."
>
> **Dev:** "Does the rebuild workflow refresh CourseDescription?"
> **Domain expert:** "No. CourseDescription is populated separately; the rebuild only consumes it."
>
> **Dev:** "Can the backend infer the last two academic years?"
> **Domain expert:** "No. The frontend chooses the terms, and processing uses those exact Academic Term Codes."
>
> **Dev:** "Can an admin rebuild from any arbitrary set of terms?"
> **Domain expert:** "No. The selected terms must form two complete academic years."
>
> **Dev:** "Can admins type any term code?"
> **Domain expert:** "No. They choose from term codes already present in CourseOfferingsRaw, with UI help for selecting a complete window."
>
> **Dev:** "Should the UI show only an ending year like 2025?"
> **Domain expert:** "No. Show the academic year span, such as 2024-25, and preview the six term codes the selection implies."
>
> **Dev:** "If an admin chooses 2025-26, which years are processed?"
> **Domain expert:** "Process 2024-25 and 2025-26, with 2025-26 as the most recent academic year."
>
> **Dev:** "Can the admin choose a span if one implied term code has not been loaded?"
> **Domain expert:** "No. The frontend should disable it and the backend should reject it."
>
> **Dev:** "Does `WasCourseTaughtInMostRecentYear` use inverted legacy SQL behavior?"
> **Domain expert:** "No. It is literal: true means the course appeared in the most recent academic year of the selected window."
>
> **Dev:** "Do we drop active catalog courses if they were not offered in the selected window?"
> **Domain expert:** "No. They stay in the Course List so departments can request support when they offer them again."
>
> **Dev:** "Do cross-listed catalog entries collapse into one row?"
> **Domain expert:** "No. Each catalog course remains selectable, but its enrollment signal includes the cross-listing group."
>
> **Dev:** "Should `MAT 110` and `MAT110` be different Courses?"
> **Domain expert:** "No. The Course Number key is normalized to uppercase with no spaces."

## Flagged Ambiguities

- "DESII_Courses" was used as the historical source-table name for offering rows; resolved: new work should use **CourseOfferingsRaw**.
- "Which terms to use" means an explicit **Processing Term Set**, not a backend-derived date window.
- "Frontend-selected terms" does not mean an arbitrary subset; resolved: selected terms must form a valid **Processing Window**.
- "Available terms" means terms present in **CourseOfferingsRaw**, not every possible Banner term code.
- `WasCourseTaughtInMostRecentYear` previously had conflicting legacy SQL behavior; resolved: the flag is literal.
- Course identifiers were inconsistently shown with and without spaces; resolved: **Course Number** is no-space uppercase in both `Courses.Number` and `CourseDescription.Course`, and UI/API input may be normalized into that form.

import * as React from "react";
import { createRoot } from "react-dom/client";

interface AcademicTermCodeOption {
    academicTermCode: string;
    isAvailable: boolean;
}

interface AcademicYearSpanOption {
    academicYearSpan: string;
    isComplete: boolean;
    terms: AcademicTermCodeOption[];
}

interface CourseRebuildResult {
    academicYearSpan: string;
}

interface ManageCourseRebuildPageProps {
    optionsUrl: string;
    rebuildUrl: string;
}

type AlertState = {
    message: string;
    title?: string;
    type: "alert-error" | "alert-info" | "alert-success";
};

function errorMessage(error: unknown, fallback: string): string {
    return error instanceof Error && error.message
        ? error.message
        : fallback;
}

export function ManageCourseRebuildPage({ optionsUrl, rebuildUrl }: ManageCourseRebuildPageProps) {
    const [spanOptions, setSpanOptions] = React.useState<AcademicYearSpanOption[]>([]);
    const [selectedSpan, setSelectedSpan] = React.useState("");
    const [isLoading, setIsLoading] = React.useState(true);
    const [isRebuilding, setIsRebuilding] = React.useState(false);
    const [alert, setAlert] = React.useState<AlertState | null>(null);

    const selectedOption = React.useMemo(
        () => spanOptions.find(option => option.academicYearSpan === selectedSpan),
        [selectedSpan, spanOptions]
    );

    React.useEffect(() => {
        let isMounted = true;

        async function loadOptions() {
            setAlert(null);
            setIsLoading(true);

            try {
                const response = await fetch(optionsUrl, { credentials: "same-origin" });

                if (!response.ok) {
                    throw new Error(await response.text());
                }

                const options = await response.json() as AcademicYearSpanOption[];

                if (!isMounted) {
                    return;
                }

                setSpanOptions(options);
                setSelectedSpan(options.find(option => option.isComplete)?.academicYearSpan ?? options[0]?.academicYearSpan ?? "");
            } catch (error) {
                if (!isMounted) {
                    return;
                }

                setSpanOptions([]);
                setSelectedSpan("");
                setAlert({
                    message: errorMessage(error, "Unable to load course rebuild options."),
                    type: "alert-error"
                });
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadOptions();

        return () => {
            isMounted = false;
        };
    }, [optionsUrl]);

    async function rebuildCourses() {
        if (!selectedOption?.isComplete) {
            return;
        }

        const confirmed = window.confirm(
            `Rebuild the Course List from ${selectedOption.academicYearSpan} and reset all submissions? This usually takes a minute or two; stay on this page until it finishes.`
        );

        if (!confirmed) {
            return;
        }

        const academicTermCodes = selectedOption.terms.map(term => term.academicTermCode);

        setAlert({
            message: "Rebuilding courses and resetting submissions. This usually takes a minute or two; stay on this page until it finishes.",
            type: "alert-info"
        });
        setIsRebuilding(true);

        try {
            const response = await fetch(rebuildUrl, {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ academicTermCodes })
            });

            if (!response.ok) {
                throw new Error(await response.text());
            }

            const result = await response.json() as CourseRebuildResult;
            setAlert({
                title: "All set",
                message: `Course List rebuilt from ${result.academicYearSpan}; submissions were reset.`,
                type: "alert-success"
            });
        } catch (error) {
            setAlert({
                message: errorMessage(error, "Course List rebuild failed."),
                type: "alert-error"
            });
        } finally {
            setIsRebuilding(false);
        }
    }

    const isSelectDisabled = isLoading || isRebuilding || spanOptions.length === 0;
    const isRebuildDisabled = isLoading || isRebuilding || !selectedOption?.isComplete;

    return (
        <>
            {alert && (
                <div
                    className={`alert rounded-none shadow-sm tacos-rebuild-alert ${alert.type} ${
                        alert.type === "alert-success" ? "tacos-rebuild-alert--success" : ""
                    }`}
                    role={alert.type === "alert-error" ? "alert" : "status"}
                >
                    {alert.type === "alert-success" && (
                        <img
                            className="tacos-rebuild-alert__taco"
                            src="/tacoAnimation.gif"
                            alt=""
                            aria-hidden="true"
                        />
                    )}
                    <div className="tacos-rebuild-alert__content">
                        {alert.title && <div className="tacos-rebuild-alert__title">{alert.title}</div>}
                        <div>{alert.message}</div>
                    </div>
                </div>
            )}

            <section className="tacos-admin-panel" aria-labelledby="courseRebuildHeading">
                <h3 id="courseRebuildHeading" className="tacos-section-heading">Processing Window</h3>

                <div className="tacos-admin-note">
                    <p>
                        The six academic terms shown here will be used to rebuild the Courses table.
                    </p>
                    <p>
                        Rebuilding also resets all current requests to unsubmitted. Approval decisions, review comments,
                        exception details, submitter, and submitted dates are cleared. Requests for courses that are not
                        in the rebuilt Course List are retired from active request screens.
                    </p>
                </div>

                <div className="tacos-form-field">
                    <label className="tacos-form-label" htmlFor="academicYearSpanSelect">Academic Year Span</label>
                    <select
                        id="academicYearSpanSelect"
                        className="tacos-select"
                        disabled={isSelectDisabled}
                        value={selectedSpan}
                        onChange={event => setSelectedSpan(event.target.value)}
                    >
                        {isLoading && <option value="">Loading available spans</option>}
                        {!isLoading && spanOptions.length === 0 && <option value="">No academic year spans available</option>}
                        {!isLoading && spanOptions.map(option => (
                            <option key={option.academicYearSpan} value={option.academicYearSpan} disabled={!option.isComplete}>
                                {option.isComplete ? option.academicYearSpan : `${option.academicYearSpan} (incomplete)`}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="tacos-term-preview" aria-live="polite">
                    <div className="tacos-term-preview__label">Academic Term Codes</div>
                    <ul className="tacos-term-list">
                        {selectedOption?.terms.map(term => (
                            <li
                                key={term.academicTermCode}
                                className={term.isAvailable
                                    ? "tacos-term-list__item"
                                    : "tacos-term-list__item tacos-term-list__item--missing"}
                            >
                                {term.academicTermCode}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="tacos-action-row">
                    <button
                        id="rebuildCoursesButton"
                        className="tacos-btn tacos-btn--danger"
                        type="button"
                        disabled={isRebuildDisabled}
                        onClick={() => {
                            void rebuildCourses();
                        }}
                    >
                        {isRebuilding ? "Rebuilding..." : "Rebuild Course List and Reset Submissions"}
                        <i className="fas fa-sync-alt tacos-btn__icon" aria-hidden="true" />
                    </button>
                </div>
            </section>
        </>
    );
}

function renderManageCourseRebuildPage() {
    const rootElement = document.querySelector<HTMLElement>("[data-course-rebuild-root='true']");

    if (!rootElement) {
        return;
    }

    const optionsUrl = rootElement.dataset.optionsUrl;
    const rebuildUrl = rootElement.dataset.rebuildUrl;

    if (!optionsUrl || !rebuildUrl) {
        throw new Error("Course rebuild endpoints are not configured.");
    }

    createRoot(rootElement).render(
        <ManageCourseRebuildPage optionsUrl={optionsUrl} rebuildUrl={rebuildUrl} />
    );
}

renderManageCourseRebuildPage();

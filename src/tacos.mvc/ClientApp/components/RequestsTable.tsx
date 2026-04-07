import * as React from "react";

import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import CourseNumber from "./CourseNumber";
import CourseType, { CourseTypeOptions } from "./CourseType";
import Exception from "./Exception";
import ExceptionDetail from "./ExceptionDetail";
import RequestType from "./RequestType";
import UncontrolledTooltip from "./UncontrolledTooltip";

import { ICourse } from "../models/ICourse";
import { IRequest } from "../models/IRequest";

interface IProps {
    className: string;

    requests: IRequest[];
    onEdit: (i: number, request: IRequest) => void;
    onRemove: (i: number) => void;
    onRevoke: (id: number) => void;
    courseNumberFilter?: string;

    onCourseCreate: (i: number, defaultValues?: ICourse) => void;
}

interface IRequestTableRow {
    request: IRequest;
    originalIndex: number;
}

interface IColumnMeta {
    className?: string;
    filterVariant?: "course" | "courseType" | "exception" | "icon" | "none" | "requestType";
    headerClassName?: string;
    width?: number;
}

const RequestsTable = (props: IProps) => {
    const { className, courseNumberFilter, onCourseCreate, onEdit, onRemove, onRevoke, requests } = props;
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(() =>
        buildInitialFilters(courseNumberFilter)
    );

    React.useEffect(() => {
        setColumnFilters((currentFilters) => {
            const nextFilters = currentFilters.filter((filter) => filter.id !== "course");

            if (courseNumberFilter) {
                nextFilters.push({
                    id: "course",
                    value: courseNumberFilter,
                });
            }

            if (filtersAreEqual(currentFilters, nextFilters)) {
                return currentFilters;
            }

            return nextFilters;
        });
    }, [courseNumberFilter]);

    const tableData = React.useMemo(() =>
        requests
            .map((request, originalIndex) => ({
                request,
                originalIndex,
            }))
            .filter((row) => !row.request.isDeleted),
    [requests]);

    const requestChanged = React.useCallback(<K extends keyof IRequest>(originalIndex: number, prop: K, value: IRequest[K]) => {
        const request = requests[originalIndex];

        const newRequest: IRequest = {
            ...request,
            [prop]: value,
        };

        onEdit(originalIndex, newRequest);
    }, [onEdit, requests]);

    const onCourseChange = React.useCallback((originalIndex: number, course: ICourse | undefined) => {
        requestChanged(originalIndex, "course", course);
    }, [requestChanged]);

    const columns = React.useMemo<ColumnDef<IRequestTableRow>[]>(() => [
        {
            id: "new-indicator",
            cell: ({ row }) => renderNewIndicator(row.original),
            enableColumnFilter: false,
            enableSorting: false,
            header: () => null,
            meta: {
                className: "text-center align-middle",
                filterVariant: "icon",
                headerClassName: "text-center",
                width: 45,
            } satisfies IColumnMeta,
        },
        {
            accessorFn: (row) => row.request.course,
            cell: ({ row }) => renderCourse(row.original, onCourseChange, onCourseCreate),
            filterFn: (row, _columnId, value) => {
                const filterValue = String(value || "").toLowerCase();
                const course = row.original.request.course;

                if (!course) {
                    return filterValue.length === 0;
                }

                return course.number.toLowerCase().includes(filterValue)
                    || course.name.toLowerCase().includes(filterValue);
            },
            header: "Course",
            id: "course",
            meta: {
                filterVariant: "course",
            } satisfies IColumnMeta,
            sortDescFirst: false,
            sortingFn: (rowA, rowB) => {
                const aNumber = rowA.original.request.course ? rowA.original.request.course.number : "";
                const bNumber = rowB.original.request.course ? rowB.original.request.course.number : "";

                return aNumber.localeCompare(bNumber);
            },
        },
        {
            accessorFn: (row) => row.request.courseType,
            cell: ({ row }) => renderCourseType(row.original, requestChanged),
            filterFn: (row, columnId, value) => {
                const filterValue = String(value || "");
                if (filterValue === "") {
                    return true;
                }

                return row.getValue<string>(columnId) === filterValue;
            },
            header: renderCourseTypeHeader,
            id: "courseType",
            meta: {
                filterVariant: "courseType",
            } satisfies IColumnMeta,
        },
        {
            accessorFn: (row) => row.request.requestType,
            cell: ({ row }) => renderRequestType(row.original, requestChanged),
            filterFn: (row, columnId, value) => {
                const filterValue = String(value || "");
                if (filterValue === "") {
                    return true;
                }

                return row.getValue<string>(columnId) === filterValue;
            },
            header: renderRequestTypeHeader,
            id: "requestType",
            meta: {
                filterVariant: "requestType",
            } satisfies IColumnMeta,
        },
        {
            accessorFn: (row) => row.request.calculatedTotal,
            cell: ({ row }) => (
                <span>{row.original.request.calculatedTotal.toFixed(3)}</span>
            ),
            header: "TA % per course offering",
            id: "calculatedTotal",
            meta: {
                className: "text-center",
            } satisfies IColumnMeta,
        },
        {
            accessorFn: (row) => row.request.exception ? row.request.exceptionAnnualizedTotal : row.request.annualizedTotal,
            cell: ({ row }) => renderAnnualizedFTE(row.original),
            header: "Annualized TA FTE",
            id: "annualizedTotal",
            meta: {
                className: "text-center",
            } satisfies IColumnMeta,
        },
        {
            accessorFn: (row) => row.request.exception,
            cell: ({ row }) => renderException(row.original, requestChanged),
            filterFn: (row, _columnId, value) => {
                const filterValue = String(value || "").toLowerCase();
                if (filterValue === "") {
                    return true;
                }

                return row.original.request.exception === (filterValue === "true");
            },
            header: "Exception ?",
            id: "exception",
            meta: {
                className: "text-center align-middle",
                filterVariant: "exception",
                headerClassName: "text-center",
                width: 150,
            } satisfies IColumnMeta,
        },
        {
            id: "remove",
            cell: ({ row }) => renderRemoveButton(row.original, onRemove),
            enableColumnFilter: false,
            enableSorting: false,
            header: "Remove",
            meta: {
                className: "text-center align-middle",
                filterVariant: "none",
                headerClassName: "text-center",
                width: 100,
            } satisfies IColumnMeta,
        },
        {
            id: "warning-indicator",
            cell: ({ row }) => renderWarnings(row.original),
            enableColumnFilter: false,
            enableSorting: false,
            header: () => null,
            meta: {
                className: "text-center align-middle",
                filterVariant: "none",
                headerClassName: "text-center",
                width: 45,
            } satisfies IColumnMeta,
        },
    ], [onCourseChange, onCourseCreate, onRemove, requestChanged]);

    const table = useReactTable({
        columns,
        data: tableData,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getRowId: (row) => String(row.request.id ?? `new-${row.originalIndex}`),
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        onSortingChange: setSorting,
        state: {
            columnFilters,
            sorting,
        },
    });

    const visibleColumnCount = table.getVisibleLeafColumns().length;
    const rows = table.getRowModel().rows;

    return (
        <div className={className}>
            <div className="table-responsive">
                <table className="table requests">
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const meta = getColumnMeta(header.column.columnDef);
                                    const canSort = header.column.getCanSort();
                                    const sortState = header.column.getIsSorted();
                                    const widthStyle = getWidthStyle(meta);

                                    return (
                                        <th
                                            className={buildClassName(
                                                meta.headerClassName,
                                                canSort ? "requests-sortable" : undefined
                                            )}
                                            key={header.id}
                                            onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                                            style={widthStyle}
                                            scope="col"
                                        >
                                            <div className="d-flex align-items-center">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(header.column.columnDef.header, header.getContext())}
                                                {sortState === "asc" && <span className="ml-2">▲</span>}
                                                {sortState === "desc" && <span className="ml-2">▼</span>}
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        ))}
                        <tr className="requests-filter-row">
                            {table.getVisibleLeafColumns().map((column) => {
                                const meta = getColumnMeta(column.columnDef);

                                return (
                                    <th
                                        className={meta.headerClassName}
                                        key={`${column.id}-filter`}
                                        style={getWidthStyle(meta)}
                                    >
                                        {renderFilter(column)}
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 && (
                            <tr>
                                <td className="requests-empty-state text-center text-muted" colSpan={visibleColumnCount}>
                                    No requests found.
                                </td>
                            </tr>
                        )}
                        {rows.map((row) => {
                            const { originalIndex, request } = row.original;
                            const rowId = request.id ? `request-${request.id}` : `request-new-${originalIndex}`;
                            const rowClassName = request.isFocused ? "target-flash" : undefined;

                            return (
                                <React.Fragment key={row.id}>
                                    <tr
                                        className={rowClassName}
                                        data-request-row="true"
                                        id={rowId}
                                    >
                                        {row.getVisibleCells().map((cell) => {
                                            const meta = getColumnMeta(cell.column.columnDef);

                                            return (
                                                <td className={meta.className} key={cell.id} style={getWidthStyle(meta)}>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                    {request.exception && (
                                        <tr className="requests-detail-row">
                                            <td className="p-0" colSpan={visibleColumnCount}>
                                                <ExceptionDetail
                                                    requestId={request.id || -1}
                                                    onExceptionAnnualCountChange={(exceptionAnnualCount) =>
                                                        requestChanged(originalIndex, "exceptionAnnualCount", exceptionAnnualCount)
                                                    }
                                                    onExceptionTotalChange={(exceptionTotal) =>
                                                        requestChanged(originalIndex, "exceptionTotal", exceptionTotal)
                                                    }
                                                    onReasonChange={(reason) =>
                                                        requestChanged(originalIndex, "exceptionReason", reason)
                                                    }
                                                    onRevoke={onRevoke}
                                                    exception={request.exception}
                                                    exceptionAnnualCount={request.exceptionAnnualCount}
                                                    exceptionApproved={request.hasApprovedException}
                                                    exceptionReason={request.exceptionReason}
                                                    exceptionTotal={request.exceptionTotal}
                                                />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );

    function renderFilter(column: ReturnType<typeof table.getVisibleLeafColumns>[number]) {
        const meta = getColumnMeta(column.columnDef);
        const currentValue = String(column.getFilterValue() || "");

        switch (meta.filterVariant) {
            case "icon":
                return (
                    <div className="text-center">
                        <i className="fas fa-filter" />
                    </div>
                );
            case "course":
                return (
                    <div style={{ position: "relative" }}>
                        <input
                            className="form-control"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                column.setFilterValue(e.target.value.toUpperCase())
                            }
                            placeholder="Search ..."
                            value={currentValue.toUpperCase()}
                        />
                        <i
                            className="fas fa-search"
                            style={{
                                position: "absolute",
                                right: "10px",
                                top: "2px",
                                transform: "translateY(50%)",
                            }}
                        />
                    </div>
                );
            case "courseType":
                return (
                    <div className="input-group">
                        <select
                            className="custom-select"
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => column.setFilterValue(e.target.value)}
                            value={currentValue}
                        >
                            {CourseTypeOptions.map((courseTypeOption) => (
                                <option key={courseTypeOption[0]} value={courseTypeOption[0]}>
                                    {courseTypeOption[1]}
                                </option>
                            ))}
                            <option value="">Show All</option>
                        </select>
                    </div>
                );
            case "requestType":
                return (
                    <div className="input-group">
                        <select
                            className="custom-select"
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => column.setFilterValue(e.target.value)}
                            value={currentValue}
                        >
                            <option value="TA">TA</option>
                            <option value="READ">Reader</option>
                            <option value="">Show All</option>
                        </select>
                    </div>
                );
            case "exception":
                return (
                    <div className="input-group">
                        <select
                            className="custom-select"
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => column.setFilterValue(e.target.value)}
                            value={currentValue}
                        >
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                            <option value="">Show All</option>
                        </select>
                    </div>
                );
            case "none":
            default:
                return null;
        }
    }
};

function buildClassName(...classNames: Array<string | undefined>) {
    return classNames.filter(Boolean).join(" ");
}

function buildInitialFilters(courseNumberFilter?: string): ColumnFiltersState {
    if (!courseNumberFilter) {
        return [];
    }

    return [{
        id: "course",
        value: courseNumberFilter,
    }];
}

function filtersAreEqual(left: ColumnFiltersState, right: ColumnFiltersState) {
    if (left.length !== right.length) {
        return false;
    }

    return left.every((filter, index) =>
        filter.id === right[index].id
        && filter.value === right[index].value
    );
}

function getColumnMeta(column: ColumnDef<IRequestTableRow>): IColumnMeta {
    return (column.meta as IColumnMeta | undefined) || {};
}

function getWidthStyle(meta: IColumnMeta): React.CSSProperties | undefined {
    if (!meta.width) {
        return undefined;
    }

    return {
        minWidth: meta.width,
        width: meta.width,
    };
}

function renderNewIndicator(row: IRequestTableRow) {
    const { originalIndex, request } = row;

    if (!request.course || !request.course.isNew) {
        return null;
    }

    return (
        <span>
            <i className="fas fa-plus-circle" id={`request-new-indicator-${originalIndex}`} />
            <UncontrolledTooltip
                placement="left"
                target={`request-new-indicator-${originalIndex}`}
            >
                New course will be created
            </UncontrolledTooltip>
        </span>
    );
}

function renderCourse(
    row: IRequestTableRow,
    onCourseChange: (originalIndex: number, course: ICourse | undefined) => void,
    onCourseCreate: (i: number, defaultValues?: ICourse) => void
) {
    const { originalIndex, request } = row;

    return (
        <CourseNumber
            course={request.course}
            key={`request-course-input-${originalIndex}`}
            onChange={(course) => onCourseChange(originalIndex, course)}
            onCourseCreate={(course) => onCourseCreate(originalIndex, course)}
        />
    );
}

function renderCourseType(
    row: IRequestTableRow,
    requestChanged: <K extends keyof IRequest>(originalIndex: number, prop: K, value: IRequest[K]) => void
) {
    const { originalIndex, request } = row;

    return (
        <CourseType
            courseType={request.courseType}
            onChange={(courseType) => requestChanged(originalIndex, "courseType", courseType)}
        />
    );
}

function renderCourseTypeHeader() {
    return (
        <div>
            <span className="mr-3">Course Type</span>
            <a href="/CAES-TA-Guidelines 2018-23.pdf" target="_blank">
                Criteria Info <i className="fas fa-external-link-alt" />
            </a>
        </div>
    );
}

function renderRequestType(
    row: IRequestTableRow,
    requestChanged: <K extends keyof IRequest>(originalIndex: number, prop: K, value: IRequest[K]) => void
) {
    const { originalIndex, request } = row;

    return (
        <RequestType
            onChange={(requestType) => requestChanged(originalIndex, "requestType", requestType)}
            requestType={request.requestType}
        />
    );
}

function renderRequestTypeHeader() {
    return (
        <div>
            <span className="mr-2">Request Type</span>
            <i className="fas fa-question-circle" id="requestTypeHeader" />
            <UncontrolledTooltip
                placement="right"
                target="requestTypeHeader"
            >
                For courses that require both TAs and Readers, select the majority position type.
            </UncontrolledTooltip>
        </div>
    );
}

function renderException(
    row: IRequestTableRow,
    requestChanged: <K extends keyof IRequest>(originalIndex: number, prop: K, value: IRequest[K]) => void
) {
    const { originalIndex, request } = row;

    return (
        <Exception
            exception={request.exception}
            onExceptionChange={(exception) => requestChanged(originalIndex, "exception", exception)}
        />
    );
}

function renderRemoveButton(row: IRequestTableRow, onRemove: (i: number) => void) {
    return (
        <button
            className="btn btn-danger"
            onClick={() => onRemove(row.originalIndex)}
        >
            <i className="fa fa-trash-alt" />
        </button>
    );
}

function renderAnnualizedFTE(row: IRequestTableRow) {
    const { originalIndex, request } = row;
    const course = request.course;
    const annualizedTotal = request.exception ? request.exceptionAnnualizedTotal : request.annualizedTotal;

    if (course && course.isCourseTaughtOnceEveryTwoYears && !request.exception) {
        return (
            <>
                {annualizedTotal.toFixed(3)}
                <span style={{ paddingLeft: ".5em" }}>
                    <i
                        className="fas fa-exclamation-triangle text-warning"
                        id={`request-${originalIndex}-otheryear-warning`}
                    />
                    <UncontrolledTooltip
                        className=""
                        placement="right"
                        target={`request-${originalIndex}-otheryear-warning`}
                    >
                        Data shows that this course is offered every other year and {course.wasCourseTaughtInMostRecentYear ? "WILL NOT" : "WILL"} be offered in the upcoming year. TA funding will not be allocated in the off year. If this is incorrect, please submit an exception request.
                    </UncontrolledTooltip>
                </span>
            </>
        );
    }

    return <>{annualizedTotal.toFixed(3)}</>;
}

function renderWarnings(row: IRequestTableRow) {
    const { originalIndex, request } = row;

    if (!request.isValid) {
        return (
            <div>
                <i className="fas fa-exclamation-triangle text-danger" id={`request-${originalIndex}-error`} />
                <UncontrolledTooltip
                    className=""
                    placement="right"
                    target={`request-${originalIndex}-error`}
                >
                    {request.error}
                </UncontrolledTooltip>
            </div>
        );
    }

    return null;
}

export default RequestsTable;

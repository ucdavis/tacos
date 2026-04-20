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
import UncontrolledTooltip from "./UncontrolledTooltip";

import { ICourse } from "../models/ICourse";
import { IRequest } from "../models/IRequest";

interface IProps {
    className: string;

    requests: IRequest[];
    onEdit: (i: number, request: IRequest) => void;
    onRemove: (i: number) => void;
    onRevoke: (id: number) => void | Promise<void>;
    courseNumberFilter?: string;

    onCourseCreate: (i: number, defaultValues?: ICourse) => void;
}

interface IRequestTableRow {
    request: IRequest;
    originalIndex: number;
}

interface IColumnMeta {
    className?: string;
    filterVariant?: "course" | "courseType" | "exception" | "icon" | "none";
    headerClassName?: string;
    width?: number;
}

interface IActiveResize {
    leftColumnId: string;
    rightColumnId: string;
    startLeftWidth: number;
    startRightWidth: number;
    startX: number;
}

const RequestsTable = (props: IProps) => {
    const { className, courseNumberFilter, onCourseCreate, onEdit, onRemove, onRevoke, requests } = props;
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(() =>
        buildInitialFilters(courseNumberFilter)
    );
    const [columnWidths, setColumnWidths] = React.useState<Record<string, number>>({});
    const headerRefs = React.useRef<Record<string, HTMLTableCellElement | null>>({});
    const activeResizeRef = React.useRef<IActiveResize | null>(null);

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

    const requestChanged = React.useCallback(<K extends keyof IRequest>(
        originalIndex: number,
        request: IRequest,
        prop: K,
        value: IRequest[K],
    ) => {
        const newRequest: IRequest = {
            ...request,
            [prop]: value,
        };

        onEdit(originalIndex, newRequest);
    }, [onEdit]);

    const onCourseChange = React.useCallback((
        originalIndex: number,
        request: IRequest,
        course: ICourse | undefined,
    ) => {
        requestChanged(originalIndex, request, "course", course);
    }, [requestChanged]);

    const columns = React.useMemo<ColumnDef<IRequestTableRow>[]>(() => [
        {
            id: "new-indicator",
            cell: ({ row }) => renderNewIndicator(row.original),
            enableColumnFilter: false,
            enableSorting: false,
            header: () => null,
            meta: {
                className: "requests-cell--center requests-cell--middle",
                filterVariant: "icon",
                headerClassName: "requests-header-cell--center",
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
            accessorFn: (row) => row.request.calculatedTaTotal,
            cell: ({ row }) => (
                <span>{row.original.request.calculatedTaTotal.toFixed(3)}</span>
            ),
            header: "TA % per course offering",
            id: "calculatedTaTotal",
            meta: {
                className: "requests-cell--center",
            } satisfies IColumnMeta,
        },
        {
            accessorFn: (row) => row.request.calculatedReaderTotal,
            cell: ({ row }) => (
                <span>{row.original.request.calculatedReaderTotal.toFixed(3)}</span>
            ),
            header: "Reader % per course offering",
            id: "calculatedReaderTotal",
            meta: {
                className: "requests-cell--center",
            } satisfies IColumnMeta,
        },
        {
            accessorFn: (row) => row.request.exception ? row.request.exceptionAnnualizedTaTotal : row.request.annualizedTaTotal,
            cell: ({ row }) => renderAnnualizedFTE(row.original, "ta"),
            header: "Annualized TA FTE",
            id: "annualizedTaTotal",
            meta: {
                className: "requests-cell--center",
            } satisfies IColumnMeta,
        },
        {
            accessorFn: (row) => row.request.exception ? row.request.exceptionAnnualizedReaderTotal : row.request.annualizedReaderTotal,
            cell: ({ row }) => renderAnnualizedFTE(row.original, "reader"),
            header: "Annualized Reader FTE",
            id: "annualizedReaderTotal",
            meta: {
                className: "requests-cell--center",
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
                className: "requests-cell--center requests-cell--middle",
                filterVariant: "exception",
                headerClassName: "requests-header-cell--center",
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
                className: "requests-cell--center requests-cell--middle",
                filterVariant: "none",
                headerClassName: "requests-header-cell--center",
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
                className: "requests-cell--center requests-cell--middle",
                filterVariant: "none",
                headerClassName: "requests-header-cell--center",
                width: 45,
            } satisfies IColumnMeta,
        },
    ], [onCourseChange, onCourseCreate, onRemove, requestChanged]);

    const columnsById = React.useMemo(() =>
        columns.reduce<Record<string, ColumnDef<IRequestTableRow>>>((currentColumns, column) => {
            if (column.id) {
                currentColumns[column.id] = column;
            }

            return currentColumns;
        }, {}),
    [columns]);

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

    const handleColumnResize = React.useCallback((e: MouseEvent) => {
        const activeResize = activeResizeRef.current;
        if (!activeResize) {
            return;
        }

        const {
            leftColumnId,
            rightColumnId,
            startLeftWidth,
            startRightWidth,
            startX,
        } = activeResize;
        const leftColumn = columnsById[leftColumnId];
        const rightColumn = columnsById[rightColumnId];
        if (!leftColumn || !rightColumn) {
            return;
        }

        const minimumLeftWidth = getMinimumColumnWidth(leftColumn);
        const minimumRightWidth = getMinimumColumnWidth(rightColumn);
        const totalWidth = startLeftWidth + startRightWidth;
        const requestedLeftWidth = Math.round(startLeftWidth + (e.clientX - startX));
        const nextLeftWidth = Math.max(
            minimumLeftWidth,
            Math.min(requestedLeftWidth, totalWidth - minimumRightWidth),
        );
        const nextRightWidth = totalWidth - nextLeftWidth;

        setColumnWidths((currentWidths) => {
            if (
                currentWidths[leftColumnId] === nextLeftWidth
                && currentWidths[rightColumnId] === nextRightWidth
            ) {
                return currentWidths;
            }

            return {
                ...currentWidths,
                [leftColumnId]: nextLeftWidth,
                [rightColumnId]: nextRightWidth,
            };
        });
    }, [columnsById]);

    const stopColumnResize = React.useCallback(() => {
        activeResizeRef.current = null;
        document.body.classList.remove("requests-column-resizing");
        document.removeEventListener("mousemove", handleColumnResize);
        document.removeEventListener("mouseup", stopColumnResize);
    }, [handleColumnResize]);

    React.useEffect(() => () => {
        document.body.classList.remove("requests-column-resizing");
        document.removeEventListener("mousemove", handleColumnResize);
        document.removeEventListener("mouseup", stopColumnResize);
    }, [handleColumnResize, stopColumnResize]);

    const startColumnResize = React.useCallback((leftColumnId: string, rightColumnId: string, startX: number) => {
        const leftColumn = columnsById[leftColumnId];
        const rightColumn = columnsById[rightColumnId];
        const leftHeaderCell = headerRefs.current[leftColumnId];
        const rightHeaderCell = headerRefs.current[rightColumnId];
        if (!leftColumn || !rightColumn || !leftHeaderCell || !rightHeaderCell) {
            return;
        }

        const startLeftWidth = getColumnWidth(
            leftColumnId,
            leftColumn,
            leftHeaderCell.getBoundingClientRect().width,
            columnWidths,
        );
        const startRightWidth = getColumnWidth(
            rightColumnId,
            rightColumn,
            rightHeaderCell.getBoundingClientRect().width,
            columnWidths,
        );

        activeResizeRef.current = {
            leftColumnId,
            rightColumnId,
            startLeftWidth: startLeftWidth || leftHeaderCell.getBoundingClientRect().width,
            startRightWidth: startRightWidth || rightHeaderCell.getBoundingClientRect().width,
            startX,
        };

        document.body.classList.add("requests-column-resizing");
        document.addEventListener("mousemove", handleColumnResize);
        document.addEventListener("mouseup", stopColumnResize);
    }, [columnWidths, columnsById, handleColumnResize, stopColumnResize]);

    const handleResizeMouseDown = React.useCallback((
        leftColumnId: string,
        rightColumnId: string,
    ) => (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        startColumnResize(leftColumnId, rightColumnId, e.clientX);
    }, [startColumnResize]);

    const visibleColumnCount = table.getVisibleLeafColumns().length;
    const rowModel = table.getRowModel();
    const rows = React.useMemo(() => {
        const persistedRows = rowModel.rows.filter((row) => row.original.request.id);
        const unsavedRows = rowModel.rows
            .filter((row) => !row.original.request.id)
            .sort((leftRow, rightRow) => leftRow.original.originalIndex - rightRow.original.originalIndex);

        if (unsavedRows.length === 0) {
            return rowModel.rows;
        }

        return [...persistedRows, ...unsavedRows];
    }, [rowModel.rows]);

    return (
        <div className={className}>
            <div className="requests-table-scroll">
                <table className="requests">
                    <colgroup>
                        {table.getVisibleLeafColumns().map((column) => (
                            <col
                                data-column-width={column.id}
                                key={`${column.id}-width`}
                                style={getWidthStyle(
                                    getColumnWidth(column.id, column.columnDef, undefined, columnWidths)
                                )}
                            />
                        ))}
                    </colgroup>
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    const meta = getColumnMeta(header.column.columnDef);
                                    const canSort = header.column.getCanSort();
                                    const nextSortOrder = header.column.getNextSortingOrder();
                                    const sortState = header.column.getIsSorted();
                                    const widthStyle = getWidthStyle(
                                        getColumnWidth(
                                            header.column.id,
                                            header.column.columnDef,
                                            undefined,
                                            columnWidths,
                                        )
                                    );
                                    const resizeColumnId = header.index > 0
                                        ? headerGroup.headers[header.index - 1].column.id
                                        : undefined;

                                    return (
                                        <th
                                            aria-sort={getAriaSort(canSort, sortState)}
                                            className={buildClassName(
                                                meta.headerClassName,
                                                canSort ? "requests-sortable" : undefined
                                            )}
                                            key={header.id}
                                            ref={(element) => {
                                                headerRefs.current[header.column.id] = element;
                                            }}
                                            style={widthStyle}
                                            scope="col"
                                        >
                                            <div
                                                className={buildClassName(
                                                    "requests-header-cell-content"
                                                )}
                                            >
                                                <div className="requests-header-cell-label">
                                                    {header.isPlaceholder
                                                        ? null
                                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                                </div>
                                                {canSort && !header.isPlaceholder && (
                                                    <button
                                                        aria-label={getSortButtonLabel(
                                                            header.column.id,
                                                            header.column.columnDef.header,
                                                            nextSortOrder,
                                                        )}
                                                        className="requests-sort-button"
                                                        data-column-sort-button={header.column.id}
                                                        onClick={header.column.getToggleSortingHandler()}
                                                        type="button"
                                                    >
                                                        {renderSortIcon(sortState)}
                                                    </button>
                                                )}
                                            </div>
                                            {resizeColumnId && !header.isPlaceholder && (
                                                <div
                                                    className="requests-column-resizer"
                                                    data-column-resizer={resizeColumnId}
                                                    onMouseDown={handleResizeMouseDown(
                                                        resizeColumnId,
                                                        header.column.id,
                                                    )}
                                                    role="presentation"
                                                />
                                            )}
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
                                        style={getWidthStyle(
                                            getColumnWidth(column.id, column.columnDef, undefined, columnWidths)
                                        )}
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
                                <td className="requests-empty-state requests-empty-state--muted" colSpan={visibleColumnCount}>
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
                                                <td
                                                    className={meta.className}
                                                    key={cell.id}
                                                    style={getWidthStyle(
                                                        getColumnWidth(
                                                            cell.column.id,
                                                            cell.column.columnDef,
                                                            undefined,
                                                            columnWidths,
                                                        )
                                                    )}
                                                >
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                    {request.exception && (
                                        <tr className="requests-detail-row">
                                            <td className="requests-detail-cell" colSpan={visibleColumnCount}>
                                                <ExceptionDetail
                                                    requestId={request.id || -1}
                                                    onExceptionAnnualCountChange={(exceptionAnnualCount) =>
                                                        requestChanged(
                                                            originalIndex,
                                                            request,
                                                            "exceptionAnnualCount",
                                                            exceptionAnnualCount,
                                                        )
                                                    }
                                                    onExceptionTaTotalChange={(exceptionTaTotal) =>
                                                        requestChanged(
                                                            originalIndex,
                                                            request,
                                                            "exceptionTaTotal",
                                                            exceptionTaTotal,
                                                        )
                                                    }
                                                    onExceptionReaderTotalChange={(exceptionReaderTotal) =>
                                                        requestChanged(
                                                            originalIndex,
                                                            request,
                                                            "exceptionReaderTotal",
                                                            exceptionReaderTotal,
                                                        )
                                                    }
                                                    onReasonChange={(reason) =>
                                                        requestChanged(
                                                            originalIndex,
                                                            request,
                                                            "exceptionReason",
                                                            reason,
                                                        )
                                                    }
                                                    onRevoke={onRevoke}
                                                    exception={request.exception}
                                                    exceptionAnnualCount={request.exceptionAnnualCount}
                                                    exceptionApproved={request.hasApprovedException}
                                                    exceptionReason={request.exceptionReason}
                                                    exceptionTaTotal={request.exceptionTaTotal}
                                                    exceptionReaderTotal={request.exceptionReaderTotal}
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
                    <div className="requests-filter-icon">
                        <i aria-hidden="true" className="fas fa-filter" />
                    </div>
                );
            case "course":
                return (
                    <div className="requests-filter-control requests-search-filter">
                        <input
                            aria-label={getFilterLabel(column.id)}
                            className="tacos-input requests-filter-input"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                column.setFilterValue(e.target.value.toUpperCase())
                            }
                            placeholder="Search ..."
                            value={currentValue.toUpperCase()}
                        />
                        <i
                            aria-hidden="true"
                            className="fas fa-search requests-search-filter__icon"
                        />
                    </div>
                );
            case "courseType":
                return (
                    <div className="requests-filter-control">
                        <select
                            aria-label={getFilterLabel(column.id)}
                            className="tacos-select requests-filter-select"
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
            case "exception":
                return (
                    <div className="requests-filter-control">
                        <select
                            aria-label={getFilterLabel(column.id)}
                            className="tacos-select requests-filter-select"
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

function getWidthStyle(width?: number): React.CSSProperties | undefined {
    if (!width) {
        return undefined;
    }

    return {
        minWidth: width,
        width,
    };
}

function getMinimumColumnWidth(column: ColumnDef<IRequestTableRow>) {
    const meta = getColumnMeta(column);

    if (meta.width) {
        return Math.min(meta.width, 100);
    }

    return 100;
}

function getColumnWidth(
    columnId: string,
    column: ColumnDef<IRequestTableRow>,
    measuredWidth?: number,
    columnWidths: Record<string, number> = {},
) {
    if (columnWidths[columnId]) {
        return columnWidths[columnId];
    }

    const meta = getColumnMeta(column);
    if (meta.width) {
        return meta.width;
    }

    return measuredWidth;
}

function getAriaSort(
    canSort: boolean,
    sortState: false | "asc" | "desc",
): React.AriaAttributes["aria-sort"] | undefined {
    if (!canSort) {
        return undefined;
    }

    if (sortState === "asc") {
        return "ascending";
    }

    if (sortState === "desc") {
        return "descending";
    }

    return "none";
}

function getFilterLabel(columnId: string) {
    switch (columnId) {
        case "course":
            return "Filter Course";
        case "courseType":
            return "Filter Course Type";
        case "exception":
            return "Filter Exception";
        default:
            return `Filter ${columnId}`;
    }
}

function getSortButtonLabel(
    columnId: string,
    header: ColumnDef<IRequestTableRow>["header"],
    nextSortOrder: false | "asc" | "desc",
) {
    const headerLabel = getSortableHeaderLabel(columnId, header);

    if (nextSortOrder === "asc") {
        return `Sort ${headerLabel} ascending`;
    }

    if (nextSortOrder === "desc") {
        return `Sort ${headerLabel} descending`;
    }

    return `Clear ${headerLabel} sorting`;
}

function getSortableHeaderLabel(columnId: string, header: ColumnDef<IRequestTableRow>["header"]) {
    if (typeof header === "string") {
        return header;
    }

    switch (columnId) {
        case "courseType":
            return "Course Type";
        default:
            return columnId;
    }
}

function renderSortIcon(sortState: false | "asc" | "desc") {
    if (sortState === "asc") {
        return <span aria-hidden="true">▲</span>;
    }

    if (sortState === "desc") {
        return <span aria-hidden="true">▼</span>;
    }

    return <span aria-hidden="true">↕</span>;
}

function renderIconTrigger(id: string, label: string, iconClassName: string) {
    return (
        <button
            aria-label={label}
            className="requests-icon-button"
            id={id}
            type="button"
        >
            <i aria-hidden="true" className={iconClassName} />
        </button>
    );
}

function renderNewIndicator(row: IRequestTableRow) {
    const { originalIndex, request } = row;

    if (!request.course || !request.course.isNew) {
        return null;
    }

    return (
        <span>
            {renderIconTrigger(
                `request-new-indicator-${originalIndex}`,
                "New course details",
                "fas fa-plus-circle",
            )}
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
    onCourseChange: (originalIndex: number, request: IRequest, course: ICourse | undefined) => void,
    onCourseCreate: (i: number, defaultValues?: ICourse) => void
) {
    const { originalIndex, request } = row;

    return (
        <CourseNumber
            course={request.course}
            onChange={(course) => onCourseChange(originalIndex, request, course)}
            onCourseCreate={(course) => onCourseCreate(originalIndex, course)}
        />
    );
}

function renderCourseType(
    row: IRequestTableRow,
    requestChanged: <K extends keyof IRequest>(
        originalIndex: number,
        request: IRequest,
        prop: K,
        value: IRequest[K],
    ) => void
) {
    const { originalIndex, request } = row;

    return (
        <CourseType
            courseType={request.courseType}
            onChange={(courseType) => requestChanged(originalIndex, request, "courseType", courseType)}
        />
    );
}

function renderCourseTypeHeader() {
    return (
        <div className="requests-header-inline">
            <span className="requests-header-label">Course Type</span>
            <a href="/CAES-TA-Guidelines 2018-23.pdf" rel="noopener noreferrer" target="_blank">
                Criteria Info <i className="fas fa-external-link-alt" />
            </a>
        </div>
    );
}

function renderException(
    row: IRequestTableRow,
    requestChanged: <K extends keyof IRequest>(
        originalIndex: number,
        request: IRequest,
        prop: K,
        value: IRequest[K],
    ) => void
) {
    const { originalIndex, request } = row;

    return (
        <Exception
            exception={request.exception}
            onExceptionChange={(exception) => requestChanged(originalIndex, request, "exception", exception)}
        />
    );
}

function renderRemoveButton(row: IRequestTableRow, onRemove: (i: number) => void) {
    return (
        <button
            aria-label="Remove request"
            className="tacos-btn tacos-btn--danger tacos-btn--icon-only"
            data-remove-request-button="true"
            type="button"
            onClick={() => onRemove(row.originalIndex)}
        >
            <i aria-hidden="true" className="fa fa-trash-alt" />
        </button>
    );
}

function renderAnnualizedFTE(row: IRequestTableRow, supportType: "ta" | "reader") {
    const { originalIndex, request } = row;
    const course = request.course;
    const annualizedTotal = supportType === "ta"
        ? (request.exception ? request.exceptionAnnualizedTaTotal : request.annualizedTaTotal)
        : (request.exception ? request.exceptionAnnualizedReaderTotal : request.annualizedReaderTotal);
    const supportLabel = supportType === "ta" ? "TA" : "Reader";

    if (course && course.isCourseTaughtOnceEveryTwoYears && !request.exception) {
        return (
            <>
                {annualizedTotal.toFixed(3)}
                <span style={{ paddingLeft: ".5em" }}>
                    {renderIconTrigger(
                        `request-${originalIndex}-${supportType}-otheryear-warning`,
                        "Every-other-year course warning",
                        "fas fa-exclamation-triangle tacos-text-warning",
                    )}
                    <UncontrolledTooltip
                        className=""
                        placement="right"
                        target={`request-${originalIndex}-${supportType}-otheryear-warning`}
                    >
                        Data shows that this course is offered every other year and {course.wasCourseTaughtInMostRecentYear ? "WILL NOT" : "WILL"} be offered in the upcoming year. {supportLabel} funding will not be allocated in the off year. If this is incorrect, please submit an exception request.
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
                {renderIconTrigger(
                    `request-${originalIndex}-error`,
                    "Request validation warning",
                    "fas fa-exclamation-triangle tacos-text-danger",
                )}
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

    if (request.calculationError) {
        return (
            <div>
                {renderIconTrigger(
                    `request-${originalIndex}-calculation-warning`,
                    "Request calculation warning",
                    "fas fa-exclamation-circle tacos-text-warning",
                )}
                <UncontrolledTooltip
                    className=""
                    placement="right"
                    target={`request-${originalIndex}-calculation-warning`}
                >
                    {request.calculationError}
                </UncontrolledTooltip>
            </div>
        );
    }

    return null;
}

export default RequestsTable;

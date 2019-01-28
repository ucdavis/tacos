import * as React from "react";

import ReactTable, { Column, CellInfo, RowInfo, Filter } from "react-table";

import CourseNumber from "./CourseNumber";
import CourseType from "./CourseType";
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

    courseNumberFilter?: string;
}

interface IState {
    filtered: Filter[];
}

interface ITypedCellInfo extends CellInfo {
    original: IRequest;
}

interface ITypedRowInfo extends RowInfo {
    original: IRequest;
}

interface IFilterParam {
    value: any;
}

interface IExpandedState {
    [index: number]: {};
}

export default class RequestsTable extends React.Component<IProps, IState> {
    private columns: Column[];

    constructor(props: IProps) {
        super(props);

        // add course number filter
        const filtered = [];
        if (this.props.courseNumberFilter) {
            filtered.push({
                id: 'course',
                value: props.courseNumberFilter,
            });
        }

        this.state = {
            filtered,
        };

        this.columns = [
            {
                Filter: this.renderNewIndicatorFilter,
                className: "d-flex justify-content-center align-items-center",
                headerClassName: "d-flex justify-content-center align-items-center",
                Cell: this.renderNewIndicator,
                width: 45,
                sortable: false,
                filterable: true, // to show the filter icon
            },
            {
                Header: "Course",
                Cell: this.renderCourse,
                Filter: this.renderCourseFilter,
                accessor: "course",
                sortable: true,
                sortMethod: (a: ICourse, b: ICourse, direction: boolean) => {
                    const sign = direction ? -1 : 1;
                    return sign * a.number.localeCompare(b.number);
                },
                filterable: true,
                filterMethod: (filter: any, request: IRequest) => {
                    const value = filter.value.toLowerCase();
                    return request.course.number.toLowerCase().indexOf(value) >= 0
                        || request.course.name.toLowerCase().indexOf(value) >= 0;
                },
            },
            {
                Header: this.renderCourseTypeHeader,
                Cell: this.renderCourseType,
                Filter: this.renderCourseTypeFilter,
                accessor: "courseType",
                sortable: true,
                filterable: true,
            },
            {
                Header: this.renderRequestTypeHeader,
                Cell: this.renderRequestType,
                Filter: this.renderRequestTypeFilter,
                accessor: "requestType",
                sortable: true,
                filterable: true,
            },
            // {
            //     Header: "TAs per course",
            //     Cell: null
            // },
            // {
            //     Header: "Annual TA FTE",
            //     Cell: null
            // },
            {
                id: "exception",
                Header: "Exception ?",
                expander: true,
                className: "d-flex justify-content-center pt-3",
                Expander: this.renderException,
                Filter: this.renderExceptionFilter,
                width: 150,
                sortable: true,
                filterable: true,
                filterMethod: (filter: any, request: IRequest) => {
                    const value = filter.value.toLowerCase();
                    if (value === "") {
                        return true;
                    }
                    return request.exception === (value === "true");
                },
            },
            {
                Header: "Remove",
                className: "d-flex justify-content-center align-items-center",
                Cell: this.renderRemoveButton,
                width: 100,
                sortable: false,
            },
            {
                className: "d-flex justify-content-center align-items-center",
                Cell: this.renderWarnings,
                width: 45,
                sortable: false,
            },
            {
                // hidden columns for data
                accessor: "exception",
                show: false,
            },
        ];
    }

    public componentWillReceiveProps(nextProps: IProps) {
        // add course number filter
        const filtered = [];
        if (this.props.courseNumberFilter) {
            filtered.push({
                id: 'course',
                value: nextProps.courseNumberFilter,
            });
        }

        this.setState({
            filtered
        });
    }

    public render() {
        const { requests } = this.props;

        const expanded = requests.reduce((e, r, index) => {
            if (r.exception) {
                e[index] = {};
            }
            return e;
        }, {} as IExpandedState);

        return (
            <TypedReactTable
                className={this.props.className}
                data={requests}
                resolveData={this.resolveData}
                columns={this.columns}
                SubComponent={this.renderExceptionDetail}
                showPagination={false}
                minRows={1}
                pageSizeOptions={[requests.length]}
                defaultPageSize={requests.length}
                expanded={expanded}
                defaultSorted={[{id: 'course', desc: true}]}
                getTrProps={this.decorateTr}
            />
        );
    }

    private renderNewIndicator = (row: ITypedCellInfo) => {
        return null;
    }

    private renderNewIndicatorFilter = (params: any) => {
        return (
            <i className="fas fa-filter" />
        )
    }

    private renderCourse = (row: ITypedCellInfo) => {
        const index = row.index;
        const request = row.original;

        return <CourseNumber course={request.course} onChange={course => this.onCourseChange(index, course)} />;
    }

    private renderCourseFilter = (params: any) => {
        const { filter, onChange } = params;
        const value = (filter && filter.value.toUpperCase()) || "";

        return (
            <div style={{ position: "relative" }}>
                <input
                    className="form-control"
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value.toUpperCase())}
                    placeholder="Search ..."
                />
                <i className="fas fa-search" style={{ top: "2px", right: "10px", transform: "translateY(50%)", position: "absolute" }}/>
            </div>
        )
    }

    private renderCourseType = (row: ITypedCellInfo) => {
        const index = row.index;
        const request = row.original;

        return (
            <CourseType
                courseType={request.courseType}
                onChange={courseType => this.requestChanged(index, "courseType", courseType)}
            />
        );
    }

    private renderCourseTypeHeader = () => {
        return (
            <div>
                <span className="mr-3">Course Type</span>
                <a target="_blank" href="/CAES-TA-Guidelines 2018-21.pdf">
                    Criteria Info <i className="fas fa-external-link-alt" />
                </a>
            </div>
        );
    }

    private renderCourseTypeFilter = (params: any) => {
        const { filter, onChange } = params;
        const value = (filter && filter.value) || "";
        return (
            <div className="input-group">
                <select
                    className="custom-select"
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
                >
                    <option value="STD">Standard lecture</option>
                    <option value="WRT">Writing intensive lecture</option>
                    <option value="LAB">Lab or Studio classes</option>
                    <option value="FLD">Field classes</option>
                    <option value="AUTO">Lecture only, automated grading</option>
                    <option value="MAN">Lecture only, manual grading</option>
                    <option value="MODW">Lecture only, moderate writing</option>
                    <option value="INT">Lecture only, writing intensive or substantial project</option>
                    <option value="">Show All</option>
                </select>
            </div>
        );
    }

    private renderRequestType = (row: ITypedCellInfo) => {
        const index = row.index;
        const request = row.original;

        return (
            <RequestType
                requestType={request.requestType}
                onChange={requestType => this.requestChanged(index, "requestType", requestType)}
            />
        );
    }

    private renderRequestTypeHeader = () => {
        return (
            <div>
                <span className="mr-2">Request Type</span>
                <i className="fas fa-question-circle" id="requestTypeHeader" />
                <UncontrolledTooltip
                    target="requestTypeHeader"
                    placement="right"
                >
                    For courses that require both TAs and Readers, select the majority position type.
                </UncontrolledTooltip>
            </div>
            
        );
    }

    private renderRequestTypeFilter = (params: any) => {
        const { filter, onChange } = params;
        const value = (filter && filter.value) || "";
        return (
            <div className="input-group">
                <select
                    className="custom-select"
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
                >
                    <option value="TA">TA</option>
                    <option value="READ">Reader</option>
                    <option value="">Show All</option>
                </select>
            </div>
        );
    }

    private renderException = (row: ITypedCellInfo) => {
        const index = row.index;
        const request = row.original;

        return (
            <Exception
                exception={request.exception}
                onExceptionChange={exception => this.requestChanged(index, "exception", exception)}
            />
        );
    }

    private renderExceptionFilter = (params: any) => {
        const { filter, onChange } = params;
        const value = (filter && filter.value) || "";
        return (
            <div className="input-group">
                <select
                    className="custom-select"
                    value={value}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
                >
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                    <option value="">Show All</option>
                </select>
            </div>
        );
    }

    private renderRemoveButton = (row: ITypedCellInfo) => {
        const index = row.index;

        return (
            <button
                className="btn btn-danger"
                onClick={() => this.props.onRemove(index)}
            >
                <i className="fa fa-trash-alt" />
            </button>
        );
    }

    private renderWarnings = (row: ITypedCellInfo) => {
        const index = row.index;
        const request = row.original;

        if (request.isDirty && !request.isValid) {
            return (
                <div>
                    <i id={`request-${index}-error`} className="fas fa-exclamation-triangle text-danger" />
                    <UncontrolledTooltip
                        className=""
                        placement="right"
                        target={`request-${index}-error`}
                    >
                        {request.error}
                    </UncontrolledTooltip>
                </div>
            );
        }

        if (request.isDirty) {
            return (
                <div>
                    <i id={`request-${index}-pending`} className="far fa-edit fa-xs" />
                    <UncontrolledTooltip className="" placement="right" target={`request-${index}-pending`}>
                        This class has pending edits.
                    </UncontrolledTooltip>
                </div>
            );
        }

        return null;
    }

    private renderExceptionDetail = (row: ITypedRowInfo) => {
        const index = row.index;
        const request = row.original;

        if (!request.exception) {
            return null;
        }

        return (
            <ExceptionDetail
                exception={request.exception}
                exceptionReason={request.exceptionReason}
                exceptionTotal={request.exceptionTotal}
                onExceptionTotalChange={exceptionTotal =>
                    this.requestChanged(index, "exceptionTotal", exceptionTotal)
                }
                onReasonChange={reason => this.requestChanged(index, "exceptionReason", reason)}
            />
        );
    }

    private onCourseChange = (index: number, course: ICourse) => {
        this.requestChanged(index, "courseNumber", course.number);
        this.requestChanged(index, "course", course);
    }

    private requestChanged = (index: number, prop: string, val: any) => {
        const request = this.props.requests[index];

        const newRequest = {
            ...request,
            [prop]: val
        };

        // new request passed up
        this.props.onEdit(index, newRequest);
    }

    private resolveData = (data: IRequest[]) => data.filter(r => !r.isDeleted);

    private onFilterChanged = (filtered: Filter[]) => {
        this.setState({ filtered });
    }

    private decorateTr = (state: any, row: ITypedRowInfo | undefined) => {
        if (!row) {
            return {};
        }
        
        const request = row.original;
        const result: any = {
            id: `request-${request.id}`,
        }

        if (request.isFocused) {
            result.className = 'target-flash';
        }

        return result;
    }
}


// tslint:disable-next-line:max-classes-per-file
class TypedReactTable extends ReactTable<IRequest>{ };

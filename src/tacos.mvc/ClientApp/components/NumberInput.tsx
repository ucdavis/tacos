import * as React from 'react';
 
interface IProps {
    value: number;
    onChange: (value: number) => void;
    format?: (value: number) => string;

    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;

    className?: string;
    inputRef?: React.RefObject<HTMLInputElement>;
}

interface IState {
    type: string;
    value: string;

    // Fix for: https://bugzilla.mozilla.org/show_bug.cgi?id=1057858
    noopBlur: boolean;
}

/*
 * Number Input saves the value to state, supports all the number controls during entry
 * then calls format to text on blur
 */
export default class NumberInput extends React.PureComponent<IProps, IState> {

    constructor(props: IProps) {
        super(props);

        this.state = {
            type: "text",
            value: this.valueToString(props.value),

            noopBlur: false,
        };
    }

    public componentWillReceiveProps(nextProps: IProps) {
        this.setState({
            value: this.valueToString(nextProps.value),
        });
    }

    public render() {
        const { className, inputRef, min, max, step, placeholder } = this.props;
        const { type, value } = this.state;


        return (
            <input
                className={className}
                type={type}
                min={min}
                max={max}
                step={step}
                placeholder={placeholder}
                value={value}
                onFocus={this.onFocus}
                onBlur={this.onBlur}
                onChange={(e) => { this.setState({ value: e.target.value }); }}
                required={true}
                ref={inputRef}
            />
        );
    }

    private valueToString = (value: number) => {
        if (this.props.format) {
            return this.props.format(value);
        }

        if (value === 0) {
            return "";
        }

        return value.toFixed(2);
    }

    private onFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        this.setState({noopBlur: true})
        this.setState({
            noopBlur: true,
            type: "number",
        });

        setTimeout(() => this.setState({noopBlur: false}), 100);
    }

    private onBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        if (this.state.noopBlur) {
            return;
        }

        let nextValue = Number(event.target.value);
        if (isNaN(nextValue)) {
            nextValue = 0;
        }
        
        this.props.onChange(nextValue);
        this.setState({type: "text"});
    }
}

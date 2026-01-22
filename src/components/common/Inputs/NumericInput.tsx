import { NumericFormat, NumberFormatValues } from 'react-number-format'

import ErrorText from "./ErrorText";
import { NumericInputProps } from "./types";
// import { ChangeEvent } from 'react';
import TextInput from './TextInput'

const NumericInput = ({ label, disabled, decimalScale, error, value, suffix = '', register, prefix = '$', onChange }: NumericInputProps) => {
    return (
        <div>
            <NumericFormat
                {...register}
                value={value}
                label={label}
                type='text'
                onValueChange={(values: NumberFormatValues) => {
                    if (!onChange) return
                    onChange(values.floatValue || 0)
                }}
                fixedDecimalScale
                decimalScale={decimalScale}
                suffix={suffix}
                // numericKeyboard
                allowNegative={false}
                customInput={TextInput}
                disabled={disabled}
                prefix={prefix}
            />
            {error && <ErrorText error={error} />}
        </div>
    )
}

export default NumericInput;
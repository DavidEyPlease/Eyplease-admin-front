import { useCallback } from "react";

import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from "@/uishadcn/ui/input-otp"

// const props = {
//     inputStyle: {
//         marginRight: 15,
//         width: 45,
//         height: 35,
//         color: '#4E31C0',
//         // fontWeight: 'bold',
//         // fontSize: 20,
//         border: '0px',
//         background: 'white',
//         borderBottom: '2px solid #B6B6B6',
//         outline: 'none',
//         padding: 5,
//     },
//     inputStyleInvalid: {
//         background: 'white',
//         color: '#F64040',
//         border: '2px solid #F64040'
//     }
// }

interface Props {
    onChange: (_value: string) => void
}

const CodeInput = ({ onChange }: Props) => {
    const onChangeHandler = useCallback((value: string) => onChange && onChange(value), [onChange, name])

    return (
        <div className="mx-auto w-max">
            <InputOTP maxLength={6} onChange={(value) => onChangeHandler(value)}>
                <InputOTPGroup className="text-primary">
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator className="text-primary" />
                <InputOTPGroup className="text-primary">
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                </InputOTPGroup>
            </InputOTP>
            {/* <ReactCodeInput
                type="number"
                placeholder="•"
                fields={6}
                name="codeInput"
                inputMode="latin"
                onChange={onChangeHandler}
                {...props}
            /> */}
        </div>
    )
}

export default CodeInput;
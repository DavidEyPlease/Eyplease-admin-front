import { useState, forwardRef } from "react";

import { Input } from "@/uishadcn/ui/input"
import { TextInputProps } from "./types";
import ErrorText from "./ErrorText";
import Button from "../Button";
import { IconEye } from "@/components/Svg/IconEye";
import { IconEyeSlash } from "@/components/Svg/IconEyeSlash";

const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
    type = 'text',
    label,
    register,
    error,
    ...props
}, ref) => {
    const [tooglePassword, setTooglePassword] = useState(false)

    return (
        <div>
            <div className="relative">
                <Input
                    ref={ref}
                    type={type === 'password' && tooglePassword ? 'text' : type}
                    aria-invalid={error ? "true" : "false"}
                    placeholder={label}
                    {...register}
                    {...props}
                />
                {type === 'password' &&
                    <Button
                        className="absolute top-0 right-0"
                        text={tooglePassword ? <IconEyeSlash /> : <IconEye />}
                        variant="ghost"
                        onClick={() => setTooglePassword(!tooglePassword)}
                    />
                }
            </div>
            {error && <ErrorText error={error} />}
        </div>
    )
});

export default TextInput;
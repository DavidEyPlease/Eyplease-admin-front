"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { Button } from "@/uishadcn/ui/button"
import { Card, CardContent } from "@/uishadcn/ui/card"
import { Info, Loader } from "lucide-react"

const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" className="text-green-500">
        <title>circle-check-3</title>
        <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke="currentColor">
            <circle cx="9" cy="9" r="7.25"></circle>
            <path d="M5.5,9c.863,.867,1.537,1.868,2.1,2.962,1.307-2.491,2.94-4.466,4.9-5.923"></path>
        </g>
    </svg>
)

interface ToastProps {
    show: boolean
    state: "initial" | "loading" | "success"
    onReset?: () => void
    onSave?: () => void
    labels?: {
        initialText?: string
        loadingText?: string
        successText?: string
        resetButtonText?: string
        saveButtonText?: string
    }
}

export function ToastActionContainer({ show, state: initialState, onReset, onSave, labels }: ToastProps) {
    const [state, setState] = React.useState(initialState)

    const saveStates = {
        initial: {
            icon: <Info className=" text-white" />,
            text: labels?.initialText || "Aplicar tareas",
        },
        loading: {
            icon: <Loader className="animate-spin text-white" />,
            text: labels?.loadingText || "Guardando",
        },
        success: {
            icon: <CheckIcon />,
            text: labels?.successText || "Cambios guardados",
        },
    }

    React.useEffect(() => {
        if (initialState === "loading") {
            setState("loading")
            const timer = setTimeout(() => {
                setState("success")
                const successTimer = setTimeout(() => {
                    setState("initial")
                }, 2000)
                return () => clearTimeout(successTimer)
            }, 3000)
            return () => clearTimeout(timer)
        } else {
            setState(initialState)
        }
    }, [initialState])

    const currentState = saveStates[state]

    const handleSave = () => {
        if (onSave) {
            onSave()
        }
    }

    if (!show) return null

    return (
        <motion.div
            className="w-fit fixed bottom-12 left-1/2 -translate-x-1/2 z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
        >
            <Card className="inline-flex h-10 items-center justify-center gap-4 px-1 py-0 bg-[#131316] rounded-[99px] overflow-hidden border-none">
                <CardContent className="flex items-center p-0">
                    <motion.div
                        className="inline-flex items-center justify-center gap-2 pl-1.5 pr-3 py-0"
                        layout
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={state}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.25 }}
                            >
                                {currentState.icon}
                            </motion.div>
                        </AnimatePresence>
                        <AnimatePresence mode="wait">
                            <motion.span
                                key={state}
                                className="text-white text-[13px] leading-5 font-normal whitespace-nowrap"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0 }}
                            >
                                {currentState.text}
                            </motion.span>
                        </AnimatePresence>
                    </motion.div>

                    <AnimatePresence>
                        {state === "initial" && (
                            <motion.div
                                className="inline-flex items-center gap-2 pl-0 pr-px py-0"
                                initial={{ opacity: 0, width: 0 }}
                                animate={{ opacity: 1, width: "auto" }}
                                exit={{ opacity: 0, width: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                            >
                                <Button
                                    variant="ghost"
                                    className="h-7 px-3 text-[13px] text-white hover:bg-white/10 hover:text-white rounded-[99px] transition-colors duration-200"
                                    onClick={onReset}
                                >
                                    {labels?.resetButtonText || 'Resetear'}
                                </Button>
                                <Button
                                    variant="default"
                                    onClick={handleSave}
                                    className="h-7 px-3 py-0 rounded-[99px] text-[13px] font-medium text-white bg-linear-to-b from-primary-500 to-primary-600 hover:from-primary-400 hover:to-primary-500 shadow-[inset_0px_1px_0px_0px_rgba(255,255,255,0.2)] transition-all duration-200"
                                >
                                    {labels?.saveButtonText || 'Guardar'}
                                </Button>
                                {/* <Button onClick={handleSave} /> */}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        </motion.div>
    )
}

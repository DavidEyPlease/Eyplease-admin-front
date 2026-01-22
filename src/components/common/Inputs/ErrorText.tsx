const ErrorText = ({ error }: { error: string }) => {
    return (
        <p role="alert" className="mt-1 text-xs text-left text-red-500">{error}</p>
    )
}

export default ErrorText;
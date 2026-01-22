import Button from "@/components/common/Button"

interface Props {
    icon: React.ReactNode
    onClick: () => void
}

const FabButton = ({ icon }: Props) => {
    return (
        <Button
            className="fixed p-6 rounded-full bottom-14 right-6"
            color="primary"
            size="icon"
            text={icon}
        />
    )
}

export default FabButton;
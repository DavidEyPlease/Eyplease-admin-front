import Button from "@/components/common/Button"

interface Props {
    icon: React.ReactNode
    onClick: () => void
}

const FabButton = ({ icon, onClick }: Props) => {
    return (
        <Button
            className="fixed p-6 rounded-full shadow-lg bottom-14 right-6 z-40"
            color="primary"
            size="icon"
            text={icon}
            onClick={onClick}
        />
    )
}

export default FabButton;
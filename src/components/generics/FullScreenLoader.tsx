import APP_LOGO from "@/assets/images/icon-white.png";
import Spinner from "@/components/common/Spinner";
import { Progress } from "@/uishadcn/ui/progress";

interface FullScreenLoaderProps {
    label?: string;
}

const FullScreenLoader = ({ label = "Cargando..." }: FullScreenLoaderProps) => {
    return (
        <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-background">
            <div className="flex w-full max-w-xs flex-col items-center gap-6 px-6 text-center">
                <div className="relative flex size-28 items-center justify-center rounded-full bg-primary shadow-sm">
                    <div className="absolute inset-0 rounded-full border border-primary/20" />
                    <img src={APP_LOGO} alt="Eyplease" className="h-14 w-14 object-contain" />
                </div>

                <div className="flex w-full flex-col items-center gap-3">
                    <Spinner color="primary" size="md" />
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <Progress value={72} className="h-1.5 w-full animate-pulse" />
                </div>
            </div>
        </div>
    )
}

export default FullScreenLoader;
import { API_ROUTES } from "@/constants/api"
import useFetchQuery from "@/hooks/useFetchQuery"
import { Backgrounds, ITemplate } from "@/interfaces/templates"
import { queryKeys } from "@/utils/queryKeys"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/uishadcn/ui/tabs"
import { Separator } from "@/uishadcn/ui/separator"

interface Props {
    template: ITemplate
}

const BackgroundsContainer = ({ backgrounds }: { backgrounds: Backgrounds }) => {
    return (
        <div className="space-y-4">
            <span>Portadas</span>
            <Separator className="my-3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(backgrounds?.covers || {}).map((image, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                        <img
                            src={image || "/placeholder.svg"}
                            alt={`Fondo ${index + 1}`}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-3">
                            <div className="text-sm font-medium">Fondo {index + 1}</div>
                        </div>
                    </div>
                ))}
            </div>
            <Separator className="my-3" />
            <span>Secciones</span>
            <Separator className="my-3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.values(backgrounds?.bg_sections || {}).map((image, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                        <img
                            src={image || "/placeholder.svg"}
                            alt={`Fondo ${index + 1}`}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-3">
                            <div className="text-sm font-medium">Fondo {index + 1}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const TemplateBackgrounds = ({ vertical, horizontal }: { vertical: Backgrounds, horizontal: Backgrounds }) => {
    return (
        <Tabs defaultValue="horizontal">
            <TabsList>
                <TabsTrigger value="horizontal">Horizontal</TabsTrigger>
                <TabsTrigger value="vertical">Vertical</TabsTrigger>
            </TabsList>
            <TabsContent value="horizontal">
                <BackgroundsContainer backgrounds={horizontal} />
            </TabsContent>
            <TabsContent value="vertical">
                <BackgroundsContainer backgrounds={vertical} />
            </TabsContent>
        </Tabs>
    )
}

const TemplateDetail = ({ template }: Props) => {
    const { response } = useFetchQuery<ITemplate>(API_ROUTES.TEMPLATES.DETAIL.replace('{id}', template.id), {
        customQueryKey: queryKeys.list('config/templates', { templateId: template.id })
    })

    return (
        <div className="space-y-4">
            <div className="grid gap-4">
                <div className="p-4 bg-gray-50 dark:bg-primary rounded-lg">
                    <h4 className="font-medium mb-2">Información de la Plantilla</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span>Nombre:</span>
                            <div className="font-semibold">{template?.name}</div>
                        </div>
                        <div>
                            <span>Clientes usando:</span>
                            <div className="font-semibold">{template?.clients_count}</div>
                        </div>
                    </div>
                </div>

                <div>
                    <h4 className="font-medium mb-3">
                        Fondos Disponibles
                    </h4>
                    {!!response &&
                        <Tabs defaultValue="unity">
                            <TabsList>
                                <TabsTrigger value="unity">Boletín Unidad</TabsTrigger>
                                <TabsTrigger value="national">Boletín Nacional</TabsTrigger>
                            </TabsList>
                            <TabsContent value="unity">
                                <TemplateBackgrounds
                                    vertical={response?.unity_background_vertical}
                                    horizontal={response?.unity_background_horizontal}
                                />
                            </TabsContent>
                            <TabsContent value="national">
                                <TemplateBackgrounds
                                    vertical={response?.national_background_vertical}
                                    horizontal={response?.national_background_horizontal}
                                />
                            </TabsContent>
                        </Tabs>
                    }
                </div>
            </div>
        </div>
    )
}

export default TemplateDetail
import { NetworkRankGroupType } from "@/interfaces/vendors";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/uishadcn/ui/accordion";
import { Card, CardContent } from "@/uishadcn/ui/card";
import { useState } from "react";
import { FormSteps } from "./form";
import { IClient } from "@/interfaces/clients";
import { CheckCheckIcon, Clock11Icon } from "lucide-react";
import BasicInfoForm from "./BasicInfoForm";
import Pictures from "./Pictures";
import DynamicTabs from "@/components/generics/DynamicTabs";
import UpdateNetwork from "../../Detail/components/Network/UpdateNetwork";

interface ClientFormProps {
    client?: IClient;
    onSetClient: (client: IClient) => void;
}

const ClientForm = ({ client, onSetClient }: ClientFormProps) => {
    const [step, setStep] = useState<FormSteps>('basic-info');
    const [networkRole, setNetworkRole] = useState<NetworkRankGroupType>('unity');

    const onCreateSuccess = (client: IClient) => {
        onSetClient(client);
        setStep('pictures');
    }

    const onUpdateSuccess = (updateClient: IClient, step: FormSteps) => {
        onSetClient({ ...client, ...updateClient });
        // setStep(step);
    }

    return (
        <Card>
            <CardContent className="grid gap-y-5">
                <Accordion
                    type="single"
                    collapsible
                    className="w-full"
                    defaultValue={step}
                    value={step}
                    onValueChange={(value) => {
                        if (value) setStep(value as FormSteps);
                    }}
                >
                    <AccordionItem value="basic-info">
                        <AccordionTrigger className="text-lg">
                            <div className="flex items-center gap-2">
                                {client ? <CheckCheckIcon className="text-emerald-500" /> : <Clock11Icon />}
                                Datos Básicos
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                            <BasicInfoForm client={client} onSuccess={onCreateSuccess} />
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="pictures" disabled={!client}>
                        <AccordionTrigger className="text-lg">
                            <div className="flex items-center gap-2">
                                {client && client?.photo && client?.logotype ? <CheckCheckIcon className="text-emerald-500" /> : <Clock11Icon />}
                                Subir archivos y datos visuales
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                            {client && (
                                <Pictures
                                    photo={client?.photo || null}
                                    logotype={client?.logotype || null}
                                    clientId={client.id}
                                    onUploadSuccess={(client, step) => onUpdateSuccess(client, step)}
                                />
                            )}
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="network" disabled={!client}>
                        <AccordionTrigger className="text-lg">
                            <div className="flex items-center gap-2">
                                <Clock11Icon />
                                Registrar vendedoras
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="flex flex-col gap-4 text-balance">
                            {client &&
                                <>
                                    <DynamicTabs
                                        value={networkRole}
                                        onValueChange={e => setNetworkRole(e as NetworkRankGroupType)}
                                        items={[
                                            { label: 'Unidad', value: 'unity' },
                                            { label: 'Directoras', value: 'directors' },
                                        ]}
                                    />
                                    <UpdateNetwork
                                        clientId={client.id}
                                        rolSelected={networkRole}
                                        buttonLabel="Subir archivo de vendedoras"
                                    />
                                </>

                            }
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </CardContent>
        </Card>
    )
}

export default ClientForm;
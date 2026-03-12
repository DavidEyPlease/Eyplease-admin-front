import Button from "@/components/common/Button"
import { API_ROUTES } from "@/constants/api"
import useRequestQuery from "@/hooks/useRequestQuery"
import { NewsletterTypes } from "@/interfaces/common"
import useAuthStore from "@/store/auth"
import { Checkbox } from "@/uishadcn/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@/uishadcn/ui/field"
import { RadioGroup, RadioGroupItem } from "@/uishadcn/ui/radio-group"
import { Separator } from "@/uishadcn/ui/separator"
import { useState } from "react"

const DispatchImportJob = () => {
    const { utilData } = useAuthStore(state => state)
    const [dispatchData, setDispatchData] = useState<{ type: string, sections: string[] }>({
        type: '',
        sections: []
    })
    const { request, requestState } = useRequestQuery()

    const onDispatch = async () => {
        console.log('Dispatching import job with data:', dispatchData)
        await request('POST', API_ROUTES.REPORTS.DISPATCH_IMPORT_JOB, dispatchData)
    }

    const newsletterGroups = utilData.newsletters.map(n => ({
        groupName: n.name,
        key: n.code,
        items: [
            ...n.sections.filter(i => i.canImported).map(s => ({
                label: s.name,
                value: s.sectionKey
            })),
            ...(n.code === NewsletterTypes.UNITY ? [
                { label: 'Tempraneras', value: 'early' }
            ] : [])
        ]
    }))

    return (
        <div>
            <div className="grid md:grid-cols-4 gap-4">
                <RadioGroup
                    defaultValue={dispatchData.type}
                    className="max-w-sm col-span-1 h-max"
                    onValueChange={e => setDispatchData({ type: e, sections: [] })}
                >
                    {newsletterGroups.map(group => (
                        <FieldLabel htmlFor={group.key} key={group.key}>
                            <Field orientation="horizontal">
                                <FieldContent>
                                    <FieldTitle>{group.groupName}</FieldTitle>
                                    <FieldDescription>
                                        Ejecutar carga de datos de {group.groupName} en segundo plano
                                    </FieldDescription>
                                </FieldContent>
                                <RadioGroupItem value={group.key} id={group.key} />
                            </Field>
                        </FieldLabel>
                    ))}
                </RadioGroup>
                <div className="col-span-3">
                    {dispatchData.type && (
                        <>
                            <FieldSet>
                                <FieldLegend variant="label">
                                    Selecciona las secciones a importar:
                                </FieldLegend>
                                <FieldDescription>
                                    Solo se importaran las secciones seleccionadas, si no se selecciona ninguna se importaran todas las secciones del boletín.
                                </FieldDescription>
                                <FieldGroup className="gap-3">
                                    {newsletterGroups.find(g => g.key === dispatchData.type)?.items.map(section => (
                                        <Field orientation="horizontal" key={section.value}>
                                            <Checkbox
                                                id={section.value}
                                                name={section.value}
                                                checked={dispatchData.sections.includes(section.value)}
                                                onCheckedChange={checked => {
                                                    if (checked) {
                                                        setDispatchData({
                                                            ...dispatchData,
                                                            sections: [...dispatchData.sections, section.value]
                                                        })
                                                    } else {
                                                        setDispatchData(prev => ({
                                                            ...prev,
                                                            sections: prev.sections.filter(s => s !== section.value)
                                                        }))
                                                    }
                                                }}
                                            />
                                            <FieldLabel
                                                htmlFor={section.value}
                                                className="font-normal"
                                            >
                                                {section.label}
                                            </FieldLabel>
                                        </Field>
                                    ))}
                                </FieldGroup>
                            </FieldSet>
                            <Separator className="my-5" />

                            <Button
                                text='Importar'
                                type="submit"
                                color="primary"
                                rounded
                                loading={requestState.loading}
                                onClick={onDispatch}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default DispatchImportJob
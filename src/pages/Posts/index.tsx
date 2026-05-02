import Button from "@/components/common/Button";
import Dropdown from "@/components/common/Inputs/Dropdown";
import DropdownGroup from "@/components/common/Inputs/DropdownGroup";
import { API_ROUTES } from "@/constants/api";
import { MONTHS_OPTIONS } from "@/constants/app";
import useRequestQuery from "@/hooks/useRequestQuery";
import useAuthStore from "@/store/auth";
import { Card, CardContent } from "@/uishadcn/ui/card";
import { Checkbox } from "@/uishadcn/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@/uishadcn/ui/field";
import { RadioGroup, RadioGroupItem } from "@/uishadcn/ui/radio-group";
import { Separator } from "@/uishadcn/ui/separator";
import { useState } from "react";
import { toast } from "sonner";

const PostsPage = () => {
    const { utilData } = useAuthStore(state => state)
    const { request, requestState } = useRequestQuery()
    const [newsletter, setNewsletter] = useState<string>('')
    const [selectedSections, setSelectedSections] = useState<string[]>([])
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null)
    const [artifacts, setArtifacts] = useState<string[]>([])

    const newsletterGroups = utilData.newsletters.map(n => ({
        groupName: n.name,
        key: n.code,
        items: n.sections.filter(i => i.has_publish_posts).map(s => ({
            label: s.name,
            value: s.sectionKey
        }))
    }))

    const onDispatch = async () => {
        try {
            if (!newsletter || !selectedMonth || !selectedSections.length || !artifacts.length) return
            await request('POST', API_ROUTES.POSTS.PUBLISH_NEWSLETTER, {
                section_keys: selectedSections,
                month: selectedMonth,
                artifacts
            })
            toast.success('Publicaciones ejecutadas correctamente')
        } catch (error) {
            toast.error('Error al ejecutar las publicaciones')
        }
    }

    return (
        <Card>
            <CardContent className="space-y-4">
                <RadioGroup
                    defaultValue={newsletter}
                    className="max-w-2xl h-max"
                    onValueChange={e => {
                        setNewsletter(e)
                        setSelectedSections([])
                    }}
                >
                    <div className="flex gap-4">
                        {newsletterGroups.map(group => (
                            <FieldLabel htmlFor={group.key} key={group.key}>
                                <Field orientation="horizontal">
                                    <FieldContent>
                                        <FieldTitle>{group.groupName}</FieldTitle>
                                        <FieldDescription>
                                            Ejecutar publicaciones de {group.groupName} en segundo plano
                                        </FieldDescription>
                                    </FieldContent>
                                    <RadioGroupItem value={group.key} id={group.key} />
                                </Field>
                            </FieldLabel>
                        ))}
                    </div>
                </RadioGroup>
                <div className="space-y-4">
                    {newsletter && (
                        <>
                            <div className="grid md:grid-cols-3 gap-4">
                                <Dropdown
                                    label="Mes de la publicación"
                                    placeholder="Selecciona un mes"
                                    value={(selectedMonth || '').toString()}
                                    className="w-max"
                                    onChange={e => setSelectedMonth(parseInt(e))}
                                    items={MONTHS_OPTIONS.map(c => ({
                                        value: c.value,
                                        label: c.label
                                    }))}
                                />
                                <FieldSet>
                                    <FieldLegend variant="label">
                                        Selecciona los archivos a generar:
                                    </FieldLegend>
                                    <FieldGroup className="gap-3">
                                        {[{ label: 'Imagen', value: 'image' }, { label: 'Video', value: 'video' }].map(artifact => (
                                            <Field orientation="horizontal" key={artifact.value}>
                                                <Checkbox
                                                    checked={artifacts.includes(artifact.value)}
                                                    onCheckedChange={checked => {
                                                        if (checked) {
                                                            setArtifacts([...artifacts, artifact.value])
                                                        } else {
                                                            setArtifacts(prev => prev.filter(a => a !== artifact.value))
                                                        }
                                                    }}
                                                />
                                                <FieldLabel
                                                    className="font-normal"
                                                >
                                                    {artifact.label}
                                                </FieldLabel>
                                            </Field>
                                        ))}
                                    </FieldGroup>
                                </FieldSet>

                                <FieldSet>
                                    <FieldLegend variant="label">
                                        Selecciona la sección a publicar:
                                    </FieldLegend>
                                    <RadioGroup
                                        defaultValue={selectedSections[0] || ''}
                                        onValueChange={e => setSelectedSections([e])}
                                    >
                                        {newsletterGroups.find(g => g.key === newsletter)?.items.map(section => (
                                            <Field orientation="horizontal" key={section.value}>
                                                <RadioGroupItem value={section.value} id={section.value} />
                                                <FieldLabel htmlFor={section.value} className="font-normal">
                                                    {section.label}
                                                </FieldLabel>
                                            </Field>
                                        ))}
                                    </RadioGroup>
                                    {/* <FieldGroup className="gap-3">
                                    {newsletterGroups.find(g => g.key === newsletter)?.items.map(section => (
                                        <Field orientation="horizontal" key={section.value}>
                                            <Checkbox
                                                id={section.value}
                                                name={section.value}
                                                checked={selectedSections.includes(section.value)}
                                                onCheckedChange={checked => {
                                                    if (checked) {
                                                        setSelectedSections([...selectedSections, section.value])
                                                    } else {
                                                        setSelectedSections(prev => prev.filter(s => s !== section.value))
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
                                </FieldGroup> */}
                                </FieldSet>
                            </div>

                            <Separator className="my-4" />

                            <div className="text-center">
                                <Button
                                    text='Publicar'
                                    type="submit"
                                    color="primary"
                                    rounded
                                    loading={requestState.loading}
                                    onClick={onDispatch}
                                />
                            </div>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default PostsPage;
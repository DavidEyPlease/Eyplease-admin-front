import { API_ROUTES } from "@/constants/api"
import { Card, CardContent } from "@/uishadcn/ui/card"
import ApiAutocomplete from "@/components/generics/ApiAutocomplete"
import { UtilsService } from "@/services/utils.service";
import { Separator } from "@/uishadcn/ui/separator";
import Dropdown from "@/components/common/Inputs/Dropdown";
import { MONTHS_OPTIONS } from "@/constants/app";
import DropdownGroup from "@/components/common/Inputs/DropdownGroup";
import useAuthStore from "@/store/auth";
import FileUploader from "@/components/generics/FileUploader";
import UploadErrorFeedback from "./components/UploadErrorFeedback";
import ReportUploadList from "./components/List";
import Button from "@/components/common/Button";
import useReportUpload from "@/hooks/useReportUpload";

const YEAR = new Date().getFullYear()

const ReportUploadsPage = () => {
    const { utilData } = useAuthStore(state => state)

    const {
        loading,
        selectedNewsletter,
        selectedMonth,
        selectedClient,
        uploadError,
        setSelectedNewsletter,
        setSelectedMonth,
        setSelectedClient,
        setFile,
        onSubmit,
        setUploadError
    } = useReportUpload()

    const newsletterGroups = utilData.newsletters.map(n => ({
        groupName: n.name,
        items: n.sections.filter(i => i.canImported).map(s => ({
            label: s.name,
            value: s.id
        }))
    }))

    return (
        <div>
            <div className="grid md:grid-cols-5 gap-4">
                <Card className="md:col-span-3">
                    <CardContent className="grid gap-y-5">
                        <div className="grid md:grid-cols-3 gap-5">
                            <DropdownGroup
                                label="Boletín"
                                groups={newsletterGroups}
                                placeholder="Seleccionar sección"
                                value={selectedNewsletter}
                                onChange={e => setSelectedNewsletter(e)}
                            />
                            <Dropdown
                                label="Mes del reporte"
                                placeholder="Selecciona un mes"
                                disabled={!selectedNewsletter}
                                value={selectedMonth}
                                onChange={e => setSelectedMonth(e)}
                                items={MONTHS_OPTIONS.map(c => ({
                                    value: `${YEAR}-${c.value}`,
                                    label: `${c.label} ${YEAR}`
                                }))}
                            />
                            <ApiAutocomplete
                                disabled={!selectedNewsletter || !selectedMonth}
                                label="Seleccionar cliente"
                                placeholder="Buscar cliente..."
                                suggestionKeyValue="user_id"
                                suggestionKeyLabel="name"
                                value={selectedClient}
                                queryFn={(params) => UtilsService.getSuggestionItems(API_ROUTES.CLIENTS.BASIC_LIST, params)}
                                onChange={e => setSelectedClient(e)}
                            />
                        </div>
                        <Separator className="my-5" />
                        <FileUploader
                            title="Importar Boletín Manual"
                            description="Sube archivos de boletines para procesamiento"
                            buttonText="Procesar Boletín"
                            fileAccepts=".xlsx, .xls"
                            onUploadFiles={(files) => setFile(files[0])}
                        />
                        <Button
                            text={loading ? 'Cargando...' : 'Subir Reporte'}
                            type="submit"
                            color="primary"
                            rounded
                            loading={loading}
                            className="mx-auto"
                            onClick={onSubmit}
                        />
                    </CardContent>
                </Card>
                <div className="md:col-span-2">
                    <ReportUploadList
                        yearMonth={selectedMonth}
                        userId={selectedClient}
                    />
                </div>
            </div>

            {uploadError &&
                <UploadErrorFeedback open={!!uploadError} onClose={() => setUploadError(null)} uploadError={uploadError} />
            }
        </div>
    )
}

export default ReportUploadsPage
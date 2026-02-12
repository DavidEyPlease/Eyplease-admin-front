import Button from "@/components/common/Button"
import Modal from "@/components/common/Modal"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import TrainingForm from "./components/TrainingForm"
import useTrainingsList from "./useTrainingsList"
import { DataTable } from "@/components/generics/DataTable"
import { trainingColumns } from "./components/ListColumns"
import { CardDescription, CardTitle } from "@/uishadcn/ui/card"
import SearchInput from "@/components/generics/SearchInput"
import TrainingFiles from "./components/TrainingFiles"

const TrainingsPage = () => {
    const { actionDialogOpen, selectedTraining, isLoading, trainings, setSearch, setActionDialogOpen } = useTrainingsList()

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Gestión de Entrenamientos
                </h1>
                <Button
                    rounded
                    text={
                        <>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Nuevo entrenamiento
                        </>
                    }
                    onClick={() => setActionDialogOpen('create')}
                />
            </div>

            <DataTable
                columns={trainingColumns}
                contentHeader={
                    <div className="space-y-2 mb-3">
                        <div>
                            <CardTitle>Entrenamientos</CardTitle>
                            <CardDescription>Gestiona todos los entrenamientos disponibles</CardDescription>
                        </div>
                        <SearchInput
                            placeholder="Buscar entrenamientos"
                            onSubmitSearch={(e) => setSearch(e)}
                        />
                    </div>
                }
                isLoading={isLoading}
                data={trainings?.items ?? []}
            />

            {actionDialogOpen && (
                <Modal
                    title={actionDialogOpen === 'edit' ? 'Editar entrenamiento' : 'Crear nuevo entrenamiento'}
                    description={actionDialogOpen === 'edit' ? `Editando: ${selectedTraining?.title}` : 'Crea un nuevo entrenamiento para tus clientes'}
                    open={['create', 'edit'].includes(actionDialogOpen)}
                    onOpenChange={() => setActionDialogOpen(null)}
                >
                    <TrainingForm
                        item={actionDialogOpen === 'edit' ? selectedTraining : undefined}
                        onSuccess={() => setActionDialogOpen(null)}
                    />
                </Modal>
            )}

            <Modal
                title={`Archivos de: ${selectedTraining?.title}`}
                description="Gestiona los archivos asociados a este entrenamiento"
                open={actionDialogOpen === 'files'}
                size="7xl"
                onOpenChange={() => setActionDialogOpen(null)}
            >
                {selectedTraining && <TrainingFiles training={selectedTraining} />}
            </Modal>
        </div>
    )
}

export default TrainingsPage
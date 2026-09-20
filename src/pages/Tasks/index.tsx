import { useEffect, useState } from 'react'

import { formatDate } from '@/utils/dates'
import { ITask } from '@/interfaces/tasks'
import useTasks from './useTasks'
import { useHeaderActions } from '@/providers/HeaderActionsProvider'

import SideModal from '@/components/common/SideModal'
import TaskForm from './components/Form'
import TaskDetail from './components/Detail'
import DynamicTabs from '@/components/generics/DynamicTabs'
import CalendarView from './CalendarView'
import TodoListView from './TodoListView'
import PageHead from "@/layouts/TopShell/PageHead"
import { isNewShell } from '@/layouts/TopShell/useNewShell'
import { cn } from '@/lib/utils'
import TaskBoard from './board/TaskBoard'

const TasksPage = () => {
    /* Con el marco nuevo abre en «La mesa» (por etapa); el calendario y la lista de siempre siguen a un clic */
    const newShell = isNewShell()
    const [viewMode, setViewMode] = useState<'board' | 'calendar' | 'todo'>(newShell ? 'board' : 'calendar')
    const { setHeaderActions } = useHeaderActions();

    const {
        tasks,
        selectedDate,
        open,
        selectedTask,
        setSelectedTask,
        setOpen,
        setData,
        ...tasksData
    } = useTasks()

    useEffect(() => {
        /* El marco nuevo lleva el conmutador en el encabezado de la página, con «La mesa» incluida */
        if (newShell) return
        setHeaderActions(
            <DynamicTabs
                value={viewMode}
                onValueChange={e => setViewMode(e as 'calendar' | 'todo')}
                items={[
                    { label: 'Calendario', value: 'calendar' },
                    { label: 'Tareas', value: 'todo' },
                ]}
            />
        )
    }, [])

    return (
        <div className='relative'>
            <div className="mb-4">
                <PageHead eyebrow="Operación" title={<>Pedidos de diseño · <em>la mesa</em></>} sub="Todo el trabajo de diseño por etapa: lo que nadie ha tomado, lo que se está haciendo, lo que espera tu visto bueno, las correcciones y lo entregado.">
                    <div className="inline-flex rounded-xl bg-foreground/5 p-[3px]">
                        {([['board', 'La mesa'], ['calendar', 'Calendario'], ['todo', 'Lista']] as const).map(([key, label]) => (
                            <button key={key} type="button" onClick={() => setViewMode(key)} className={cn('h-8 cursor-pointer rounded-[9px] px-3.5 text-[12.5px] font-bold transition-colors', viewMode === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{label}</button>
                        ))}
                    </div>
                </PageHead>
            </div>

            {viewMode === 'board' && <TaskBoard onOpen={setSelectedTask} />}
            {/* {tasksData.isLoading && <PageLoader />} */}

            {viewMode === 'calendar' && (
                <CalendarView
                    tasks={tasks}
                    {...tasksData}
                />
            )}

            {viewMode === 'todo' && (
                <TodoListView
                    tasks={tasks}
                    {...tasksData}
                />
            )}

            {open && selectedDate && (
                <SideModal
                    open={open}
                    size='md'
                    onOpenChange={setOpen}
                    title="Crear tarea"
                    description={`Añadir una nueva tarea para la fecha ${formatDate(selectedDate, { date: 'long' })}`}
                >
                    <TaskForm selectedDate={selectedDate} onSuccess={
                        (newTask: ITask) => {
                            setData([...tasks, newTask]);
                            setOpen(false);
                        }}
                    />
                </SideModal>
            )}

            {selectedTask && (
                <TaskDetail task={selectedTask} onClose={() => setSelectedTask(null)} />
            )}
        </div>
    )
}

export default TasksPage
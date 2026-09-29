import { useEffect, useState } from 'react'
import { PlusIcon } from 'lucide-react'

import { formatDate } from '@/utils/dates'
import { publishEvent } from '@/utils/events'
import { ITask } from '@/interfaces/tasks'
import { RoleKeys } from '@/interfaces/common'
import useAuth from '@/hooks/useAuth'
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
import TaskCalendar from './calendar/TaskCalendar'
import TaskList from './list/TaskList'

type ViewMode = 'board' | 'calendar' | 'todo'

const VIEWS: Array<[ViewMode, string]> = [['board', 'La mesa'], ['calendar', 'Calendario'], ['todo', 'Lista']]

const TasksPage = () => {
    /* Con el marco nuevo abre en «La mesa» (por etapa) y el calendario y la lista llevan su piel nueva;
       con el marco de siempre, todo sigue como estaba */
    const newShell = isNewShell()
    const [viewMode, setViewMode] = useState<ViewMode>(newShell ? 'board' : 'calendar')
    const { setHeaderActions } = useHeaderActions();
    const { user } = useAuth()

    const {
        tasks,
        selectedDate,
        setSelectedDate,
        open,
        selectedTask,
        setSelectedTask,
        setOpen,
        setData,
        ...tasksData
    } = useTasks()

    /* La dirección ve cada pedido en su fecha de inicio; quien diseña, en su entrega (lo mismo que pide la API) */
    const isDirector = user?.role?.role_key === RoleKeys.SUPER_ADMIN
    const dateKey = isDirector ? 'started_at' : 'expired_at'
    const month = tasksData.filters.month ?? new Date().getMonth() + 1

    const create = (date: Date) => {
        setSelectedDate(date)
        setOpen(true)
    }

    /* Mover un pedido de día: se ve al instante y, si la API lo rechaza, useTasks avisa */
    const moveTo = async (task: ITask, date: Date) => {
        setData(tasks.map(item => item.id === task.id ? { ...item, started_at: date } : item))
        await tasksData.onDragEnd(date, task.id)
    }

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
                <PageHead eyebrow="Operación" title={<>Pedidos de diseño · <em>{viewMode === 'board' ? 'la mesa' : viewMode === 'calendar' ? 'el calendario' : 'la lista'}</em></>} sub="Todo el trabajo de diseño: lo que nadie ha tomado, lo que se está haciendo, lo que espera tu visto bueno, las correcciones y lo entregado.">
                    <div className="inline-flex rounded-xl bg-foreground/5 p-[3px]">
                        {VIEWS.map(([key, label]) => (
                            <button key={key} type="button" onClick={() => setViewMode(key)} className={cn('h-8 cursor-pointer rounded-[9px] px-3.5 text-[12.5px] font-bold transition-colors', viewMode === key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground')}>{label}</button>
                        ))}
                    </div>
                    <button type="button" onClick={() => create(new Date())} className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B47E0] to-[#6C47FF] px-4 text-[13px] font-bold text-white shadow-[0_10px_24px_-12px_rgba(91,71,224,.8)] transition-opacity hover:opacity-95">
                        <PlusIcon className="size-4" /> Nuevo pedido
                    </button>
                </PageHead>
            </div>

            {viewMode === 'board' && <TaskBoard onOpen={setSelectedTask} />}

            {viewMode === 'calendar' && (newShell ? (
                <TaskCalendar
                    tasks={tasks}
                    loading={tasksData.isLoading}
                    month={month}
                    onMonthChange={next => tasksData.onApplyFilters({ month: next })}
                    dateKey={dateKey}
                    onOpen={setSelectedTask}
                    onCreate={create}
                    onMove={isDirector ? moveTo : undefined}
                />
            ) : (
                <CalendarView
                    tasks={tasks}
                    {...tasksData}
                />
            ))}

            {viewMode === 'todo' && (newShell ? (
                <TaskList
                    tasks={tasks}
                    loading={tasksData.isLoading}
                    month={month}
                    onMonthChange={next => tasksData.onApplyFilters({ month: next })}
                    dateKey={dateKey}
                    onOpen={setSelectedTask}
                />
            ) : (
                <TodoListView
                    tasks={tasks}
                    {...tasksData}
                />
            ))}

            {open && selectedDate && (
                <SideModal
                    open={open}
                    size='md'
                    onOpenChange={setOpen}
                    title="Nuevo pedido"
                    description={`Para el ${formatDate(selectedDate, { date: 'long' })}`}
                >
                    <TaskForm selectedDate={selectedDate} onSuccess={
                        (newTask: ITask) => {
                            /* El mismo aviso que ya escuchan la mesa, el calendario y la lista: así el pedido
                               nuevo aparece en la vista que esté abierta, sin recargar y sin duplicarse */
                            publishEvent('tasks-updated', { ...newTask, eventType: 'add' });
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

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

const TasksPage = () => {
    const [viewMode, setViewMode] = useState<'calendar' | 'todo'>('calendar')
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
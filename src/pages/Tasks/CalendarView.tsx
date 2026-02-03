import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from '@fullcalendar/daygrid'
import esLocale from '@fullcalendar/core/locales/es'
import interactionPlugin from '@fullcalendar/interaction'

import { Card, CardContent } from "@/uishadcn/ui/card"
import FilterSidebar from "./components/FilterSidebar"
import { cn } from "@/lib/utils"
import { Badge } from "@/uishadcn/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/uishadcn/ui/tooltip"
import { MAP_TASK_STATUS_COLORS, MAP_TASK_TYPES_COLORS } from "@/constants/app"
import { EventContentArg } from "@fullcalendar/core/index.js"
import { ITask, TaskStatusTypes } from "@/interfaces/tasks"
import { useSidebar } from "@/uishadcn/ui/sidebar"
import { useEffect, useRef } from "react"
import { UseTaskResult } from "./useTasks"

const renderEventContent = (eventInfo: EventContentArg & { event: ITask }) => {
    if (!eventInfo?.event) return null;
    const { task_type, task_status } = eventInfo.event._def.extendedProps;
    return (
        <div
            className={cn('p-2 rounded-md flex flex-col gap-y-1 shadow-sm', ...eventInfo.event.classNames)}
        >
            {/* <Badge className={cn(MAP_TASK_TYPES_COLORS[task_type?.slug])}>{task_type?.name}</Badge> */}
            <Badge className={cn('w-fit', 'text-[10px]', MAP_TASK_STATUS_COLORS[task_status?.slug as TaskStatusTypes])}>
                {task_status?.name}
            </Badge>

            <div className="flex items-center gap-x-1 break-words">
                <Tooltip>
                    <TooltipTrigger>
                        <div className={`size-3 rounded-full ${MAP_TASK_TYPES_COLORS[task_type.slug]}`} />
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{task_type?.name}</p>
                    </TooltipContent>
                </Tooltip>
                <p className={cn('break-words', 'text-xs', task_status?.slug === TaskStatusTypes.COMPLETED && 'line-through')}>{eventInfo.event.title.length > 15 ? `${eventInfo.event.title.substring(0, 15)}...` : eventInfo.event.title}</p>
            </div>
        </div>
    )
}

type CalendarViewProps = Pick<UseTaskResult, 'filters' | 'onApplyFilters' | 'isLoading' | 'tasks' | 'handleDateSelect' | 'handleEventClick' | 'onDragEnd'>;

const CalendarView = ({
    filters,
    onApplyFilters,
    tasks,
    handleDateSelect,
    handleEventClick,
    onDragEnd
}: CalendarViewProps) => {
    const calendarRef = useRef<FullCalendar | null>(null)
    const { state: sidebarState } = useSidebar()

    useEffect(() => {
        if (calendarRef.current) {
            calendarRef.current.getApi().updateSize();
        }
    }, [calendarRef, sidebarState]);

    return (
        <Card>
            <CardContent className='p-0'>
                <div className="flex flex-col md:flex-row">
                    <FilterSidebar filters={filters} onChangeFilters={onApplyFilters} />
                    <div className='w-full relative py-4'>
                        {/* {isLoading && <PageLoader className='w-full' />} */}

                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, interactionPlugin]}
                            headerToolbar={{
                                left: 'prev,next',
                                center: 'title',
                                right: 'dayGridMonth'
                            }}
                            locale={esLocale}
                            initialView='dayGridMonth'
                            editable={true}
                            selectable={true}
                            selectMirror={true}
                            dayMaxEvents={true}
                            dateClick={handleDateSelect}
                            events={tasks}
                            eventContent={renderEventContent}
                            eventClick={handleEventClick}
                            datesSet={(event) => onApplyFilters({ month: new Date(event.view.currentStart).getMonth() + 1 })}
                            eventDrop={e => e.event.start && onDragEnd(e.event.start, e.event.id)}
                            eventDurationEditable={false}
                        // eventResize={e => console.log('eventResize', e)}
                        //   eventsSet={handleEvents} // called after events are initialized/added/changed/removed
                        /* you can update a remote database when these fire:
                        eventAdd={function(){}}
                        eventChange={function(){}}
                        eventRemove={function(){}}
                        */
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default CalendarView;
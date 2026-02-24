import { UserRequestService } from "./requestService"

export const EventTypes = {
    ONLINE: 'online',
    PRESENTIAL: 'presential',
} as const;
export type EventTypes = typeof EventTypes[keyof typeof EventTypes];


export const EventOnlinePlatform = {
    ZOOM: 'zoom',
    FACEBOOK: 'facebook',
    OTHER: 'other',
} as const;
export type EventOnlinePlatform = typeof EventOnlinePlatform[keyof typeof EventOnlinePlatform];


export type EventOnlineData = {
    platforms: EventOnlinePlatform[]
    event_link?: string
    facebook_group?: string
    zoom_id?: string
}

export interface EventDate {
    id: string
    start_date: Date
    end_date: Date
    location: string
}

export interface IEvent {
    id: string
    title: string
    description: string | null
    start_date: Date
    event_type: EventTypes
    event_dates: EventDate[]
    online_data: EventOnlineData | null
    service: UserRequestService | null
}
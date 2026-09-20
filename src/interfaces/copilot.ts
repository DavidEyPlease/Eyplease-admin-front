export type CopilotRole = 'user' | 'assistant'

export interface ICopilotMessage {
    id: string
    role: CopilotRole
    text: string
    created_at: string
}

export interface ICopilotConversation {
    id: string
    title: string
    last_message_at: string | null
    created_at: string
}

export interface ICopilotConversationsPage {
    items: ICopilotConversation[]
    pagination_token: string | null
    last_page: boolean
}

export interface ICopilotSendPayload {
    message: string
    conversation_id: string | null
}

export interface ICopilotSendResponse {
    conversation_id: string
    message: string
}

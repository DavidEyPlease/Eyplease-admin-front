export const UserRequestStatusTypes = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  PENDING_CORRECTION: 'pending_correction',
} as const;

export type UserRequestStatusTypes = typeof UserRequestStatusTypes[keyof typeof UserRequestStatusTypes];

export interface UserRequestService {
  id: string
  title: string
  description: string
  quantity: number
  status: UserRequestStatusTypes
}
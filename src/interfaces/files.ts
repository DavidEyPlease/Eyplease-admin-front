export const FileTypes = {
  EVENT: 'event',
  USER_REQUESTED_SERVICE: 'user_requested_service',
  TRAINING_COVER: 'training_cover',
  TRAINING_PPTX: 'training_pptx',
  TRAINING_PDF_READING: 'training_pdf_reading',
  TRAINING_PPTX_TO_PDF: 'training_pptx_to_pdf',
  TRAINING_PDF_PREVIEW: 'training_pdf_preview',
  USER_PROFILE_PHOTO: 'user_profile_photo',
  USER_LOGOTYPE: 'user_logotype',
  TEMPLATE_COVER: 'template_cover',
} as const;

export type FileTypes = typeof FileTypes[keyof typeof FileTypes];


export interface EypleaseFile {
  id: string
  url: string
  uri: string
  name?: string
  type: FileTypes
}
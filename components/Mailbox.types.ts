export type MailboxCategory =
  'operations' | 'exams' | 'training' | 'community' | 'system' | 'personal'

export type MailboxActionType = 'view' | 'download' | 'join'

export type MailboxAction = {
  type: MailboxActionType
  label: string
  href?: string
}

export type MailboxSignOff = {
  name: string
  role: string
  org: string
}

export type MailboxEmail = {
  id: string
  sender: string
  senderId?: string
  recipientId: string
  category: MailboxCategory
  subject: string
  date: string
  dateFull: string
  sentAt: string
  preview: string
  body: string[]
  signOff: MailboxSignOff
  action?: MailboxAction
  automatic?: boolean
  read?: boolean
}

// A person the current user can send a message to — students and
// instructors, minus the current user.
export type MailboxPerson = {
  id: string
  name: string
  kind: 'student' | 'instructor'
}

// Who a composed message is sent as: the current user themselves, or one of
// the shared desks (instructor personas only).
export type MailboxSendAs = 'self' | 'operations' | 'exams' | 'training'

export type ComposeEmailValues = {
  recipientId: string
  subject: string
  body: string
  sendAs: MailboxSendAs
}

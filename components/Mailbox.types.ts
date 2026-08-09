export type MailboxSignOff = {
  name: string
  role: string
  org: string
}

export type MailboxEmail = {
  id: string
  sender: string
  subject: string
  date: string
  dateFull: string
  preview: string
  body: string[]
  linkText: string
  signOff: MailboxSignOff
  automatic?: boolean
  read?: boolean
}

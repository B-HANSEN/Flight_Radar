import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import CertificateList from './CertificateList'
import { DUMMY_CERTIFICATES } from './CertificateList.data'

const meta: Meta<typeof CertificateList> = {
  component: CertificateList,
  title: 'Components/CertificateList',
  args: {
    certificates: DUMMY_CERTIFICATES,
  },
}
export default meta

export const Default: StoryObj<typeof CertificateList> = {}

export const Empty: StoryObj<typeof CertificateList> = {
  args: {
    certificates: [],
  },
}

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import JsonLd from './JsonLd'

const meta: Meta<typeof JsonLd> = {
  component: JsonLd,
  title: 'Components/JsonLd',
}
export default meta

// Renders an invisible <script type="application/ld+json"> tag — inspect the
// "Show code" panel or the story's HTML output to see the emitted markup.
export const Default: StoryObj<typeof JsonLd> = {
  args: {
    data: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': 'https://example.com/#organization',
      name: 'Flight Radar',
      url: 'https://example.com',
    },
  },
}

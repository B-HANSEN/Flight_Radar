import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useArgs } from 'storybook/preview-api'
import TabBar from './TabBar'
import AgendaCalendar from './AgendaCalendar'
import { DUMMY_AGENDA_EVENTS } from './AgendaCalendar.data'

const meta: Meta<typeof TabBar> = {
  component: TabBar,
  title: 'Components/TabBar',
  argTypes: {
    activePath: {
      control: 'select',
      options: [
        '/me/agenda',
        '/me/certificates',
        '/me/courses',
        '/me/signatures',
        '/me/logbook',
        '/me/flight-duty-times',
        '/me/documents',
        '/me/solo',
        '/me/availability',
        '/me/emails',
      ],
    },
  },
}
export default meta

export const Default: StoryObj<typeof TabBar> = {
  args: {
    activePath: '/me/agenda',
  },
  render: (args) => {
    const [, updateArgs] = useArgs()
    return (
      <TabBar
        {...args}
        onItemClick={(href) => updateArgs({ activePath: href })}
      />
    )
  },
}

const DUMMY_PANEL_TEXT: Record<string, string> = {
  '/me/certificates':
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  '/me/courses':
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  '/me/signatures':
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
  '/me/logbook':
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
  '/me/flight-duty-times':
    'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.',
  '/me/documents':
    'Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
  '/me/solo':
    'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.',
  '/me/availability':
    'Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.',
  '/me/emails':
    'Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur.',
}

export const WithAgenda: StoryObj<typeof TabBar> = {
  args: {
    activePath: '/me/agenda',
  },
  render: (args) => {
    const [, updateArgs] = useArgs()
    const activePath = args.activePath ?? '/me/agenda'
    return (
      <div className='flex flex-col gap-4'>
        <TabBar
          {...args}
          onItemClick={(href) => updateArgs({ activePath: href })}
        />
        {activePath === '/me/agenda' ? (
          <AgendaCalendar
            events={DUMMY_AGENDA_EVENTS}
            initialMonth={{ year: 2026, month: 7 }}
          />
        ) : (
          <p className='max-w-160 px-1 font-secondary text-sm text-black-300'>
            {DUMMY_PANEL_TEXT[activePath]}
          </p>
        )}
      </div>
    )
  },
}

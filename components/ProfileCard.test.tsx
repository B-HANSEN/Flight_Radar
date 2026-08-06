import { fireEvent, render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import type { ComponentProps } from 'react'
import ProfileCard from './ProfileCard'
import enMessages from '@/messages/en.json'

const baseProps: ComponentProps<typeof ProfileCard> = {
  name: 'Doe, John',
  email: 'john.doe@example.com',
  phone: '+34 600 123 456',
  birthday: '14 March 1994',
  info: 'PPL online · Q1 2025',
  role: 'Student',
  emergencyContact: {
    name: 'Jane Doe',
    relation: 'Sister',
    phone: '+34 600 987 654',
  },
}

function renderCard(props: Partial<ComponentProps<typeof ProfileCard>> = {}) {
  return render(
    <NextIntlClientProvider locale='en' messages={enMessages}>
      <ProfileCard {...baseProps} {...props} />
    </NextIntlClientProvider>,
  )
}

describe('ProfileCard', () => {
  it('renders the name as a heading and the Information tab active by default', () => {
    renderCard()
    expect(
      screen.getByRole('heading', { name: 'Doe, John' }),
    ).toBeInTheDocument()

    expect(screen.getByRole('tab', { name: 'Information' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'Emergency' })).toHaveAttribute(
      'aria-selected',
      'false',
    )

    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument()
    expect(screen.getByText('+34 600 123 456')).toBeInTheDocument()
    expect(screen.getByText('14 March 1994')).toBeInTheDocument()
    expect(screen.getByText('PPL online · Q1 2025')).toBeInTheDocument()
    expect(screen.getByText('Student')).toBeInTheDocument()
    expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument()
  })

  it('switches to the Emergency tab and shows its fields when clicked', () => {
    renderCard()
    fireEvent.click(screen.getByRole('tab', { name: 'Emergency' }))

    expect(screen.getByRole('tab', { name: 'Emergency' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByRole('tab', { name: 'Information' })).toHaveAttribute(
      'aria-selected',
      'false',
    )

    expect(screen.getByText('Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('Sister')).toBeInTheDocument()
    expect(screen.getByText('+34 600 987 654')).toBeInTheDocument()
    expect(screen.queryByText('john.doe@example.com')).not.toBeInTheDocument()
  })

  it('calls onEdit and onLock when the header actions are clicked', () => {
    const onEdit = vi.fn()
    const onLock = vi.fn()
    renderCard({ onEdit, onLock })

    fireEvent.click(screen.getByRole('button', { name: 'Edit profile' }))
    fireEvent.click(screen.getByRole('button', { name: 'Lock profile' }))

    expect(onEdit).toHaveBeenCalledOnce()
    expect(onLock).toHaveBeenCalledOnce()
  })

  it('shows an image placeholder when no avatarSrc is given', () => {
    renderCard()
    expect(
      screen.getByRole('img', { name: 'Profile photo' }),
    ).toBeInTheDocument()
    expect(screen.queryByAltText('Profile photo')).not.toBeInTheDocument()
  })

  it('renders the avatar photo when avatarSrc is given', () => {
    renderCard({ avatarSrc: '/news/instrument-panel.webp' })
    const image = screen.getByAltText('Profile photo')
    expect(image.tagName).toBe('IMG')
    expect(image).toHaveAttribute('src')
  })

  it('only points aria-controls at the active tab panel', () => {
    renderCard()
    expect(screen.getByRole('tab', { name: 'Information' })).toHaveAttribute(
      'aria-controls',
      'profile-panel-information',
    )
    expect(screen.getByRole('tab', { name: 'Emergency' })).not.toHaveAttribute(
      'aria-controls',
    )

    fireEvent.click(screen.getByRole('tab', { name: 'Emergency' }))

    expect(
      screen.getByRole('tab', { name: 'Information' }),
    ).not.toHaveAttribute('aria-controls')
    expect(screen.getByRole('tab', { name: 'Emergency' })).toHaveAttribute(
      'aria-controls',
      'profile-panel-emergency',
    )
  })

  it('moves focus and activates the next tab with ArrowRight, wrapping around', () => {
    renderCard()
    const information = screen.getByRole('tab', { name: 'Information' })
    const emergency = screen.getByRole('tab', { name: 'Emergency' })

    fireEvent.keyDown(information, { key: 'ArrowRight' })
    expect(emergency).toHaveFocus()
    expect(emergency).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyDown(emergency, { key: 'ArrowRight' })
    expect(information).toHaveFocus()
    expect(information).toHaveAttribute('aria-selected', 'true')
  })

  it('moves focus and activates the previous tab with ArrowLeft, wrapping around', () => {
    renderCard()
    const information = screen.getByRole('tab', { name: 'Information' })
    const emergency = screen.getByRole('tab', { name: 'Emergency' })

    fireEvent.keyDown(information, { key: 'ArrowLeft' })
    expect(emergency).toHaveFocus()
    expect(emergency).toHaveAttribute('aria-selected', 'true')
  })

  it('jumps to the first/last tab with Home/End', () => {
    renderCard()
    const information = screen.getByRole('tab', { name: 'Information' })
    const emergency = screen.getByRole('tab', { name: 'Emergency' })

    fireEvent.keyDown(information, { key: 'End' })
    expect(emergency).toHaveFocus()
    expect(emergency).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyDown(emergency, { key: 'Home' })
    expect(information).toHaveFocus()
    expect(information).toHaveAttribute('aria-selected', 'true')
  })

  it('only keeps the active tab in the natural tab order', () => {
    renderCard()
    expect(screen.getByRole('tab', { name: 'Information' })).toHaveAttribute(
      'tabIndex',
      '0',
    )
    expect(screen.getByRole('tab', { name: 'Emergency' })).toHaveAttribute(
      'tabIndex',
      '-1',
    )
  })
})

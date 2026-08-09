import { render, screen } from '@testing-library/react'
import PageHeading from './PageHeading'

describe('PageHeading', () => {
  it('renders the title', () => {
    render(<PageHeading title='Hello' />)
    expect(screen.getByRole('heading', { name: 'Hello' })).toBeInTheDocument()
  })

  it('renders the description when provided', () => {
    render(<PageHeading title='Hello' description='World' />)
    expect(screen.getByText('World')).toBeInTheDocument()
  })

  it('omits the description when not provided', () => {
    render(<PageHeading title='Hello' />)
    expect(screen.queryByText('World')).not.toBeInTheDocument()
  })
})

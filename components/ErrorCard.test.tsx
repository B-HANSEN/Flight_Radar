import { fireEvent, render, screen } from '@testing-library/react'
import ErrorCard from './ErrorCard'

describe('ErrorCard', () => {
  it('renders the title and body', () => {
    render(
      <ErrorCard
        title='Something knocked us off course.'
        body='An unexpected error interrupted this page.'
        cta='Try again'
        onRetry={() => {}}
      />,
    )

    expect(
      screen.getByRole('heading', { name: 'Something knocked us off course.' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('An unexpected error interrupted this page.'),
    ).toBeInTheDocument()
  })

  it('calls onRetry when the CTA is clicked', () => {
    const onRetry = vi.fn()
    render(
      <ErrorCard
        title='Something knocked us off course.'
        body='An unexpected error interrupted this page.'
        cta='Try again'
        onRetry={onRetry}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})

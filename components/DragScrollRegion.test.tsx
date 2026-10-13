import { fireEvent, render, screen } from '@testing-library/react'
import DragScrollRegion from './DragScrollRegion'

describe('DragScrollRegion', () => {
  it('renders a keyboard-focusable region that shows a grabbing cursor while dragged', () => {
    render(
      <DragScrollRegion role='group' aria-label='Bookings' className='h-10'>
        <p>Content</p>
      </DragScrollRegion>,
    )

    const region = screen.getByRole('group', { name: 'Bookings' })
    expect(region).toHaveAttribute('tabindex', '0')
    expect(region).toHaveClass('h-10', 'cursor-grab')
    expect(screen.getByText('Content')).toBeInTheDocument()

    region.setPointerCapture = vi.fn()
    fireEvent.pointerDown(region, { pointerType: 'mouse', pointerId: 1 })
    expect(region).toHaveClass('cursor-grabbing')
  })
})

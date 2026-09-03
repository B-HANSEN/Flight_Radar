import { focusRing } from '@/lib/styles'

type Props = {
  label: string
  onClick: () => void
}

// Shared trigger for the modal stories below: they render closed by default
// (so Storybook's a11y addon and screenshots see the resting state first)
// and this button flips the arg that opens them.
export default function StoryOpenButton({ label, onClick }: Props) {
  return (
    <button
      type='button'
      onClick={onClick}
      className={`rounded-lg bg-blue-200 px-4 py-2 font-primary text-sm font-semibold text-black-300 ${focusRing}`}
    >
      {label}
    </button>
  )
}

import { BOOK_STATUS } from '../../utils/constants'
import { getBookStatusLabel } from '../../utils/bookUtils'

const STATUS_CLASSES = {
  [BOOK_STATUS.WANT_TO_READ]: 'bg-sand text-walnut',
  [BOOK_STATUS.READING]: 'bg-caramel/20 text-walnut',
  [BOOK_STATUS.COMPLETED]: 'bg-success/15 text-success',
  [BOOK_STATUS.PAUSED]: 'bg-surface-secondary text-text-secondary',
}

function BookStatusBadge({ status, className = '' }) {
  const label = getBookStatusLabel(status)
  const statusClass =
    STATUS_CLASSES[status] || STATUS_CLASSES[BOOK_STATUS.WANT_TO_READ]

  return (
    <span
      className={[
        'inline-flex max-w-full items-center rounded-full px-2.5 py-1',
        'text-xs font-medium leading-none',
        statusClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {label}
    </span>
  )
}

export default BookStatusBadge

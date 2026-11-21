import { getBookProgressPercentage } from '../../utils/bookUtils'

function BookProgress({
  currentPage = 0,
  totalPages = 0,
  showLabel = true,
  compact = false,
  className = '',
}) {
  const safeTotal = Math.max(0, Number(totalPages) || 0)
  const safeCurrent = Math.max(0, Number(currentPage) || 0)
  const percentage = getBookProgressPercentage({
    currentPage: safeCurrent,
    totalPages: safeTotal,
  })
  const displayedCurrent =
    safeTotal > 0 ? Math.min(safeCurrent, safeTotal) : safeCurrent

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      {showLabel ? (
        <div className="mb-2 flex items-center justify-between gap-3 text-xs">
          <span className="text-text-secondary">
            {displayedCurrent.toLocaleString()} of {safeTotal.toLocaleString()}{' '}
            pages
          </span>
          <span className="shrink-0 font-semibold tabular-nums text-text-primary">
            {percentage}%
          </span>
        </div>
      ) : null}

      <div
        className={[
          'w-full overflow-hidden rounded-full bg-surface-secondary',
          compact ? 'h-1.5' : 'h-2',
        ].join(' ')}
        role="progressbar"
        aria-label="Reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        aria-valuetext={`${percentage}% complete`}
      >
        <div
          className="h-full rounded-full bg-caramel transition-[width] duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default BookProgress

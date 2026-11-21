import { useState } from 'react'
import { BookOpen } from 'lucide-react'

function BookCover({
  src,
  title = 'Untitled book',
  author,
  aspectRatio = 'aspect-[2/3]',
  className = '',
  imageClassName = '',
  fallbackClassName = '',
}) {
  const [failedSrc, setFailedSrc] = useState(null)

  const showImage = Boolean(src) && failedSrc !== src

  return (
    <div
      className={[
        'relative flex w-full shrink-0 items-center justify-center',
        'overflow-hidden rounded-xl bg-surface shadow-sm',
        aspectRatio,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showImage ? (
        <img
          src={src}
          alt={title ? `Cover of ${title}` : 'Book cover'}
          loading="lazy"
          onError={() => setFailedSrc(src)}
          className={[
            'absolute inset-0 h-full w-full object-cover',
            imageClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        />
      ) : (
        <div
          className={[
            'flex h-full w-full flex-col items-center justify-center',
            'gap-3 bg-surface p-4 text-center text-text-primary',
            fallbackClassName,
          ]
            .filter(Boolean)
            .join(' ')}
          role="img"
          aria-label={`No cover available for ${title}`}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-secondary">
            <BookOpen aria-hidden="true" className="h-6 w-6 opacity-80" />
          </div>

          <span className="line-clamp-3 font-display text-sm font-semibold leading-snug">
            {title}
          </span>

          {author ? (
            <span className="line-clamp-2 text-xs text-text-secondary">
              {author}
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default BookCover

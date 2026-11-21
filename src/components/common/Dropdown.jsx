import { useEffect, useRef, useState } from 'react'
import { ChevronDown, MoreHorizontal } from 'lucide-react'

function Dropdown({
  trigger,
  triggerLabel = 'Open menu',
  items = [],
  align = 'end',
  className = '',
  menuClassName = '',
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    menuRef.current?.querySelector('[role="menuitem"]:not([disabled])')?.focus()

    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const focusItem = (index) => {
    const buttons = menuRef.current?.querySelectorAll(
      '[role="menuitem"]:not([disabled])',
    )
    if (!buttons?.length) return
    buttons[(index + buttons.length) % buttons.length].focus()
  }

  const handleMenuKeyDown = (event) => {
    const buttons = Array.from(
      menuRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])') ||
        [],
    )
    const currentIndex = buttons.indexOf(document.activeElement)

    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusItem(currentIndex + 1)
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusItem(currentIndex < 0 ? buttons.length - 1 : currentIndex - 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusItem(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusItem(buttons.length - 1)
    }
  }

  const handleSelect = (item) => {
    if (item.disabled || item.divider) return
    item.onSelect?.(item)
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div
      ref={rootRef}
      className={['relative inline-flex', className].filter(Boolean).join(' ')}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={triggerLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-text-primary transition-colors hover:bg-surface-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        {trigger || (
          <>
            <MoreHorizontal aria-hidden="true" className="h-5 w-5" />
            <span>{triggerLabel}</span>
            <ChevronDown
              aria-hidden="true"
              className="h-3.5 w-3.5 text-text-muted"
            />
          </>
        )}
      </button>

      {open ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={triggerLabel}
          onKeyDown={handleMenuKeyDown}
          className={[
            'absolute top-full z-[var(--z-dropdown)] mt-2 min-w-48 overflow-hidden',
            'rounded-xl border border-border bg-surface py-1.5 shadow-lg',
            align === 'start' ? 'left-0' : 'right-0',
            menuClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {items.map((item, index) => {
            if (item.divider) {
              return (
                <div
                  key={item.id || `divider-${index}`}
                  role="separator"
                  className="my-1.5 border-t border-border"
                />
              )
            }

            const Icon = item.icon

            return (
              <button
                key={item.id || item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={() => handleSelect(item)}
                className={[
                  'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm',
                  'transition-colors disabled:cursor-not-allowed disabled:opacity-45',
                  item.destructive
                    ? 'text-danger hover:bg-danger/10'
                    : 'text-text-primary hover:bg-surface-secondary',
                ].join(' ')}
              >
                {Icon ? (
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                ) : null}
                <span>{item.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export default Dropdown

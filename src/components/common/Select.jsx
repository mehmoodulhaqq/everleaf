import { useId } from 'react'
import { ChevronDown } from 'lucide-react'

function Select({
  label,
  id,
  name,
  options = [],
  value,
  defaultValue,
  onChange,
  placeholder = 'Select an option',
  hint,
  error,
  className = '',
  wrapperClassName = '',
  required = false,
  disabled = false,
  ...selectProps
}) {
  const generatedId = useId()
  const selectId = id || generatedId
  const hintId = hint ? `${selectId}-hint` : undefined
  const errorId = error ? `${selectId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={['w-full', wrapperClassName].filter(Boolean).join(' ')}>
      {label ? (
        <label
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-text-primary"
        >
          {label}
          {required ? (
            <span className="ml-1 text-danger" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}

      <div className="relative">
        <select
          id={selectId}
          name={name}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={[
            'min-h-11 w-full appearance-none rounded-lg border bg-surface py-2 pl-3 pr-10',
            'text-sm text-text-primary outline-none transition-colors',
            'focus:border-focus focus:ring-2 focus:ring-focus/20',
            'disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:opacity-70',
            error ? 'border-danger' : 'border-border-strong',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...selectProps}
        >
          <option value="" disabled={required}>
            {placeholder}
          </option>
          {options.map((option) => {
            const normalized =
              typeof option === 'string'
                ? { label: option, value: option }
                : option

            return (
              <option
                key={normalized.value}
                value={normalized.value}
                disabled={normalized.disabled}
              >
                {normalized.label}
              </option>
            )
          })}
        </select>

        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
        />
      </div>

      {hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-text-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default Select

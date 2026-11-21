import { useId } from 'react'

function Input({
  label,
  id,
  name,
  type = 'text',
  value,
  defaultValue,
  onChange,
  placeholder,
  hint,
  error,
  leadingIcon,
  trailingElement,
  className = '',
  inputClassName = '',
  wrapperClassName = '',
  required = false,
  disabled = false,
  ...inputProps
}) {
  const generatedId = useId()
  const inputId = id || generatedId
  const hintId = hint ? `${inputId}-hint` : undefined
  const errorId = error ? `${inputId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={['w-full', wrapperClassName].filter(Boolean).join(' ')}>
      {label ? (
        <label
          htmlFor={inputId}
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

      <div
        className={[
          'flex min-h-11 items-center gap-2 rounded-lg border bg-surface px-3',
          'transition-colors',
          error
            ? 'border-danger focus-within:border-danger'
            : 'border-border-strong focus-within:border-focus',
          disabled ? 'cursor-not-allowed bg-surface-secondary opacity-70' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {leadingIcon ? (
          <span className="shrink-0 text-text-muted" aria-hidden="true">
            {leadingIcon}
          </span>
        ) : null}

        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={[
            'min-w-0 w-full bg-transparent py-2 text-sm text-text-primary outline-none',
            'placeholder:text-text-muted disabled:cursor-not-allowed',
            inputClassName,
          ]
            .filter(Boolean)
            .join(' ')}
          {...inputProps}
        />

        {trailingElement ? (
          <span className="shrink-0">{trailingElement}</span>
        ) : null}
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

export default Input

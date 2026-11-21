import { Search, X } from 'lucide-react'
import Input from './Input'

function SearchBar({
  value = '',
  onChange,
  onClear,
  placeholder = 'Search...',
  label = 'Search',
  className = '',
  inputClassName = '',
  disabled = false,
  ...inputProps
}) {
  const hasValue = String(value).length > 0

  return (
    <Input
      type="search"
      name="search"
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      leadingIcon={<Search className="h-4 w-4" />}
      trailingElement={
        hasValue && onClear ? (
          <button
            type="button"
            onClick={onClear}
            disabled={disabled}
            aria-label="Clear search"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary disabled:opacity-50"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        ) : null
      }
      disabled={disabled}
      className={className}
      inputClassName={inputClassName}
      {...inputProps}
    />
  )
}

export default SearchBar

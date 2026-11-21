import { AlertTriangle } from 'lucide-react'
import Button from './Button'
import Modal from './Modal'

function ConfirmDialog({
  open = false,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  loading = false,
}) {
  const handleConfirm = () => {
    if (!loading) {
      onConfirm?.()
    }
  }

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title={title}
      size="sm"
      closeOnOverlay={!loading}
      closeOnEscape={!loading}
      showCloseButton={!loading}
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>

          <Button
            type="button"
            variant={destructive ? 'danger' : 'primary'}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        {destructive ? (
          <span className="mt-0.5 shrink-0 text-danger">
            <AlertTriangle aria-hidden="true" className="h-5 w-5" />
          </span>
        ) : null}

        <p className="text-sm text-text-secondary">{description}</p>
      </div>
    </Modal>
  )
}

export default ConfirmDialog

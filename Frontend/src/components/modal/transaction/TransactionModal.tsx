import styles from './TransactionModal.module.css'

type CategoryOption = { id: number; name: string }
type QuickNoteOption = { id: number; title: string }

export function TransactionModal(props: {
  isOpen: boolean
  mode: 'create' | 'edit'
  modalType: 'INCOME' | 'EXPENSE'
  saving: boolean
  date: string
  dateMin?: string
  dateMax?: string
  categoryId: number | null
  amount: string
  description: string
  categories: CategoryOption[]
  quickNotes?: QuickNoteOption[]
  onClose: () => void
  onDateChange: (value: string) => void
  onCategoryChange: (value: number) => void
  onAmountChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onApplyQuickNote?: (text: string) => void
  onSubmit: () => void
}) {
  const {
    isOpen,
    mode,
    modalType,
    saving,
    date,
    dateMin,
    dateMax,
    categoryId,
    amount,
    description,
    categories,
    quickNotes = [],
    onClose,
    onDateChange,
    onCategoryChange,
    onAmountChange,
    onDescriptionChange,
    onApplyQuickNote,
    onSubmit,
  } = props

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <strong>{mode === 'edit' ? 'Sua transaction' : 'Them transaction'} ({modalType})</strong>
          <button className={styles.close} type="button" onClick={onClose}>
            Close
          </button>
        </div>

        <div className={styles.form}>
          <label className={styles.field}>
            <span>Date</span>
            <input
              className={styles.input}
              type="date"
              value={date}
              min={dateMin}
              max={dateMax}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Category</span>
            <select
              className={styles.select}
              value={categoryId ?? ''}
              onChange={(e) => onCategoryChange(Number(e.target.value))}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <label className={styles.field}>
            <span>Amount</span>
            <input
              className={styles.input}
              type="number"
              step="1"
              min="1"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
            />
          </label>

          <label className={styles.field}>
            <span>Description</span>
            {quickNotes.length > 0 ? (
              <select
                className={styles.select}
                value=""
                onChange={(e) => {
                  const selected = quickNotes.find((q) => q.id === Number(e.target.value))
                  if (selected && onApplyQuickNote) {
                    onApplyQuickNote(selected.title)
                  }
                }}
              >
                <option value="">Chen tu quick note...</option>
                {quickNotes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title}
                  </option>
                ))}
              </select>
            ) : null}
            <textarea
              className={styles.textarea}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
            />
          </label>

          <div className={styles.actions}>
            <button className={styles.save} type="button" onClick={onSubmit} disabled={saving}>
              {saving ? 'Saving...' : mode === 'edit' ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


import styles from './BudgetColumn.module.css'

export type BudgetColumnRow = {
  categoryId: number
  categoryName: string
  plannedAmount: string
  originalPlannedAmount: string
  actualAmount: number
}

export function BudgetColumn(props: {
  title: string
  rows: BudgetColumnRow[]
  loading: boolean
  editing: boolean
  saving: boolean
  onStartEdit: () => void
  onSave: () => void
  onCancel: () => void
  onChange: (categoryId: number, value: string) => void
}) {
  const { title, rows, loading, editing, saving, onStartEdit, onSave, onCancel, onChange } = props
  const totalPlanned = rows.reduce((sum, row) => sum + Number(row.plannedAmount || 0), 0)
  const totalActual = rows.reduce((sum, row) => sum + row.actualAmount, 0)
  const totalDiff = totalPlanned - totalActual

  function formatVn(value: number) {
    return value.toLocaleString('vi-VN')
  }

  function diffClass(diff: number) {
    if (diff < 0) return styles.negative
    if (diff > 0) return styles.positive
    return styles.neutral
  }

  return (
    <div className={styles.box}>
      <div className={styles.boxHeader}>
        <h3 className={styles.boxTitle}>{title}</h3>
        {!editing ? (
          <button className={styles.editButton} type="button" onClick={onStartEdit}>
            Edit
          </button>
        ) : (
          <div className={styles.headerActions}>
            <button className={styles.saveButton} type="button" onClick={onSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button className={styles.cancelButton} type="button" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
          </div>
        )}
      </div>

      {loading ? <p className={styles.sub}>Dang tai...</p> : null}

      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div>Danh muc</div>
          <div className={styles.rightCol}>Du kien</div>
          <div className={styles.rightCol}>Thuc te</div>
          <div className={styles.rightCol}>Chenh lech</div>
        </div>
        <div className={`${styles.tableRow} ${styles.totalRow}`}>
          <div className={styles.name}>Tong</div>
          <div className={styles.readonlyCell}>{formatVn(totalPlanned)}</div>
          <div className={styles.readonlyCell}>{formatVn(totalActual)}</div>
          <div className={`${styles.readonlyCell} ${diffClass(totalDiff)}`}>{formatVn(totalDiff)}</div>
        </div>
        {rows.map((row) => (
          <div key={row.categoryId} className={styles.tableRow}>
            <div className={styles.name}>{row.categoryName}</div>
            <input
              className={styles.input}
              type="number"
              step="0.01"
              min="0"
              disabled={!editing}
              value={row.plannedAmount}
              onChange={(e) => onChange(row.categoryId, e.target.value)}
              placeholder="0"
            />
            <div className={styles.readonlyCell}>{formatVn(row.actualAmount)}</div>
            <div className={`${styles.readonlyCell} ${diffClass(Number(row.plannedAmount || 0) - row.actualAmount)}`}>
              {formatVn(Number(row.plannedAmount || 0) - row.actualAmount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


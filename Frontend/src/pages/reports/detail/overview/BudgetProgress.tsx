import styles from './BudgetProgress.module.css'

function clampPercent(value: number) {
  if (!Number.isFinite(value) || value < 0) return 0
  if (value > 100) return 100
  return value
}

export function BudgetProgress(props: { title: string; planned: number; actual: number }) {
  const { title, planned, actual } = props
  const percent = planned > 0 ? clampPercent((actual / planned) * 100) : 0

  return (
    <div className={styles.wrap}>
      <div className={styles.row}>
        <strong>{title}</strong>
        <span>{percent.toFixed(0)}%</span>
      </div>
      <div className={styles.meta}>
        <span>Du kien: {planned.toLocaleString('vi-VN')}</span>
        <span>Thuc te: {actual.toLocaleString('vi-VN')}</span>
      </div>
      <div className={styles.track}>
        <div className={styles.bar} style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}


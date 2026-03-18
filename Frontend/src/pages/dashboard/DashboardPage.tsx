import styles from './DashboardPage.module.css'

export function DashboardPage() {
  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Dashboard</h2>
      <p className={styles.sub}>Chỗ này lát mình làm chọn tháng (MonthlyReport) + overview.</p>
    </div>
  )
}


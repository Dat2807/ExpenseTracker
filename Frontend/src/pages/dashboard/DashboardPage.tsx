import styles from './DashboardPage.module.css'

export function DashboardPage() {
  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Dashboard</h2>
      <p className={styles.sub}>
        Khu tong quan / tinh hinh gan day (de bo sung nghiep vu sau). Hien tai luong chinh la vao Reports de chon thang.
      </p>
    </div>
  )
}


import styles from './OverviewCards.module.css'

export function OverviewCards(props: { plannedBalance: number; actualBalance: number }) {
  const { plannedBalance, actualBalance } = props

  return (
    <div className={styles.cards}>
      <div className={styles.card}>
        <h4 className={styles.title}>So du du kien</h4>
        <p className={styles.value}>{plannedBalance.toLocaleString('vi-VN')}</p>
      </div>
      <div className={styles.card}>
        <h4 className={styles.title}>So du thuc te</h4>
        <p className={styles.value}>{actualBalance.toLocaleString('vi-VN')}</p>
      </div>
    </div>
  )
}


import { Link } from 'react-router-dom'

import styles from './Header.module.css'

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>ExpenseTracker</div>
      <div className={styles.right}>
        <Link className={styles.link} to="/">
          Trang gioi thieu
        </Link>
        <span className={styles.pill}>Month: (coming)</span>
      </div>
    </header>
  )
}


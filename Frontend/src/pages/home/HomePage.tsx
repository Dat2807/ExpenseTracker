import { Link } from 'react-router-dom'

import { getToken } from '../../state/auth'
import styles from './HomePage.module.css'

export function HomePage() {
  const isLoggedIn = Boolean(getToken())

  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <h1 className={styles.title}>ExpenseTracker</h1>
        <p className={styles.sub}>Quan ly chi tieu ca nhan theo thang, budget va giao dich.</p>

        <div className={styles.actions}>
          {!isLoggedIn ? (
            <>
              <Link className={styles.primary} to="/login">
                Dang nhap
              </Link>
              <Link className={styles.secondary} to="/register">
                Dang ky
              </Link>
            </>
          ) : (
            <Link className={styles.primary} to="/dashboard">
              Vao Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}


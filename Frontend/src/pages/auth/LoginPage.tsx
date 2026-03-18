import { Link } from 'react-router-dom'

import styles from './LoginPage.module.css'

export function LoginPage() {
  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <h2 className={styles.title}>Login</h2>
        <form className={styles.form}>
          <label className={styles.field}>
            <span>Username</span>
            <input className={styles.input} />
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <input className={styles.input} type="password" />
          </label>
          <button className={styles.button} type="button">
            Login (next step)
          </button>
        </form>
        <div className={styles.footer}>
          <span>Chưa có tài khoản?</span> <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  )
}


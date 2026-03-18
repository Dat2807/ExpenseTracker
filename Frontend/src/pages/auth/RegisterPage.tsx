import { Link } from 'react-router-dom'

import styles from './RegisterPage.module.css'

export function RegisterPage() {
  return (
    <div className={styles.shell}>
      <div className={styles.card}>
        <h2 className={styles.title}>Register</h2>
        <form className={styles.form}>
          <label className={styles.field}>
            <span>Username</span>
            <input className={styles.input} />
          </label>
          <label className={styles.field}>
            <span>Email</span>
            <input className={styles.input} />
          </label>
          <label className={styles.field}>
            <span>Password</span>
            <input className={styles.input} type="password" />
          </label>
          <label className={styles.field}>
            <span>Confirm password</span>
            <input className={styles.input} type="password" />
          </label>
          <button className={styles.button} type="button">
            Register (next step)
          </button>
        </form>
        <div className={styles.footer}>
          <span>Đã có tài khoản?</span> <Link to="/login">Login</Link>
        </div>
      </div>
    </div>
  )
}


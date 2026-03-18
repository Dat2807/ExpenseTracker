import { Outlet } from 'react-router-dom'

import { Header } from '../Header/Header'
import { Sidebar } from '../Sidebar/Sidebar'
import styles from './MainLayout.module.css'

export function MainLayout() {
  return (
    <div className={styles.shell}>
      <Header />
      <div className={styles.body}>
        <Sidebar />
        <main className={styles.main}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}


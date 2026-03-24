import { NavLink } from 'react-router-dom'

import styles from './Sidebar.module.css'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/reports', label: 'Reports' },
  { to: '/categories', label: 'Categories' },
  { to: '/quick-notes', label: 'Quick Notes' },
]

export function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}


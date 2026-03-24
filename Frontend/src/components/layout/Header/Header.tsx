import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'

import { clearToken } from '../../../state/auth'
import styles from './Header.module.css'

export function Header() {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleLogout() {
    clearToken()
    setIsMenuOpen(false)
    navigate('/')
  }

  return (
    <header className={styles.header}>
      <div className={styles.brand}>ExpenseTracker</div>
      <div className={styles.right}>
        <Link className={styles.link} to="/">
          Trang gioi thieu
        </Link>
        <span className={styles.pill}>Month: (coming)</span>

        <div className={styles.userMenu} ref={menuRef}>
          <button
            type="button"
            className={styles.avatarButton}
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Open user menu"
          >
            🙂
          </button>

          {isMenuOpen ? (
            <div className={styles.dropdown}>
              <button type="button" className={styles.menuItem} onClick={() => setIsMenuOpen(false)}>
                View profile (soon)
              </button>
              <button type="button" className={styles.menuItemDanger} onClick={handleLogout}>
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}


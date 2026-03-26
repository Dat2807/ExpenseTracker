import { useEffect, useState } from 'react'

import { createCategory, deleteCategory, listCategories } from '../../api/categories'
import type { CategoryType } from '../../api/categories'
import { getApiErrorMessage } from '../../api/client'
import styles from './CategoriesPage.module.css'

export function CategoriesPage() {
  const [type, setType] = useState<CategoryType>('EXPENSE')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<Array<{ id: number; name: string; type: CategoryType }>>([])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const [expenseData, incomeData] = await Promise.all([listCategories('EXPENSE'), listCategories('INCOME')])
      const merged = [...expenseData, ...incomeData]
      setCategories(merged.map((item) => ({ id: item.id, name: item.name, type: item.type })))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Khong tai duoc categories'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function onCreate() {
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      await createCategory({ name: name.trim(), type })
      setName('')
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Khong tao duoc category'))
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(categoryId: number) {
    setError('')
    try {
      await deleteCategory(categoryId)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Khong xoa duoc category'))
    }
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Categories</h2>
      <p className={styles.sub}>Tao category truoc de dung cho budget va transactions theo thang.</p>

      <div className={styles.controls}>
        <select className={styles.select} value={type} onChange={(e) => setType(e.target.value as CategoryType)}>
          <option value="EXPENSE">EXPENSE</option>
          <option value="INCOME">INCOME</option>
        </select>
        <input
          className={styles.input}
          placeholder="Ten category..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className={styles.button} type="button" onClick={onCreate} disabled={saving}>
          {saving ? 'Dang tao...' : 'Tao'}
        </button>
      </div>

      {error ? <div className={styles.error}>{error}</div> : null}
      {loading ? <div className={styles.sub}>Dang tai...</div> : null}

      <div className={styles.list}>
        {categories.map((item) => (
          <div key={item.id} className={styles.item}>
            <div>
              <div className={styles.itemName}>{item.name}</div>
              <div className={styles.itemMeta}>{item.type}</div>
            </div>
            <button className={styles.deleteButton} type="button" onClick={() => onDelete(item.id)}>
              Xoa
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}


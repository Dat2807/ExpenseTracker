import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { createReport, listReports } from '../../api/reports'
import { getApiErrorMessage } from '../../api/client'
import styles from './ReportsPage.module.css'

export function ReportsPage() {
  const now = useMemo(() => new Date(), [])
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [reports, setReports] = useState<Array<{ id: number; year: number; month: number; title: string }>>([])
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')

  async function loadReports() {
    setLoading(true)
    setError('')
    try {
      const data = await listReports()
      setReports(data)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Khong tai duoc danh sach thang'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadReports()
  }, [])

  async function handleCreate() {
    setCreating(true)
    setError('')
    try {
      await createReport({ year, month, title: `Thang ${month}/${year}` })
      await loadReports()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Khong tao duoc thang moi'))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Reports (Danh sach thang)</h2>
      <p className={styles.sub}>Moi report la mot thang, bam vao de vao chi tiet.</p>

      <div className={styles.createBox}>
        <label className={styles.field}>
          <span>Year</span>
          <input
            className={styles.input}
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          />
        </label>
        <label className={styles.field}>
          <span>Month</span>
          <input
            className={styles.input}
            type="number"
            min={1}
            max={12}
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          />
        </label>
        <button className={styles.button} type="button" onClick={handleCreate} disabled={creating}>
          {creating ? 'Dang tao...' : 'Tao thang'}
        </button>
      </div>

      {error ? <div className={styles.error}>{error}</div> : null}
      {loading ? <div className={styles.sub}>Dang tai...</div> : null}

      <div className={styles.list}>
        {reports.map((report) => (
          <Link key={report.id} className={styles.item} to={`/reports/${report.id}`}>
            <div className={styles.itemTitle}>
              Thang {report.month}/{report.year}
            </div>
            <div className={styles.itemSub}>{report.title || 'Khong co title'}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}


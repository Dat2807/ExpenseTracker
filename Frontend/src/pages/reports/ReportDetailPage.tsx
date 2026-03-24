import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { getApiErrorMessage } from '../../api/client'
import { getReport } from '../../api/reports'
import styles from './ReportDetailPage.module.css'

type TabKey = 'overview' | 'transactions' | 'detailed'

export function ReportDetailPage() {
  const { reportId = '' } = useParams()
  const [activeTab, setActiveTab] = useState<TabKey>('overview')
  const [reportTitle, setReportTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError('')
      try {
        const report = await getReport(reportId)
        setReportTitle(`Thang ${report.month}/${report.year}`)
      } catch (err) {
        setError(getApiErrorMessage(err, 'Khong tai duoc report'))
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [reportId])

  return (
    <div className={styles.page}>
      <Link to="/reports" className={styles.back}>
        ← Quay lai danh sach thang
      </Link>
      <h2 className={styles.title}>{reportTitle || 'Report detail'}</h2>
      {loading ? <p className={styles.sub}>Dang tai...</p> : null}
      {error ? <p className={styles.error}>{error}</p> : null}

      <div className={styles.tabs}>
        <button
          type="button"
          className={activeTab === 'overview' ? `${styles.tab} ${styles.active}` : styles.tab}
          onClick={() => setActiveTab('overview')}
        >
          Overview + Budget
        </button>
        <button
          type="button"
          className={activeTab === 'transactions' ? `${styles.tab} ${styles.active}` : styles.tab}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
        <button
          type="button"
          className={activeTab === 'detailed' ? `${styles.tab} ${styles.active}` : styles.tab}
          onClick={() => setActiveTab('detailed')}
        >
          Detailed report
        </button>
      </div>

      <div className={styles.panel}>
        {activeTab === 'overview' ? (
          <>
            <h3>Overview + Budget</h3>
            <p>Cho nay se dat form budget theo category cho thang nay (MVP tiep theo).</p>
          </>
        ) : null}

        {activeTab === 'transactions' ? (
          <>
            <h3>Transactions</h3>
            <p>Cho nay se dat list + form giao dich cho report thang nay (MVP tiep theo).</p>
          </>
        ) : null}

        {activeTab === 'detailed' ? (
          <>
            <h3>Detailed report</h3>
            <p>Cho nay la bao cao chi tiet + bieu do (lam sau).</p>
          </>
        ) : null}
      </div>
    </div>
  )
}


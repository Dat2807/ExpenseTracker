import { useEffect, useMemo, useState } from 'react'

import { TransactionModal } from '../../../../components/modal/transaction/TransactionModal'
import { listCategories } from '../../../../api/categories'
import { getApiErrorMessage } from '../../../../api/client'
import { listQuickNotes } from '../../../../api/quickNotes'
import { getReport } from '../../../../api/reports'
import { createTransaction, deleteTransaction, listTransactionsByReport, updateTransaction } from '../../../../api/transactions'
import styles from './TransactionsTab.module.css'

type CategoryType = 'INCOME' | 'EXPENSE'

type Tx = {
  id: number
  category: number
  amount: string
  date: string
  description: string
}

function formatMoney(value: string) {
  const n = Number(value)
  if (Number.isNaN(n)) return value
  return n.toLocaleString('vi-VN')
}

export function TransactionsTab(props: { reportId: string; onError: (message: string) => void }) {
  const { reportId, onError } = props
  const [loading, setLoading] = useState(false)
  const [txs, setTxs] = useState<Tx[]>([])
  const [incomeCategories, setIncomeCategories] = useState<Array<{ id: number; name: string }>>([])
  const [expenseCategories, setExpenseCategories] = useState<Array<{ id: number; name: string }>>([])
  const [quickNotes, setQuickNotes] = useState<Array<{ id: number; title: string }>>([])
  const [dateMin, setDateMin] = useState<string | null>(null)
  const [dateMax, setDateMax] = useState<string | null>(null)

  const categoryNameById = useMemo(() => {
    const m = new Map<number, string>()
    for (const c of incomeCategories) m.set(c.id, c.name)
    for (const c of expenseCategories) m.set(c.id, c.name)
    return m
  }, [incomeCategories, expenseCategories])

  const incomeTxs = txs.filter((t) => incomeCategories.some((c) => c.id === t.category))
  const expenseTxs = txs.filter((t) => expenseCategories.some((c) => c.id === t.category))

  const [modalOpen, setModalOpen] = useState(false)
  const [modalType, setModalType] = useState<CategoryType>('EXPENSE')
  const [saving, setSaving] = useState(false)
  const [editingTxId, setEditingTxId] = useState<number | null>(null)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [date, setDate] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  function toTxShape(item: { id: number; category: number; amount: string; date: string; description: string }): Tx {
    return {
      id: item.id,
      category: item.category,
      amount: item.amount,
      date: item.date,
      description: item.description,
    }
  }

  async function loadData() {
    setLoading(true)
    onError('')
    try {
      const [inc, exp, notes, report, items] = await Promise.all([
        listCategories('INCOME'),
        listCategories('EXPENSE'),
        listQuickNotes(),
        getReport(reportId),
        listTransactionsByReport(reportId),
      ])
      setIncomeCategories(inc.map((c) => ({ id: c.id, name: c.name })))
      setExpenseCategories(exp.map((c) => ({ id: c.id, name: c.name })))
      setQuickNotes(notes.map((n) => ({ id: n.id, title: n.title || n.content })))
      setTxs(items.map((t) => ({ id: t.id, category: t.category, amount: t.amount, date: t.date, description: t.description })))

      const start = new Date(report.year, report.month - 1, 1)
      const end = new Date(report.year, report.month, 0)
      setDateMin(start.toISOString().slice(0, 10))
      setDateMax(end.toISOString().slice(0, 10))
    } catch (err) {
      onError(getApiErrorMessage(err, 'Khong tai duoc transactions'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportId])

  function openTransactionModal(params: { type: CategoryType; tx?: Tx }) {
    const { type, tx } = params
    setModalType(type)
    setModalOpen(true)
    if (tx) {
      setEditingTxId(tx.id)
      setCategoryId(tx.category)
      setAmount(tx.amount)
      setDescription(tx.description)
      setDate(tx.date)
      return
    }

    const list = type === 'INCOME' ? incomeCategories : expenseCategories
    setEditingTxId(null)
    setCategoryId(list.length > 0 ? list[0].id : null)
    setAmount('')
    setDescription('')
    const today = new Date().toISOString().slice(0, 10)
    const defaultDate = dateMin && dateMax ? (today < dateMin ? dateMin : today > dateMax ? dateMax : today) : today
    setDate(defaultDate)
  }

  async function onDelete(txId: number) {
    const confirmed = window.confirm('Ban co chac muon xoa transaction nay khong?')
    if (!confirmed) return

    onError('')
    try {
      await deleteTransaction(txId)
      setTxs((prev) => prev.filter((t) => t.id !== txId))
    } catch (err) {
      onError(getApiErrorMessage(err, 'Khong xoa duoc transaction'))
    }
  }

  async function saveTransaction() {
    if (!categoryId) return
    const payload = {
      report: Number(reportId),
      category: categoryId,
      amount,
      date,
      description,
    }
    if (editingTxId) {
      return updateTransaction(editingTxId, payload)
    }
    return createTransaction(payload)
  }

  async function onCreate() {
    if (!categoryId) return
    setSaving(true)
    onError('')
    try {
      const saved = await saveTransaction()
      if (!saved) return
      if (editingTxId) {
        setTxs((prev) =>
          prev.map((t) =>
            t.id === editingTxId
              ? toTxShape(saved)
              : t,
          ),
        )
      } else {
        setTxs((prev) => [toTxShape(saved), ...prev])
      }
      setModalOpen(false)
      setEditingTxId(null)
    } catch (err) {
      onError(getApiErrorMessage(err, editingTxId ? 'Khong cap nhat duoc transaction' : 'Khong tao duoc transaction'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.grid}>
      <div className={styles.box}>
        <div className={styles.boxHeader}>
          <h3 className={styles.boxTitle}>Chi phi</h3>
          <button className={styles.addButton} type="button" onClick={() => openTransactionModal({ type: 'EXPENSE' })}>
            + Transaction
          </button>
        </div>
        {loading ? <p className={styles.sub}>Dang tai...</p> : null}
        <div className={styles.list}>
          {expenseTxs.map((t) => (
            <div key={t.id} className={styles.item}>
              <div className={styles.itemTop}>
                <div className={styles.amount}>-{formatMoney(t.amount)}</div>
                <div className={styles.itemActions}>
                  <div className={styles.meta}>{t.date}</div>
                  <button className={styles.edit} type="button" onClick={() => openTransactionModal({ type: 'EXPENSE', tx: t })}>
                    Sua
                  </button>
                  <button className={styles.delete} type="button" onClick={() => onDelete(t.id)}>
                    Xoa
                  </button>
                </div>
              </div>
              <div className={styles.meta}>{categoryNameById.get(t.category) ?? `Category #${t.category}`}</div>
              {t.description ? <div className={styles.meta}>{t.description}</div> : null}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.box}>
        <div className={styles.boxHeader}>
          <h3 className={styles.boxTitle}>Thu nhap</h3>
          <button className={styles.addButton} type="button" onClick={() => openTransactionModal({ type: 'INCOME' })}>
            + Transaction
          </button>
        </div>
        {loading ? <p className={styles.sub}>Dang tai...</p> : null}
        <div className={styles.list}>
          {incomeTxs.map((t) => (
            <div key={t.id} className={styles.item}>
              <div className={styles.itemTop}>
                <div className={styles.amount}>+{formatMoney(t.amount)}</div>
                <div className={styles.itemActions}>
                  <div className={styles.meta}>{t.date}</div>
                  <button className={styles.edit} type="button" onClick={() => openTransactionModal({ type: 'INCOME', tx: t })}>
                    Sua
                  </button>
                  <button className={styles.delete} type="button" onClick={() => onDelete(t.id)}>
                    Xoa
                  </button>
                </div>
              </div>
              <div className={styles.meta}>{categoryNameById.get(t.category) ?? `Category #${t.category}`}</div>
              {t.description ? <div className={styles.meta}>{t.description}</div> : null}
            </div>
          ))}
        </div>
      </div>

      <TransactionModal
        isOpen={modalOpen}
        mode={editingTxId ? 'edit' : 'create'}
        modalType={modalType}
        saving={saving}
        date={date}
        dateMin={dateMin ?? undefined}
        dateMax={dateMax ?? undefined}
        categoryId={categoryId}
        amount={amount}
        description={description}
        categories={modalType === 'INCOME' ? incomeCategories : expenseCategories}
        quickNotes={quickNotes}
        onClose={() => setModalOpen(false)}
        onDateChange={setDate}
        onCategoryChange={setCategoryId}
        onAmountChange={setAmount}
        onDescriptionChange={setDescription}
        onApplyQuickNote={(text) => setDescription((prev) => (prev ? `${prev} ${text}` : text))}
        onSubmit={onCreate}
      />
    </div>
  )
}


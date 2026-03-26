import { useEffect, useState } from 'react'

import { listCategories } from '../../../../api/categories'
import { createBudget, listBudgetsByReport, updateBudget } from '../../../../api/budgets'
import { getApiErrorMessage } from '../../../../api/client'
import styles from './OverviewBudgetTab.module.css'

type CategoryRow = {
  categoryId: number
  categoryName: string
  budgetId?: number
  plannedAmount: string
  originalPlannedAmount: string
}

export function OverviewBudgetTab(props: { reportId: string; onError: (message: string) => void }) {
  const { reportId, onError } = props
  const [expenseRows, setExpenseRows] = useState<CategoryRow[]>([])
  const [incomeRows, setIncomeRows] = useState<CategoryRow[]>([])
  const [loading, setLoading] = useState(false)
  const [editingExpense, setEditingExpense] = useState(false)
  const [editingIncome, setEditingIncome] = useState(false)
  const [savingExpense, setSavingExpense] = useState(false)
  const [savingIncome, setSavingIncome] = useState(false)

  useEffect(() => {
    async function loadBudgetData() {
      setLoading(true)
      onError('')
      try {
        const [expenseCategories, incomeCategories, budgets] = await Promise.all([
          listCategories('EXPENSE'),
          listCategories('INCOME'),
          listBudgetsByReport(reportId),
        ])

        const budgetMap = new Map(budgets.map((budget) => [budget.category, budget]))
        const expRows = expenseCategories.map((category) => {
          const existed = budgetMap.get(category.id)
          const planned = existed?.planned_amount ?? ''
          return {
            categoryId: category.id,
            categoryName: category.name,
            budgetId: existed?.id,
            plannedAmount: planned,
            originalPlannedAmount: planned,
          }
        })

        const incRows = incomeCategories.map((category) => {
          const existed = budgetMap.get(category.id)
          const planned = existed?.planned_amount ?? ''
          return {
            categoryId: category.id,
            categoryName: category.name,
            budgetId: existed?.id,
            plannedAmount: planned,
            originalPlannedAmount: planned,
          }
        })

        setExpenseRows(expRows)
        setIncomeRows(incRows)
      } catch (err) {
        onError(getApiErrorMessage(err, 'Khong tai duoc budget cua thang'))
      } finally {
        setLoading(false)
      }
    }

    void loadBudgetData()
  }, [onError, reportId])

  function onChangeExpense(categoryId: number, value: string) {
    setExpenseRows((prev) =>
      prev.map((row) => (row.categoryId === categoryId ? { ...row, plannedAmount: value } : row)),
    )
  }

  function onChangeIncome(categoryId: number, value: string) {
    setIncomeRows((prev) =>
      prev.map((row) => (row.categoryId === categoryId ? { ...row, plannedAmount: value } : row)),
    )
  }

  async function saveColumn(kind: 'EXPENSE' | 'INCOME') {
    onError('')
    try {
      const rows = kind === 'EXPENSE' ? expenseRows : incomeRows
      const dirtyRows = rows.filter((r) => r.plannedAmount.trim() !== r.originalPlannedAmount.trim())

      for (const row of dirtyRows) {
        const amount = row.plannedAmount.trim()
        if (!amount) continue

        if (row.budgetId) {
          await updateBudget(row.budgetId, { planned_amount: amount })
        } else {
          const created = await createBudget({
            report: Number(reportId),
            category: row.categoryId,
            planned_amount: amount,
          })
          row.budgetId = created.id
        }
      }

      if (kind === 'EXPENSE') {
        setExpenseRows((prev) => prev.map((r) => ({ ...r, originalPlannedAmount: r.plannedAmount })))
        setEditingExpense(false)
      } else {
        setIncomeRows((prev) => prev.map((r) => ({ ...r, originalPlannedAmount: r.plannedAmount })))
        setEditingIncome(false)
      }
    } catch (err) {
      onError(getApiErrorMessage(err, 'Khong luu duoc budget'))
    }
  }

  return (
    <div className={styles.grid}>
      <div className={styles.overviewBox}>
        <h3 className={styles.boxTitle}>Overview (coming)</h3>
        <p className={styles.sub}>O nay de hien tong quan tinh hinh (lam sau).</p>
      </div>

      <div className={styles.box}>
        <div className={styles.boxHeader}>
          <h3 className={styles.boxTitle}>Chi phi</h3>
          {!editingExpense ? (
            <button className={styles.editButton} type="button" onClick={() => setEditingExpense(true)}>
              Edit
            </button>
          ) : (
            <div className={styles.headerActions}>
              <button
                className={styles.saveButton}
                type="button"
                onClick={async () => {
                  setSavingExpense(true)
                  await saveColumn('EXPENSE')
                  setSavingExpense(false)
                }}
                disabled={savingExpense}
              >
                {savingExpense ? 'Saving...' : 'Save'}
              </button>
              <button
                className={styles.cancelButton}
                type="button"
                onClick={() => {
                  setExpenseRows((prev) => prev.map((r) => ({ ...r, plannedAmount: r.originalPlannedAmount })))
                  setEditingExpense(false)
                }}
                disabled={savingExpense}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {loading ? <p className={styles.sub}>Dang tai...</p> : null}

        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div>Danh muc</div>
            <div className={styles.rightCol}>Du kien</div>
          </div>
          {expenseRows.map((row) => (
            <div key={row.categoryId} className={styles.tableRow}>
              <div className={styles.name}>{row.categoryName}</div>
              <input
                className={styles.input}
                type="number"
                step="0.01"
                min="0"
                disabled={!editingExpense}
                value={row.plannedAmount}
                onChange={(e) => onChangeExpense(row.categoryId, e.target.value)}
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.box}>
        <div className={styles.boxHeader}>
          <h3 className={styles.boxTitle}>Thu nhap</h3>
          {!editingIncome ? (
            <button className={styles.editButton} type="button" onClick={() => setEditingIncome(true)}>
              Edit
            </button>
          ) : (
            <div className={styles.headerActions}>
              <button
                className={styles.saveButton}
                type="button"
                onClick={async () => {
                  setSavingIncome(true)
                  await saveColumn('INCOME')
                  setSavingIncome(false)
                }}
                disabled={savingIncome}
              >
                {savingIncome ? 'Saving...' : 'Save'}
              </button>
              <button
                className={styles.cancelButton}
                type="button"
                onClick={() => {
                  setIncomeRows((prev) => prev.map((r) => ({ ...r, plannedAmount: r.originalPlannedAmount })))
                  setEditingIncome(false)
                }}
                disabled={savingIncome}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {loading ? <p className={styles.sub}>Dang tai...</p> : null}

        <div className={styles.table}>
          <div className={styles.tableHeader}>
            <div>Danh muc</div>
            <div className={styles.rightCol}>Du kien</div>
          </div>
          {incomeRows.map((row) => (
            <div key={row.categoryId} className={styles.tableRow}>
              <div className={styles.name}>{row.categoryName}</div>
              <input
                className={styles.input}
                type="number"
                step="0.01"
                min="0"
                disabled={!editingIncome}
                value={row.plannedAmount}
                onChange={(e) => onChangeIncome(row.categoryId, e.target.value)}
                placeholder="0"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}


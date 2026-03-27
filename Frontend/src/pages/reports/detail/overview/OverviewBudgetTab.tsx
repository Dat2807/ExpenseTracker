import { useEffect, useState } from 'react'

import { listCategories } from '../../../../api/categories'
import { createBudget, listBudgetsByReport, updateBudget } from '../../../../api/budgets'
import { getApiErrorMessage } from '../../../../api/client'
import { listTransactionsByReport } from '../../../../api/transactions'
import { BudgetColumn } from './BudgetColumn'
import type { BudgetColumnRow } from './BudgetColumn'
import { BudgetProgress } from './BudgetProgress'
import { OverviewCards } from './OverviewCards'
import styles from './OverviewBudgetTab.module.css'

type CategoryRow = BudgetColumnRow & { budgetId?: number }

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
        const [expenseCategories, incomeCategories, budgets, transactions] = await Promise.all([
          listCategories('EXPENSE'),
          listCategories('INCOME'),
          listBudgetsByReport(reportId),
          listTransactionsByReport(reportId),
        ])

        const budgetMap = new Map(budgets.map((budget) => [budget.category, budget]))
        const actualMap = new Map<number, number>()
        for (const tx of transactions) {
          actualMap.set(tx.category, (actualMap.get(tx.category) ?? 0) + Number(tx.amount || 0))
        }
        const expRows = expenseCategories.map((category) => {
          const existed = budgetMap.get(category.id)
          const planned = existed?.planned_amount ?? ''
          return {
            categoryId: category.id,
            categoryName: category.name,
            budgetId: existed?.id,
            plannedAmount: planned,
            originalPlannedAmount: planned,
            actualAmount: actualMap.get(category.id) ?? 0,
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
            actualAmount: actualMap.get(category.id) ?? 0,
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

  const plannedExpense = expenseRows.reduce((sum, row) => sum + Number(row.plannedAmount || 0), 0)
  const plannedIncome = incomeRows.reduce((sum, row) => sum + Number(row.plannedAmount || 0), 0)
  const actualExpense = expenseRows.reduce((sum, row) => sum + row.actualAmount, 0)
  const actualIncome = incomeRows.reduce((sum, row) => sum + row.actualAmount, 0)
  const plannedBalance = plannedIncome - plannedExpense
  const actualBalance = actualIncome - actualExpense

  return (
    <div className={styles.grid}>
      <div className={styles.top}>
        <OverviewCards plannedBalance={plannedBalance} actualBalance={actualBalance} />
      </div>

      <div className={styles.progressRow}>
        <BudgetProgress title="Tien do chi phi" planned={plannedExpense} actual={actualExpense} />
        <BudgetProgress title="Tien do thu nhap" planned={plannedIncome} actual={actualIncome} />
      </div>

      <div className={styles.columnsRow}>
        <BudgetColumn
          title="Chi phi"
          rows={expenseRows}
          loading={loading}
          editing={editingExpense}
          saving={savingExpense}
          onStartEdit={() => setEditingExpense(true)}
          onSave={async () => {
            setSavingExpense(true)
            await saveColumn('EXPENSE')
            setSavingExpense(false)
          }}
          onCancel={() => {
            setExpenseRows((prev) => prev.map((r) => ({ ...r, plannedAmount: r.originalPlannedAmount })))
            setEditingExpense(false)
          }}
          onChange={onChangeExpense}
        />

        <BudgetColumn
          title="Thu nhap"
          rows={incomeRows}
          loading={loading}
          editing={editingIncome}
          saving={savingIncome}
          onStartEdit={() => setEditingIncome(true)}
          onSave={async () => {
            setSavingIncome(true)
            await saveColumn('INCOME')
            setSavingIncome(false)
          }}
          onCancel={() => {
            setIncomeRows((prev) => prev.map((r) => ({ ...r, plannedAmount: r.originalPlannedAmount })))
            setEditingIncome(false)
          }}
          onChange={onChangeIncome}
        />
      </div>
    </div>
  )
}


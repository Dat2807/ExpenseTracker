import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { MainLayout } from '../components/layout/MainLayout/MainLayout'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage.tsx'
import { BudgetsPage } from '../pages/budgets/BudgetsPage'
import { CategoriesPage } from '../pages/categories/CategoriesPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { QuickNotesPage } from '../pages/quick-notes/QuickNotesPage'
import { TransactionsPage } from '../pages/transactions/TransactionsPage'

function Protected() {
  // MVP: chưa có auth, cho đi thẳng. Bước sau sẽ thay bằng check token.
  return <Outlet />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<Protected />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/quick-notes" element={<QuickNotesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}


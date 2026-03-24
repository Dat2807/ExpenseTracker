import { Navigate, Outlet, Route, Routes } from 'react-router-dom'

import { MainLayout } from '../components/layout/MainLayout/MainLayout'
import { getToken } from '../state/auth'
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage.tsx'
import { CategoriesPage } from '../pages/categories/CategoriesPage'
import { DashboardPage } from '../pages/dashboard/DashboardPage'
import { HomePage } from '../pages/home/HomePage'
import { QuickNotesPage } from '../pages/quick-notes/QuickNotesPage'
import { ReportDetailPage } from '../pages/reports/ReportDetailPage'
import { ReportsPage } from '../pages/reports/ReportsPage'

function Protected() {
  if (!getToken()) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}

function PublicOnly() {
  if (getToken()) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route element={<PublicOnly />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<Protected />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/:reportId" element={<ReportDetailPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/quick-notes" element={<QuickNotesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}


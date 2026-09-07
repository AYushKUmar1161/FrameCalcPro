import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout, ProjectLayout } from './layouts/AppLayout'
import { PublicLayout, LandingPageContent } from './layouts/PublicLayout'
import { DashboardPage } from './pages/DashboardPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { NewProjectPage } from './pages/NewProjectPage'
import { ProjectOverviewPage } from './pages/ProjectOverviewPage'
import { WallsPage } from './pages/WallsPage'
import { OpeningsPage } from './pages/OpeningsPage'
import { MaterialsPage } from './pages/MaterialsPage'
import { EstimatePage } from './pages/EstimatePage'
import { ExportPage } from './pages/ExportPage'
import { SettingsPage } from './pages/SettingsPage'
import { CalculatorPage } from './pages/CalculatorPage'
import { ToastContainer } from './components/ui/Toast'

export function AppRouter() {
  return (
    <>
      <Routes>
        {/* Public landing page */}
        <Route element={<PublicLayout />}>
          <Route index element={<LandingPageContent />} />
        </Route>

        {/* App shell with sidebar */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/calculator" element={<CalculatorPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/new" element={<NewProjectPage />} />

          {/* Project sub-routes */}
          <Route path="/projects/:id" element={<ProjectLayout />}>
            <Route index element={<ProjectOverviewPage />} />
            <Route path="walls" element={<WallsPage />} />
            <Route path="openings" element={<OpeningsPage />} />
            <Route path="materials" element={<MaterialsPage />} />
            <Route path="estimate" element={<EstimatePage />} />
            <Route path="export" element={<ExportPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="wizard" element={<CalculatorPage />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </>
  )
}

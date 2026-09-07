import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Calculator,
  ChevronRight,
  ClipboardList,
  Cloud,
  Download,
  FolderKanban,
  HelpCircle,
  Home,
  LayoutDashboard,
  Layers,
  Menu,
  MoreVertical,
  Package,
  Plus,
  Printer,
  Ruler,
  Save,
  Settings,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react'
import { cn } from '../lib/cn'
import { useIsMobile } from '../hooks/useMediaQuery'
import { useProjectContext } from '../context/ProjectContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../components/ui/Button'
import { Tooltip } from '../components/ui/Tooltip'
import { Dropdown } from '../components/ui/Dropdown'

const primaryNavItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/calculator', label: 'Step-by-Step Calculator', icon: Calculator },
  { to: '/projects', label: 'Project Library', icon: FolderKanban },
]

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()
  const location = useLocation()
  const navigate = useNavigate()
  const { activeProject: ctxActiveProject, projects, saveProject } = useProjectContext()
  const { user, setAuthModalOpen } = useAuth()
  const { showToast } = useToast()

  // Generate breadcrumb items
  const pathParts = location.pathname.split('/').filter(Boolean)
  const isProjectSubRoute = pathParts[0] === 'projects' && pathParts.length >= 2
  const projectId = isProjectSubRoute ? pathParts[1] : null
  const activeProject = projectId ? projects.find((p) => p.id === projectId) ?? ctxActiveProject : ctxActiveProject
  const subSection = isProjectSubRoute && pathParts.length >= 3 ? pathParts[2] : null

  const handleSave = () => {
    if (activeProject) {
      saveProject(activeProject)
      showToast(`Project "${activeProject.name}" saved!`, 'success')
    } else {
      showToast('All changes are up to date.', 'info')
    }
  }

  const sidebarContent = (
    <aside
      className={cn(
        'flex h-full flex-col bg-white border-r border-zinc-200/80 z-40',
        isMobile
          ? 'fixed inset-y-0 left-0 w-72 shadow-2xl transition-transform duration-300'
          : 'w-64 shrink-0',
        isMobile && !sidebarOpen && '-translate-x-full',
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-5">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white shadow-xs group-hover:bg-brand-600 transition-colors">
            <Ruler className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight text-zinc-950 flex items-center">
              FrameCalc<span className="text-brand-600">Pro</span>
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-600">
              Construction SaaS
            </span>
          </div>
        </Link>
        {isMobile && (
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-zinc-400 hover:text-zinc-600 p-1 cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
            Main Menu
          </p>
          {primaryNavItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150',
                  isActive
                    ? 'bg-brand-50/80 text-brand-950 border-l-3 border-brand-500 shadow-2xs font-bold'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950',
                )
              }
            >
              <Icon className="h-4 w-4 shrink-0 text-current" />
              <span>{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Active Project Quick Links (if browsing a project) */}
        {activeProject && (
          <div className="space-y-1 pt-2 border-t border-zinc-100">
            <div className="px-3 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                Active Project
              </p>
              <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[9px] font-semibold text-brand-700">
                {activeProject.walls.length} walls
              </span>
            </div>

            <div className="px-3 py-1">
              <p className="text-xs font-bold text-zinc-900 truncate">
                {activeProject.name}
              </p>
              <p className="text-[10px] text-zinc-600 capitalize">
                {activeProject.projectType} · {activeProject.settings.studSpacing}" O.C.
              </p>
            </div>

            <div className="space-y-0.5 pt-1">
              {[
                { to: `/projects/${activeProject.id}`, label: 'Overview', icon: LayoutDashboard, end: true },
                { to: `/projects/${activeProject.id}/walls`, label: 'Walls Schedule', icon: ClipboardList },
                { to: `/projects/${activeProject.id}/openings`, label: 'Doors & Windows', icon: Package },
                { to: `/projects/${activeProject.id}/materials`, label: 'Material Prices', icon: Settings },
                { to: `/projects/${activeProject.id}/estimate`, label: 'Material Takeoff', icon: Calculator },
                { to: `/projects/${activeProject.id}/wizard`, label: 'Guided Wizard', icon: Sparkles },
                { to: `/projects/${activeProject.id}/settings`, label: 'Framing Specs', icon: Layers },
              ].map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                      isActive
                        ? 'bg-brand-50/90 text-brand-900 font-semibold'
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900',
                    )
                  }
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom status & disclaimer trigger */}
      <div className="border-t border-zinc-100 p-4 space-y-3 bg-stone-50/40">
        <button
          onClick={() => setAuthModalOpen(true)}
          className="w-full flex items-center justify-between rounded-xl border border-zinc-200/80 bg-white p-2.5 text-left hover:border-brand-400 hover:shadow-2xs transition-all cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`flex h-7 w-7 items-center justify-center rounded-lg shrink-0 ${user ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>
              <Cloud className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-zinc-900 truncate">
                {user ? user.email : 'Cloud Sync & Auth'}
              </p>
              <p className="text-[10px] text-zinc-500">
                {user ? 'Supabase Connected' : 'Sign in / Sync'}
              </p>
            </div>
          </div>
          <span className={`h-2 w-2 rounded-full shrink-0 ${user ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`} />
        </button>

        <div className="flex items-center justify-between text-xs text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-medium text-zinc-600">Live Auto-Save</span>
          </div>
          <Tooltip content="All project data and custom line overrides are stored directly in your browser localStorage and synced to Supabase when logged in.">
            <HelpCircle className="h-3.5 w-3.5 text-zinc-400 hover:text-zinc-600 cursor-pointer" />
          </Tooltip>
        </div>

        <div className="rounded-xl border border-zinc-200/70 bg-white p-2.5 flex items-start gap-2">
          <ShieldAlert className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
          <p className="text-[10px] text-zinc-500 leading-tight">
            Estimation only. Not a structural engineering tool.
          </p>
        </div>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAF9F6]">
      {/* Desktop Sidebar */}
      {!isMobile && sidebarContent}

      {/* Mobile Drawer Overlay */}
      {isMobile && sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          {sidebarContent}
        </>
      )}

      {/* Right Column: Top Bar + Content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <header className="no-print flex h-16 shrink-0 items-center justify-between border-b border-zinc-200/80 bg-white/95 px-4 sm:px-6 shadow-2xs z-20">
          <div className="flex items-center gap-3 min-w-0">
            {isMobile && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                aria-label="Open sidebar menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            {/* Breadcrumb path */}
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 overflow-hidden">
              <Link to="/dashboard" className="hover:text-zinc-900 transition-colors shrink-0">
                <Home className="h-3.5 w-3.5" />
              </Link>
              <ChevronRight className="h-3 w-3 text-zinc-300 shrink-0" />

              {activeProject ? (
                <>
                  <Link to="/projects" className="hover:text-zinc-900 transition-colors shrink-0 hidden sm:inline">
                    Projects
                  </Link>
                  <ChevronRight className="h-3 w-3 text-zinc-300 shrink-0 hidden sm:inline" />
                  <Link
                    to={`/projects/${activeProject.id}`}
                    className="font-semibold text-zinc-900 truncate hover:text-brand-600 transition-colors max-w-[140px] sm:max-w-[200px]"
                    title={activeProject.name}
                  >
                    {activeProject.name}
                  </Link>
                  {subSection && (
                    <>
                      <ChevronRight className="h-3 w-3 text-zinc-300 shrink-0" />
                      <span className="text-zinc-500 capitalize">{subSection}</span>
                    </>
                  )}
                </>
              ) : (
                <span className="font-semibold text-zinc-900 capitalize truncate">
                  {pathParts.length > 0 ? pathParts.join(' / ') : 'Dashboard'}
                </span>
              )}
            </div>

            {/* Autosave status badge */}
            <div className="hidden lg:flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-200/60 ml-2 shrink-0">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Saved just now</span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {activeProject && (
              <>
                <Tooltip content="Save current project">
                  <button
                    onClick={handleSave}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer"
                    aria-label="Save project"
                  >
                    <Save className="h-4 w-4" />
                  </button>
                </Tooltip>

                <Tooltip content="Export PDF or CSV">
                  <Link
                    to={`/projects/${activeProject.id}/export`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer"
                    aria-label="Export options"
                  >
                    <Download className="h-4 w-4" />
                  </Link>
                </Tooltip>

                <Dropdown
                  trigger={
                    <button
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer"
                      aria-label="More project actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  }
                  items={[
                    {
                      label: 'Step-by-Step Wizard',
                      icon: <Sparkles className="h-3.5 w-3.5" />,
                      onClick: () => navigate(`/projects/${activeProject.id}/wizard`),
                    },
                    {
                      label: 'Print Estimate',
                      icon: <Printer className="h-3.5 w-3.5" />,
                      onClick: () => window.print(),
                    },
                    {
                      label: 'Framing Settings',
                      icon: <Settings className="h-3.5 w-3.5" />,
                      onClick: () => navigate(`/projects/${activeProject.id}/settings`),
                    },
                  ]}
                />
              </>
            )}

            <Tooltip content={user ? `Signed in as ${user.email}` : 'Sign in / Cloud Sync'}>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-zinc-200 bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950 transition-colors cursor-pointer"
                aria-label="Account and cloud sync"
              >
                <Cloud className={`h-3.5 w-3.5 ${user ? 'text-emerald-600' : 'text-zinc-400'}`} />
                <span className="hidden md:inline max-w-[110px] truncate">
                  {user ? user.email?.split('@')[0] : 'Cloud Sync'}
                </span>
              </button>
            </Tooltip>

            <Link to="/projects/new">
              <Button variant="gradient" size="sm" className="shadow-xs ml-1">
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Project</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export function ProjectLayout() {
  const match = useLocation().pathname.match(/\/projects\/([^/]+)/)
  const id = match?.[1] ?? ''

  const projectTabs = [
    { to: `/projects/${id}`, label: 'Overview', icon: LayoutDashboard, end: true },
    { to: `/projects/${id}/walls`, label: 'Walls', icon: ClipboardList },
    { to: `/projects/${id}/openings`, label: 'Openings', icon: Package },
    { to: `/projects/${id}/materials`, label: 'Prices', icon: Settings },
    { to: `/projects/${id}/estimate`, label: 'Takeoff & Estimate', icon: Calculator },
    { to: `/projects/${id}/wizard`, label: 'Step-by-Step Wizard', icon: Sparkles },
    { to: `/projects/${id}/export`, label: 'Export', icon: FolderKanban },
    { to: `/projects/${id}/settings`, label: 'Settings', icon: Layers },
  ]

  return (
    <div>
      {/* Tab Navigation Sub-bar */}
      <div className="no-print sticky top-0 z-20 border-b border-zinc-200/80 bg-white shadow-2xs">
        <div className="mx-auto max-w-7xl overflow-x-auto scrollbar-none">
          <nav className="flex px-4 sm:px-6 space-x-2" aria-label="Project tabs">
            {projectTabs.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-2 border-b-2 py-3 px-3 text-xs font-medium transition-all duration-150 cursor-pointer',
                    isActive
                      ? 'border-brand-500 text-brand-700 font-bold'
                      : 'border-transparent text-zinc-500 hover:text-zinc-900 hover:border-zinc-300',
                  )
                }
              >
                <Icon className="h-3.5 w-3.5 text-current" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Routed Project Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <Outlet />
      </div>
    </div>
  )
}

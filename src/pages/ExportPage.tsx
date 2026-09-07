import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Download, FileText, Printer, Share2, Upload } from 'lucide-react'
import { useProjectContext } from '../context/ProjectContext'
import { useToast } from '../context/ToastContext'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { exportToCsv, exportToPdf, printEstimate } from '../services/exportService'

export function ExportPage() {
  const { id } = useParams<{ id: string }>()
  const { loadProject, activeProject, estimate } = useProjectContext()
  const { showToast } = useToast()

  useEffect(() => {
    if (id && (!activeProject || activeProject.id !== id)) {
      loadProject(id)
    }
  }, [id, activeProject, loadProject])

  if (!activeProject || !estimate) {
    return <div className="flex items-center justify-center py-20"><p className="text-zinc-500">Loading…</p></div>
  }

  const handleExportPdf = () => {
    try {
      exportToPdf(activeProject, estimate)
      showToast('PDF downloaded.', 'success')
    } catch {
      showToast('PDF export failed.', 'error')
    }
  }

  const handleExportCsv = () => {
    try {
      exportToCsv(activeProject, estimate)
      showToast('CSV downloaded.', 'success')
    } catch {
      showToast('CSV export failed.', 'error')
    }
  }

  // Export project as JSON backup
  const handleExportJson = () => {
    const json = JSON.stringify(activeProject, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeProject.name.replace(/\s+/g, '_')}_project.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Project backup downloaded.', 'success')
  }

  // Share via URL (encodes project in URL hash as base64)
  const handleShareLink = () => {
    const encoded = btoa(encodeURIComponent(JSON.stringify(activeProject)))
    const url = `${window.location.origin}/?share=${encoded}`
    navigator.clipboard.writeText(url).then(() => {
      showToast('Shareable link copied to clipboard!', 'success')
    }).catch(() => {
      showToast('Could not copy link. Please copy the URL manually.', 'info')
    })
  }

  const exportOptions = [
    {
      id: 'pdf',
      icon: FileText,
      title: 'PDF Estimate',
      description: 'Professional estimate report with material list, assumptions, and disclaimer. Print or share with clients.',
      action: handleExportPdf,
      label: 'Download PDF',
      color: 'text-red-600 bg-red-50',
    },
    {
      id: 'csv',
      icon: Download,
      title: 'CSV Spreadsheet',
      description: 'Machine-readable material takeoff. Import into Excel, Google Sheets, or your estimating software.',
      action: handleExportCsv,
      label: 'Download CSV',
      color: 'text-green-600 bg-green-50',
    },
    {
      id: 'print',
      icon: Printer,
      title: 'Print Estimate',
      description: 'Send directly to your printer. Uses browser print dialog for maximum compatibility.',
      action: () => printEstimate(),
      label: 'Print',
      color: 'text-zinc-600 bg-zinc-100',
    },
    {
      id: 'json',
      icon: Upload,
      title: 'Project Backup (JSON)',
      description: 'Download a full project backup. Use to restore on another device or browser.',
      action: handleExportJson,
      label: 'Download Backup',
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'share',
      icon: Share2,
      title: 'Share Link',
      description: 'Copy a shareable URL to send this estimate to a client, supplier, or colleague.',
      action: handleShareLink,
      label: 'Copy Link',
      color: 'text-purple-600 bg-purple-50',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Export & Share</h1>
        <p className="text-sm text-zinc-500 mt-1">Export your estimate in multiple formats or share with clients.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {exportOptions.map(({ id: optId, icon: Icon, title, description, action, label, color }) => (
          <Card key={optId}>
            <div className="flex items-start gap-4">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
                <p className="mt-1 text-sm text-zinc-500">{description}</p>
                <Button
                  size="sm"
                  variant="secondary"
                  className="mt-3"
                  onClick={action}
                >
                  {label}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600">
        <p className="font-medium text-zinc-800 mb-1">Project: {activeProject.name}</p>
        <p>Type: <span className="capitalize">{activeProject.projectType}</span> · {activeProject.walls.length} walls · {activeProject.openings.length} openings</p>
        <p>Last updated: {new Date(activeProject.updatedAt).toLocaleString()}</p>
      </div>
    </div>
  )
}

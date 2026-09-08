import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { FramingEstimate } from '../types/estimate'
import type { Project } from '../types/project'
import { DISCLAIMER } from '../data/constants'
import { formatCurrency, formatNumber } from '../utils/calculations'
import { formatArea, formatLength, getAreaUnitLabel, getLengthUnitLabel } from '../utils/units'

export function exportToCsv(project: Project, estimate: FramingEstimate): void {
  const headers = [
    'Category',
    'Material',
    'Size',
    'Required Qty',
    'Order Qty (w/ Waste)',
    'Linear Feet',
    'Unit Cost ($)',
    'Total Cost ($)',
  ]

  const rows = estimate.materialLines.map((line) => [
    line.category,
    line.material,
    line.size,
    String(line.quantity),
    String(line.quantityWithWaste),
    line.linearFeet > 0 ? formatNumber(line.linearFeet, 2) : '',
    formatNumber(line.unitCost, 2),
    formatNumber(line.totalCost, 2),
  ])

  rows.push(['', '', '', '', '', '', 'Subtotal', formatNumber(estimate.subtotal, 2)])
  rows.push(['', '', '', '', '', '', 'Misc Hardware', formatNumber(estimate.miscHardware, 2)])
  rows.push(['', '', '', '', '', '', 'Estimated Total', formatNumber(estimate.estimatedTotal, 2)])

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
    )
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${project.name.replace(/\s+/g, '_')}_takeoff.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function exportToPdf(project: Project, estimate: FramingEstimate): void {
  const doc = new jsPDF()
  const system = project.measurementSystem
  let y = 18

  // Header branding - Watermelon Marigold identity
  doc.setFontSize(22)
  doc.setTextColor(255, 95, 109) // Watermelon #FF5F6D
  doc.text('FrameCalcPro', 14, y)

  doc.setFontSize(9)
  doc.setTextColor(161, 98, 7) // Marigold #B45309
  doc.text('Fast, Accurate Framing Material Takeoffs & Cost Estimates', 66, y)

  y += 8
  doc.setFontSize(14)
  doc.setTextColor(24, 24, 27)
  doc.text(project.name, 14, y)

  y += 6
  doc.setFontSize(8.5)
  doc.setTextColor(113, 113, 122)
  doc.text(
    `Project Type: ${project.projectType.toUpperCase()} | System: ${project.measurementSystem} | Waste: ${project.settings.wastePercent}% | Date: ${new Date().toLocaleDateString()}`,
    14,
    y,
  )

  // 8 Core Results Metrics Summary Box
  y += 8
  doc.setFillColor(255, 247, 240) // warm tint
  doc.setDrawColor(254, 215, 170) // marigold border
  doc.roundedRect(14, y, 182, 34, 2, 2, 'FD')

  doc.setFontSize(10)
  doc.setTextColor(225, 29, 72) // Watermelon brand accent
  doc.text('Key Estimation Metrics (Results Dashboard)', 18, y + 6)

  doc.setFontSize(8)
  doc.setTextColor(39, 39, 42)

  const col1X = 18
  const col2X = 75
  const col3X = 135

  const totalHeadersCount = estimate.headerBreakdowns.reduce((sum, h) => sum + h.quantity, 0)
  const totalHeadersLF = estimate.headerBreakdowns.reduce((sum, h) => sum + h.linearFeet, 0)

  doc.text(`• Total Material Cost: ${formatCurrency(estimate.estimatedTotal)}`, col1X, y + 14)
  doc.text(`• Total Studs: ${estimate.studBreakdown.totalWithWaste} (${estimate.studBreakdown.totalRequired} base)`, col1X, y + 20)
  doc.text(`• Total Plates: ${estimate.plateBreakdown.totalWithWaste} boards (${formatNumber(estimate.plateBreakdown.totalLinearFeet, 1)} LF)`, col1X, y + 26)

  doc.text(`• Total Headers: ${totalHeadersCount} (${formatNumber(totalHeadersLF, 1)} LF)`, col2X, y + 14)
  doc.text(`• Sheathing (4×8): ${estimate.sheathing ? `${estimate.sheathing.sheetsWithWaste} sheets (${estimate.sheathing.sheathingType})` : 'None'}`, col2X, y + 20)
  doc.text(`• Fire / Mid Blocking: ${estimate.blocking.boardsRequired} boards (${formatNumber(estimate.blocking.linearFeet, 1)} LF)`, col2X, y + 26)

  doc.text(`• Total Wall Length: ${formatLength(estimate.geometry.totalWallLength, system)}`, col3X, y + 14)
  doc.text(`• Total Wall Area: ${formatArea(estimate.geometry.totalWallArea, system)}`, col3X, y + 20)
  doc.text(`• Walls: ${estimate.geometry.wallCount} | Openings: ${estimate.geometry.openingCount}`, col3X, y + 26)

  y += 40

  // Material Takeoff Table
  autoTable(doc, {
    startY: y,
    head: [['Category', 'Material', 'Size', 'Req Qty', 'Order Qty', 'LF', 'Unit Cost', 'Total']],
    body: estimate.materialLines.map((line) => [
      line.category,
      line.material,
      line.size,
      String(line.quantity),
      String(line.quantityWithWaste),
      line.linearFeet > 0 ? formatNumber(line.linearFeet, 1) : '-',
      formatCurrency(line.unitCost),
      formatCurrency(line.totalCost),
    ]),
    foot: [
      ['', '', '', '', '', '', 'Subtotal', formatCurrency(estimate.subtotal)],
      ['', '', '', '', '', '', 'Misc Hardware', formatCurrency(estimate.miscHardware)],
      ['', '', '', '', '', '', 'Estimated Total', formatCurrency(estimate.estimatedTotal)],
    ],
    styles: { fontSize: 7.5, cellPadding: 2 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    footStyles: { fillColor: [255, 247, 240], textColor: [24, 24, 27], fontStyle: 'bold' },
  })

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable
    ?.finalY ?? y + 40

  // Calculation Assumptions Section
  let ay = finalY + 8
  if (ay > 240) {
    doc.addPage()
    ay = 18
  }

  doc.setFontSize(10)
  doc.setTextColor(24, 24, 27)
  doc.text('Calculation Assumptions', 14, ay)
  ay += 5

  doc.setFontSize(7)
  doc.setTextColor(82, 82, 91)
  const assumptions = Object.entries(estimate.assumptions)
  for (const [, value] of assumptions) {
    if (ay > 275) {
      doc.addPage()
      ay = 18
    }
    doc.text(`• ${value}`, 14, ay)
    ay += 4
  }

  // Disclaimer
  ay += 4
  if (ay > 265) {
    doc.addPage()
    ay = 18
  }
  doc.setFontSize(6.5)
  doc.setTextColor(161, 161, 170)
  const disclaimerLines = doc.splitTextToSize(DISCLAIMER, 180)
  doc.text(disclaimerLines, 14, ay)

  doc.save(`${project.name.replace(/\s+/g, '_')}_estimate.pdf`)
}

export function printEstimate(): void {
  window.print()
}

export function getPrintSummaryHtml(
  project: Project,
  estimate: FramingEstimate,
): string {
  const system = project.measurementSystem
  const lengthUnit = getLengthUnitLabel(system)
  const areaUnit = getAreaUnitLabel(system)

  return `
    <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 900px; margin: 0 auto; padding: 24px; color: #18181b;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #fed7aa; padding-bottom: 12px; margin-bottom: 20px;">
        <div>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
            <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
              <defs>
                <linearGradient id="printBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#FF9D3B" />
                  <stop offset="55%" stop-color="#FF5F6D" />
                  <stop offset="100%" stop-color="#FF3823" />
                </linearGradient>
              </defs>
              <g fill="#18181B">
                <path d="M 48.5 13 L 13 36.5 L 13 87 L 20 87 L 20 40.5 L 48.5 21.8 Z" />
                <rect x="25.5" y="32.5" width="7" height="54.5" />
                <rect x="38" y="24" width="7" height="63" />
              </g>
              <g fill="url(#printBrandGrad)">
                <path d="M 51.5 13 L 87 36.5 L 87 87 L 80 87 L 80 40.5 L 51.5 21.8 Z" />
                <rect x="55" y="24" width="7" height="63" />
                <rect x="67.5" y="32.5" width="7" height="54.5" />
                <rect x="55" y="80" width="19.5" height="7" />
              </g>
            </svg>
            <div>
              <h1 style="color: #18181B; margin: 0; font-size: 22px; font-weight: 900; letter-spacing: -0.02em;">FrameCalc<span style="color: #FF5F6D;">Pro</span></h1>
              <p style="color: #71717a; margin: 1px 0 0; font-size: 8.5px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase;">Framing Material Takeoff</p>
            </div>
          </div>
          <h2 style="margin: 4px 0 0; font-size: 18px; font-weight: 700;">${project.name}</h2>
          <p style="color: #71717a; margin: 4px 0 0; font-size: 13px;">${project.projectType.toUpperCase()} · ${project.measurementSystem} · ${project.settings.wastePercent}% Waste Allowance</p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 12px; color: #71717a;">Estimated Project Total</div>
          <div style="font-size: 24px; font-weight: 800; color: #E11D48;">${formatCurrency(estimate.estimatedTotal)}</div>
        </div>
      </div>

      <!-- 8 Key Metrics Grid -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px;">
        <div style="border: 1px solid #fed7aa; padding: 10px; border-radius: 8px; background: #fff7ed;">
          <div style="font-size: 11px; color: #9a3412; font-weight: 600;">Total Studs</div>
          <div style="font-size: 18px; font-weight: 800; color: #18181b;">${estimate.studBreakdown.totalWithWaste} pcs</div>
          <div style="font-size: 10px; color: #78350f;">${estimate.studBreakdown.totalRequired} base req</div>
        </div>
        <div style="border: 1px solid #fed7aa; padding: 10px; border-radius: 8px; background: #fff7ed;">
          <div style="font-size: 11px; color: #9a3412; font-weight: 600;">Total Plates</div>
          <div style="font-size: 18px; font-weight: 800; color: #18181b;">${estimate.plateBreakdown.totalWithWaste} boards</div>
          <div style="font-size: 10px; color: #78350f;">${formatNumber(estimate.plateBreakdown.totalLinearFeet, 1)} LF</div>
        </div>
        <div style="border: 1px solid #fed7aa; padding: 10px; border-radius: 8px; background: #fff7ed;">
          <div style="font-size: 11px; color: #9a3412; font-weight: 600;">Headers</div>
          <div style="font-size: 18px; font-weight: 800; color: #18181b;">${estimate.headerBreakdowns.reduce((sum, h) => sum + h.quantity, 0)} pcs</div>
          <div style="font-size: 10px; color: #78350f;">${formatNumber(estimate.headerBreakdowns.reduce((sum, h) => sum + h.linearFeet, 0), 1)} LF</div>
        </div>
        <div style="border: 1px solid #fed7aa; padding: 10px; border-radius: 8px; background: #fff7ed;">
          <div style="font-size: 11px; color: #9a3412; font-weight: 600;">Sheathing (4×8)</div>
          <div style="font-size: 18px; font-weight: 800; color: #18181b;">${estimate.sheathing ? `${estimate.sheathing.sheetsWithWaste} sheets` : 'None'}</div>
          <div style="font-size: 10px; color: #78350f;">${estimate.sheathing?.sheathingType || ''}</div>
        </div>
        <div style="border: 1px solid #e4e4e7; padding: 10px; border-radius: 8px; background: #fafafa;">
          <div style="font-size: 11px; color: #71717a;">Fire / Mid Blocking</div>
          <div style="font-size: 18px; font-weight: 700;">${estimate.blocking.boardsRequired} boards</div>
          <div style="font-size: 10px; color: #a1a1aa;">${formatNumber(estimate.blocking.linearFeet, 1)} LF</div>
        </div>
        <div style="border: 1px solid #e4e4e7; padding: 10px; border-radius: 8px; background: #fafafa;">
          <div style="font-size: 11px; color: #71717a;">Total Wall Length</div>
          <div style="font-size: 18px; font-weight: 700;">${formatNumber(estimate.geometry.totalWallLength, 1)} ${lengthUnit}</div>
          <div style="font-size: 10px; color: #a1a1aa;">${estimate.geometry.wallCount} walls</div>
        </div>
        <div style="border: 1px solid #e4e4e7; padding: 10px; border-radius: 8px; background: #fafafa;">
          <div style="font-size: 11px; color: #71717a;">Total Wall Area</div>
          <div style="font-size: 18px; font-weight: 700;">${formatNumber(estimate.geometry.totalWallArea, 1)} ${areaUnit}</div>
          <div style="font-size: 10px; color: #a1a1aa;">gross wall area</div>
        </div>
        <div style="border: 1px solid #fed7aa; padding: 10px; border-radius: 8px; background: #fff7ed;">
          <div style="font-size: 11px; color: #9a3412; font-weight: 600;">Material Subtotal</div>
          <div style="font-size: 18px; font-weight: 800; color: #18181b;">${formatCurrency(estimate.subtotal)}</div>
          <div style="font-size: 10px; color: #78350f;">+ ${formatCurrency(estimate.miscHardware)} misc</div>
        </div>
      </div>

      <!-- Takeoff Table -->
      <table style="width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 24px;">
        <thead>
          <tr style="background: #1e293b; color: #ffffff;">
            <th style="text-align: left; padding: 9px 8px; border: 1px solid #334155;">Category</th>
            <th style="text-align: left; padding: 9px 8px; border: 1px solid #334155;">Material Item</th>
            <th style="text-align: left; padding: 9px 8px; border: 1px solid #334155;">Size</th>
            <th style="text-align: right; padding: 9px 8px; border: 1px solid #334155;">Req Qty</th>
            <th style="text-align: right; padding: 9px 8px; border: 1px solid #334155;">Qty (w/ Waste)</th>
            <th style="text-align: right; padding: 9px 8px; border: 1px solid #334155;">Linear Ft</th>
            <th style="text-align: right; padding: 9px 8px; border: 1px solid #334155;">Unit Cost</th>
            <th style="text-align: right; padding: 9px 8px; border: 1px solid #334155;">Total Cost</th>
          </tr>
        </thead>
        <tbody>
          ${estimate.materialLines
            .map(
              (line) => `
            <tr>
              <td style="padding: 7px 8px; border: 1px solid #e4e4e7;">${line.category}</td>
              <td style="padding: 7px 8px; border: 1px solid #e4e4e7; font-weight: 500;">${line.material}</td>
              <td style="padding: 7px 8px; border: 1px solid #e4e4e7; font-family: monospace;">${line.size}</td>
              <td style="padding: 7px 8px; border: 1px solid #e4e4e7; text-align: right;">${line.quantity}</td>
              <td style="padding: 7px 8px; border: 1px solid #e4e4e7; text-align: right; font-weight: bold; color: #e11d48;">${line.quantityWithWaste}</td>
              <td style="padding: 7px 8px; border: 1px solid #e4e4e7; text-align: right;">${line.linearFeet > 0 ? formatNumber(line.linearFeet, 1) : '—'}</td>
              <td style="padding: 7px 8px; border: 1px solid #e4e4e7; text-align: right;">${formatCurrency(line.unitCost)}</td>
              <td style="padding: 7px 8px; border: 1px solid #e4e4e7; text-align: right; font-weight: bold; background: #fff7ed;">${formatCurrency(line.totalCost)}</td>
            </tr>`,
            )
            .join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="7" style="padding: 8px; text-align: right; border: 1px solid #e4e4e7; font-weight: 600;">Subtotal</td>
            <td style="padding: 8px; text-align: right; border: 1px solid #e4e4e7; font-weight: bold;">${formatCurrency(estimate.subtotal)}</td>
          </tr>
          <tr>
            <td colspan="7" style="padding: 8px; text-align: right; border: 1px solid #e4e4e7; font-weight: 600;">Misc Hardware / Fasteners Allowance</td>
            <td style="padding: 8px; text-align: right; border: 1px solid #e4e4e7; font-weight: bold;">${formatCurrency(estimate.miscHardware)}</td>
          </tr>
          <tr style="background: #fff1f2; border-top: 2px solid #ff5f6d;">
            <td colspan="7" style="padding: 10px 8px; text-align: right; border: 1px solid #fecdd3; font-size: 14px; font-weight: 800; color: #9f1239;">Estimated Total Cost</td>
            <td style="padding: 10px 8px; text-align: right; border: 1px solid #fecdd3; font-size: 15px; font-weight: 800; color: #9f1239;">${formatCurrency(estimate.estimatedTotal)}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Assumptions -->
      <div style="border-top: 1px solid #e4e4e7; padding-top: 12px; margin-top: 16px;">
        <h3 style="font-size: 13px; margin: 0 0 8px;">Calculation Assumptions</h3>
        <ul style="font-size: 11px; color: #52525b; margin: 0; padding-left: 20px;">
          ${Object.entries(estimate.assumptions)
            .map(([, val]) => `<li>${val}</li>`)
            .join('')}
        </ul>
      </div>

      <p style="font-size: 10px; color: #a1a1aa; margin-top: 20px;">${DISCLAIMER}</p>
    </div>
  `
}

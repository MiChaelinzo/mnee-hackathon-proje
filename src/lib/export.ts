interface TrendData {
  bundleId: string
  count: number
  avgConfidence: number
  avgPosition: number
  lastRecommended: number
  trendDirection: 'up' | 'down' | 'stable'
}

interface BundleInfo {
  name: string
  type: 'bundle' | 'subscription'
  category: string
  discount: number
}

interface ExportData {
  bundleName: string
  type: string
  category: string
  discount: string
  recommendations: number
  avgConfidence: string
  avgPosition: string
  trend: string
  lastSeen: string
}

export function generateCSV(
  data: TrendData[],
  getBundleName: (bundleId: string) => BundleInfo,
  timeRange: string
): string {
  const headers = [
    'Bundle Name',
    'Type',
    'Category',
    'Discount',
    'Recommendations',
    'Avg Confidence',
    'Avg Position',
    'Trend',
    'Last Recommended',
  ]

  const rows = data.map((trend) => {
    const bundleInfo = getBundleName(trend.bundleId)
    const lastSeen = formatTimestamp(trend.lastRecommended)
    
    return [
      escapeCSV(bundleInfo.name),
      bundleInfo.type,
      bundleInfo.category,
      `${bundleInfo.discount}%`,
      trend.count.toString(),
      `${Math.round(trend.avgConfidence)}%`,
      `#${Math.round(trend.avgPosition)}`,
      trend.trendDirection,
      lastSeen,
    ]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  return csvContent
}

function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  
  URL.revokeObjectURL(url)
}

export function generatePDF(
  data: TrendData[],
  getBundleName: (bundleId: string) => BundleInfo,
  timeRange: string,
  totalRecommendations: number
): string {
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const timeRangeLabel = {
    '24h': 'Last 24 Hours',
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    'all': 'All Time',
  }[timeRange] || timeRange

  let html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>AI Recommendation Trends Report</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      padding: 40px;
      color: #1a1a1a;
      background: #ffffff;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      border-bottom: 3px solid #6366f1;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 32px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
    }
    
    .header .subtitle {
      font-size: 16px;
      color: #666;
      margin-bottom: 12px;
    }
    
    .header .metadata {
      display: flex;
      gap: 24px;
      font-size: 14px;
      color: #888;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    
    .stat-card {
      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
      padding: 20px;
      border-radius: 12px;
      color: white;
    }
    
    .stat-card.secondary {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    }
    
    .stat-card.tertiary {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    }
    
    .stat-card .label {
      font-size: 13px;
      opacity: 0.9;
      margin-bottom: 8px;
    }
    
    .stat-card .value {
      font-size: 32px;
      font-weight: 700;
    }
    
    .section {
      margin-bottom: 40px;
    }
    
    .section h2 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 20px;
      color: #1a1a1a;
    }
    
    .table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .table thead {
      background: #f9fafb;
    }
    
    .table th {
      text-align: left;
      padding: 12px 16px;
      font-size: 13px;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .table td {
      padding: 12px 16px;
      font-size: 14px;
      color: #1f2937;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .table tbody tr:last-child td {
      border-bottom: none;
    }
    
    .table tbody tr:hover {
      background: #f9fafb;
    }
    
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .badge.bundle {
      background: #dbeafe;
      color: #1e40af;
    }
    
    .badge.subscription {
      background: #fef3c7;
      color: #92400e;
    }
    
    .badge.up {
      background: #d1fae5;
      color: #065f46;
    }
    
    .badge.down {
      background: #fee2e2;
      color: #991b1b;
    }
    
    .badge.stable {
      background: #e5e7eb;
      color: #374151;
    }
    
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #888;
    }
    
    .rank {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 14px;
    }
    
    .rank.gold {
      background: #fef3c7;
      color: #92400e;
    }
    
    .rank.default {
      background: #f3f4f6;
      color: #6b7280;
    }
    
    @media print {
      body {
        padding: 20px;
      }
      
      .table {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>AI Recommendation Trends Report</h1>
    <div class="subtitle">MNEE AI Agent Marketplace - Recommendation Analytics</div>
    <div class="metadata">
      <span><strong>Generated:</strong> ${dateStr}</span>
      <span><strong>Time Range:</strong> ${timeRangeLabel}</span>
      <span><strong>Total Bundles:</strong> ${data.length}</span>
    </div>
  </div>
  
  <div class="stats-grid">
    <div class="stat-card">
      <div class="label">Total Recommendations</div>
      <div class="value">${totalRecommendations}</div>
    </div>
    <div class="stat-card secondary">
      <div class="label">Unique Bundles</div>
      <div class="value">${data.length}</div>
    </div>
    <div class="stat-card tertiary">
      <div class="label">Avg Confidence</div>
      <div class="value">${data.length > 0 ? Math.round(data.reduce((sum, t) => sum + t.avgConfidence, 0) / data.length) : 0}%</div>
    </div>
  </div>
  
  <div class="section">
    <h2>Top Recommended Bundles</h2>
    <table class="table">
      <thead>
        <tr>
          <th style="width: 60px;">Rank</th>
          <th>Bundle Name</th>
          <th style="width: 120px;">Type</th>
          <th style="width: 120px;">Category</th>
          <th style="width: 100px; text-align: center;">Recommendations</th>
          <th style="width: 100px; text-align: center;">Confidence</th>
          <th style="width: 80px; text-align: center;">Trend</th>
        </tr>
      </thead>
      <tbody>
  `

  data.forEach((trend, index) => {
    const bundleInfo = getBundleName(trend.bundleId)
    const rankClass = index === 0 ? 'gold' : 'default'
    
    html += `
        <tr>
          <td style="text-align: center;">
            <span class="rank ${rankClass}">${index + 1}</span>
          </td>
          <td><strong>${escapeHTML(bundleInfo.name)}</strong></td>
          <td>
            <span class="badge ${bundleInfo.type}">${bundleInfo.type}</span>
          </td>
          <td>${escapeHTML(bundleInfo.category)}</td>
          <td style="text-align: center; font-weight: 600;">${trend.count}</td>
          <td style="text-align: center; font-weight: 600;">${Math.round(trend.avgConfidence)}%</td>
          <td style="text-align: center;">
            <span class="badge ${trend.trendDirection}">${trend.trendDirection}</span>
          </td>
        </tr>
    `
  })

  html += `
      </tbody>
    </table>
  </div>
  
  <div class="section">
    <h2>Detailed Metrics</h2>
    <table class="table">
      <thead>
        <tr>
          <th>Bundle Name</th>
          <th style="width: 100px; text-align: center;">Discount</th>
          <th style="width: 100px; text-align: center;">Avg Position</th>
          <th style="width: 180px;">Last Recommended</th>
        </tr>
      </thead>
      <tbody>
  `

  data.forEach((trend) => {
    const bundleInfo = getBundleName(trend.bundleId)
    const lastSeen = formatTimestamp(trend.lastRecommended)
    
    html += `
        <tr>
          <td><strong>${escapeHTML(bundleInfo.name)}</strong></td>
          <td style="text-align: center;">${bundleInfo.discount}%</td>
          <td style="text-align: center; font-family: monospace;">#${Math.round(trend.avgPosition)}</td>
          <td>${lastSeen}</td>
        </tr>
    `
  })

  html += `
      </tbody>
    </table>
  </div>
  
  <div class="footer">
    <p>This report was automatically generated by the MNEE AI Agent Marketplace</p>
    <p>For more information, visit the marketplace dashboard</p>
  </div>
</body>
</html>
  `

  return html
}

function escapeHTML(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

export function downloadPDF(htmlContent: string, filename: string): void {
  const blob = new Blob([htmlContent], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  
  const printWindow = window.open(url, '_blank')
  
  if (printWindow) {
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        URL.revokeObjectURL(url)
      }, 250)
    }
  }
}

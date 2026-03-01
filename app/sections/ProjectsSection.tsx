'use client'

import React, { useState, useCallback } from 'react'
import { FiArrowLeft, FiLoader, FiDownload, FiCheckCircle, FiAlertCircle, FiCheck, FiCircle, FiMinus } from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { callAIAgent } from '@/lib/aiAgent'

const PROJECT_REPORT_ID = '69a492b2ad5175ca488a2a20'

interface Milestone { name: string; status: 'completed' | 'in-progress' | 'upcoming'; date: string; notes: string }

interface Project {
  id: string; name: string; type: string; location: string; startDate: string; expectedCompletion: string
  progress: number; status: string; budgetAllocated: string; budgetSpent: string
  milestones: Milestone[]; risks: string; report?: any; reportPdf?: string
}

const initialProjects: Project[] = [
  {
    id: '1', name: 'Royal Palm Villa Phase 2', type: 'Villa', location: 'Palm Beach, FL',
    startDate: '2025-09-01', expectedCompletion: '2026-08-15', progress: 68, status: 'On Track',
    budgetAllocated: '$12.4M', budgetSpent: '$8.1M',
    milestones: [
      { name: 'Site Preparation', status: 'completed', date: '2025-09-15', notes: 'Completed on schedule' },
      { name: 'Foundation', status: 'completed', date: '2025-11-20', notes: 'Reinforced concrete base' },
      { name: 'Structural Framing', status: 'completed', date: '2026-01-10', notes: 'Steel and wood hybrid' },
      { name: 'Interior Finishing', status: 'in-progress', date: '2026-04-30', notes: 'Italian marble installation' },
      { name: 'Landscaping', status: 'upcoming', date: '2026-06-15', notes: 'Tropical garden design' },
      { name: 'Final Inspection', status: 'upcoming', date: '2026-08-01', notes: 'City and HOA approval' },
    ],
    risks: 'Material delivery delays for imported marble; weather concerns in hurricane season',
  },
  {
    id: '2', name: 'Pristine Bay Clubhouse', type: 'Building', location: 'Malibu, CA',
    startDate: '2025-11-01', expectedCompletion: '2026-10-30', progress: 42, status: 'On Track',
    budgetAllocated: '$5.8M', budgetSpent: '$2.3M',
    milestones: [
      { name: 'Permits & Design', status: 'completed', date: '2025-11-30', notes: 'All permits secured' },
      { name: 'Foundation Work', status: 'completed', date: '2026-01-15', notes: 'Coastal reinforcement' },
      { name: 'Structural Framing', status: 'in-progress', date: '2026-03-30', notes: 'Ocean-facing glass walls' },
      { name: 'MEP Installation', status: 'upcoming', date: '2026-06-15', notes: 'Smart building systems' },
      { name: 'Interior Finishing', status: 'upcoming', date: '2026-09-01', notes: 'Resort-style finishing' },
    ],
    risks: 'Coastal building regulations may require additional reinforcement',
  },
  {
    id: '3', name: 'Skyline Tower Construction', type: 'Building', location: 'New York, NY',
    startDate: '2026-01-15', expectedCompletion: '2027-06-30', progress: 15, status: 'On Track',
    budgetAllocated: '$28.5M', budgetSpent: '$3.9M',
    milestones: [
      { name: 'Design & Engineering', status: 'completed', date: '2026-01-30', notes: 'Award-winning design' },
      { name: 'Foundation & Underground', status: 'in-progress', date: '2026-04-30', notes: 'Deep pile foundations' },
      { name: 'Core Structure', status: 'upcoming', date: '2026-09-30', notes: '40 floors planned' },
      { name: 'Facade & Glazing', status: 'upcoming', date: '2027-02-28', notes: 'Floor-to-ceiling glass' },
      { name: 'Interior & Fit-out', status: 'upcoming', date: '2027-05-30', notes: 'Luxury penthouse suites' },
    ],
    risks: 'Union labor negotiations ongoing; steel price volatility',
  },
  {
    id: '4', name: 'Heritage Manor Renovation', type: 'Villa', location: 'Charleston, SC',
    startDate: '2025-06-01', expectedCompletion: '2026-03-15', progress: 85, status: 'Delayed',
    budgetAllocated: '$4.2M', budgetSpent: '$3.8M',
    milestones: [
      { name: 'Assessment & Planning', status: 'completed', date: '2025-06-30', notes: 'Historic preservation review' },
      { name: 'Structural Restoration', status: 'completed', date: '2025-09-15', notes: 'Foundation stabilization' },
      { name: 'Systems Upgrade', status: 'completed', date: '2025-12-01', notes: 'Modern HVAC and electrical' },
      { name: 'Interior Restoration', status: 'completed', date: '2026-02-01', notes: 'Period-accurate millwork' },
      { name: 'Final Inspections', status: 'in-progress', date: '2026-03-15', notes: 'Historic board review pending' },
    ],
    risks: 'Historic preservation board review delayed by 3 weeks',
  },
  {
    id: '5', name: 'Coral Bay Development', type: 'Building', location: 'Turks & Caicos',
    startDate: '2025-03-01', expectedCompletion: '2025-12-31', progress: 100, status: 'Completed',
    budgetAllocated: '$3.6M', budgetSpent: '$3.4M',
    milestones: [
      { name: 'Site Work', status: 'completed', date: '2025-04-15', notes: 'Beachfront clearing' },
      { name: 'Construction', status: 'completed', date: '2025-08-30', notes: 'Resort-style build' },
      { name: 'Finishing', status: 'completed', date: '2025-11-15', notes: 'Tropical luxury finish' },
      { name: 'Handover', status: 'completed', date: '2025-12-20', notes: 'Keys delivered to client' },
    ],
    risks: '',
  },
]

interface ProjectsSectionProps {
  showSample: boolean
  setActiveAgent: (id: string | null) => void
}

function projectStatusColor(status: string) {
  switch (status) {
    case 'On Track': return 'bg-green-100 text-green-700 border-green-200'
    case 'Delayed': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'Completed': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    default: return 'bg-muted text-muted-foreground'
  }
}

function healthColor(h: string) {
  switch (h?.toLowerCase?.()) {
    case 'green': return 'bg-green-100 text-green-700 border-green-200'
    case 'yellow': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'red': return 'bg-red-100 text-red-700 border-red-200'
    default: return 'bg-muted text-muted-foreground'
  }
}

function severityColor(s: string) {
  switch (s?.toLowerCase?.()) {
    case 'high': return 'bg-red-100 text-red-700 border-red-200'
    case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'low': return 'bg-green-100 text-green-700 border-green-200'
    default: return 'bg-muted text-muted-foreground'
  }
}

function renderMarkdown(text: string) {
  if (!text) return null
  return (
    <div className="space-y-2">
      {text.split('\n').map((line, i) => {
        if (line.startsWith('### ')) return <h4 key={i} className="font-semibold text-sm mt-3 mb-1">{line.slice(4)}</h4>
        if (line.startsWith('## ')) return <h3 key={i} className="font-semibold text-base mt-3 mb-1">{line.slice(3)}</h3>
        if (line.startsWith('# ')) return <h2 key={i} className="font-bold text-lg mt-4 mb-2">{line.slice(2)}</h2>
        if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 list-disc text-sm">{line.slice(2)}</li>
        if (/^\d+\.\s/.test(line)) return <li key={i} className="ml-4 list-decimal text-sm">{line.replace(/^\d+\.\s/, '')}</li>
        if (!line.trim()) return <div key={i} className="h-1" />
        return <p key={i} className="text-sm">{line}</p>
      })}
    </div>
  )
}

export default function ProjectsSection({ showSample, setActiveAgent }: ProjectsSectionProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [reportLoading, setReportLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const selected = projects.find((p) => p.id === selectedId) ?? null

  const generateReport = useCallback(async (proj: Project) => {
    setReportLoading(true)
    setStatusMsg(null)
    setActiveAgent(PROJECT_REPORT_ID)
    try {
      const milestonesText = proj.milestones.map((m) => `${m.name}: ${m.status} (${m.date}) - ${m.notes}`).join('; ')
      const msg = `Generate a project report for: Project: ${proj.name}, Type: ${proj.type}, Location: ${proj.location}, Progress: ${proj.progress}%, Budget Allocated: ${proj.budgetAllocated}, Budget Spent: ${proj.budgetSpent}, Status: ${proj.status}, Start Date: ${proj.startDate}, Expected Completion: ${proj.expectedCompletion}, Milestones: ${milestonesText}, Risks: ${proj.risks}`
      const result = await callAIAgent(msg, PROJECT_REPORT_ID)
      if (result.success) {
        const data = result?.response?.result
        const files = Array.isArray(result?.module_outputs?.artifact_files) ? result.module_outputs.artifact_files : []
        const pdfUrl = files?.[0]?.file_url ?? ''
        setProjects((prev) => prev.map((p) => p.id === proj.id ? { ...p, report: data, reportPdf: pdfUrl } : p))
        setStatusMsg({ type: 'success', text: 'Report generated successfully' })
      } else {
        setStatusMsg({ type: 'error', text: 'Failed to generate report.' })
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'An error occurred during report generation.' })
    }
    setReportLoading(false)
    setActiveAgent(null)
  }, [setActiveAgent])

  const filteredProjects = projects.filter((p) => statusFilter === 'all' || p.status === statusFilter)

  function milestoneIcon(status: string) {
    switch (status) {
      case 'completed': return <FiCheck size={14} className="text-green-600" />
      case 'in-progress': return <FiCircle size={14} className="text-amber-500" />
      case 'upcoming': return <FiMinus size={14} className="text-muted-foreground" />
      default: return <FiMinus size={14} className="text-muted-foreground" />
    }
  }

  // Detail View
  if (selected) {
    const r = selected.report
    const budgetPercent = (() => {
      const alloc = parseFloat(selected.budgetAllocated.replace(/[^0-9.]/g, ''))
      const spent = parseFloat(selected.budgetSpent.replace(/[^0-9.]/g, ''))
      return alloc > 0 ? Math.round((spent / alloc) * 100) : 0
    })()

    return (
      <div className="p-8 lg:p-12 space-y-6">
        <button onClick={() => { setSelectedId(null); setStatusMsg(null) }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground tracking-wider font-light transition-colors">
          <FiArrowLeft size={14} /> Back to Projects
        </button>

        {statusMsg && (
          <div className={`flex items-center gap-2 px-4 py-3 text-sm tracking-wider font-light border ${statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {statusMsg.type === 'success' ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
            {statusMsg.text}
          </div>
        )}

        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-serif text-xl font-light tracking-wider text-foreground">{selected.name}</h2>
                <p className="text-sm text-muted-foreground tracking-wider font-light mt-1">{selected.location} | {selected.type}</p>
              </div>
              <span className={`px-3 py-1 text-xs tracking-wider font-light border ${projectStatusColor(selected.status)}`}>{selected.status}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="font-serif text-3xl font-light text-primary">{selected.progress}%</p>
                <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mt-1">Completion</p>
              </div>
              <div className="text-center">
                <p className="font-serif text-3xl font-light text-foreground">{budgetPercent}%</p>
                <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mt-1">Budget Used</p>
              </div>
              <div className="text-center">
                <p className="font-serif text-lg font-light text-foreground">{selected.startDate}</p>
                <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mt-1">Start Date</p>
              </div>
              <div className="text-center">
                <p className="font-serif text-lg font-light text-foreground">{selected.expectedCompletion}</p>
                <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mt-1">Expected Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base font-light tracking-wider">Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {selected.milestones.map((m, i) => (
                  <div key={i} className="flex items-start gap-3 py-3 border-b border-border last:border-0">
                    <div className="mt-0.5">{milestoneIcon(m.status)}</div>
                    <div className="flex-1">
                      <p className="text-sm tracking-wider font-light text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground tracking-wider font-light">{m.date} -- {m.notes}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] tracking-wider font-light capitalize">{m.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-base font-light tracking-wider">Budget</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm tracking-wider font-light">
                  <span className="text-muted-foreground">Allocated</span>
                  <span>{selected.budgetAllocated}</span>
                </div>
                <div className="flex justify-between text-sm tracking-wider font-light">
                  <span className="text-muted-foreground">Spent</span>
                  <span>{selected.budgetSpent}</span>
                </div>
                <Progress value={budgetPercent} className="h-2" />
                <p className="text-xs text-muted-foreground tracking-wider font-light">{budgetPercent}% of budget utilized</p>
              </CardContent>
            </Card>
            {selected.risks && (
              <Card className="border border-border shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="font-serif text-base font-light tracking-wider">Risks & Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm tracking-wider font-light text-muted-foreground leading-relaxed">{selected.risks}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <Button onClick={() => generateReport(selected)} disabled={reportLoading} className="tracking-wider font-light text-sm">
          {reportLoading ? <><FiLoader size={14} className="mr-2 animate-spin" /> Generating Report...</> : 'Generate Report'}
        </Button>

        {/* Report Result */}
        {r && (
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-base font-light tracking-wider">Project Report</CardTitle>
                {selected.reportPdf && (
                  <a href={selected.reportPdf} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary tracking-wider font-light hover:underline">
                    <FiDownload size={12} /> Download PDF
                  </a>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-serif text-lg font-light tracking-wider text-foreground">{r?.report_title ?? ''}</h3>

              {r?.project_overview && (
                <div className="pt-3 border-t border-border">
                  <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mb-2">Project Overview</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div><span className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Project</span><p className="text-sm tracking-wider font-light">{r.project_overview?.project_name ?? ''}</p></div>
                    <div><span className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Completion</span><p className="text-sm tracking-wider font-light">{r.project_overview?.completion_percentage ?? ''}</p></div>
                    <div><span className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Budget Utilization</span><p className="text-sm tracking-wider font-light">{r.project_overview?.budget_utilization ?? ''}</p></div>
                    <div><span className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Days Remaining</span><p className="text-sm tracking-wider font-light">{r.project_overview?.days_remaining ?? ''}</p></div>
                    <div><span className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Health</span><span className={`inline-block px-2 py-0.5 text-[10px] tracking-wider font-light border mt-1 ${healthColor(r.project_overview?.overall_health ?? '')}`}>{r.project_overview?.overall_health ?? ''}</span></div>
                  </div>
                </div>
              )}

              {Array.isArray(r?.milestone_updates) && r.milestone_updates.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mb-2">Milestone Updates</p>
                  <div className="space-y-2">{r.milestone_updates.map((m: any, i: number) => (
                    <div key={i} className="flex items-start gap-3 py-2 border-b border-border/50 last:border-0">
                      <div className="flex-1"><p className="text-sm tracking-wider font-light">{m?.milestone ?? ''}</p><p className="text-xs text-muted-foreground tracking-wider font-light">{m?.notes ?? ''}</p></div>
                      <Badge variant="secondary" className="text-[10px] tracking-wider font-light">{m?.status ?? ''}</Badge>
                    </div>
                  ))}</div>
                </div>
              )}

              {r?.budget_analysis && (
                <div className="pt-3 border-t border-border">
                  <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mb-2">Budget Analysis</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Allocated</span><p className="text-sm tracking-wider font-light">{r.budget_analysis?.allocated ?? ''}</p></div>
                    <div><span className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Spent</span><p className="text-sm tracking-wider font-light">{r.budget_analysis?.spent ?? ''}</p></div>
                    <div><span className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Remaining</span><p className="text-sm tracking-wider font-light">{r.budget_analysis?.remaining ?? ''}</p></div>
                    <div><span className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Projection</span><p className="text-sm tracking-wider font-light">{r.budget_analysis?.projection ?? ''}</p></div>
                  </div>
                </div>
              )}

              {r?.timeline_assessment && <div className="pt-3 border-t border-border"><p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mb-2">Timeline Assessment</p>{renderMarkdown(r.timeline_assessment)}</div>}

              {Array.isArray(r?.key_accomplishments) && r.key_accomplishments.length > 0 && (
                <div className="pt-3 border-t border-border"><p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mb-2">Key Accomplishments</p><ul className="space-y-1">{r.key_accomplishments.map((a: string, i: number) => <li key={i} className="text-sm tracking-wider font-light flex items-start gap-2"><span className="text-primary">-</span>{a}</li>)}</ul></div>
              )}

              {Array.isArray(r?.risk_factors) && r.risk_factors.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mb-2">Risk Factors</p>
                  <div className="space-y-2">{r.risk_factors.map((rf: any, i: number) => (
                    <div key={i} className="p-3 bg-secondary/50 border border-border">
                      <div className="flex items-start justify-between"><p className="text-sm tracking-wider font-light">{rf?.risk ?? ''}</p><span className={`px-2 py-0.5 text-[10px] tracking-wider font-light border ${severityColor(rf?.severity ?? '')}`}>{rf?.severity ?? ''}</span></div>
                      {rf?.mitigation && <p className="text-xs text-muted-foreground tracking-wider font-light mt-1">Mitigation: {rf.mitigation}</p>}
                    </div>
                  ))}</div>
                </div>
              )}

              {Array.isArray(r?.recommendations) && r.recommendations.length > 0 && (
                <div className="pt-3 border-t border-border"><p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mb-2">Recommendations</p><ol className="space-y-1">{r.recommendations.map((rec: string, i: number) => <li key={i} className="text-sm tracking-wider font-light flex items-start gap-2"><span className="text-primary font-medium">{i + 1}.</span>{rec}</li>)}</ol></div>
              )}

              {r?.summary && <div className="pt-3 border-t border-border"><p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mb-2">Summary</p>{renderMarkdown(r.summary)}</div>}
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  // List View
  return (
    <div className="p-8 lg:p-12 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-light tracking-wider text-foreground">Projects</h2>
          <p className="text-sm text-muted-foreground tracking-wider mt-1 font-light">Track construction progress and generate reports</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 text-sm tracking-wider font-light"><SelectValue placeholder="Filter Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="On Track">On Track</SelectItem>
            <SelectItem value="Delayed">Delayed</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showSample ? (
        <div className="space-y-4">
          {filteredProjects.map((proj) => (
            <Card key={proj.id} className="border border-border shadow-sm hover:shadow-md transition-shadow duration-300 cursor-pointer" onClick={() => setSelectedId(proj.id)}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-serif text-base font-light tracking-wider text-foreground">{proj.name}</h3>
                    <p className="text-xs text-muted-foreground tracking-wider font-light mt-1">{proj.location} | {proj.type}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs tracking-wider font-light border ${projectStatusColor(proj.status)}`}>{proj.status}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-muted-foreground tracking-wider font-light mb-1">
                      <span>Progress</span>
                      <span>{proj.progress}%</span>
                    </div>
                    <Progress value={proj.progress} className="h-1.5" />
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground tracking-wider font-light">Expected</p>
                    <p className="text-sm tracking-wider font-light">{proj.expectedCompletion}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground tracking-wider font-light">Enable Sample Data to view projects</p>
        </div>
      )}
    </div>
  )
}

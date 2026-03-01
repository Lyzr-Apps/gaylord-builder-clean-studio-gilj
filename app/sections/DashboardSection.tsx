'use client'

import { FiUsers, FiCheckCircle, FiBriefcase, FiDollarSign, FiArrowUpRight, FiArrowRight } from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface DashboardSectionProps {
  onNavigate: (page: 'leads' | 'projects') => void
  showSample: boolean
}

const statCards = [
  { label: 'Active Leads', value: '24', trend: '+3 this week', icon: <FiUsers size={20} /> },
  { label: 'Qualified Leads', value: '12', trend: '+2 this week', icon: <FiCheckCircle size={20} /> },
  { label: 'Active Projects', value: '5', trend: '1 nearing completion', icon: <FiBriefcase size={20} /> },
  { label: 'Revenue Pipeline', value: '$47.2M', trend: '+$4.8M this month', icon: <FiDollarSign size={20} /> },
]

const recentLeads = [
  { name: 'Victoria Ashworth', interest: 'Royal Palm Villa', status: 'New', date: '2026-02-28' },
  { name: 'James Harrington III', interest: 'Skyline Tower Suite', status: 'Qualified', date: '2026-02-27' },
  { name: 'Elena Marchand', interest: 'Oceanview Penthouse', status: 'Proposal Sent', date: '2026-02-26' },
  { name: 'Robert Chen-Williams', interest: 'Heritage Manor', status: 'Converted', date: '2026-02-25' },
  { name: 'Sophia Laurent', interest: 'Emerald Heights Villa', status: 'New', date: '2026-02-24' },
]

const activeProjects = [
  { name: 'Royal Palm Villa Phase 2', progress: 68, milestone: 'Interior finishing' },
  { name: 'Pristine Bay Clubhouse', progress: 42, milestone: 'Structural framing' },
  { name: 'Skyline Tower Construction', progress: 15, milestone: 'Foundation work' },
  { name: 'Heritage Manor Renovation', progress: 85, milestone: 'Final inspections' },
]

function statusColor(status: string) {
  switch (status) {
    case 'New': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'Qualified': return 'bg-green-100 text-green-700 border-green-200'
    case 'Proposal Sent': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'Converted': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    default: return 'bg-muted text-muted-foreground'
  }
}

export default function DashboardSection({ onNavigate, showSample }: DashboardSectionProps) {
  if (!showSample) {
    return (
      <div className="p-8 lg:p-12 space-y-8">
        <div>
          <h2 className="font-serif text-2xl font-light tracking-wider text-foreground">Dashboard</h2>
          <p className="text-sm text-muted-foreground tracking-wider mt-1 font-light">Overview of your luxury real estate operations</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((s) => (
            <Card key={s.label} className="border border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-muted-foreground">{s.icon}</span>
                  <FiArrowUpRight size={14} className="text-muted-foreground/40" />
                </div>
                <p className="font-serif text-3xl font-light tracking-wider text-foreground">--</p>
                <p className="text-xs tracking-wider text-muted-foreground mt-1 font-light uppercase">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="flex items-center justify-center py-16">
          <p className="text-sm text-muted-foreground tracking-wider font-light">Enable Sample Data to view the dashboard overview</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 lg:p-12 space-y-8">
      <div>
        <h2 className="font-serif text-2xl font-light tracking-wider text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground tracking-wider mt-1 font-light">Overview of your luxury real estate operations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((s) => (
          <Card key={s.label} className="border border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">{s.icon}</span>
                <FiArrowUpRight size={14} className="text-primary" />
              </div>
              <p className="font-serif text-3xl font-light tracking-wider text-foreground">{s.value}</p>
              <p className="text-xs tracking-wider text-muted-foreground mt-1 font-light uppercase">{s.label}</p>
              <p className="text-[11px] text-primary mt-2 tracking-wider font-light">{s.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base font-light tracking-wider">Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {recentLeads.map((lead, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-light tracking-wider text-foreground truncate">{lead.name}</p>
                    <p className="text-xs text-muted-foreground tracking-wider font-light">{lead.interest}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`px-2 py-0.5 text-[10px] tracking-wider font-light border ${statusColor(lead.status)}`}>{lead.status}</span>
                    <span className="text-[10px] text-muted-foreground tracking-wider">{lead.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base font-light tracking-wider">Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProjects.map((proj, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-light tracking-wider text-foreground">{proj.name}</p>
                    <span className="text-xs text-muted-foreground tracking-wider">{proj.progress}%</span>
                  </div>
                  <Progress value={proj.progress} className="h-1.5" />
                  <p className="text-[11px] text-muted-foreground tracking-wider font-light">Next: {proj.milestone}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" className="tracking-wider font-light text-sm" onClick={() => onNavigate('leads')}>
          <FiArrowRight size={14} className="mr-2" /> View All Leads
        </Button>
        <Button variant="outline" className="tracking-wider font-light text-sm" onClick={() => onNavigate('projects')}>
          <FiArrowRight size={14} className="mr-2" /> View All Projects
        </Button>
      </div>
    </div>
  )
}

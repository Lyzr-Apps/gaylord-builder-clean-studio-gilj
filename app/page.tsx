'use client'

import React, { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

import Sidebar from './sections/Sidebar'
import type { ActivePage } from './sections/Sidebar'
import DashboardSection from './sections/DashboardSection'
import PropertiesSection from './sections/PropertiesSection'
import LeadsSection from './sections/LeadsSection'
import ProjectsSection from './sections/ProjectsSection'
import RevenueSection from './sections/RevenueSection'

const AGENTS = [
  { id: '69a492b115a7bc6aa5e885e4', name: 'Client Inquiry', purpose: 'Property questions and availability' },
  { id: '69a492b17447fbb48963edc8', name: 'Lead Qualifier', purpose: 'Lead scoring and qualification' },
  { id: '69a492b256b99c8e0e6ce77f', name: 'Proposal Generator', purpose: 'Luxury property proposals with PDF' },
  { id: '69a492b2ad5175ca488a2a20', name: 'Project Report', purpose: 'Construction progress reports with PDF' },
]

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: '' }
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
          <div className="text-center p-8 max-w-md">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-4 text-sm">{this.state.error}</p>
            <button onClick={() => this.setState({ hasError: false, error: '' })} className="px-4 py-2 bg-primary text-primary-foreground text-sm">
              Try again
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default function Page() {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard')
  const [showSample, setShowSample] = useState(false)
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null)

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />

        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="flex items-center justify-between px-8 py-4 border-b border-border bg-card flex-shrink-0">
            <div className="flex items-center gap-3">
              {activeAgentId && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary animate-pulse" />
                  <span className="text-xs tracking-wider font-light text-muted-foreground">
                    {AGENTS.find((a) => a.id === activeAgentId)?.name ?? 'Agent'} processing...
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Label htmlFor="sample-toggle" className="text-xs tracking-wider font-light text-muted-foreground cursor-pointer">
                Sample Data
              </Label>
              <Switch id="sample-toggle" checked={showSample} onCheckedChange={setShowSample} />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            {activePage === 'dashboard' && (
              <DashboardSection onNavigate={setActivePage} showSample={showSample} />
            )}
            {activePage === 'properties' && (
              <PropertiesSection showSample={showSample} />
            )}
            {activePage === 'leads' && (
              <LeadsSection showSample={showSample} setActiveAgent={setActiveAgentId} />
            )}
            {activePage === 'projects' && (
              <ProjectsSection showSample={showSample} setActiveAgent={setActiveAgentId} />
            )}
            {activePage === 'revenue' && (
              <RevenueSection showSample={showSample} />
            )}
          </main>

          {/* Agent Status Bar */}
          <footer className="px-8 py-3 border-t border-border bg-card flex-shrink-0">
            <div className="flex items-center gap-6">
              <span className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-light">Agents</span>
              {AGENTS.map((agent) => (
                <div key={agent.id} className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 ${activeAgentId === agent.id ? 'bg-primary animate-pulse' : 'bg-muted-foreground/30'}`} />
                  <span className="text-[10px] tracking-wider font-light text-muted-foreground" title={agent.purpose}>
                    {agent.name}
                  </span>
                </div>
              ))}
            </div>
          </footer>
        </div>
      </div>
    </ErrorBoundary>
  )
}

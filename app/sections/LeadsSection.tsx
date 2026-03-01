'use client'

import React, { useState, useCallback } from 'react'
import { FiArrowLeft, FiPlus, FiX, FiLoader, FiDownload, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { callAIAgent } from '@/lib/aiAgent'

const LEAD_QUALIFIER_ID = '69a492b17447fbb48963edc8'
const PROPOSAL_GENERATOR_ID = '69a492b256b99c8e0e6ce77f'

interface Lead {
  id: string; name: string; email: string; phone: string; interest: string; budget: string; source: string; status: string; date: string; notes: string
  qualification?: any; proposal?: any; proposalPdf?: string
}

const initialLeads: Lead[] = [
  { id: '1', name: 'Victoria Ashworth', email: 'v.ashworth@email.com', phone: '+1 (305) 555-0142', interest: 'Royal Palm Villa', budget: '$7M - $10M', source: 'Referral', status: 'New', date: '2026-02-28', notes: 'Interested in waterfront properties' },
  { id: '2', name: 'James Harrington III', email: 'jharrington@email.com', phone: '+1 (212) 555-0198', interest: 'Skyline Tower Suite', budget: '$3M - $5M', source: 'Website', status: 'Qualified', date: '2026-02-27', notes: 'NYC-based investor, wants pied-a-terre' },
  { id: '3', name: 'Elena Marchand', email: 'e.marchand@email.com', phone: '+1 (310) 555-0267', interest: 'Oceanview Penthouse', budget: '$4M - $6M', source: 'Event', status: 'Proposal Sent', date: '2026-02-26', notes: 'Attended gala, very interested' },
  { id: '4', name: 'Robert Chen-Williams', email: 'rcw@email.com', phone: '+1 (415) 555-0334', interest: 'Heritage Manor', budget: '$2M - $4M', source: 'Social Media', status: 'Converted', date: '2026-02-25', notes: 'Closed deal, move-in Q3' },
  { id: '5', name: 'Sophia Laurent', email: 's.laurent@email.com', phone: '+33 6 55 01 23 45', interest: 'Emerald Heights Villa', budget: '$5M - $7M', source: 'Referral', status: 'New', date: '2026-02-24', notes: 'International buyer, Paris-based' },
  { id: '6', name: 'Marcus Wellington', email: 'm.wellington@email.com', phone: '+1 (786) 555-0411', interest: 'The Grand Residence', budget: '$6M - $9M', source: 'Website', status: 'New', date: '2026-02-23', notes: 'Family relocation, needs space' },
]

interface LeadsSectionProps {
  showSample: boolean
  setActiveAgent: (id: string | null) => void
}

function statusColor(status: string) {
  switch (status) {
    case 'New': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'Qualified': return 'bg-green-100 text-green-700 border-green-200'
    case 'Proposal Sent': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'Converted': return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    default: return 'bg-muted text-muted-foreground'
  }
}

function categoryColor(cat: string) {
  switch (cat?.toLowerCase?.()) {
    case 'hot': return 'bg-red-100 text-red-700 border-red-200'
    case 'warm': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'cold': return 'bg-blue-100 text-blue-700 border-blue-200'
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

export default function LeadsSection({ showSample, setActiveAgent }: LeadsSectionProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', interest: '', budget: '', source: 'Website', notes: '' })
  const [qualifyLoading, setQualifyLoading] = useState(false)
  const [proposalLoading, setProposalLoading] = useState(false)
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const selectedLead = leads.find((l) => l.id === selectedId) ?? null

  const handleAddLead = useCallback(() => {
    if (!newLead.name.trim()) return
    const lead: Lead = {
      id: Date.now().toString(),
      name: newLead.name, email: newLead.email, phone: newLead.phone,
      interest: newLead.interest, budget: newLead.budget, source: newLead.source,
      status: 'New', date: new Date().toISOString().split('T')[0], notes: newLead.notes,
    }
    setLeads((prev) => [lead, ...prev])
    setNewLead({ name: '', email: '', phone: '', interest: '', budget: '', source: 'Website', notes: '' })
    setAddOpen(false)
  }, [newLead])

  const qualifyLead = useCallback(async (lead: Lead) => {
    setQualifyLoading(true)
    setStatusMsg(null)
    setActiveAgent(LEAD_QUALIFIER_ID)
    try {
      const msg = `Qualify this lead: Name: ${lead.name}, Budget: ${lead.budget}, Property Interest: ${lead.interest}, Source: ${lead.source}, Notes: ${lead.notes}, Email: ${lead.email}, Phone: ${lead.phone}`
      const result = await callAIAgent(msg, LEAD_QUALIFIER_ID)
      if (result.success) {
        const data = result?.response?.result
        setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, qualification: data, status: 'Qualified' } : l))
        setStatusMsg({ type: 'success', text: 'Lead qualified successfully' })
      } else {
        setStatusMsg({ type: 'error', text: 'Failed to qualify lead. Please try again.' })
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'An error occurred during qualification.' })
    }
    setQualifyLoading(false)
    setActiveAgent(null)
  }, [setActiveAgent])

  const generateProposal = useCallback(async (lead: Lead) => {
    setProposalLoading(true)
    setStatusMsg(null)
    setActiveAgent(PROPOSAL_GENERATOR_ID)
    try {
      const msg = `Generate a luxury property proposal for: Client: ${lead.name}, Property Interest: ${lead.interest}, Budget: ${lead.budget}, Notes: ${lead.notes}`
      const result = await callAIAgent(msg, PROPOSAL_GENERATOR_ID)
      if (result.success) {
        const data = result?.response?.result
        const files = Array.isArray(result?.module_outputs?.artifact_files) ? result.module_outputs.artifact_files : []
        const pdfUrl = files?.[0]?.file_url ?? ''
        setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, proposal: data, proposalPdf: pdfUrl, status: 'Proposal Sent' } : l))
        setStatusMsg({ type: 'success', text: 'Proposal generated successfully' })
      } else {
        setStatusMsg({ type: 'error', text: 'Failed to generate proposal.' })
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'An error occurred during proposal generation.' })
    }
    setProposalLoading(false)
    setActiveAgent(null)
  }, [setActiveAgent])

  // Detail View
  if (selectedLead) {
    const q = selectedLead.qualification
    const p = selectedLead.proposal
    return (
      <div className="p-8 lg:p-12 space-y-6">
        <button onClick={() => { setSelectedId(null); setStatusMsg(null) }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground tracking-wider font-light transition-colors">
          <FiArrowLeft size={14} /> Back to Leads
        </button>

        {statusMsg && (
          <div className={`flex items-center gap-2 px-4 py-3 text-sm tracking-wider font-light border ${statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
            {statusMsg.type === 'success' ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
            {statusMsg.text}
          </div>
        )}

        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-xl font-light tracking-wider text-foreground">{selectedLead.name}</h2>
                <p className="text-sm text-muted-foreground tracking-wider font-light mt-1">{selectedLead.email} | {selectedLead.phone}</p>
              </div>
              <span className={`px-3 py-1 text-xs tracking-wider font-light border ${statusColor(selectedLead.status)}`}>{selectedLead.status}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div><p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Property Interest</p><p className="text-sm tracking-wider font-light mt-1">{selectedLead.interest}</p></div>
              <div><p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Budget</p><p className="text-sm tracking-wider font-light mt-1">{selectedLead.budget}</p></div>
              <div><p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Source</p><p className="text-sm tracking-wider font-light mt-1">{selectedLead.source}</p></div>
              <div><p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Date</p><p className="text-sm tracking-wider font-light mt-1">{selectedLead.date}</p></div>
            </div>
            {selectedLead.notes && <p className="text-sm text-muted-foreground tracking-wider font-light mt-4 pt-4 border-t border-border">{selectedLead.notes}</p>}
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => qualifyLead(selectedLead)} disabled={qualifyLoading} className="tracking-wider font-light text-sm">
            {qualifyLoading ? <><FiLoader size={14} className="mr-2 animate-spin" /> Qualifying...</> : 'Qualify Lead'}
          </Button>
          <Button onClick={() => generateProposal(selectedLead)} disabled={proposalLoading} className="tracking-wider font-light text-sm">
            {proposalLoading ? <><FiLoader size={14} className="mr-2 animate-spin" /> Generating Proposal...</> : 'Generate Proposal'}
          </Button>
        </div>

        {/* Qualification Result */}
        {q && (
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base font-light tracking-wider">Lead Qualification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="font-serif text-4xl font-light text-primary">{q?.qualification_score ?? '--'}</p>
                  <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Score / 10</p>
                </div>
                <span className={`px-3 py-1 text-xs tracking-wider font-light border ${categoryColor(q?.category ?? '')}`}>{q?.category ?? 'N/A'}</span>
                <Badge variant="secondary" className="text-[10px] tracking-wider font-light">{q?.priority_level ?? 'N/A'}</Badge>
              </div>
              {q?.score_breakdown && (
                <div className="space-y-2 pt-3 border-t border-border">
                  <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Score Breakdown</p>
                  {Object.entries(q.score_breakdown).map(([key, val]) => (
                    <div key={key} className="flex items-center gap-3">
                      <span className="text-xs tracking-wider font-light text-muted-foreground w-40 capitalize">{key.replace(/_/g, ' ')}</span>
                      <Progress value={Number(val) * 10} className="h-1.5 flex-1" />
                      <span className="text-xs tracking-wider text-foreground w-8 text-right">{String(val)}</span>
                    </div>
                  ))}
                </div>
              )}
              {q?.summary && <div className="pt-3 border-t border-border"><p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mb-2">Summary</p>{renderMarkdown(q.summary)}</div>}
              {Array.isArray(q?.recommended_actions) && q.recommended_actions.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mb-2">Recommended Actions</p>
                  <ul className="space-y-1">{q.recommended_actions.map((a: string, i: number) => <li key={i} className="text-sm tracking-wider font-light flex items-start gap-2"><span className="text-primary mt-0.5">-</span>{a}</li>)}</ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Proposal Result */}
        {p && (
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-base font-light tracking-wider">Proposal</CardTitle>
                {selectedLead.proposalPdf && (
                  <a href={selectedLead.proposalPdf} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-primary tracking-wider font-light hover:underline">
                    <FiDownload size={12} /> Download PDF
                  </a>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="font-serif text-lg font-light tracking-wider text-foreground">{p?.proposal_title ?? ''}</h3>
              {p?.client_greeting && <p className="text-sm tracking-wider font-light text-muted-foreground italic">{p.client_greeting}</p>}
              {p?.executive_summary && <div className="pt-3 border-t border-border"><p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mb-2">Executive Summary</p>{renderMarkdown(p.executive_summary)}</div>}
              {p?.property_details && (
                <div className="pt-3 border-t border-border">
                  <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mb-2">Property Details</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {p.property_details?.name && <div><span className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Name</span><p className="text-sm tracking-wider font-light">{p.property_details.name}</p></div>}
                    {p.property_details?.location && <div><span className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Location</span><p className="text-sm tracking-wider font-light">{p.property_details.location}</p></div>}
                    {p.property_details?.type && <div><span className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Type</span><p className="text-sm tracking-wider font-light">{p.property_details.type}</p></div>}
                    {p.property_details?.size_sqft && <div><span className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Size</span><p className="text-sm tracking-wider font-light">{p.property_details.size_sqft} sqft</p></div>}
                    {p.property_details?.bedrooms && <div><span className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Bedrooms</span><p className="text-sm tracking-wider font-light">{p.property_details.bedrooms}</p></div>}
                    {p.property_details?.bathrooms && <div><span className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Bathrooms</span><p className="text-sm tracking-wider font-light">{p.property_details.bathrooms}</p></div>}
                    {p.property_details?.price_range && <div><span className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Price</span><p className="text-sm tracking-wider font-light">{p.property_details.price_range}</p></div>}
                  </div>
                  {Array.isArray(p.property_details?.key_amenities) && p.property_details.key_amenities.length > 0 && (
                    <div className="mt-3"><span className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Key Amenities</span><div className="flex flex-wrap gap-2 mt-1">{p.property_details.key_amenities.map((a: string, i: number) => <Badge key={i} variant="secondary" className="text-[10px] tracking-wider font-light">{a}</Badge>)}</div></div>
                  )}
                </div>
              )}
              {Array.isArray(p?.unique_selling_points) && p.unique_selling_points.length > 0 && (
                <div className="pt-3 border-t border-border"><p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mb-2">Unique Selling Points</p><ul className="space-y-1">{p.unique_selling_points.map((u: string, i: number) => <li key={i} className="text-sm tracking-wider font-light flex items-start gap-2"><span className="text-primary">-</span>{u}</li>)}</ul></div>
              )}
              {Array.isArray(p?.customization_options) && p.customization_options.length > 0 && (
                <div className="pt-3 border-t border-border"><p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mb-2">Customization Options</p><ul className="space-y-1">{p.customization_options.map((c: string, i: number) => <li key={i} className="text-sm tracking-wider font-light flex items-start gap-2"><span className="text-primary">-</span>{c}</li>)}</ul></div>
              )}
              {p?.pricing_note && <div className="pt-3 border-t border-border"><p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mb-2">Pricing Note</p><p className="text-sm tracking-wider font-light text-muted-foreground">{p.pricing_note}</p></div>}
              {Array.isArray(p?.next_steps) && p.next_steps.length > 0 && (
                <div className="pt-3 border-t border-border"><p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mb-2">Next Steps</p><ol className="space-y-1">{p.next_steps.map((n: string, i: number) => <li key={i} className="text-sm tracking-wider font-light flex items-start gap-2"><span className="text-primary font-medium">{i + 1}.</span>{n}</li>)}</ol></div>
              )}
              {p?.closing_statement && <div className="pt-3 border-t border-border"><p className="text-sm tracking-wider font-light italic text-muted-foreground">{p.closing_statement}</p></div>}
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
          <h2 className="font-serif text-2xl font-light tracking-wider text-foreground">Leads</h2>
          <p className="text-sm text-muted-foreground tracking-wider mt-1 font-light">Manage and qualify prospective clients</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="tracking-wider font-light text-sm">
          <FiPlus size={14} className="mr-2" /> Add Lead
        </Button>
      </div>

      {statusMsg && (
        <div className={`flex items-center gap-2 px-4 py-3 text-sm tracking-wider font-light border ${statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {statusMsg.type === 'success' ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
          {statusMsg.text}
        </div>
      )}

      {showSample ? (
        <Card className="border border-border shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light">Name</th>
                    <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light">Email</th>
                    <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light hidden md:table-cell">Interest</th>
                    <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light hidden lg:table-cell">Budget</th>
                    <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light hidden lg:table-cell">Source</th>
                    <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light">Status</th>
                    <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                      <td className="px-4 py-3"><button onClick={() => setSelectedId(lead.id)} className="text-sm tracking-wider font-light text-foreground hover:text-primary transition-colors">{lead.name}</button></td>
                      <td className="px-4 py-3 text-xs tracking-wider font-light text-muted-foreground">{lead.email}</td>
                      <td className="px-4 py-3 text-xs tracking-wider font-light text-muted-foreground hidden md:table-cell">{lead.interest}</td>
                      <td className="px-4 py-3 text-xs tracking-wider font-light text-muted-foreground hidden lg:table-cell">{lead.budget}</td>
                      <td className="px-4 py-3 text-xs tracking-wider font-light text-muted-foreground hidden lg:table-cell">{lead.source}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-0.5 text-[10px] tracking-wider font-light border ${statusColor(lead.status)}`}>{lead.status}</span></td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedId(lead.id); }} className="text-xs tracking-wider font-light h-7 px-2">View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground tracking-wider font-light">Enable Sample Data to view leads, or add a new lead to get started</p>
        </div>
      )}

      {/* Add Lead Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-light tracking-wider">Add New Lead</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div><Label className="text-xs tracking-wider font-light uppercase">Name *</Label><Input value={newLead.name} onChange={(e) => setNewLead((p) => ({ ...p, name: e.target.value }))} placeholder="Full name" className="mt-1 text-sm tracking-wider font-light" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs tracking-wider font-light uppercase">Email</Label><Input type="email" value={newLead.email} onChange={(e) => setNewLead((p) => ({ ...p, email: e.target.value }))} placeholder="Email" className="mt-1 text-sm tracking-wider font-light" /></div>
              <div><Label className="text-xs tracking-wider font-light uppercase">Phone</Label><Input value={newLead.phone} onChange={(e) => setNewLead((p) => ({ ...p, phone: e.target.value }))} placeholder="Phone" className="mt-1 text-sm tracking-wider font-light" /></div>
            </div>
            <div><Label className="text-xs tracking-wider font-light uppercase">Property Interest</Label><Input value={newLead.interest} onChange={(e) => setNewLead((p) => ({ ...p, interest: e.target.value }))} placeholder="e.g. Royal Palm Villa" className="mt-1 text-sm tracking-wider font-light" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label className="text-xs tracking-wider font-light uppercase">Budget</Label><Input value={newLead.budget} onChange={(e) => setNewLead((p) => ({ ...p, budget: e.target.value }))} placeholder="e.g. $3M - $5M" className="mt-1 text-sm tracking-wider font-light" /></div>
              <div>
                <Label className="text-xs tracking-wider font-light uppercase">Source</Label>
                <Select value={newLead.source} onValueChange={(v) => setNewLead((p) => ({ ...p, source: v }))}>
                  <SelectTrigger className="mt-1 text-sm tracking-wider font-light"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Event">Event</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs tracking-wider font-light uppercase">Notes</Label><Textarea value={newLead.notes} onChange={(e) => setNewLead((p) => ({ ...p, notes: e.target.value }))} placeholder="Additional notes..." className="mt-1 text-sm tracking-wider font-light" rows={3} /></div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="tracking-wider font-light text-sm">Cancel</Button>
              <Button onClick={handleAddLead} disabled={!newLead.name.trim()} className="tracking-wider font-light text-sm">Add Lead</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { FiMessageCircle, FiX, FiSend, FiMapPin, FiMaximize } from 'react-icons/fi'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { callAIAgent } from '@/lib/aiAgent'

const AGENT_ID = '69a492b115a7bc6aa5e885e4'

interface PropertiesSectionProps {
  showSample: boolean
}

const properties = [
  { name: 'Royal Palm Villa', type: 'Villa', location: 'Palm Beach, FL', price: '$8.5M', beds: 7, baths: 9, sqft: '12,400', status: 'Available', gradient: 'from-amber-100 to-amber-50' },
  { name: 'Pristine Bay Estate', type: 'Villa', location: 'Malibu, CA', price: '$6.2M', beds: 5, baths: 7, sqft: '9,800', status: 'Available', gradient: 'from-stone-200 to-stone-100' },
  { name: 'Oceanview Penthouse', type: 'Penthouse', location: 'Miami Beach, FL', price: '$4.8M', beds: 4, baths: 5, sqft: '5,600', status: 'Available', gradient: 'from-sky-100 to-sky-50' },
  { name: 'The Grand Residence', type: 'Villa', location: 'Beverly Hills, CA', price: '$7.9M', beds: 6, baths: 8, sqft: '11,200', status: 'Under Construction', gradient: 'from-rose-100 to-rose-50' },
  { name: 'Emerald Heights Villa', type: 'Villa', location: 'Aspen, CO', price: '$5.1M', beds: 5, baths: 6, sqft: '8,400', status: 'Available', gradient: 'from-emerald-100 to-emerald-50' },
  { name: 'Skyline Tower Suite', type: 'Penthouse', location: 'New York, NY', price: '$3.9M', beds: 3, baths: 4, sqft: '4,200', status: 'Available', gradient: 'from-slate-200 to-slate-100' },
  { name: 'Heritage Manor', type: 'Villa', location: 'Charleston, SC', price: '$2.8M', beds: 5, baths: 5, sqft: '7,600', status: 'Sold', gradient: 'from-orange-100 to-orange-50' },
  { name: 'Coral Bay Retreat', type: 'Building', location: 'Turks & Caicos', price: '$1.2M', beds: 3, baths: 3, sqft: '3,200', status: 'Available', gradient: 'from-teal-100 to-teal-50' },
]

interface ChatMsg { role: 'user' | 'agent'; text: string; suggestions?: { name: string; relevance: string }[]; followUp?: string }

export default function PropertiesSection({ showSample }: PropertiesSectionProps) {
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMsg[]>([])
  const [chatLoading, setChatLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [chatMessages])

  const filtered = properties.filter((p) => {
    if (typeFilter !== 'all' && p.type !== typeFilter) return false
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    return true
  })

  const sendChat = useCallback(async (msg: string) => {
    if (!msg.trim()) return
    const userMsg = msg.trim()
    setChatInput('')
    setChatMessages((prev) => [...prev, { role: 'user', text: userMsg }])
    setChatLoading(true)
    try {
      const result = await callAIAgent(userMsg, AGENT_ID)
      if (result.success) {
        const data = result?.response?.result
        const responseText = data?.response_text ?? 'Thank you for your inquiry. Please let me know how I can assist you further.'
        const suggested = Array.isArray(data?.suggested_properties) ? data.suggested_properties : []
        const followUp = data?.follow_up_question ?? ''
        setChatMessages((prev) => [...prev, { role: 'agent', text: responseText, suggestions: suggested, followUp }])
      } else {
        setChatMessages((prev) => [...prev, { role: 'agent', text: 'I apologize, but I was unable to process your request at this time. Please try again.' }])
      }
    } catch {
      setChatMessages((prev) => [...prev, { role: 'agent', text: 'An error occurred. Please try again shortly.' }])
    }
    setChatLoading(false)
  }, [])

  function statusBadge(status: string) {
    switch (status) {
      case 'Available': return 'bg-green-100 text-green-700 border-green-200'
      case 'Under Construction': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'Sold': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <div className="p-8 lg:p-12 space-y-8 relative min-h-screen">
      <div>
        <h2 className="font-serif text-2xl font-light tracking-wider text-foreground">Properties</h2>
        <p className="text-sm text-muted-foreground tracking-wider mt-1 font-light">Exclusive luxury real estate portfolio</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44 text-sm tracking-wider font-light">
            <SelectValue placeholder="Property Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Villa">Villa</SelectItem>
            <SelectItem value="Penthouse">Penthouse</SelectItem>
            <SelectItem value="Building">Building</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44 text-sm tracking-wider font-light">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Under Construction">Under Construction</SelectItem>
            <SelectItem value="Sold">Sold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {showSample ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((p) => (
            <Card key={p.name} className="border border-border shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
              <div className={`h-44 bg-gradient-to-br ${p.gradient} flex items-center justify-center`}>
                <FiMaximize size={32} className="text-muted-foreground/20 group-hover:text-muted-foreground/40 transition-colors" />
              </div>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-serif text-base font-light tracking-wider text-foreground">{p.name}</h3>
                  <span className={`px-2 py-0.5 text-[10px] tracking-wider font-light border ${statusBadge(p.status)}`}>{p.status}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <FiMapPin size={12} />
                  <span className="text-xs tracking-wider font-light">{p.location}</span>
                </div>
                <p className="font-serif text-lg font-light tracking-wider text-primary">{p.price}</p>
                <div className="flex gap-4 text-xs text-muted-foreground tracking-wider font-light pt-1 border-t border-border">
                  <span>{p.beds} Beds</span>
                  <span>{p.baths} Baths</span>
                  <span>{p.sqft} sqft</span>
                </div>
                <Badge variant="secondary" className="text-[10px] tracking-wider font-light">{p.type}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-muted-foreground tracking-wider font-light">Enable Sample Data to browse property listings</p>
        </div>
      )}

      {/* Chat Trigger */}
      <button
        onClick={() => setChatOpen(true)}
        className={`fixed bottom-8 right-8 z-50 w-14 h-14 bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 ${chatOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <FiMessageCircle size={22} />
      </button>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="fixed bottom-0 right-0 z-50 w-full max-w-md h-[32rem] bg-card border-l border-t border-border shadow-xl flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h3 className="font-serif text-sm font-light tracking-wider text-foreground">Client Inquiry</h3>
              <p className="text-[10px] text-muted-foreground tracking-wider font-light">Ask about properties, pricing, and availability</p>
            </div>
            <button onClick={() => setChatOpen(false)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
              <FiX size={18} />
            </button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {chatMessages.length === 0 && (
              <p className="text-xs text-muted-foreground tracking-wider font-light text-center py-8">Start a conversation about our luxury properties</p>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'} px-4 py-3 text-sm tracking-wider font-light leading-relaxed`}>
                  <p>{m.text}</p>
                  {Array.isArray(m.suggestions) && m.suggestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/30 space-y-2">
                      <p className="text-[10px] tracking-wider uppercase opacity-70">Suggested Properties</p>
                      {m.suggestions.map((s, j) => (
                        <div key={j} className="text-xs">
                          <span className="font-medium">{s?.name ?? 'Property'}</span>
                          {s?.relevance && <span className="opacity-70"> -- {s.relevance}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  {m.followUp && (
                    <button
                      className="mt-2 text-xs underline opacity-70 hover:opacity-100 transition-opacity"
                      onClick={() => sendChat(m.followUp ?? '')}
                    >
                      {m.followUp}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-secondary px-4 py-3 text-sm text-muted-foreground tracking-wider font-light animate-pulse">Composing response...</div>
              </div>
            )}
          </div>
          <div className="px-5 py-3 border-t border-border flex gap-2">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about properties..."
              className="text-sm tracking-wider font-light"
              onKeyDown={(e) => { if (e.key === 'Enter') sendChat(chatInput) }}
            />
            <Button size="sm" onClick={() => sendChat(chatInput)} disabled={chatLoading || !chatInput.trim()} className="px-3">
              <FiSend size={14} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

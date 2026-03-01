'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  FiDollarSign, FiTrendingUp, FiTrendingDown, FiArrowUpRight, FiPlus, FiX,
  FiCalendar, FiFilter, FiDownload, FiCheckCircle, FiClock, FiAlertCircle,
  FiPercent, FiBarChart2, FiPieChart, FiEdit2, FiTrash2, FiCopy, FiCreditCard
} from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

interface RevenueSectionProps {
  showSample: boolean
}

interface Transaction {
  id: string
  date: string
  client: string
  property: string
  type: 'Sale' | 'Deposit' | 'Installment' | 'Commission' | 'Rental'
  amount: number
  status: 'Completed' | 'Pending' | 'Overdue' | 'Scheduled'
  method: string
  notes: string
}

interface RevenueByProperty {
  property: string
  type: string
  totalRevenue: number
  collected: number
  pending: number
}

const initialTransactions: Transaction[] = [
  { id: '1', date: '2026-02-28', client: 'Robert Chen-Williams', property: 'Heritage Manor', type: 'Sale', amount: 2800000, status: 'Completed', method: 'Wire Transfer', notes: 'Full purchase price - closing completed' },
  { id: '2', date: '2026-02-25', client: 'Elena Marchand', property: 'Oceanview Penthouse', type: 'Deposit', amount: 480000, status: 'Completed', method: 'Wire Transfer', notes: '10% deposit - purchase agreement signed' },
  { id: '3', date: '2026-02-20', client: 'James Harrington III', property: 'Skyline Tower Suite', type: 'Deposit', amount: 390000, status: 'Completed', method: 'Certified Check', notes: '10% reservation deposit' },
  { id: '4', date: '2026-03-01', client: 'Victoria Ashworth', property: 'Royal Palm Villa', type: 'Installment', amount: 1700000, status: 'Pending', method: 'Wire Transfer', notes: 'Construction milestone payment - Phase 2' },
  { id: '5', date: '2026-03-15', client: 'Sophia Laurent', property: 'Emerald Heights Villa', type: 'Deposit', amount: 510000, status: 'Scheduled', method: 'International Transfer', notes: 'Reservation deposit upon proposal acceptance' },
  { id: '6', date: '2026-02-15', client: 'Marcus Wellington', property: 'The Grand Residence', type: 'Installment', amount: 1580000, status: 'Overdue', method: 'Wire Transfer', notes: 'Missed Feb 15 deadline - follow up required' },
  { id: '7', date: '2026-02-10', client: 'Coral Bay Investments LLC', property: 'Coral Bay Retreat', type: 'Sale', amount: 1200000, status: 'Completed', method: 'Escrow', notes: 'Full purchase completed - keys delivered' },
  { id: '8', date: '2026-01-28', client: 'Pristine Holdings Group', property: 'Pristine Bay Estate', type: 'Commission', amount: 186000, status: 'Completed', method: 'Wire Transfer', notes: 'Broker commission - 3% of sale price' },
  { id: '9', date: '2026-02-05', client: 'Robert Chen-Williams', property: 'Heritage Manor', type: 'Commission', amount: 84000, status: 'Completed', method: 'Wire Transfer', notes: 'Agent commission - 3% of sale price' },
  { id: '10', date: '2026-03-10', client: 'Elena Marchand', property: 'Oceanview Penthouse', type: 'Installment', amount: 960000, status: 'Scheduled', method: 'Wire Transfer', notes: '2nd installment - 20% at foundation completion' },
]

const revenueByProperty: RevenueByProperty[] = [
  { property: 'Heritage Manor', type: 'Villa', totalRevenue: 2884000, collected: 2884000, pending: 0 },
  { property: 'Royal Palm Villa', type: 'Villa', totalRevenue: 8500000, collected: 3400000, pending: 5100000 },
  { property: 'Oceanview Penthouse', type: 'Penthouse', totalRevenue: 4800000, collected: 480000, pending: 4320000 },
  { property: 'Skyline Tower Suite', type: 'Penthouse', totalRevenue: 3900000, collected: 390000, pending: 3510000 },
  { property: 'Coral Bay Retreat', type: 'Building', totalRevenue: 1200000, collected: 1200000, pending: 0 },
  { property: 'The Grand Residence', type: 'Villa', totalRevenue: 7900000, collected: 2370000, pending: 5530000 },
  { property: 'Emerald Heights Villa', type: 'Villa', totalRevenue: 5100000, collected: 0, pending: 5100000 },
  { property: 'Pristine Bay Estate', type: 'Villa', totalRevenue: 6200000, collected: 6200000, pending: 0 },
]

const monthlyData = [
  { month: 'Sep 2025', revenue: 1200000 },
  { month: 'Oct 2025', revenue: 3400000 },
  { month: 'Nov 2025', revenue: 2100000 },
  { month: 'Dec 2025', revenue: 6200000 },
  { month: 'Jan 2026', revenue: 4870000 },
  { month: 'Feb 2026', revenue: 5524000 },
]

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
  return `$${amount.toLocaleString()}`
}

function formatFullCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function statusStyle(status: string) {
  switch (status) {
    case 'Completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'Overdue': return 'bg-red-100 text-red-700 border-red-200'
    case 'Scheduled': return 'bg-blue-100 text-blue-700 border-blue-200'
    default: return 'bg-muted text-muted-foreground'
  }
}

function typeStyle(type: string) {
  switch (type) {
    case 'Sale': return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'Deposit': return 'bg-blue-50 text-blue-700 border-blue-200'
    case 'Installment': return 'bg-purple-50 text-purple-700 border-purple-200'
    case 'Commission': return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'Rental': return 'bg-teal-50 text-teal-700 border-teal-200'
    default: return 'bg-muted text-muted-foreground'
  }
}

type TabView = 'overview' | 'transactions' | 'by-property'

export default function RevenueSection({ showSample }: RevenueSectionProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions)
  const [activeTab, setActiveTab] = useState<TabView>('overview')
  const [addOpen, setAddOpen] = useState(false)
  const [detailTx, setDetailTx] = useState<Transaction | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [newTx, setNewTx] = useState({
    date: '', client: '', property: '', type: 'Sale' as Transaction['type'],
    amount: '', status: 'Pending' as Transaction['status'], method: 'Wire Transfer', notes: ''
  })
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    }).catch(() => {})
  }, [])

  // Computed metrics
  const metrics = useMemo(() => {
    const completed = transactions.filter(t => t.status === 'Completed')
    const pending = transactions.filter(t => t.status === 'Pending')
    const overdue = transactions.filter(t => t.status === 'Overdue')
    const scheduled = transactions.filter(t => t.status === 'Scheduled')

    const totalCollected = completed.reduce((sum, t) => sum + t.amount, 0)
    const totalPending = pending.reduce((sum, t) => sum + t.amount, 0)
    const totalOverdue = overdue.reduce((sum, t) => sum + t.amount, 0)
    const totalScheduled = scheduled.reduce((sum, t) => sum + t.amount, 0)
    const totalPipeline = totalCollected + totalPending + totalOverdue + totalScheduled

    const collectionRate = totalPipeline > 0 ? Math.round((totalCollected / totalPipeline) * 100) : 0

    const byType = transactions.reduce((acc, t) => {
      acc[t.type] = (acc[t.type] || 0) + t.amount
      return acc
    }, {} as Record<string, number>)

    return { totalCollected, totalPending, totalOverdue, totalScheduled, totalPipeline, collectionRate, byType, completedCount: completed.length, pendingCount: pending.length, overdueCount: overdue.length }
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (filterStatus !== 'all' && t.status !== filterStatus) return false
      if (filterType !== 'all' && t.type !== filterType) return false
      return true
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [transactions, filterStatus, filterType])

  const handleAddTransaction = useCallback(() => {
    if (!newTx.client.trim() || !newTx.property.trim() || !newTx.amount) return
    const tx: Transaction = {
      id: Date.now().toString(),
      date: newTx.date || new Date().toISOString().split('T')[0],
      client: newTx.client,
      property: newTx.property,
      type: newTx.type,
      amount: parseFloat(newTx.amount.replace(/[^0-9.]/g, '')),
      status: newTx.status,
      method: newTx.method,
      notes: newTx.notes,
    }
    setTransactions(prev => [tx, ...prev])
    setNewTx({ date: '', client: '', property: '', type: 'Sale', amount: '', status: 'Pending', method: 'Wire Transfer', notes: '' })
    setAddOpen(false)
    setStatusMsg({ type: 'success', text: 'Transaction recorded successfully' })
    setTimeout(() => setStatusMsg(null), 3000)
  }, [newTx])

  const markAsCompleted = useCallback((id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'Completed' as const } : t))
    setStatusMsg({ type: 'success', text: 'Payment marked as completed' })
    setTimeout(() => setStatusMsg(null), 3000)
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
    setDetailTx(null)
    setStatusMsg({ type: 'success', text: 'Transaction removed' })
    setTimeout(() => setStatusMsg(null), 3000)
  }, [])

  // Find the max monthly revenue for bar chart scaling
  const maxMonthly = Math.max(...monthlyData.map(d => d.revenue))

  if (!showSample) {
    return (
      <div className="p-8 lg:p-12 space-y-8">
        <div>
          <h2 className="font-serif text-2xl font-light tracking-wider text-foreground">Revenue</h2>
          <p className="text-sm text-muted-foreground tracking-wider mt-1 font-light">Financial tracking and collection management</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Total Collected', icon: <FiDollarSign size={20} /> },
            { label: 'Pending Payments', icon: <FiClock size={20} /> },
            { label: 'Overdue', icon: <FiAlertCircle size={20} /> },
            { label: 'Collection Rate', icon: <FiPercent size={20} /> },
          ].map((s) => (
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
        {/* Banking Details Card - always visible */}
        <Card className="border border-border shadow-sm bg-gradient-to-r from-card to-secondary/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FiCreditCard size={20} className="text-primary" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="font-serif text-base font-light tracking-wider text-foreground">Payment Collection Details</h3>
                  <p className="text-xs text-muted-foreground tracking-wider font-light mt-1">Wire transfer information for collecting application revenue</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-light">IBAN</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm tracking-wider font-light text-foreground bg-secondary px-3 py-2 border border-border flex-1 font-mono select-all">
                        FR76 2823 3000 0129 8467 0824 394
                      </code>
                      <button
                        onClick={() => copyToClipboard('FR7628233000012984670824394', 'iban')}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                        title="Copy IBAN"
                      >
                        {copiedField === 'iban' ? <FiCheckCircle size={16} className="text-emerald-600" /> : <FiCopy size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-light">BIC / SWIFT</p>
                    <div className="flex items-center gap-2">
                      <code className="text-sm tracking-wider font-light text-foreground bg-secondary px-3 py-2 border border-border flex-1 font-mono select-all">
                        REVOFRP2
                      </code>
                      <button
                        onClick={() => copyToClipboard('REVOFRP2', 'bic')}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                        title="Copy BIC"
                      >
                        {copiedField === 'bic' ? <FiCheckCircle size={16} className="text-emerald-600" /> : <FiCopy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground tracking-wider font-light">
                  Share these details with clients for wire transfer payments. All amounts should reference the property name and invoice number.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground tracking-wider font-light">Enable Sample Data to view revenue analytics</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 lg:p-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-light tracking-wider text-foreground">Revenue</h2>
          <p className="text-sm text-muted-foreground tracking-wider mt-1 font-light">Financial tracking and collection management</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="tracking-wider font-light text-sm">
          <FiPlus size={14} className="mr-2" /> Record Payment
        </Button>
      </div>

      {/* Status Message */}
      {statusMsg && (
        <div className={`flex items-center gap-2 px-4 py-3 text-sm tracking-wider font-light border ${statusMsg.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {statusMsg.type === 'success' ? <FiCheckCircle size={14} /> : <FiAlertCircle size={14} />}
          {statusMsg.text}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground"><FiDollarSign size={20} /></span>
              <FiTrendingUp size={14} className="text-emerald-600" />
            </div>
            <p className="font-serif text-3xl font-light tracking-wider text-foreground">{formatCurrency(metrics.totalCollected)}</p>
            <p className="text-xs tracking-wider text-muted-foreground mt-1 font-light uppercase">Total Collected</p>
            <p className="text-[11px] text-emerald-600 mt-2 tracking-wider font-light">{metrics.completedCount} transactions completed</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground"><FiClock size={20} /></span>
              <FiArrowUpRight size={14} className="text-amber-600" />
            </div>
            <p className="font-serif text-3xl font-light tracking-wider text-foreground">{formatCurrency(metrics.totalPending)}</p>
            <p className="text-xs tracking-wider text-muted-foreground mt-1 font-light uppercase">Pending Payments</p>
            <p className="text-[11px] text-amber-600 mt-2 tracking-wider font-light">{metrics.pendingCount} awaiting collection</p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground"><FiAlertCircle size={20} /></span>
              {metrics.totalOverdue > 0 ? <FiTrendingDown size={14} className="text-red-600" /> : <FiCheckCircle size={14} className="text-emerald-600" />}
            </div>
            <p className="font-serif text-3xl font-light tracking-wider text-foreground">{formatCurrency(metrics.totalOverdue)}</p>
            <p className="text-xs tracking-wider text-muted-foreground mt-1 font-light uppercase">Overdue</p>
            <p className={`text-[11px] mt-2 tracking-wider font-light ${metrics.overdueCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {metrics.overdueCount > 0 ? `${metrics.overdueCount} require follow-up` : 'No overdue payments'}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground"><FiPercent size={20} /></span>
              <FiArrowUpRight size={14} className="text-primary" />
            </div>
            <p className="font-serif text-3xl font-light tracking-wider text-foreground">{metrics.collectionRate}%</p>
            <p className="text-xs tracking-wider text-muted-foreground mt-1 font-light uppercase">Collection Rate</p>
            <p className="text-[11px] text-primary mt-2 tracking-wider font-light">Pipeline: {formatCurrency(metrics.totalPipeline)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Banking Details Card */}
      <Card className="border border-border shadow-sm bg-gradient-to-r from-card to-secondary/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FiCreditCard size={20} className="text-primary" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-serif text-base font-light tracking-wider text-foreground">Payment Collection Details</h3>
                <p className="text-xs text-muted-foreground tracking-wider font-light mt-1">Wire transfer information for collecting application revenue</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-light">IBAN</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm tracking-wider font-light text-foreground bg-secondary px-3 py-2 border border-border flex-1 font-mono select-all">
                      FR76 2823 3000 0129 8467 0824 394
                    </code>
                    <button
                      onClick={() => copyToClipboard('FR7628233000012984670824394', 'iban')}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                      title="Copy IBAN"
                    >
                      {copiedField === 'iban' ? <FiCheckCircle size={16} className="text-emerald-600" /> : <FiCopy size={16} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-light">BIC / SWIFT</p>
                  <div className="flex items-center gap-2">
                    <code className="text-sm tracking-wider font-light text-foreground bg-secondary px-3 py-2 border border-border flex-1 font-mono select-all">
                      REVOFRP2
                    </code>
                    <button
                      onClick={() => copyToClipboard('REVOFRP2', 'bic')}
                      className="p-2 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                      title="Copy BIC"
                    >
                      {copiedField === 'bic' ? <FiCheckCircle size={16} className="text-emerald-600" /> : <FiCopy size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground tracking-wider font-light">
                Share these details with clients for wire transfer payments. All amounts should reference the property name and invoice number.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([
          { id: 'overview' as TabView, label: 'Overview', icon: <FiBarChart2 size={14} /> },
          { id: 'transactions' as TabView, label: 'Transactions', icon: <FiDollarSign size={14} /> },
          { id: 'by-property' as TabView, label: 'By Property', icon: <FiPieChart size={14} /> },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 text-sm tracking-wider font-light transition-colors border-b-2 -mb-[1px] ${
              activeTab === tab.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue Chart */}
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-base font-light tracking-wider">Monthly Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {monthlyData.map((d, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-xs tracking-wider font-light text-muted-foreground w-20 flex-shrink-0">{d.month.split(' ')[0]}</span>
                      <div className="flex-1 h-6 bg-secondary relative">
                        <div
                          className="h-full bg-primary/80 transition-all duration-500"
                          style={{ width: `${maxMonthly > 0 ? (d.revenue / maxMonthly) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs tracking-wider font-light text-foreground w-16 text-right flex-shrink-0">{formatCurrency(d.revenue)}</span>
                    </div>
                  ))}
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-wider font-light text-muted-foreground uppercase">6-Month Total</span>
                  <span className="font-serif text-lg font-light tracking-wider text-primary">
                    {formatCurrency(monthlyData.reduce((s, d) => s + d.revenue, 0))}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Revenue by Type */}
            <Card className="border border-border shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="font-serif text-base font-light tracking-wider">Revenue by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(metrics.byType)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, amount]) => {
                      const percent = metrics.totalPipeline > 0 ? Math.round((amount / metrics.totalPipeline) * 100) : 0
                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 text-[10px] tracking-wider font-light border ${typeStyle(type)}`}>{type}</span>
                            </div>
                            <span className="text-sm tracking-wider font-light text-foreground">{formatCurrency(amount)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress value={percent} className="h-1.5 flex-1" />
                            <span className="text-xs tracking-wider text-muted-foreground w-10 text-right">{percent}%</span>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Collection Pipeline */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base font-light tracking-wider">Collection Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-0 h-8 w-full">
                {metrics.totalPipeline > 0 && (
                  <>
                    <div
                      className="h-full bg-emerald-500 flex items-center justify-center text-[10px] text-white tracking-wider font-light"
                      style={{ width: `${(metrics.totalCollected / metrics.totalPipeline) * 100}%` }}
                      title={`Collected: ${formatFullCurrency(metrics.totalCollected)}`}
                    >
                      {(metrics.totalCollected / metrics.totalPipeline) * 100 > 10 && 'Collected'}
                    </div>
                    <div
                      className="h-full bg-amber-400 flex items-center justify-center text-[10px] text-amber-900 tracking-wider font-light"
                      style={{ width: `${(metrics.totalPending / metrics.totalPipeline) * 100}%` }}
                      title={`Pending: ${formatFullCurrency(metrics.totalPending)}`}
                    >
                      {(metrics.totalPending / metrics.totalPipeline) * 100 > 10 && 'Pending'}
                    </div>
                    {metrics.totalOverdue > 0 && (
                      <div
                        className="h-full bg-red-400 flex items-center justify-center text-[10px] text-white tracking-wider font-light"
                        style={{ width: `${(metrics.totalOverdue / metrics.totalPipeline) * 100}%` }}
                        title={`Overdue: ${formatFullCurrency(metrics.totalOverdue)}`}
                      >
                        {(metrics.totalOverdue / metrics.totalPipeline) * 100 > 8 && 'Overdue'}
                      </div>
                    )}
                    <div
                      className="h-full bg-blue-300 flex items-center justify-center text-[10px] text-blue-900 tracking-wider font-light"
                      style={{ width: `${(metrics.totalScheduled / metrics.totalPipeline) * 100}%` }}
                      title={`Scheduled: ${formatFullCurrency(metrics.totalScheduled)}`}
                    >
                      {(metrics.totalScheduled / metrics.totalPipeline) * 100 > 10 && 'Scheduled'}
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-500" /><span className="text-xs tracking-wider font-light text-muted-foreground">Collected ({formatCurrency(metrics.totalCollected)})</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-400" /><span className="text-xs tracking-wider font-light text-muted-foreground">Pending ({formatCurrency(metrics.totalPending)})</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-red-400" /><span className="text-xs tracking-wider font-light text-muted-foreground">Overdue ({formatCurrency(metrics.totalOverdue)})</span></div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 bg-blue-300" /><span className="text-xs tracking-wider font-light text-muted-foreground">Scheduled ({formatCurrency(metrics.totalScheduled)})</span></div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions Preview */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-base font-light tracking-wider">Recent Transactions</CardTitle>
                <button onClick={() => setActiveTab('transactions')} className="text-xs tracking-wider font-light text-primary hover:underline">View All</button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light">Date</th>
                      <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light">Client</th>
                      <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light hidden md:table-cell">Property</th>
                      <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light">Type</th>
                      <th className="text-right px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light">Amount</th>
                      <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.slice(0, 5).map(tx => (
                      <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors cursor-pointer" onClick={() => setDetailTx(tx)}>
                        <td className="px-4 py-3 text-xs tracking-wider font-light text-muted-foreground">{tx.date}</td>
                        <td className="px-4 py-3 text-sm tracking-wider font-light text-foreground">{tx.client}</td>
                        <td className="px-4 py-3 text-xs tracking-wider font-light text-muted-foreground hidden md:table-cell">{tx.property}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 text-[10px] tracking-wider font-light border ${typeStyle(tx.type)}`}>{tx.type}</span></td>
                        <td className="px-4 py-3 text-sm tracking-wider font-light text-foreground text-right">{formatFullCurrency(tx.amount)}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 text-[10px] tracking-wider font-light border ${statusStyle(tx.status)}`}>{tx.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-44 text-sm tracking-wider font-light">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-44 text-sm tracking-wider font-light">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Sale">Sale</SelectItem>
                <SelectItem value="Deposit">Deposit</SelectItem>
                <SelectItem value="Installment">Installment</SelectItem>
                <SelectItem value="Commission">Commission</SelectItem>
                <SelectItem value="Rental">Rental</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs tracking-wider font-light text-muted-foreground ml-auto">
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Transactions Table */}
          <Card className="border border-border shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light">Date</th>
                      <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light">Client</th>
                      <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light hidden md:table-cell">Property</th>
                      <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light">Type</th>
                      <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light hidden lg:table-cell">Method</th>
                      <th className="text-right px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light">Amount</th>
                      <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light">Status</th>
                      <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-muted-foreground font-light">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map(tx => (
                      <tr key={tx.id} className="border-b border-border last:border-0 hover:bg-secondary/50 transition-colors">
                        <td className="px-4 py-3 text-xs tracking-wider font-light text-muted-foreground">{tx.date}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => setDetailTx(tx)} className="text-sm tracking-wider font-light text-foreground hover:text-primary transition-colors">{tx.client}</button>
                        </td>
                        <td className="px-4 py-3 text-xs tracking-wider font-light text-muted-foreground hidden md:table-cell">{tx.property}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 text-[10px] tracking-wider font-light border ${typeStyle(tx.type)}`}>{tx.type}</span></td>
                        <td className="px-4 py-3 text-xs tracking-wider font-light text-muted-foreground hidden lg:table-cell">{tx.method}</td>
                        <td className="px-4 py-3 text-sm tracking-wider font-light text-foreground text-right">{formatFullCurrency(tx.amount)}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-0.5 text-[10px] tracking-wider font-light border ${statusStyle(tx.status)}`}>{tx.status}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {(tx.status === 'Pending' || tx.status === 'Overdue') && (
                              <Button variant="ghost" size="sm" onClick={() => markAsCompleted(tx.id)} className="text-xs h-7 px-2 text-emerald-600 hover:text-emerald-700" title="Mark as collected">
                                <FiCheckCircle size={14} />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => setDetailTx(tx)} className="text-xs h-7 px-2" title="View details">
                              <FiEdit2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredTransactions.length === 0 && (
                <div className="flex items-center justify-center py-12">
                  <p className="text-sm text-muted-foreground tracking-wider font-light">No transactions match your filters</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* By Property Tab */}
      {activeTab === 'by-property' && (
        <div className="space-y-4">
          {revenueByProperty
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .map((rp) => {
              const collectedPercent = rp.totalRevenue > 0 ? Math.round((rp.collected / rp.totalRevenue) * 100) : 0
              return (
                <Card key={rp.property} className="border border-border shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-serif text-base font-light tracking-wider text-foreground">{rp.property}</h3>
                        <Badge variant="secondary" className="text-[10px] tracking-wider font-light mt-1">{rp.type}</Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-serif text-xl font-light tracking-wider text-foreground">{formatCurrency(rp.totalRevenue)}</p>
                        <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light mt-1">Total Value</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs tracking-wider font-light">
                        <span className="text-muted-foreground">Collection Progress</span>
                        <span className="text-foreground">{collectedPercent}%</span>
                      </div>
                      <div className="flex items-center gap-0 h-3 w-full bg-secondary">
                        <div className="h-full bg-emerald-500 transition-all" style={{ width: `${collectedPercent}%` }} />
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-4">
                          <span className="text-xs tracking-wider font-light text-emerald-600">Collected: {formatCurrency(rp.collected)}</span>
                          {rp.pending > 0 && <span className="text-xs tracking-wider font-light text-amber-600">Pending: {formatCurrency(rp.pending)}</span>}
                        </div>
                        {collectedPercent === 100 && (
                          <span className="flex items-center gap-1 text-xs tracking-wider font-light text-emerald-600"><FiCheckCircle size={12} /> Fully Collected</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
        </div>
      )}

      {/* Transaction Detail Dialog */}
      <Dialog open={!!detailTx} onOpenChange={() => setDetailTx(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-light tracking-wider">Transaction Details</DialogTitle>
          </DialogHeader>
          {detailTx && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Date</p>
                  <p className="text-sm tracking-wider font-light mt-1">{detailTx.date}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Status</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] tracking-wider font-light border ${statusStyle(detailTx.status)}`}>{detailTx.status}</span>
                </div>
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Client</p>
                  <p className="text-sm tracking-wider font-light mt-1">{detailTx.client}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Property</p>
                  <p className="text-sm tracking-wider font-light mt-1">{detailTx.property}</p>
                </div>
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Type</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] tracking-wider font-light border ${typeStyle(detailTx.type)}`}>{detailTx.type}</span>
                </div>
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Method</p>
                  <p className="text-sm tracking-wider font-light mt-1">{detailTx.method}</p>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Amount</p>
                <p className="font-serif text-2xl font-light tracking-wider text-primary mt-1">{formatFullCurrency(detailTx.amount)}</p>
              </div>
              {detailTx.notes && (
                <div>
                  <p className="text-[10px] tracking-wider uppercase text-muted-foreground font-light">Notes</p>
                  <p className="text-sm tracking-wider font-light mt-1 text-muted-foreground">{detailTx.notes}</p>
                </div>
              )}
              <Separator />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  {(detailTx.status === 'Pending' || detailTx.status === 'Overdue') && (
                    <Button size="sm" onClick={() => { markAsCompleted(detailTx.id); setDetailTx(null) }} className="tracking-wider font-light text-xs">
                      <FiCheckCircle size={12} className="mr-1" /> Mark Collected
                    </Button>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => deleteTransaction(detailTx.id)} className="tracking-wider font-light text-xs text-destructive hover:text-destructive">
                  <FiTrash2 size={12} className="mr-1" /> Remove
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg font-light tracking-wider">Record Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs tracking-wider font-light uppercase">Date</Label>
                <Input type="date" value={newTx.date} onChange={(e) => setNewTx(p => ({ ...p, date: e.target.value }))} className="mt-1 text-sm tracking-wider font-light" />
              </div>
              <div>
                <Label className="text-xs tracking-wider font-light uppercase">Type</Label>
                <Select value={newTx.type} onValueChange={(v) => setNewTx(p => ({ ...p, type: v as Transaction['type'] }))}>
                  <SelectTrigger className="mt-1 text-sm tracking-wider font-light"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sale">Sale</SelectItem>
                    <SelectItem value="Deposit">Deposit</SelectItem>
                    <SelectItem value="Installment">Installment</SelectItem>
                    <SelectItem value="Commission">Commission</SelectItem>
                    <SelectItem value="Rental">Rental</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs tracking-wider font-light uppercase">Client *</Label>
              <Input value={newTx.client} onChange={(e) => setNewTx(p => ({ ...p, client: e.target.value }))} placeholder="Client name" className="mt-1 text-sm tracking-wider font-light" />
            </div>
            <div>
              <Label className="text-xs tracking-wider font-light uppercase">Property *</Label>
              <Input value={newTx.property} onChange={(e) => setNewTx(p => ({ ...p, property: e.target.value }))} placeholder="Property name" className="mt-1 text-sm tracking-wider font-light" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs tracking-wider font-light uppercase">Amount *</Label>
                <Input value={newTx.amount} onChange={(e) => setNewTx(p => ({ ...p, amount: e.target.value }))} placeholder="e.g. 500000" className="mt-1 text-sm tracking-wider font-light" />
              </div>
              <div>
                <Label className="text-xs tracking-wider font-light uppercase">Status</Label>
                <Select value={newTx.status} onValueChange={(v) => setNewTx(p => ({ ...p, status: v as Transaction['status'] }))}>
                  <SelectTrigger className="mt-1 text-sm tracking-wider font-light"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs tracking-wider font-light uppercase">Payment Method</Label>
              <Select value={newTx.method} onValueChange={(v) => setNewTx(p => ({ ...p, method: v }))}>
                <SelectTrigger className="mt-1 text-sm tracking-wider font-light"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                  <SelectItem value="Certified Check">Certified Check</SelectItem>
                  <SelectItem value="Escrow">Escrow</SelectItem>
                  <SelectItem value="International Transfer">International Transfer</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs tracking-wider font-light uppercase">Notes</Label>
              <Textarea value={newTx.notes} onChange={(e) => setNewTx(p => ({ ...p, notes: e.target.value }))} placeholder="Transaction details..." className="mt-1 text-sm tracking-wider font-light" rows={3} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setAddOpen(false)} className="tracking-wider font-light text-sm">Cancel</Button>
              <Button onClick={handleAddTransaction} disabled={!newTx.client.trim() || !newTx.property.trim() || !newTx.amount} className="tracking-wider font-light text-sm">Record Payment</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

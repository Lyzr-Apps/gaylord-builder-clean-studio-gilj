'use client'

import React, { useState, useCallback } from 'react'
import {
  FiRss, FiCopy, FiCheckCircle, FiExternalLink, FiHome, FiFileText,
  FiTrendingUp, FiGlobe, FiShare2, FiAlertCircle, FiLink, FiCode,
  FiBookOpen, FiAward, FiTarget, FiBarChart2
} from 'react-icons/fi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface RssSectionProps {
  showSample: boolean
}

interface RssFeed {
  id: string
  name: string
  description: string
  endpoint: string
  param: string
  icon: React.ReactNode
  itemCount: number
  categories: string[]
  color: string
}

interface FeedArticle {
  title: string
  description: string
  date: string
  category: string
  feedId: string
}

const BASE_URL = typeof window !== 'undefined' ? window.location.origin : ''

const feeds: RssFeed[] = [
  {
    id: 'properties',
    name: 'Property Listings',
    description: 'Exclusive luxury villas, penthouses, and estates. New listings, price updates, and availability.',
    endpoint: '/api/rss?feed=properties',
    param: 'properties',
    icon: <FiHome size={20} />,
    itemCount: 5,
    categories: ['Property Listing'],
    color: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  {
    id: 'news',
    name: 'Company News',
    description: 'Project milestones, company announcements, awards, and featured builds.',
    endpoint: '/api/rss?feed=news',
    param: 'news',
    icon: <FiFileText size={20} />,
    itemCount: 5,
    categories: ['Company News', 'Project Milestone', 'Featured Project', 'Awards'],
    color: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  {
    id: 'insights',
    name: 'Market Insights',
    description: 'Expert market analysis, investment trends, sustainability reports, and luxury industry outlook.',
    endpoint: '/api/rss?feed=insights',
    param: 'insights',
    icon: <FiTrendingUp size={20} />,
    itemCount: 4,
    categories: ['Market Analysis', 'Industry Trends', 'Sustainability', 'Investment'],
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  {
    id: 'all',
    name: 'All Updates',
    description: 'Combined feed with all property listings, news, and market insights in chronological order.',
    endpoint: '/api/rss?feed=all',
    param: 'all',
    icon: <FiGlobe size={20} />,
    itemCount: 14,
    categories: ['All Categories'],
    color: 'bg-purple-100 text-purple-700 border-purple-200',
  },
]

const sampleArticles: FeedArticle[] = [
  { title: 'Royal Palm Villa - Exclusive Palm Beach Estate Now Available', description: 'Discover 12,400 sqft of unparalleled luxury with 7 bedrooms, 9 bathrooms, and breathtaking waterfront views.', date: '2026-02-28', category: 'Property Listing', feedId: 'properties' },
  { title: 'Gaylord.M Builder Launches AI-Powered Property Concierge', description: 'Our new AI-powered client inquiry system allows prospective buyers to get instant answers about our luxury properties 24/7.', date: '2026-02-28', category: 'Company News', feedId: 'news' },
  { title: 'Palm Beach Real Estate: Record Sales in Waterfront Properties', description: 'Palm Beach continues to break records with waterfront villa sales exceeding $50M in Q4 2025.', date: '2026-02-26', category: 'Market Analysis', feedId: 'insights' },
  { title: 'Oceanview Penthouse - Miami Beach Luxury Living', description: 'Elevated living at its finest. 5,600 sqft penthouse with 4 bedrooms, floor-to-ceiling ocean views.', date: '2026-02-25', category: 'Property Listing', feedId: 'properties' },
  { title: 'Coral Bay Development Successfully Delivered to Client', description: 'The successful completion and handover of the Coral Bay Retreat in Turks & Caicos, delivered on time and under budget.', date: '2026-02-22', category: 'Project Milestone', feedId: 'news' },
  { title: 'The Grand Residence - Beverly Hills Under Construction', description: 'A once-in-a-generation opportunity in Beverly Hills. 11,200 sqft villa with customizable finishes.', date: '2026-02-20', category: 'Property Listing', feedId: 'properties' },
  { title: 'Why Ultra-Luxury Buyers Are Choosing Custom Builds', description: 'The trend toward bespoke luxury homes continues to accelerate as discerning buyers prefer custom-built properties.', date: '2026-02-19', category: 'Industry Trends', feedId: 'insights' },
  { title: 'Heritage Manor Renovation: Preserving History with Modern Luxury', description: 'How historic preservation and contemporary luxury coexist beautifully in our Charleston project.', date: '2026-02-18', category: 'Featured Project', feedId: 'news' },
]

const distributionChannels = [
  { name: 'Google News', description: 'Submit feeds for Google News indexing', icon: <FiGlobe size={16} />, status: 'Available' },
  { name: 'Feedly', description: 'Listed on Feedly for subscriber growth', icon: <FiRss size={16} />, status: 'Available' },
  { name: 'Apple News', description: 'Distribute via Apple News format', icon: <FiBookOpen size={16} />, status: 'Available' },
  { name: 'Flipboard', description: 'Property listings on Flipboard magazines', icon: <FiShare2 size={16} />, status: 'Available' },
  { name: 'Social Media Auto-Post', description: 'Auto-publish new items to social platforms', icon: <FiTarget size={16} />, status: 'Available' },
  { name: 'Email Newsletters', description: 'Convert feed items to email digests', icon: <FiFileText size={16} />, status: 'Available' },
]

const seoStats = [
  { label: 'Feed Subscribers', value: '2,840', trend: '+12% this month', icon: <FiRss size={18} /> },
  { label: 'Traffic from Feeds', value: '18.4K', trend: '+23% vs last month', icon: <FiBarChart2 size={18} /> },
  { label: 'Syndication Reach', value: '156K', trend: 'Across 6 platforms', icon: <FiGlobe size={18} /> },
  { label: 'Lead Conversions', value: '47', trend: 'From feed referrals', icon: <FiAward size={18} /> },
]

type TabView = 'feeds' | 'preview' | 'distribution' | 'embed'

function categoryStyle(category: string) {
  switch (category) {
    case 'Property Listing': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'Company News': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'Project Milestone': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'Featured Project': return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'Awards': return 'bg-pink-100 text-pink-700 border-pink-200'
    case 'Market Analysis': return 'bg-teal-100 text-teal-700 border-teal-200'
    case 'Industry Trends': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
    case 'Sustainability': return 'bg-green-100 text-green-700 border-green-200'
    case 'Investment': return 'bg-orange-100 text-orange-700 border-orange-200'
    default: return 'bg-muted text-muted-foreground'
  }
}

export default function RssSection({ showSample }: RssSectionProps) {
  const [activeTab, setActiveTab] = useState<TabView>('feeds')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [selectedFeed, setSelectedFeed] = useState<string | null>(null)

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    }).catch(() => {})
  }, [])

  const feedUrl = (param: string) => `${BASE_URL}/api/rss?feed=${param}`

  const filteredArticles = selectedFeed
    ? sampleArticles.filter(a => a.feedId === selectedFeed)
    : sampleArticles

  if (!showSample) {
    return (
      <div className="p-8 lg:p-12 space-y-8">
        <div>
          <h2 className="font-serif text-2xl font-light tracking-wider text-foreground">RSS Feeds</h2>
          <p className="text-sm text-muted-foreground tracking-wider mt-1 font-light">Content syndication and traffic generation</p>
        </div>

        {/* Feed URLs are always visible */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="font-serif text-base font-light tracking-wider">Available RSS Feeds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {feeds.map(feed => (
              <div key={feed.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{feed.icon}</span>
                  <div>
                    <p className="text-sm tracking-wider font-light text-foreground">{feed.name}</p>
                    <p className="text-xs text-muted-foreground tracking-wider font-light">{feed.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <code className="text-xs text-muted-foreground bg-secondary px-2 py-1 border border-border font-mono hidden lg:block">
                    /api/rss?feed={feed.param}
                  </code>
                  <button
                    onClick={() => copyToClipboard(feedUrl(feed.param), feed.id)}
                    className="p-2 text-muted-foreground hover:text-primary transition-colors"
                    title="Copy feed URL"
                  >
                    {copiedField === feed.id ? <FiCheckCircle size={14} className="text-emerald-600" /> : <FiCopy size={14} />}
                  </button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center justify-center py-12">
          <p className="text-sm text-muted-foreground tracking-wider font-light">Enable Sample Data to view feed analytics and content preview</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 lg:p-12 space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl font-light tracking-wider text-foreground">RSS Feeds</h2>
        <p className="text-sm text-muted-foreground tracking-wider mt-1 font-light">Content syndication, promotion, and traffic generation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {seoStats.map(stat => (
          <Card key={stat.label} className="border border-border shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-muted-foreground">{stat.icon}</span>
              </div>
              <p className="font-serif text-3xl font-light tracking-wider text-foreground">{stat.value}</p>
              <p className="text-xs tracking-wider text-muted-foreground mt-1 font-light uppercase">{stat.label}</p>
              <p className="text-[11px] text-primary mt-2 tracking-wider font-light">{stat.trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {([
          { id: 'feeds' as TabView, label: 'Feed URLs', icon: <FiRss size={14} /> },
          { id: 'preview' as TabView, label: 'Content Preview', icon: <FiFileText size={14} /> },
          { id: 'distribution' as TabView, label: 'Distribution', icon: <FiShare2 size={14} /> },
          { id: 'embed' as TabView, label: 'Embed & Integration', icon: <FiCode size={14} /> },
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

      {/* Feed URLs Tab */}
      {activeTab === 'feeds' && (
        <div className="space-y-4">
          {feeds.map(feed => (
            <Card key={feed.id} className="border border-border shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${feed.color.split(' ')[0]} border ${feed.color.split(' ').slice(2).join(' ')}`}>
                    {feed.icon}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-serif text-base font-light tracking-wider text-foreground">{feed.name}</h3>
                        <p className="text-xs text-muted-foreground tracking-wider font-light mt-1">{feed.description}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px] tracking-wider font-light flex-shrink-0">{feed.itemCount} items</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-foreground bg-secondary px-3 py-2 border border-border font-mono flex-1 select-all overflow-x-auto">
                        {feedUrl(feed.param)}
                      </code>
                      <button
                        onClick={() => copyToClipboard(feedUrl(feed.param), `feed-${feed.id}`)}
                        className="p-2 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                        title="Copy URL"
                      >
                        {copiedField === `feed-${feed.id}` ? <FiCheckCircle size={16} className="text-emerald-600" /> : <FiCopy size={16} />}
                      </button>
                      <a
                        href={`/api/rss?feed=${feed.param}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                        title="Open feed"
                      >
                        <FiExternalLink size={16} />
                      </a>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {feed.categories.map(cat => (
                        <span key={cat} className={`px-2 py-0.5 text-[10px] tracking-wider font-light border ${categoryStyle(cat)}`}>{cat}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Content Preview Tab */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFeed(null)}
              className={`px-3 py-1.5 text-xs tracking-wider font-light border transition-colors ${!selectedFeed ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:text-foreground'}`}
            >
              All Feeds
            </button>
            {feeds.filter(f => f.id !== 'all').map(feed => (
              <button
                key={feed.id}
                onClick={() => setSelectedFeed(feed.id)}
                className={`px-3 py-1.5 text-xs tracking-wider font-light border transition-colors ${selectedFeed === feed.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:text-foreground'}`}
              >
                {feed.name}
              </button>
            ))}
          </div>

          <Card className="border border-border shadow-sm">
            <CardContent className="p-0">
              {filteredArticles.map((article, i) => (
                <div key={i} className="flex items-start gap-4 p-5 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-sm tracking-wider font-light text-foreground leading-relaxed">{article.title}</h4>
                      <span className="text-xs text-muted-foreground tracking-wider font-light flex-shrink-0">{article.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground tracking-wider font-light leading-relaxed">{article.description}</p>
                    <span className={`inline-block px-2 py-0.5 text-[10px] tracking-wider font-light border ${categoryStyle(article.category)}`}>{article.category}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Distribution Tab */}
      {activeTab === 'distribution' && (
        <div className="space-y-6">
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base font-light tracking-wider">Syndication Channels</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground tracking-wider font-light mb-4">
                Submit your RSS feed URLs to these platforms to maximize reach and drive qualified traffic to your property listings.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {distributionChannels.map((channel, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 border border-border bg-card hover:bg-secondary/30 transition-colors">
                    <span className="text-muted-foreground mt-0.5">{channel.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm tracking-wider font-light text-foreground">{channel.name}</p>
                        <span className="px-2 py-0.5 text-[10px] tracking-wider font-light border bg-emerald-100 text-emerald-700 border-emerald-200">{channel.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground tracking-wider font-light mt-1">{channel.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base font-light tracking-wider">SEO & Traffic Benefits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { title: 'Search Engine Indexing', desc: 'RSS feeds help search engines discover and index new property listings faster, improving organic visibility.' },
                { title: 'Content Syndication', desc: 'Distribute luxury property content across multiple platforms simultaneously, reaching affluent buyers where they browse.' },
                { title: 'Email Marketing Integration', desc: 'Convert RSS items into automated email newsletters for subscribed clients and prospects.' },
                { title: 'Social Media Automation', desc: 'Auto-publish new listings and market insights to social platforms, maintaining consistent presence.' },
                { title: 'Partner & Affiliate Networks', desc: 'Share feeds with luxury lifestyle publications, real estate portals, and partner websites for backlink generation.' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-2">
                  <FiCheckCircle size={14} className="text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm tracking-wider font-light text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground tracking-wider font-light mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Embed & Integration Tab */}
      {activeTab === 'embed' && (
        <div className="space-y-6">
          {/* HTML Meta Tags */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-base font-light tracking-wider">HTML Head Tags</CardTitle>
                <button
                  onClick={() => copyToClipboard(
                    `<link rel="alternate" type="application/rss+xml" title="Gaylord.M Builder - Properties" href="${BASE_URL}/api/rss?feed=properties" />\n<link rel="alternate" type="application/rss+xml" title="Gaylord.M Builder - News" href="${BASE_URL}/api/rss?feed=news" />\n<link rel="alternate" type="application/rss+xml" title="Gaylord.M Builder - Insights" href="${BASE_URL}/api/rss?feed=insights" />`,
                    'html-meta'
                  )}
                  className="flex items-center gap-1.5 text-xs tracking-wider font-light text-primary hover:underline"
                >
                  {copiedField === 'html-meta' ? <><FiCheckCircle size={12} /> Copied</> : <><FiCopy size={12} /> Copy</>}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground tracking-wider font-light mb-3">
                Add these tags to your website's HTML head to enable RSS autodiscovery by browsers and feed readers.
              </p>
              <pre className="bg-secondary p-4 border border-border text-xs font-mono text-foreground overflow-x-auto leading-relaxed select-all">
{`<link rel="alternate"
  type="application/rss+xml"
  title="Gaylord.M Builder - Properties"
  href="${BASE_URL}/api/rss?feed=properties" />

<link rel="alternate"
  type="application/rss+xml"
  title="Gaylord.M Builder - News"
  href="${BASE_URL}/api/rss?feed=news" />

<link rel="alternate"
  type="application/rss+xml"
  title="Gaylord.M Builder - Insights"
  href="${BASE_URL}/api/rss?feed=insights" />`}
              </pre>
            </CardContent>
          </Card>

          {/* JavaScript Widget */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="font-serif text-base font-light tracking-wider">JavaScript Embed Widget</CardTitle>
                <button
                  onClick={() => copyToClipboard(
                    `<div id="gaylordm-feed"></div>\n<script>\nfetch('${BASE_URL}/api/rss?feed=properties')\n  .then(r => r.text())\n  .then(xml => {\n    const parser = new DOMParser();\n    const doc = parser.parseFromString(xml, 'text/xml');\n    const items = doc.querySelectorAll('item');\n    let html = '<ul style="list-style:none;padding:0">';\n    items.forEach(item => {\n      const title = item.querySelector('title').textContent;\n      const link = item.querySelector('link').textContent;\n      const desc = item.querySelector('description').textContent;\n      html += '<li style="margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #eee">';\n      html += '<a href="'+link+'" style="font-size:14px;font-weight:500;color:#333;text-decoration:none">'+title+'</a>';\n      html += '<p style="font-size:12px;color:#888;margin-top:4px">'+desc.substring(0,120)+'...</p></li>';\n    });\n    html += '</ul>';\n    document.getElementById('gaylordm-feed').innerHTML = html;\n  });\n</script>`,
                    'js-widget'
                  )}
                  className="flex items-center gap-1.5 text-xs tracking-wider font-light text-primary hover:underline"
                >
                  {copiedField === 'js-widget' ? <><FiCheckCircle size={12} /> Copied</> : <><FiCopy size={12} /> Copy</>}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground tracking-wider font-light mb-3">
                Embed a live property feed on partner websites or landing pages. This widget fetches and displays the latest listings automatically.
              </p>
              <pre className="bg-secondary p-4 border border-border text-xs font-mono text-foreground overflow-x-auto leading-relaxed select-all">
{`<div id="gaylordm-feed"></div>
<script>
fetch('${BASE_URL}/api/rss?feed=properties')
  .then(r => r.text())
  .then(xml => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const items = doc.querySelectorAll('item');
    let html = '<ul>';
    items.forEach(item => {
      const title = item.querySelector('title').textContent;
      const link = item.querySelector('link').textContent;
      html += '<li><a href="'+link+'">'+title+'</a></li>';
    });
    html += '</ul>';
    document.getElementById('gaylordm-feed').innerHTML = html;
  });
</script>`}
              </pre>
            </CardContent>
          </Card>

          {/* Direct API Endpoints */}
          <Card className="border border-border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-base font-light tracking-wider">API Endpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground tracking-wider font-light mb-3">
                Use these endpoints directly in any RSS reader, automation tool (Zapier, Make, n8n), or custom integration.
              </p>
              {feeds.map(feed => (
                <div key={feed.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">{feed.icon}</span>
                    <span className="text-sm tracking-wider font-light text-foreground">{feed.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-xs text-muted-foreground bg-secondary px-2 py-1 border border-border font-mono">
                      GET /api/rss?feed={feed.param}
                    </code>
                    <button
                      onClick={() => copyToClipboard(feedUrl(feed.param), `api-${feed.id}`)}
                      className="p-1.5 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {copiedField === `api-${feed.id}` ? <FiCheckCircle size={14} className="text-emerald-600" /> : <FiCopy size={14} />}
                    </button>
                  </div>
                </div>
              ))}
              <Separator className="my-3" />
              <div className="flex items-start gap-2">
                <FiAlertCircle size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                <p className="text-[11px] text-muted-foreground tracking-wider font-light">
                  All feeds return valid RSS 2.0 XML with Atom namespace. Responses are cached for 1 hour. Content-Type: application/rss+xml.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

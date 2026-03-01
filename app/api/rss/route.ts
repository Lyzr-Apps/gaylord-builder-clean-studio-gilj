import { NextRequest, NextResponse } from 'next/server'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://gaylordm-builder.com'
const COMPANY = 'Gaylord.M Builder'

interface FeedItem {
  title: string
  description: string
  link: string
  pubDate: string
  category: string
  guid: string
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildRssXml(
  title: string,
  description: string,
  items: FeedItem[]
): string {
  const itemsXml = items
    .map(
      (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <description>${escapeXml(item.description)}</description>
      <link>${escapeXml(item.link)}</link>
      <pubDate>${new Date(item.pubDate).toUTCString()}</pubDate>
      <category>${escapeXml(item.category)}</category>
      <guid isPermaLink="false">${escapeXml(item.guid)}</guid>
    </item>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml(description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>${escapeXml(COMPANY)} RSS</generator>
    <atom:link href="${escapeXml(SITE_URL)}/api/rss" rel="self" type="application/rss+xml"/>
${itemsXml}
  </channel>
</rss>`
}

// Sample feed data - in production this would come from a database
const propertyItems: FeedItem[] = [
  {
    title: 'Royal Palm Villa - Exclusive Palm Beach Estate Now Available',
    description: 'Discover 12,400 sqft of unparalleled luxury with 7 bedrooms, 9 bathrooms, and breathtaking waterfront views. This Palm Beach masterpiece features Italian marble finishes, a private dock, and resort-style amenities. Starting at $8.5M.',
    link: `${SITE_URL}/properties/royal-palm-villa`,
    pubDate: '2026-02-28T10:00:00Z',
    category: 'Property Listing',
    guid: 'property-royal-palm-villa-2026',
  },
  {
    title: 'Oceanview Penthouse - Miami Beach Luxury Living',
    description: 'Elevated living at its finest. 5,600 sqft penthouse with 4 bedrooms, floor-to-ceiling ocean views, private elevator access, and exclusive rooftop terrace. Located in the heart of Miami Beach. Starting at $4.8M.',
    link: `${SITE_URL}/properties/oceanview-penthouse`,
    pubDate: '2026-02-25T09:00:00Z',
    category: 'Property Listing',
    guid: 'property-oceanview-penthouse-2026',
  },
  {
    title: 'The Grand Residence - Beverly Hills Under Construction',
    description: 'A once-in-a-generation opportunity in Beverly Hills. 11,200 sqft villa with 6 bedrooms, 8 bathrooms, and customizable finishes. Expected completion Q3 2026. Reserve now at $7.9M.',
    link: `${SITE_URL}/properties/grand-residence`,
    pubDate: '2026-02-20T14:00:00Z',
    category: 'Property Listing',
    guid: 'property-grand-residence-2026',
  },
  {
    title: 'Emerald Heights Villa - Aspen Mountain Retreat',
    description: 'Escape to the mountains in this 8,400 sqft Aspen retreat. 5 bedrooms, 6 bathrooms, ski-in/ski-out access, heated infinity pool, and panoramic Rocky Mountain views. Listed at $5.1M.',
    link: `${SITE_URL}/properties/emerald-heights`,
    pubDate: '2026-02-15T11:00:00Z',
    category: 'Property Listing',
    guid: 'property-emerald-heights-2026',
  },
  {
    title: 'Skyline Tower Suite - Manhattan Ultra-Luxury Penthouse',
    description: 'Live above the skyline in this 4,200 sqft New York penthouse suite. 3 bedrooms, 4 bathrooms, 360-degree city views, private concierge, and world-class amenities. Starting at $3.9M.',
    link: `${SITE_URL}/properties/skyline-tower`,
    pubDate: '2026-02-10T08:00:00Z',
    category: 'Property Listing',
    guid: 'property-skyline-tower-2026',
  },
]

const newsItems: FeedItem[] = [
  {
    title: 'Gaylord.M Builder Launches AI-Powered Property Concierge',
    description: 'We are proud to announce our new AI-powered client inquiry system, allowing prospective buyers to get instant answers about our luxury properties 24/7. Experience personalized property recommendations and real-time availability updates.',
    link: `${SITE_URL}/news/ai-concierge-launch`,
    pubDate: '2026-02-28T12:00:00Z',
    category: 'Company News',
    guid: 'news-ai-concierge-2026',
  },
  {
    title: 'Coral Bay Development Successfully Delivered to Client',
    description: 'We are delighted to announce the successful completion and handover of the Coral Bay Retreat in Turks & Caicos. This resort-style property was delivered on time and under budget, showcasing our commitment to excellence.',
    link: `${SITE_URL}/news/coral-bay-completion`,
    pubDate: '2026-02-22T10:00:00Z',
    category: 'Project Milestone',
    guid: 'news-coral-bay-2026',
  },
  {
    title: 'Heritage Manor Renovation: Preserving History with Modern Luxury',
    description: 'Our Heritage Manor project in Charleston, SC demonstrates how historic preservation and contemporary luxury can coexist beautifully. Featuring period-accurate millwork, modern HVAC systems, and smart home integration.',
    link: `${SITE_URL}/news/heritage-manor-feature`,
    pubDate: '2026-02-18T09:00:00Z',
    category: 'Featured Project',
    guid: 'news-heritage-manor-2026',
  },
  {
    title: 'Luxury Real Estate Market Outlook: Q1 2026',
    description: 'Our market analysis shows continued strong demand for ultra-luxury properties in coastal markets. Key trends include sustainable design, smart home integration, and wellness-focused amenities driving premium valuations.',
    link: `${SITE_URL}/news/market-outlook-q1-2026`,
    pubDate: '2026-02-12T14:00:00Z',
    category: 'Market Insight',
    guid: 'news-market-q1-2026',
  },
  {
    title: 'Gaylord.M Builder Recognized as Top Luxury Developer 2025',
    description: 'We are honored to be recognized among the top luxury real estate developers for the third consecutive year. This award reflects our dedication to craftsmanship, client service, and architectural excellence.',
    link: `${SITE_URL}/news/top-developer-award`,
    pubDate: '2026-02-05T11:00:00Z',
    category: 'Awards',
    guid: 'news-award-2026',
  },
]

const marketItems: FeedItem[] = [
  {
    title: 'Palm Beach Real Estate: Record Sales in Waterfront Properties',
    description: 'Palm Beach continues to break records with waterfront villa sales exceeding $50M in Q4 2025. Gaylord.M Builder properties consistently outperform market averages with premium finishes and exclusive locations.',
    link: `${SITE_URL}/insights/palm-beach-records`,
    pubDate: '2026-02-26T10:00:00Z',
    category: 'Market Analysis',
    guid: 'insight-palm-beach-2026',
  },
  {
    title: 'Why Ultra-Luxury Buyers Are Choosing Custom Builds',
    description: 'The trend toward bespoke luxury homes continues to accelerate. Discover why discerning buyers prefer custom-built properties that reflect their unique lifestyle, and how Gaylord.M Builder delivers personalized luxury.',
    link: `${SITE_URL}/insights/custom-builds-trend`,
    pubDate: '2026-02-19T09:00:00Z',
    category: 'Industry Trends',
    guid: 'insight-custom-builds-2026',
  },
  {
    title: 'Sustainable Luxury: Green Building Without Compromise',
    description: 'Sustainability and luxury are no longer mutually exclusive. Learn how our projects incorporate solar energy, reclaimed materials, and smart water systems while maintaining the highest standards of luxury design.',
    link: `${SITE_URL}/insights/sustainable-luxury`,
    pubDate: '2026-02-14T13:00:00Z',
    category: 'Sustainability',
    guid: 'insight-sustainability-2026',
  },
  {
    title: 'Investment Potential: Luxury Real Estate as an Asset Class',
    description: 'With global markets uncertain, luxury real estate remains a stable investment vehicle. Our analysis shows premium properties in key markets delivering 8-12% annual appreciation over the past decade.',
    link: `${SITE_URL}/insights/investment-potential`,
    pubDate: '2026-02-08T10:00:00Z',
    category: 'Investment',
    guid: 'insight-investment-2026',
  },
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const feed = searchParams.get('feed') || 'all'

  let title: string
  let description: string
  let items: FeedItem[]

  switch (feed) {
    case 'properties':
      title = `${COMPANY} - Luxury Property Listings`
      description = 'Exclusive luxury villas, penthouses, and estates from Gaylord.M Builder. Subscribe for the latest property listings and availability updates.'
      items = propertyItems
      break
    case 'news':
      title = `${COMPANY} - Company News & Updates`
      description = 'Stay informed with the latest news, project milestones, and announcements from Gaylord.M Builder.'
      items = newsItems
      break
    case 'insights':
      title = `${COMPANY} - Market Insights & Trends`
      description = 'Expert analysis, market trends, and investment insights in luxury real estate from the Gaylord.M Builder team.'
      items = marketItems
      break
    default:
      title = `${COMPANY} - All Updates`
      description = 'Everything from Gaylord.M Builder: luxury property listings, company news, and market insights.'
      items = [...propertyItems, ...newsItems, ...marketItems].sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      )
  }

  const xml = buildRssXml(title, description, items)

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}

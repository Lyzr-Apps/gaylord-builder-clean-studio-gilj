'use client'

import { FiGrid, FiHome, FiUsers, FiBriefcase, FiDollarSign } from 'react-icons/fi'

export type ActivePage = 'dashboard' | 'properties' | 'leads' | 'projects' | 'revenue'

interface SidebarProps {
  activePage: ActivePage
  onNavigate: (page: ActivePage) => void
}

const navItems: { id: ActivePage; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <FiGrid size={18} /> },
  { id: 'properties', label: 'Properties', icon: <FiHome size={18} /> },
  { id: 'leads', label: 'Leads', icon: <FiUsers size={18} /> },
  { id: 'projects', label: 'Projects', icon: <FiBriefcase size={18} /> },
  { id: 'revenue', label: 'Revenue', icon: <FiDollarSign size={18} /> },
]

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 h-screen flex-shrink-0 bg-secondary border-r border-border flex flex-col">
      <div className="px-8 py-8 border-b border-border">
        <h1 className="font-serif text-xl font-light tracking-wider text-foreground leading-relaxed">
          Gaylord.M
        </h1>
        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground font-light mt-0.5">
          Builder
        </p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = activePage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm tracking-wider font-light transition-all duration-200 ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="px-6 py-6 border-t border-border">
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-light">
          Luxury Real Estate
        </p>
        <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-light mt-1">
          Command Center
        </p>
      </div>
    </aside>
  )
}

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BottomNavProps {
  isAdmin?: boolean
}

const getNavItems = (isAdmin: boolean) => {
  const items = [
    {
      href: '/',
      label: 'Partidos',
      icon: (active: boolean) => (
        <svg
          viewBox='0 0 24 24'
          className={`w-6 h-6 ${active ? 'text-green-400' : 'text-gray-500'}`}
          fill='none'
          stroke='currentColor'
          strokeWidth={active ? 2.5 : 1.8}
        >
          <circle
            cx='12'
            cy='12'
            r='9'
          />
          <path
            d='M12 3c0 0-2 3-2 9s2 9 2 9'
            strokeLinecap='round'
          />
          <path
            d='M3 12h18'
            strokeLinecap='round'
          />
          <path
            d='M5 7c1.5 1 4 1.5 7 1.5S17.5 8 19 7'
            strokeLinecap='round'
          />
          <path
            d='M5 17c1.5-1 4-1.5 7-1.5S17.5 16 19 17'
            strokeLinecap='round'
          />
        </svg>
      )
    },
    {
      href: '/live',
      label: 'En Vivo',
      icon: (active: boolean) => (
        <div className='relative'>
          <svg
            viewBox='0 0 24 24'
            className={`w-6 h-6 ${active ? 'text-green-400' : 'text-gray-500'}`}
            fill='none'
            stroke='currentColor'
            strokeWidth={active ? 2.5 : 1.8}
          >
            {/* Icono play / señal live */}
            <circle
              cx='12'
              cy='12'
              r='9'
            />
            <polygon
              points='10,8 16,12 10,16'
              fill='currentColor'
              stroke='none'
            />
          </svg>
          {/* Punto rojo pulsante — siempre visible en la tab Live */}
          <span className='absolute -top-0.5 -right-0.5 w-2 h-2'>
            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75' />
            <span className='relative inline-flex rounded-full h-2 w-2 bg-red-500' />
          </span>
        </div>
      )
    },
    {
      href: '/standings',
      label: 'Clasificación',
      icon: (active: boolean) => (
        <svg
          viewBox='0 0 24 24'
          className={`w-6 h-6 ${active ? 'text-green-400' : 'text-gray-500'}`}
          fill='none'
          stroke='currentColor'
          strokeWidth={active ? 2.5 : 1.8}
        >
          <rect
            x='3'
            y='3'
            width='18'
            height='18'
            rx='2'
          />
          <path
            d='M3 9h18M3 15h18M9 9v9'
            strokeLinecap='round'
          />
        </svg>
      )
    }
  ]

  if (isAdmin) {
    items.push({
      href: '/admin',
      label: 'Admin',
      icon: (active: boolean) => (
        <svg
          viewBox='0 0 24 24'
          className={`w-6 h-6 ${active ? 'text-green-400' : 'text-gray-500'}`}
          fill='none'
          stroke='currentColor'
          strokeWidth={active ? 2.5 : 1.8}
        >
          <circle
            cx='12'
            cy='8'
            r='4'
          />
          <path
            d='M4 20c0-4 3.6-7 8-7s8 3 8 7'
            strokeLinecap='round'
          />
        </svg>
      )
    })
  }

  return items
}

export default function BottomNav({ isAdmin = false }: BottomNavProps) {
  const pathname = usePathname()
  const navItems = getNavItems(isAdmin)

  return (
    <nav
      className='fixed bottom-0 left-0 right-0 md:hidden z-50 bg-gray-900/95 backdrop-blur-sm border-t border-gray-800'
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className='flex items-stretch'>
        {navItems.map(item => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex-1 flex flex-col items-center justify-center gap-1 py-2.5
                transition-colors duration-150
                ${active ? 'text-green-400' : 'text-gray-500 hover:text-gray-300'}
              `}
            >
              {item.icon(active)}
              <span className={`text-xs font-medium ${active ? 'text-green-400' : ''}`}>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

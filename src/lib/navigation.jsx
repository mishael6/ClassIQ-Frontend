'use client'

import NextLink from 'next/link'
import { usePathname, useRouter, useSearchParams as useNextSearchParams } from 'next/navigation'

/** Small adapters for existing page components during the App Router migration. */
export function Link({ to, ...props }) {
  return <NextLink href={to} {...props} />
}

export function NavLink({ to, end = false, className, ...props }) {
  const pathname = usePathname()
  const isActive = end ? pathname === to : pathname === to || pathname.startsWith(`${to}/`)
  const resolvedClassName = typeof className === 'function' ? className({ isActive }) : className
  return <NextLink href={to} className={resolvedClassName} {...props} />
}

export function useNavigate() {
  const router = useRouter()
  return (href, options = {}) => options.replace ? router.replace(href) : router.push(href)
}

export function useSearchParams() {
  return [useNextSearchParams()]
}

import type { Metadata } from 'next'
import NotFoundClient from './NotFoundClient'

// metadata can only be exported from a server file, so the interactive 404
// body (usePathname for the Guido's variant) lives in NotFoundClient.
export const metadata: Metadata = {
  title: 'Page Not Found',
}

export default function NotFound() {
  return <NotFoundClient />
}

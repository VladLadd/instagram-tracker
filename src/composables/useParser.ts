import type { User } from '../types'

export function parseInstagramHtml(html: string): User[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const links = Array.from(doc.querySelectorAll<HTMLAnchorElement>('a[href*="instagram.com/"]'))
  const seen = new Set<string>()
  const users: User[] = []

  for (const link of links) {
    const match = (link.getAttribute('href') || '').match(/instagram\.com\/([^/?#]+)/)
    if (!match) continue
    const username = match[1]
    if (!username || seen.has(username)) continue
    seen.add(username)
    users.push({ username, displayName: link.textContent?.trim() || username })
  }

  return users
}

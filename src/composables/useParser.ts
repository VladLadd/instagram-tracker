import type { User } from '../types'

// Parse a plain text list: one username per line, or "username - displayName"
export function parseUserList(raw: string): User[] {
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [username, ...rest] = line.split(/\s*[-–]\s*/)
      return {
        username: username.replace('@', '').trim(),
        displayName: rest.join(' ').trim() || username.trim(),
      }
    })
}

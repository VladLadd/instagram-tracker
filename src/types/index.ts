export interface User {
  username: string
  displayName: string
  avatarUrl?: string
}

export interface Snapshot {
  id: string
  createdAt: string
  label: string
  followers: User[]
  following: User[]
}

export interface SnapshotSummary {
  id: string
  createdAt: string
  label: string
  followersCount: number
  followingCount: number
}

export interface DiffResult {
  unfollowed: User[]
  newFollowers: User[]
  mutual: User[]
  notMutual: User[]
  youDontFollowBack: User[]
}

export type TabKey = 'unfollowed' | 'newFollowers' | 'mutual' | 'notMutual' | 'youDontFollowBack'

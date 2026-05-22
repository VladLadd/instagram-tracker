<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '../composables/useApi'
import type { SnapshotSummary, DiffResult, TabKey } from '../types'
import UserCard from '../components/UserCard.vue'
import ImportModal from '../components/ImportModal.vue'

const savedTheme = localStorage.getItem('igtrack-theme') || 'dark'
const isDark = ref(savedTheme === 'dark')
document.documentElement.setAttribute('data-theme', savedTheme)

function toggleTheme() {
  isDark.value = !isDark.value
  const theme = isDark.value ? 'dark' : 'light'
  localStorage.setItem('igtrack-theme', theme)
  document.documentElement.setAttribute('data-theme', theme)
}

const snapshots = ref<SnapshotSummary[]>([])
const diff = ref<DiffResult | null>(null)
const fromId = ref<string | null>(null)
const toId = ref<string>('')
const activeTab = ref<TabKey>('unfollowed')
const showModal = ref(false)
const loading = ref(false)
const search = ref('')

const tabs: { key: TabKey; label: string; emoji: string; colorClass: string }[] = [
  { key: 'unfollowed',        label: 'Отписались',          emoji: '👋', colorClass: 'tab-red'    },
  { key: 'newFollowers',      label: 'Новые подписчики',    emoji: '✨', colorClass: 'tab-green'  },
  { key: 'mutual',            label: 'Взаимные',            emoji: '🤝', colorClass: 'tab-blue'   },
  { key: 'notMutual',         label: 'Не подписаны в ответ', emoji: '🌚', colorClass: 'tab-orange' },
  { key: 'youDontFollowBack', label: 'Ты не подписан',      emoji: '👀', colorClass: 'tab-purple' },
]

async function loadSnapshots() {
  snapshots.value = await api.getSnapshots()
  if (snapshots.value.length > 0) {
    toId.value = snapshots.value[snapshots.value.length - 1].id
    if (snapshots.value.length > 1) {
      fromId.value = snapshots.value[snapshots.value.length - 2].id
    }
  }
}

async function loadDiff() {
  if (!toId.value) return
  loading.value = true
  try {
    diff.value = await api.getDiff(fromId.value, toId.value)
  } finally {
    loading.value = false
  }
}

async function deleteSnapshot(id: string) {
  if (!confirm('Удалить снапшот?')) return
  await api.deleteSnapshot(id)
  await loadSnapshots()
  await loadDiff()
}

const currentList = computed(() => {
  if (!diff.value) return []
  const list = diff.value[activeTab.value] ?? []
  if (!search.value.trim()) return list
  const q = search.value.toLowerCase()
  return list.filter(
    (u) => u.username.toLowerCase().includes(q) || u.displayName.toLowerCase().includes(q)
  )
})

const stats = computed(() => {
  if (!diff.value) return null
  return {
    unfollowed:        diff.value.unfollowed.length,
    newFollowers:      diff.value.newFollowers.length,
    mutual:            diff.value.mutual.length,
    notMutual:         diff.value.notMutual.length,
    youDontFollowBack: diff.value.youDontFollowBack.length,
  }
})

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

watch([fromId, toId], loadDiff)

onMounted(async () => {
  await loadSnapshots()
  await loadDiff()
})
</script>

<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="header">
      <div class="header-left">
        <span class="logo">◈ IGTrack</span>
        <span class="tagline">контроль подписок</span>
      </div>
      <div class="header-right">
        <button class="btn-theme" @click="toggleTheme" :title="isDark ? 'Светлая тема' : 'Тёмная тема'">
          <svg v-if="isDark" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        </button>
        <button class="btn-primary" @click="showModal = true">+ Новый снапшот</button>
      </div>
    </header>

    <!-- Snapshot selectors -->
    <section class="selectors">
      <div class="selector-group">
        <label>Сравнить с</label>
        <select v-model="fromId">
          <option :value="null">— первый раз (без сравнения)</option>
          <option v-for="s in snapshots" :key="s.id" :value="s.id">
            {{ s.label || formatDate(s.createdAt) }} · {{ s.followersCount }} / {{ s.followingCount }}
          </option>
        </select>
      </div>
      <div class="arrow">→</div>
      <div class="selector-group">
        <label>Текущий снапшот</label>
        <select v-model="toId">
          <option v-for="s in snapshots" :key="s.id" :value="s.id">
            {{ s.label || formatDate(s.createdAt) }} · {{ s.followersCount }} / {{ s.followingCount }}
          </option>
        </select>
      </div>
      <button
        v-if="toId"
        class="btn-delete"
        title="Удалить текущий снапшот"
        @click="deleteSnapshot(toId)"
      >🗑</button>
    </section>

    <!-- Empty state -->
    <div v-if="snapshots.length === 0" class="empty-state">
      <div class="empty-icon">📷</div>
      <h2>Нет снапшотов</h2>
      <p>Добавь первый снапшот — вставь списки подписчиков и подписок</p>
      <button class="btn-primary" @click="showModal = true">Добавить первый снапшот</button>
    </div>

    <template v-else>
      <!-- Stats bar -->
      <div v-if="stats" class="stats-bar">
        <div v-for="tab in tabs" :key="tab.key" class="stat-chip" :class="tab.colorClass" @click="activeTab = tab.key">
          <span class="stat-emoji">{{ tab.emoji }}</span>
          <span class="stat-count">{{ stats[tab.key] }}</span>
          <span class="stat-label">{{ tab.label }}</span>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-btn"
          :class="[tab.colorClass, { active: activeTab === tab.key }]"
          @click="activeTab = tab.key"
        >
          <span>{{ tab.emoji }} {{ tab.label }}</span>
          <span v-if="stats" class="tab-count">{{ stats[tab.key] }}</span>
        </button>
      </div>

      <!-- Search -->
      <div class="search-bar">
        <input v-model="search" placeholder="🔍 Поиск по имени или username..." />
        <span v-if="search" class="search-clear" @click="search = ''">×</span>
      </div>

      <!-- List -->
      <div v-if="loading" class="loading">Загружаю...</div>
      <div v-else-if="currentList.length === 0" class="list-empty">
        <span>{{ search ? 'Ничего не найдено' : 'Список пуст' }}</span>
      </div>
      <div v-else class="user-list">
        <UserCard
          v-for="user in currentList"
          :key="user.username"
          :user="user"
        />
      </div>
    </template>

    <ImportModal v-if="showModal" @close="showModal = false" @created="async () => { showModal = false; await loadSnapshots(); await loadDiff() }" />
  </div>
</template>

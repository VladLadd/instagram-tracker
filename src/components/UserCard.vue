<script setup lang="ts">
import type { User } from '../types'

defineProps<{ user: User; badge?: string; badgeClass?: string }>()
</script>

<template>
  <div class="user-card">
    <div class="avatar">
      <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.username" />
      <span v-else class="avatar-initials">{{ user.username[0]?.toUpperCase() }}</span>
    </div>
    <div class="user-info">
      <span class="display-name">{{ user.displayName || user.username }}</span>
      <span class="username">@{{ user.username }}</span>
    </div>
    <span v-if="badge" class="badge" :class="badgeClass">{{ badge }}</span>
    <a
      :href="`https://instagram.com/${user.username}`"
      target="_blank"
      rel="noopener"
      class="ig-link"
      title="Открыть в Instagram"
    >↗</a>
  </div>
</template>

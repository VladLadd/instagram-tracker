<script setup lang="ts">
import { ref } from 'vue'
import type { User } from '../types'
import { parseInstagramHtml } from '../composables/useParser'
import { api } from '../composables/useApi'

const emit = defineEmits<{ (e: 'created'): void; (e: 'close'): void }>()

const label = ref('')
const followers = ref<User[]>([])
const following = ref<User[]>([])
const followersName = ref('')
const followingName = ref('')
const loading = ref(false)
const error = ref('')

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
    reader.readAsText(file, 'utf-8')
  })
}

async function onFollowersFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  followersName.value = file.name
  followers.value = parseInstagramHtml(await readFile(file))
}

async function onFollowingFile(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  followingName.value = file.name
  following.value = parseInstagramHtml(await readFile(file))
}

async function submit() {
  if (!followers.value.length && !following.value.length) {
    error.value = 'Загрузи хотя бы один файл'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await api.createSnapshot({
      label: label.value.trim(),
      followers: followers.value,
      following: following.value,
    })
    emit('created')
  } catch (e: unknown) {
    error.value = e instanceof Error ? e.message : 'Ошибка'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <div class="modal-header">
        <h2>Новый снапшот</h2>
        <button class="close-btn" @click="emit('close')">×</button>
      </div>
      <p class="modal-hint">
        Загрузи HTML-файлы из архива данных Instagram<br />
        (<code>followers_1.html</code> и <code>following.html</code>)
      </p>

      <div class="field">
        <label>Метка (необязательно)</label>
        <input v-model="label" placeholder="Например: май 2026" />
      </div>

      <div class="two-col">
        <label class="file-drop" :class="{ loaded: followers.length > 0 }">
          <input type="file" accept=".html" @change="onFollowersFile" />
          <span v-if="!followers.length" class="file-drop-idle">
            <span class="file-icon">↑</span>
            <span class="file-label">Подписчики</span>
            <span class="file-hint">followers_1.html</span>
          </span>
          <span v-else class="file-drop-done">
            <span class="file-icon">✓</span>
            <span class="file-label">{{ followersName }}</span>
            <span class="file-count">{{ followers.length }} пользователей</span>
          </span>
        </label>

        <label class="file-drop" :class="{ loaded: following.length > 0 }">
          <input type="file" accept=".html" @change="onFollowingFile" />
          <span v-if="!following.length" class="file-drop-idle">
            <span class="file-icon">↑</span>
            <span class="file-label">Подписки</span>
            <span class="file-hint">following.html</span>
          </span>
          <span v-else class="file-drop-done">
            <span class="file-icon">✓</span>
            <span class="file-label">{{ followingName }}</span>
            <span class="file-count">{{ following.length }} пользователей</span>
          </span>
        </label>
      </div>

      <p v-if="error" class="error-msg">{{ error }}</p>

      <div class="modal-actions">
        <button class="btn-cancel" @click="emit('close')">Отмена</button>
        <button class="btn-primary" :disabled="loading" @click="submit">
          {{ loading ? 'Сохраняю...' : 'Сохранить снапшот' }}
        </button>
      </div>
    </div>
  </div>
</template>

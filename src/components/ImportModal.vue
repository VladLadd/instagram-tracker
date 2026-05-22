<script setup lang="ts">
import { ref } from 'vue'
import { parseUserList } from '../composables/useParser'
import { api } from '../composables/useApi'

const emit = defineEmits<{ (e: 'created'): void; (e: 'close'): void }>()

const label = ref('')
const followersRaw = ref('')
const followingRaw = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  if (!followersRaw.value.trim() && !followingRaw.value.trim()) {
    error.value = 'Добавь хотя бы один список'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await api.createSnapshot({
      label: label.value.trim(),
      followers: parseUserList(followersRaw.value),
      following: parseUserList(followingRaw.value),
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
        Вставь списки username'ов — каждый с новой строки.<br />
        Формат: <code>username</code> или <code>username - Имя</code>
      </p>

      <div class="field">
        <label>Метка (необязательно)</label>
        <input v-model="label" placeholder="Например: май 2026" />
      </div>

      <div class="two-col">
        <div class="field">
          <label>Подписчики (Followers)</label>
          <textarea v-model="followersRaw" placeholder="username1&#10;username2 - Имя&#10;..." rows="10" />
          <span class="count">{{ parseUserList(followersRaw).length }} пользователей</span>
        </div>
        <div class="field">
          <label>Подписки (Following)</label>
          <textarea v-model="followingRaw" placeholder="username1&#10;username2 - Имя&#10;..." rows="10" />
          <span class="count">{{ parseUserList(followingRaw).length }} пользователей</span>
        </div>
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

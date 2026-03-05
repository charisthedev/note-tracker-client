<script setup lang="ts">
defineProps<{
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  busy?: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
  close: [];
}>();
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      @click.self="emit('close')"
      class="fixed inset-0 z-50 flex items-end bg-slate-900/50 p-2 sm:items-center sm:justify-center"
    >
      <div class="w-full rounded-2xl bg-white p-4 shadow-2xl sm:max-w-md">
        <h3 class="text-base font-semibold text-slate-900">{{ title }}</h3>
        <p class="mt-2 text-sm text-slate-600">{{ message }}</p>

        <div class="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            :disabled="busy"
            @click="emit('close')"
            class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-70"
          >
            {{ cancelText || 'Cancel' }}
          </button>
          <button
            type="button"
            :disabled="busy"
            @click="emit('confirm')"
            class="rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:opacity-70"
          >
            {{ busy ? 'Processing...' : confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import ClockIcon from '@/components/icons/ClockIcon.vue';
import EditIcon from '@/components/icons/EditIcon.vue';
import TrashIcon from '@/components/icons/TrashIcon.vue';
import type { NoteItem } from '@/types/note';

const props = defineProps<{
  note: NoteItem;
  deleting?: boolean;
}>();

defineEmits<{
  edit: [id: string];
  delete: [id: string];
}>();

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
</script>

<template>
  <article class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow">
    <div class="mb-1 flex items-start justify-between gap-4">
      <div>
        <h3 class="text-base font-semibold text-slate-900">{{ props.note.title }}</h3>
        <p class="whitespace-pre-line text-sm leading-relaxed text-slate-700">
          {{ props.note.content || 'No content for this note yet.' }}
        </p>
      </div>

      <div class="inline-flex items-center gap-2">
        <button
          type="button"
          @click="$emit('edit', props.note.id)"
          class="rounded-md border border-slate-300 px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <EditIcon />
        </button>
        <button
          type="button"
          :disabled="props.deleting"
          @click="$emit('delete', props.note.id)"
          class="rounded-md border border-rose-200 bg-rose-50 px-2 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 disabled:opacity-70"
        >
          <TrashIcon />
        </button>
      </div>
    </div>

    <div class="mt-2 flex items-center gap-2">
      <ClockIcon />
      <p class="text-xs text-slate-500">{{ formatDate(props.note.updatedAt) }}</p>
    </div>
  </article>
</template>

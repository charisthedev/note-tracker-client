<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { watch } from 'vue';
import CloseCircleIcon from '@/components/icons/CloseCircleIcon.vue';
import { noteSchema, type NoteFormValues } from '@/schemas/noteSchema';
import type { NoteItem } from '@/types/note';

const props = withDefaults(
  defineProps<{
    open: boolean;
    note: NoteItem | null;
    busy?: boolean;
    resetKey?: number;
  }>(),
  {
    busy: false,
    resetKey: 0,
  },
);

const emit = defineEmits<{
  submit: [payload: { id: string; values: NoteFormValues }];
  close: [];
}>();

const { defineField, errors, handleSubmit, resetForm, meta } = useForm<NoteFormValues>({
  validationSchema: toTypedSchema(noteSchema),
  initialValues: {
    title: '',
    content: '',
  },
});

watch(
  () => props.note,
  (note) => {
    resetForm({
      values: {
        title: note?.title ?? '',
        content: note?.content ?? '',
      },
    });
  },
  { immediate: true },
);

watch(
  () => props.resetKey,
  () => {
    resetForm({
      values: {
        title: props.note?.title ?? '',
        content: props.note?.content ?? '',
      },
    });
  },
);

const [title, titleAttrs] = defineField('title');
const [content, contentAttrs] = defineField('content');

const onSubmit = handleSubmit((values) => {
  if (!props.note) {
    return;
  }

  emit('submit', { id: props.note.id, values });
});
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      @click.self="emit('close')"
      class="fixed inset-0 z-50 flex items-end bg-slate-900/50 p-2 sm:items-center sm:justify-center"
    >
      <div class="w-full rounded-2xl bg-white p-4 shadow-2xl sm:max-w-lg">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900">Update Note</h3>
          <button
            type="button"
            @click="emit('close')"
            class="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <CloseCircleIcon />
          </button>
        </div>

        <form class="space-y-4" @submit.prevent="onSubmit">
          <label class="block space-y-1.5">
            <span class="text-sm font-medium text-slate-800">Title</span>
            <input
              v-model="title"
              v-bind="titleAttrs"
              type="text"
              autocomplete="off"
              class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              placeholder="What is this note about?"
            />
            <small class="text-xs font-medium text-rose-600" v-if="errors.title">{{ errors.title }}</small>
          </label>

          <label class="block space-y-1.5">
            <span class="text-sm font-medium text-slate-800">Content</span>
            <textarea
              v-model="content"
              v-bind="contentAttrs"
              rows="7"
              class="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
              placeholder="Write your note..."
            ></textarea>
            <small class="text-xs font-medium text-rose-600" v-if="errors.content">{{ errors.content }}</small>
          </label>

          <div class="flex items-center gap-2">
            <button
              type="submit"
              :disabled="busy || !meta.dirty"
              class="inline-flex items-center justify-center rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {{ busy ? 'Saving...' : 'Update Note' }}
            </button>
            <button
              type="button"
              :disabled="busy"
              @click="emit('close')"
              class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-70"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

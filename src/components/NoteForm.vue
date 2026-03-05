<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { watch } from 'vue';
import { noteSchema, type NoteFormValues } from '@/schemas/noteSchema';

const props = withDefaults(
  defineProps<{
    initialValues?: NoteFormValues;
    submitLabel?: string;
    busy?: boolean;
    showCancel?: boolean;
    resetKey?: number;
  }>(),
  {
    initialValues: () => ({ title: '', content: '' }),
    submitLabel: 'Save Note',
    busy: false,
    showCancel: false,
    resetKey: 0,
  },
);

const emit = defineEmits<{
  submit: [values: NoteFormValues];
  cancel: [];
}>();

const { defineField, errors, handleSubmit, resetForm } = useForm<NoteFormValues>({
  validationSchema: toTypedSchema(noteSchema),
  initialValues: props.initialValues,
});

watch(
  () => props.initialValues,
  (values) => {
    resetForm({ values });
  },
  { deep: true },
);

watch(
  () => props.resetKey,
  () => {
    resetForm({
      values: props.initialValues,
    });
  },
);

const [title, titleAttrs] = defineField('title');
const [content, contentAttrs] = defineField('content');

const onSubmit = handleSubmit((values) => {
  emit('submit', values);
});
</script>

<template>
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
        :disabled="busy"
        class="inline-flex items-center justify-center rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {{ busy ? 'Saving...' : submitLabel }}
      </button>
      <button
        v-if="showCancel"
        type="button"
        @click="emit('cancel')"
        class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
      >
        Cancel
      </button>
    </div>
  </form>
</template>

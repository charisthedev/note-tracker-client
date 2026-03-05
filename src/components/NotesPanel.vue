<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useInfiniteQuery, useMutation, useQueryClient, type InfiniteData } from '@tanstack/vue-query';
import { toast } from 'vue-sonner';
import ConfirmModal from '@/components/ConfirmModal.vue';
import NoteCard from '@/components/NoteCard.vue';
import NoteForm from '@/components/NoteForm.vue';
import UpdateNoteModal from '@/components/UpdateNoteModal.vue';
import { createNote, deleteNote, listNotes, updateNote } from '@/lib/api';
import type { NoteFormValues } from '@/schemas/noteSchema';
import type { IPaginationResult } from '@/types';
import type { NoteItem } from '@/types/note';

const queryClient = useQueryClient();

const isCreateModalOpen = ref(false);
const isUpdateModalOpen = ref(false);
const noteToEditId = ref<string | null>(null);
const noteToDeleteId = ref<string | null>(null);
const createFormResetKey = ref(0);
const updateFormResetKey = ref(0);

const notesQuery = useInfiniteQuery<
  IPaginationResult<NoteItem>,
  Error,
  InfiniteData<IPaginationResult<NoteItem>, string | undefined>,
  ['notes-feed'],
  string | undefined
>({
  queryKey: ['notes-feed'],
  initialPageParam: undefined as string | undefined,
  queryFn: ({ pageParam }) => listNotes({ cursor: pageParam, limit: 10 }),
  getNextPageParam: (lastPage) => {
    if (lastPage.meta.hasNextPage) {
      return lastPage.meta.nextCursor;
    }

    return undefined;
  },
});

watch(
  () => notesQuery.error.value,
  (error) => {
    if (error) {
      toast.error(error.message);
    }
  },
);

const createMutation = useMutation({
  mutationFn: createNote,
  onSuccess: async () => {
    isCreateModalOpen.value = false;
    createFormResetKey.value += 1;
    toast.success('Note created successfully.');
    await queryClient.invalidateQueries({ queryKey: ['notes-feed'] });
  },
  onError: (error) => {
    const message = error instanceof Error ? error.message : 'Could not create note.';
    toast.error(message);
  },
});

const updateMutation = useMutation({
  mutationFn: (params: { id: string; data: NoteFormValues }) => updateNote(params.id, params.data),
  onSuccess: async () => {
    isUpdateModalOpen.value = false;
    noteToEditId.value = null;
    updateFormResetKey.value += 1;
    toast.success('Note updated successfully.');
    await queryClient.invalidateQueries({ queryKey: ['notes-feed'] });
  },
  onError: (error) => {
    const message = error instanceof Error ? error.message : 'Could not update note.';
    toast.error(message);
  },
});

const deleteMutation = useMutation({
  mutationFn: deleteNote,
  onSuccess: async () => {
    noteToDeleteId.value = null;
    toast.success('Note deleted successfully.');
    await queryClient.invalidateQueries({ queryKey: ['notes-feed'] });
  },
  onError: (error) => {
    const message = error instanceof Error ? error.message : 'Could not delete note.';
    toast.error(message);
  },
});

const notes = computed(() => notesQuery.data.value?.pages.flatMap((page) => page.data) ?? []);

const noteToEdit = computed<NoteItem | null>(
  () => notes.value.find((item) => item.id === noteToEditId.value) ?? null,
);

const noteToDelete = computed<NoteItem | null>(
  () => notes.value.find((item) => item.id === noteToDeleteId.value) ?? null,
);

const deleteMessage = computed(() => {
  const title = noteToDelete.value?.title ?? 'this note';
  return `This will permanently delete "${title}".`;
});

const isDeletingSelectedNote = computed(
  () => deleteMutation.isPending.value && deleteMutation.variables.value === noteToDeleteId.value,
);

function isMobileViewport() {
  if (typeof window === 'undefined') {
    return false;
  }

  return window.matchMedia('(max-width: 1023px)').matches;
}

function openCreateForm() {
  if (isMobileViewport()) {
    isCreateModalOpen.value = true;
  }
}

function closeCreateForm() {
  isCreateModalOpen.value = false;
  createFormResetKey.value += 1;
}

function openEditModal(id: string) {
  noteToEditId.value = id;
  isUpdateModalOpen.value = true;
}

function closeUpdateModal() {
  isUpdateModalOpen.value = false;
  noteToEditId.value = null;
  updateFormResetKey.value += 1;
}

function promptDelete(id: string) {
  noteToDeleteId.value = id;
}

function closeDeleteModal() {
  noteToDeleteId.value = null;
}

function onCreate(values: NoteFormValues) {
  createMutation.mutate(values);
}

function onUpdate(payload: { id: string; values: NoteFormValues }) {
  updateMutation.mutate({ id: payload.id, data: payload.values });
}

function onDeleteConfirm() {
  if (!noteToDeleteId.value) {
    return;
  }

  deleteMutation.mutate(noteToDeleteId.value);
}

function loadMore() {
  notesQuery.fetchNextPage();
}
</script>

<template>
  <div class="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6 lg:py-8">
    <div class="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <section class="space-y-4">
        <div class="space-y-4" v-if="notesQuery.isPending.value">
          <article
            class="animate-pulse rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            v-for="idx in 4"
            :key="idx"
          >
            <div class="mb-3 h-4 w-2/3 rounded bg-slate-200"></div>
            <div class="mb-2 h-3 w-full rounded bg-slate-200"></div>
            <div class="h-3 w-5/6 rounded bg-slate-200"></div>
          </article>
        </div>

        <div class="space-y-4" v-else-if="notes.length">
          <NoteCard
            v-for="note in notes"
            :key="note.id"
            :note="note"
            :deleting="deleteMutation.isPending.value && deleteMutation.variables.value === note.id"
            @edit="openEditModal"
            @delete="promptDelete"
          />

          <div class="flex justify-center pt-2" v-if="notesQuery.hasNextPage.value">
            <button
              type="button"
              :disabled="notesQuery.isFetchingNextPage.value"
              @click="loadMore"
              class="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-70"
            >
              {{ notesQuery.isFetchingNextPage.value ? 'Loading more...' : 'Load more' }}
            </button>
          </div>
        </div>

        <p class="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600" v-else>
          No notes yet. Start by creating one.
        </p>
      </section>

      <aside class="sticky top-6 hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm lg:block">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-slate-900">Create Note</h3>
        </div>

        <NoteForm
          :busy="createMutation.isPending.value"
          :reset-key="createFormResetKey"
          submit-label="Create Note"
          @submit="onCreate"
        />
      </aside>
    </div>

    <button
      type="button"
      @click="openCreateForm"
      class="fixed bottom-5 right-5 inline-flex h-12 items-center justify-center rounded-full bg-sky-700 px-5 text-sm font-semibold text-white shadow-lg shadow-sky-900/20 transition hover:bg-sky-800 lg:hidden"
    >
      Create note
    </button>

    <Teleport to="body">
      <div
        v-if="isCreateModalOpen"
        @click.self="closeCreateForm"
        class="fixed inset-0 z-50 flex items-end bg-slate-900/50 p-2 sm:items-center sm:justify-center"
      >
        <div class="w-full rounded-2xl bg-white p-4 shadow-2xl sm:max-w-lg">
          <div class="mb-4 flex items-center justify-between">
            <h3 class="text-base font-semibold text-slate-900">Create Note</h3>
            <button
              type="button"
              @click="closeCreateForm"
              class="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              Close
            </button>
          </div>

          <NoteForm
            :busy="createMutation.isPending.value"
            :reset-key="createFormResetKey"
            submit-label="Create Note"
            @submit="onCreate"
          />
        </div>
      </div>
    </Teleport>

    <UpdateNoteModal
      :open="isUpdateModalOpen"
      :note="noteToEdit"
      :busy="updateMutation.isPending.value"
      :reset-key="updateFormResetKey"
      @submit="onUpdate"
      @close="closeUpdateModal"
    />

    <ConfirmModal
      :open="Boolean(noteToDelete)"
      title="Delete note"
      :message="deleteMessage"
      confirm-text="Delete"
      :busy="isDeletingSelectedNote"
      @confirm="onDeleteConfirm"
      @close="closeDeleteModal"
    />
  </div>
</template>

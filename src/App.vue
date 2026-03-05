<script setup lang="ts">
import NotesPanel from '@/components/NotesPanel.vue';
import { Toaster } from 'vue-sonner';
</script>

<template>
  <div class="min-h-screen bg-linear-to-b from-slate-100 via-slate-100 to-slate-200 relative">
    <header class="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-10">
      <div class="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 lg:px-6">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">Note Taker</p>
        </div>
      </div>
    </header>

    <NotesPanel />
    <Toaster rich-colors position="top-right" />
  </div>
</template>

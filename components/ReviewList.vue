<template>
  <div class="w-full max-w-4xl mx-auto p-4">
    <div class="space-y-4">
      <ReviewCard
        v-for="review in reviews"
        :key="review.id"
        :content="review.content"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Review {
  id: string
  content: string
}

defineProps<{
  reviews: Review[]
}>()
</script>
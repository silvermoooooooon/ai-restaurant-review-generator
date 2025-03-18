<template>
  <div class="w-full">
    <h2 class="text-xl font-semibold mb-6 text-blue-400 flex items-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd" />
      </svg>
      生成的评论 ({{ reviews.length }})
    </h2>
    <div class="grid gap-6 grid-cols-1">
      <ReviewCard
        v-for="review in reviews"
        :key="review.id"
        :content="review.content"
        class="animate-fadeIn"
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

<style>
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out forwards;
}
</style>
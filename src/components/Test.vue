<template>
  <div>
    <span>
      {{ list.length }}
    </span>
  </div>
</template>
<script setup lang="ts">
import { onUpdated } from "vue";

defineProps<{ list: any[] }>();
onUpdated(() => {
  console.log("u");
});
</script>

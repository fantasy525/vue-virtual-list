<template>
  <div class="home">
    <ScrollView :height="400">
      <div class="item">1</div>
      <div class="item">2</div>
      <div class="item">3</div>
      <div class="item">4</div>
    </ScrollView>
  </div>
</template>

<script lang="ts" setup>
import ScrollView from "@/components/ScrollView.vue";
</script>
<style scoped>
.item {
  height: 200px;
}
.item:nth-child(even) {
  background-color: #a2c9ad;
}
</style>

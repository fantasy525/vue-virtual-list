<template>
  <ScrollView :on-scroll="onScroll" :height="height">
    <div
      class="virtual-list"
      :style="{ height: itemHeight * dataList.length + 'px' }"
    >
      <div class="virtual-list-wrapper" :style="{ transform: transform }">
        <div
          class="virtual-list-item"
          :style="{ height: itemHeight + 'px' }"
          :key="index"
          v-for="(item, index) in visibleList"
        >
          <slot :item="item" :index="startIndex + index"></slot>
        </div>
      </div>
    </div>
  </ScrollView>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import ScrollView from "./ScrollView.vue";
const props = defineProps<{
  itemHeight: number;
  dataList: any[];
  height: number;
}>();
const count = 20;
const startIndex = ref(0);
const endIndex = computed(() => {
  return startIndex.value + count;
});
const transform = computed(() => {
  return `translateY(${startIndex.value * props.itemHeight}px)`;
});
const visibleList = computed(() => {
  return props.dataList.slice(startIndex.value, endIndex.value);
});
const onScroll = (offset: number) => {
  console.log(offset, Math.ceil(offset / props.itemHeight));
  startIndex.value = Math.abs(Math.ceil(offset / props.itemHeight));
};
</script>

<style>
.virtual-list {
  overflow: hidden;
}
</style>

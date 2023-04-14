<template>
  <ScrollView
    :on-viewport-height-change="onViewportHeightChange"
    :on-scroll="onScroll"
    :height="height"
  >
    <div
      class="virtual-list"
      :style="{ height: itemHeight * dataList.length + 'px' }"
    >
      <div
        class="virtual-list-wrapper"
        ref="listWrapper"
        :style="{ transform: transform }"
      >
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
import useFixedSize from "./useFixedSize";
const props = defineProps<{
  itemHeight: number;
  dataList: any[];
  height: number;
}>();
const viewPortHeight = ref(0);
const onViewportHeightChange = (height: number) => {
  viewPortHeight.value = height;
};
const { transform, onScroll, visibleList, startIndex, listWrapper } =
  useFixedSize(props, viewPortHeight);
</script>

<style>
.virtual-list {
  overflow: hidden;
}
</style>

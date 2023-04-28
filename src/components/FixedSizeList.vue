<template>
  <ScrollView
    :on-viewport-height-change="onViewportHeightChange"
    :on-scroll="onScroll"
    :height="height"
    :on-reach-bottom="onReachBottom"
  >
    <div class="virtual-list">
      <div
        class="holder"
        :style="{
          transform: transform,
          height: props.dataList.length * itemHeight + 'px',
        }"
      >
        <div class="virtual-list-wrapper" ref="listWrapper">
          <div
            class="virtual-list-item"
            :style="{ ...withItemStyle }"
            :key="index"
            ref="listItem"
            v-for="(item, index) in visibleList"
          >
            <slot :item="item" :index="startIndex + index"></slot>
          </div>
        </div>
      </div>
    </div>
  </ScrollView>
</template>

<script setup lang="ts">
import {
  computed,
  isReactive,
  isRef,
  nextTick,
  onMounted,
  onUpdated,
  ref,
  watchEffect,
} from "vue";
import ScrollView from "./ScrollView.vue";
import { CSSProperties } from "vue/types/jsx";
const props = defineProps<{
  dataList: any[];
  height?: number;
  itemStyle?: CSSProperties;
  onReachBottom?: () => void;
}>();
const itemHeight = ref(100);
const withItemStyle = computed(() => {
  return props.itemStyle || {};
});
const viewPortHeight = ref(0);
const listWrapper = ref<HTMLDivElement>();
if (isReactive(props.dataList) || isRef(props.dataList)) {
  throw new Error("dataList 应该是shallow的,否则大量数据更新会有性能问题");
}

const onViewportHeightChange = (height: number) => {
  viewPortHeight.value = height;
};
const count = ref(2);
const bufferSize = 2;
const startIndex = ref(0);
const listItem = ref<HTMLDivElement[]>();
const endIndex = computed(() => {
  return Math.min(startIndex.value + count.value, props.dataList.length);
});
const transform = computed(() => {
  return `translateY(${startIndex.value * itemHeight.value}px)`;
});
const visibleList = computed(() => {
  return props.dataList.slice(startIndex.value, endIndex.value);
});
const onScroll = (offset: number) => {
  return new Promise<void>((resolve) => {
    const index = Math.floor(Math.abs(offset / itemHeight.value));
    startIndex.value = index - Math.min(index, bufferSize);
    nextTick(() => {
      resolve();
    });
  });
};
const fillViewPort = () => {
  count.value =
    Math.ceil(viewPortHeight.value / itemHeight.value) + bufferSize * 2;
};
watchEffect(() => {
  fillViewPort();
});
const measureItemHeight = () => {
  if (listItem.value && listItem.value.length > 0) {
    const node = listItem.value[0] as HTMLDivElement;
    const marginTop = node.style.marginTop.match(
      /-?\d+(\.\d+)?([eE][-+]?\d+)?/g
    );
    const marginBottom = node.style.marginBottom.match(
      /-?\d+(\.\d+)?([eE][-+]?\d+)?/g
    );
    let margin = 0;
    if (marginBottom && marginBottom[0]) {
      margin += parseInt(marginBottom[0]);
    }
    if (marginTop && marginTop[0]) {
      margin += parseInt(marginTop[0]);
    }
    if (itemHeight.value !== margin + node.offsetHeight) {
      itemHeight.value = margin + node.offsetHeight;
    }
  }
};
onUpdated(() => {
  measureItemHeight();
});
onMounted(() => {
  measureItemHeight();
});
</script>

<style>
.virtual-list {
  overflow: hidden;
}
.virtual-list-wrapper {
  position: relative;
}
.virtual-list-item {
  box-sizing: border-box;
}
</style>

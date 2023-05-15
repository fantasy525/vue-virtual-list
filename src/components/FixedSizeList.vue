<template>
  <component
    :is="platform"
    :on-viewport-height-change="onViewportHeightChange"
    :on-scroll="onScroll"
    :height="height"
    :on-reach-bottom="onReachBottom"
  >
    <div
      class="heightHolder"
      :style="{
        height: props.dataList.length * itemHeight + 'px',
      }"
    >
      <div
        class="virtual-list-wrapper"
        ref="listWrapper"
        :style="{ transform: transform }"
      >
        <div
          v-for="(item, index) in visibleList"
          class="virtual-list-item"
          :style="{
            ...withItemStyle,
          }"
          :key="startIndex + index"
          ref="listItem"
        >
          <slot :item="item" :index="startIndex + index"></slot>
        </div>
      </div>
    </div>
  </component>
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
  watch,
  watchEffect,
} from "vue";
import ScrollPC from "./ScrollPC.vue";
import ScrollH5 from "./ScrollH5.vue";
import { CSSProperties } from "vue/types/jsx";
import ScrollView from "./ScrollView.vue";
const props = withDefaults(
  defineProps<{
    dataList: any[];
    height?: number;
    itemStyle?: CSSProperties;
    onReachBottom?: () => void;
    mobile?: boolean;
  }>(),
  { mobile: false }
);
const platform = computed(() => {
  return props.mobile ? ScrollView : ScrollPC;
});
const itemHeight = ref(100);
let hasMeasureHeight = false;
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
const count = ref(4);
const bufferSize = 2;
const startIndex = ref(0);
const listItem = ref<HTMLDivElement[]>();
const endIndex = computed(() => {
  return Math.min(startIndex.value + count.value, props.dataList.length);
});
const transform = computed(() => {
  return `translate3d(0,${startIndex.value * itemHeight.value}px,0)`;
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
  if (hasMeasureHeight) {
    return;
  }
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
    hasMeasureHeight = true;
  }
};
onUpdated(() => {
  measureItemHeight();
});
onMounted(() => {
  measureItemHeight();
});
</script>

<style scoped>
.virtual-list {
  overflow: hidden;
  position: relative;
}

.virtual-list-wrapper {
  will-change: transform;
  overflow: hidden;
}
.virtual-list-item {
  pointer-events: auto;
  box-sizing: border-box;
  width: 100%;
}
</style>

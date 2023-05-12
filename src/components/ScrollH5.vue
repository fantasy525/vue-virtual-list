<template>
  <div
    ref="scrollWrapper"
    class="scrollWrapper"
    :style="{ height: viewPortHeight }"
    @scroll="onScroll"
  >
    <div class="scroller" ref="scroller">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, nextTick, ref, watchEffect } from "vue";
import useHeightObserve from "./useHeightObserve";
const props = defineProps<{
  height?: number;
  onScroll?: (offset: number) => void | Promise<void>;
  onViewportHeightChange?: (height: number) => void;
  onReachBottom?: () => void;
}>();
const scrollWrapper = ref<HTMLDivElement | undefined>();
const scroller = ref<HTMLDivElement | undefined>();
const scrollWrapperHeight = useHeightObserve(
  scrollWrapper,
  "offsetHeight",
  props.height
);
const scrollerMaxHeight = useHeightObserve(scroller, "scrollHeight");

const viewPortHeight = computed(() => {
  if (props.height) {
    return `${props.height}px`;
  }
  return "100%";
});

const onScroll = () => {
  if (
    scrollWrapper.value!.scrollTop ===
    scrollerMaxHeight.value - scrollWrapperHeight.value
  ) {
    props.onReachBottom && props.onReachBottom();
  }
  props.onScroll && props.onScroll(scrollWrapper.value!.scrollTop);
};

watchEffect(() => {
  props.onViewportHeightChange &&
    props.onViewportHeightChange(scrollWrapperHeight.value);
});
</script>
<style scoped lang="less">
.scrollWrapper {
  overflow: auto;
  height: 100%;
  // background-color: aquamarine;
}
.scroller {
  position: relative;
  /* display:flex是必须的，可以大大减少滚动时HitTest时间 */
  display: flex;
  flex-direction: column;
  will-change: transform;
}
</style>

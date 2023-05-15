<template>
  <div
    ref="scrollWrapper"
    class="scrollWrapper"
    :style="{ height: viewPortHeight }"
  >
    <div class="scroller" ref="scroller">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, nextTick, ref, watchEffect } from "vue";
import useHeightObserve from "./useHeightObserve";
import useMobile from "./useMobileTouch";
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
function animate(y: number) {
  //   scrollWrapper.value!.scrollTop = -y;
  scroller.value!.style.transform = `translate3d(0,${y}px,0)`;
  // scroller.value!.style.webkitTransform = `translate3d(0,${y}px,0)`;
}
const onScroll = (offset: number, type: "probe" | "default" = "default") => {
  // type ===
  return new Promise<void>((resolve) => {
    if (!props.onScroll) {
      if (type === "probe") return;
      animate(offset);
    } else {
      const result = props.onScroll(offset);
      if (type === "probe") return;
      if (result instanceof Promise) {
        // 等外部更新渲染完UI后再移动位置
        result.then(() => {
          animate(offset);
          nextTick(resolve);
        });
      } else {
        animate(offset);
      }
    }
  });
};
// 当前设备是移动设备
useMobile(
  scroller,
  scrollWrapper,
  scrollerMaxHeight,
  scrollWrapperHeight,
  onScroll,
  props.onReachBottom
);
watchEffect(() => {
  props.onViewportHeightChange &&
    props.onViewportHeightChange(scrollWrapperHeight.value);
});
</script>
<style scoped lang="less">
.scrollWrapper {
  overflow: hidden;
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

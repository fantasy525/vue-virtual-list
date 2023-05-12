<template>
  <div
    ref="scrollWrapper"
    class="scrollWrapper"
    :style="{ height: viewPortHeight }"
    @scroll="nativeScroll"
  >
    <div class="scroller" ref="scroller">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { computed, nextTick, ref, watchEffect } from "vue";
import useMouseWheel from "./useMouseWheel";
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

function animate(y: number) {
  scrollWrapper.value!.scrollTop = -y;
}
const nativeScroll = () => {
  if (
    scrollWrapper.value!.scrollTop ===
    scrollerMaxHeight.value - scrollWrapperHeight.value
  ) {
    props.onReachBottom && props.onReachBottom();
  }
  props.onScroll && props.onScroll(scrollWrapper.value!.scrollTop);
};

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

useMouseWheel(
  scroller,
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
.tag {
  position: absolute;
  right: 0;
  left: 0;
  text-align: right;
  z-index: 22;
  color: red;
  div {
    top: 0;
    position: absolute;
    right: 0;
    display: block;
    border-top: 1px solid black;
    width: 100px;
    height: 2px;
  }
}
</style>

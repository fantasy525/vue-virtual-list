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
import {
  computed,
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
  watchEffect,
} from "vue";
import useMobile from "./useMobile";
import useMouseWheel from "./useMouseWheel";
import useHeightObserve from "./useHeightObserve";
const props = defineProps<{
  height?: number;
  onScroll?: (offset: number) => void | Promise<void>;
  onViewportHeightChange?: (height: number) => void;
}>();
const scrollWrapper = ref<HTMLDivElement | undefined>();
const scroller = ref<HTMLDivElement | undefined>();
const scrollWrapperHeight = useHeightObserve(scrollWrapper, "offsetHeight");
const scrollerMaxHeight = useHeightObserve(scroller, "scrollHeight");

const viewPortHeight = computed(() => {
  if (props.height) {
    return `${props.height}px`;
  }
  return "100%";
});

function setTranslateY(y: number) {
  scroller.value!.style.transform = `translate3d(0,${y}px,0)`;
  scroller.value!.style.webkitTransform = `translate3d(0,${y}px,0)`;
}

// 当前设备是移动设备
useMobile(scroller, scrollWrapperHeight, (offset) => {
  props.onScroll && props.onScroll(offset);
});

const { onRawWheel } = useMouseWheel(
  scrollerMaxHeight,
  scrollWrapperHeight,
  (offset) => {
    if (!props.onScroll) {
      setTranslateY(offset);
      return;
    }
    const result = props.onScroll(offset);
    if (result instanceof Promise) {
      // 等外部更新渲染完UI后再移动位置
      result.then(() => {
        setTranslateY(offset);
      });
    } else {
      Promise.resolve().then(() => {
        setTranslateY(offset);
      });
    }
  }
);

watchEffect(() => {
  props.onViewportHeightChange &&
    props.onViewportHeightChange(scrollWrapperHeight.value);
});

onMounted(() => {
  if (!scroller.value) return;
  scroller.value.addEventListener("wheel", onRawWheel);
});
onBeforeMount(() => {
  if (!scroller.value) return;
  scroller.value.removeEventListener("wheel", onRawWheel);
});
</script>
<style scoped>
.scrollWrapper {
  overflow: hidden;
}
.scroller {
  /* display:flex是必须的，可以大大减少滚动时HitTest时间 */
  display: flex;
  flex-direction: column;
}
</style>

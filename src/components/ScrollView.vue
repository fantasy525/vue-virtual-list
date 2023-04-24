<template>
  <div
    ref="scrollWrapper"
    class="scrollWrapper"
    :style="{ height: viewPortHeight }"
  >
    <div class="scroller" ref="scroller">
      <div
        class="tag"
        v-for="(item, index) in tags"
        :key="index"
        :style="{ top: index * 200 + 'px' }"
      >
        <span> {{ index * 200 }}</span>
        <div></div>
      </div>
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
const scrollWrapperHeight = useHeightObserve(
  scrollWrapper,
  "offsetHeight",
  props.height
);
const tags = computed(() => {
  if (scrollerMaxHeight.value === undefined) return;
  return Math.ceil(scrollerMaxHeight.value / 200);
});
const scrollerMaxHeight = useHeightObserve(scroller, "scrollHeight");

const viewPortHeight = computed(() => {
  if (props.height) {
    return `${props.height}px`;
  }
  return "100%";
});

function setTranslateY(y: number) {
  scrollWrapper.value!.scrollTop = -y;
  // scroller.value!.style.transform = `translate3d(0,${y}px,0)`;
  // scroller.value!.style.webkitTransform = `translate3d(0,${y}px,0)`;
}

// 当前设备是移动设备
useMobile(scroller, scrollWrapperHeight, (offset) => {
  props.onScroll && props.onScroll(offset);
});
let raf: number;
const { onRawWheel } = useMouseWheel(
  scrollerMaxHeight,
  scrollWrapperHeight,
  (offset) => {
    window.cancelAnimationFrame(raf);
    if (!props.onScroll) {
      setTranslateY(offset);
      return;
    }
    const result = props.onScroll(offset);
    if (result instanceof Promise) {
      // 等外部更新渲染完UI后再移动位置
      result.then(() => {
        raf = window.requestAnimationFrame(() => {
          setTranslateY(offset);
        });
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
<style scoped lang="less">
.scrollWrapper {
  overflow: hidden;
  height: 100%;
  background-color: aquamarine;
}
.scroller {
  position: relative;
  /* display:flex是必须的，可以大大减少滚动时HitTest时间 */
  display: flex;
  flex-direction: column;
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

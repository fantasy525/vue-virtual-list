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
import { computed, onMounted, onUnmounted, ref } from "vue";
import useMobile from "./useMobile";
import useMouseWheel from "./useMouseWheel";
const props = defineProps<{
  height?: number;
  onScroll?: (offset: number) => void;
  onViewportHeightChange?: (height: number) => void;
}>();
const scrollWrapper = ref<HTMLDivElement | null>(null);
const scroller = ref<HTMLDivElement | undefined>();
const ro = ref<ResizeObserver>();
const scrollWrapperHeight = ref(props.height);
const viewPortHeight = computed(() => {
  if (props.height) {
    return `${props.height}px`;
  }
  return "100%";
});
onMounted(() => {
  ro.value = new ResizeObserver((enties) => {
    if (enties.length) {
      scrollWrapperHeight.value = scrollWrapper.value!.offsetHeight;
      props.onViewportHeightChange &&
        props.onViewportHeightChange(scrollWrapperHeight.value);
    }
  });
  ro.value.observe(scroller.value!);
});

// 当前设备是移动设备
useMobile(scroller, scrollWrapperHeight, (offset) => {
  props.onScroll && props.onScroll(offset);
});

useMouseWheel(scroller, scrollWrapperHeight, (offset) => {
  props.onScroll && props.onScroll(offset);
});

onUnmounted(() => {
  ro.value?.disconnect();
});
</script>
<style scoped>
.scrollWrapper {
  overflow: hidden;
}
</style>

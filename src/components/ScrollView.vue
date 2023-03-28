<template>
  <div
    ref="scrollWrapper"
    class="scrollWrapper"
    :style="{ height: height + 'px' }"
  >
    <div class="scroller" ref="scroller">
      <slot></slot>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue";
import useMobile from "./useMobile";
import useMouseWheel from "./useMouseWheel";
const props = defineProps<{
  height: number;
  onScroll?: (offset: number) => void;
}>();
const scrollWrapper = ref<HTMLDivElement | null>(null);
const scroller = ref<HTMLDivElement | null>(null);
const text = ref("");
if (/Mobi|Android|iPhone/i.test(navigator.userAgent)) {
  // 当前设备是移动设备
  useMobile(scroller, props.height, (offset) => {
    props.onScroll && props.onScroll(offset);
  });
} else {
  useMouseWheel(scroller, props.height, (offset) => {
    props.onScroll && props.onScroll(offset);
  });
}
</script>
<style scoped>
.scrollWrapper {
  overflow: hidden;
  height: 100%;
  background-color: gray;
}
</style>

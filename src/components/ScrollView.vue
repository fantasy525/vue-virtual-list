<template>
  <div ref="scroller" class="scroller" :style="{ height: height + 'px' }">
    <slot></slot>
  </div>
</template>
<script lang="ts" setup>
import { onMounted, ref } from "vue";
defineProps<{ height: number }>();
const scroller = ref<HTMLDivElement | null>(null);

const initListener = () => {
  const onStart = (e: TouchEvent) => {
    console.log(e.target);
  };
  const onMove = (e: TouchEvent) => {
    console.log(e.target);
  };
  const onEnd = (e: TouchEvent) => {
    console.log(e.target);
  };
  scroller.value?.addEventListener("touchstart", onStart);
  scroller.value?.addEventListener("touchmove", onMove);
  scroller.value?.addEventListener("touchend", onEnd);

  return () => {
    scroller.value?.removeEventListener("touchstart", onStart);
    scroller.value?.removeEventListener("touchmove", onMove);
    scroller.value?.removeEventListener("touchend", onEnd);
  };
};
onMounted(() => {
  const offer = initListener();
  return () => {
    offer();
  };
});
</script>
<style scoped>
.scroller {
  overflow: hidden;
}
</style>

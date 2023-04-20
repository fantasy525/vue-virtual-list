import { computed, onBeforeMount, onMounted, ref, Ref, watchEffect } from "vue";
const useMouseWheel = (
  scrollerHeight: Ref<number | undefined>,
  height: Ref<number | undefined>,
  onWheel: (offset: number) => void
) => {
  let transfomrY = 0;
  const minY = ref(0);

  let refHandler: number;
  const canScroll = computed(() => {
    if (height.value !== undefined && scrollerHeight.value !== undefined) {
      return scrollerHeight.value > height.value;
    }
    return false;
  });
  const onRawWheel = (e: WheelEvent) => {
    if (!canScroll.value) {
      return;
    }
    e.preventDefault();
    window.cancelAnimationFrame(refHandler);
    const { deltaY } = e;
    let offset = transfomrY - deltaY;
    if (offset > 0) {
      offset = 0;
    }
    if (offset < -minY.value) {
      offset = -minY.value;
    }
    if (offset !== transfomrY) {
      transfomrY = parseInt(offset + "");
      refHandler = requestAnimationFrame(() => {
        onWheel(transfomrY);
      });
    }
  };

  watchEffect(() => {
    if (height.value !== undefined && scrollerHeight.value !== undefined) {
      minY.value = scrollerHeight.value! - height.value;
    }
  });
  return { onRawWheel };
};

export default useMouseWheel;

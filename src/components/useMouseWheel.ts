import { computed, onBeforeMount, onMounted, ref, Ref, watchEffect } from "vue";
const useMouseWheel = (
  scroller: Ref<HTMLElement | undefined>,
  scrollerHeight: Ref<number | undefined>,
  height: Ref<number | undefined>,
  onScroll: (offset: number) => void,
  onReachBottom?: () => void
) => {
  let transfomrY = 0;
  const maxY = ref(0);
  let raf;
  const canScroll = computed(() => {
    if (height.value !== undefined && scrollerHeight.value !== undefined) {
      return scrollerHeight.value > height.value;
    }
    return false;
  });
  const onRawWheel = (e: WheelEvent) => {
    e.preventDefault();
    // 必须使用 requestAnimationFrame 来使滚动更流畅，否则会卡顿
    // 每次滚动前清除上次的，防止一帧内执行多次相同的动画
    window.cancelAnimationFrame(raf);
    raf = window.requestAnimationFrame(() => {
      if (!canScroll.value) {
        return;
      }
      const { deltaY } = e;
      let offset = transfomrY - deltaY;
      if (offset > 0) {
        offset = 0;
      }
      if (offset < -maxY.value) {
        offset = -maxY.value;
      }
      if (offset !== transfomrY) {
        transfomrY = parseInt(offset + "");
        onScroll(transfomrY);
        if (Math.abs(transfomrY) === maxY.value) {
          onReachBottom && onReachBottom();
          console.log("到达底部");
        }
      }
    });
  };

  watchEffect(() => {
    if (height.value !== undefined && scrollerHeight.value !== undefined) {
      maxY.value = scrollerHeight.value! - height.value;
    }
  });
  onMounted(() => {
    if (!scroller.value) return;
    scroller.value.addEventListener("wheel", onRawWheel);
  });
  onBeforeMount(() => {
    if (!scroller.value) return;
    scroller.value.removeEventListener("wheel", onRawWheel);
  });
};

export default useMouseWheel;

import { computed, onBeforeMount, onMounted, ref, Ref, watchEffect } from "vue";
const useMouseWheel = (
  scrollerHeight: Ref<number | undefined>,
  height: Ref<number | undefined>,
  onWheel: (offset: number) => void
) => {
  let transfomrY = 0;
  const minY = ref(0);
  let raf;
  const canScroll = computed(() => {
    if (height.value !== undefined && scrollerHeight.value !== undefined) {
      return scrollerHeight.value > height.value;
    }
    return false;
  });
  function throttle(fn, delay) {
    let timer: undefined | number = undefined;
    let lastTime: number | undefined = undefined;

    return function (...args) {
      console.log("wheeel start");
      const currentTime = Date.now();
      if (!lastTime || currentTime - lastTime >= delay) {
        fn(...args);
        lastTime = currentTime;
      } else {
        clearTimeout(timer);
        timer = setTimeout(() => {
          fn(...args);
          lastTime = currentTime;
        }, delay - (currentTime - lastTime));
      }
    };
  }

  const onRawWheel = (e: WheelEvent) => {
    e.preventDefault();
    console.log("wheeel work");
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
      if (offset < -minY.value) {
        offset = -minY.value;
      }
      if (offset !== transfomrY) {
        transfomrY = parseInt(offset + "");
        onWheel(transfomrY);
      }
    });
  };

  watchEffect(() => {
    if (height.value !== undefined && scrollerHeight.value !== undefined) {
      minY.value = scrollerHeight.value! - height.value;
    }
  });
  return { onRawWheel };
};

export default useMouseWheel;

import { computed, onBeforeMount, onMounted, Ref } from "vue";
const useMouseWheel = (
  scroller: Ref<HTMLElement | undefined>,
  height: Ref<number | undefined>,
  onWheel: (offset: number) => void
) => {
  let transfomrY = 0;
  const minY = computed(() => {
    if (!height.value) {
      return scroller.value!.scrollHeight;
    }
    return scroller.value!.scrollHeight - height.value;
  });
  let refHandler: number;
  function setTranslateY(y: number) {
    transfomrY = y;
    scroller.value!.style.transform = `translate3d(0,${y}px,0)`;
    scroller.value!.style.webkitTransform = `translate3d(0,${y}px,0)`;
  }

  const onRawWheel = (e: WheelEvent) => {
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
        setTranslateY(transfomrY);
        onWheel(transfomrY);
      });
    }
  };

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

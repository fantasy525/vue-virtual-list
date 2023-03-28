import { onBeforeMount, onMounted, Ref } from "vue";
const useMouseWheel = (
  scroller: Ref<HTMLElement | null>,
  height: number,
  onWheel: (offset: number) => void
) => {
  let transfomrY = 0;
  let minY = 0;
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
    if (offset < -minY) {
      offset = -minY;
    }
    if (offset !== transfomrY) {
      transfomrY = offset;
      setTranslateY(transfomrY);
      refHandler = requestAnimationFrame(() => {
        onWheel(transfomrY);
      });
    }
  };

  onMounted(() => {
    minY = scroller.value!.scrollHeight - height;
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

import { computed, onBeforeMount, onMounted, ref, Ref } from "vue";

const useMobile = (
  scroller: Ref<HTMLElement | undefined>,
  height: Ref<number | undefined>,
  onScroll: (offset: number) => void
) => {
  let transfomrY = 0;
  let startY = 0;
  let endY = 0;
  let momentumStartY = 0;
  let startTime = 0;
  const minY = computed(() => {
    if (!height.value) return parseInt(scroller.value!.scrollHeight + "");
    return parseInt(observerScrollerHeight.value - height.value + "");
  });
  let refHandler = 0;
  const ro = ref<ResizeObserver>();
  function setTranslateY(y: number) {
    transfomrY = y;
    scroller.value!.style.transform = `translate3d(0,${y}px,0)`;
    scroller.value!.style.webkitTransform = `translate3d(0,${y}px,0)`;
  }
  const setTransition = (duration: number, timingFunction: string) => {
    scroller.value!.style.transitionDuration = duration + "ms";
    scroller.value!.style.transitionTimingFunction = timingFunction;
  };
  const getCurrentPos = () => {
    const matrix =
      window.getComputedStyle(scroller.value!).getPropertyValue("transform") ||
      window
        .getComputedStyle(scroller.value!)
        .getPropertyValue("webkitTransform");
    if (matrix === "none") {
      return "none";
    }

    return Math.round(+matrix.split(")")[0].split(", ")[5]);
  };
  const probe = (cur: number | "none", end: number) => {
    refHandler = requestAnimationFrame(() => {
      if (cur === "none") return;
      onScroll(cur);
      if (Math.ceil(parseInt(cur + "")) !== Math.ceil(parseInt(end + ""))) {
        probe(getCurrentPos(), end);
      } else {
        window.cancelAnimationFrame(refHandler);
      }
    });
  };
  const momentum = (end: number, start: number, duration: number) => {
    // 惯性滑动加速度
    const deceleration = 0.003;
    // 拖动的有效惯性距离，不一定是从onStart到onEnd的距离，比如缓慢拖动的时候是最后一次onmove到onend的距离
    const distance = end - start;
    // 1. 根据距离和时长计算滑块的末速度；根据物理知识得出 v1 = 2S / t
    const speed = (2 * Math.abs(distance)) / duration;
    /**
   * 2. 根据末速度计算惯性滑动的距离；匀减速运动末速度为0；S = -(v1*v1) / 2a,由于a是负数
        因此为了方便计算，把-1/2a 定义为常量A简化方程为 S =( v1*v1) / A
        由于v1平方会导致算出的距离很大，因此简化为S = v1 / A,我们只需要定义一个常量即可
   */
    const dis = (speed / deceleration) * (distance < 0 ? -1 : 1);
    let momentEndY = 0;
    if (end + dis > 0) {
      setTransition(
        Math.abs((0 - start) / speed),
        "cubic-bezier(.29, .71, .34, .97)"
      );
      setTranslateY(momentEndY);
    } else if (end + dis < -minY.value) {
      setTransition(
        Math.abs((-minY.value - end) / speed),
        "cubic-bezier(.29, .71, .34, .97)"
      );
      momentEndY = -minY.value;
      setTranslateY(momentEndY);
    } else {
      setTransition(1200, "cubic-bezier(.29, .71, .34, .97)");
      momentEndY = parseInt(end + dis + "");
      setTranslateY(momentEndY);
    }

    probe(getCurrentPos(), momentEndY);
  };
  const stop = () => {
    // 获取当前 translate 的位置
    const y = getCurrentPos();
    if (y === "none") {
      return;
    }
    setTranslateY(y);
  };
  const onStart = (e: TouchEvent) => {
    e.preventDefault();
    stop();
    setTransition(0, "");
    startY = e.changedTouches[0].pageY;
    momentumStartY = endY = transfomrY;
    startTime = new Date().getTime();
  };

  const onMove = (e: TouchEvent) => {
    e.preventDefault();
    const now = new Date().getTime();
    const movePageY = e.changedTouches[0].pageY;
    const moveDis = movePageY - startY;
    // 上次的Y加本次产生的位移
    let lastY = endY + moveDis;
    if (lastY > 0) {
      lastY = 0;
    }
    if (lastY < -minY.value) {
      lastY = -minY.value;
    }
    if (now - startTime > 300) {
      startTime = now;
      momentumStartY = transfomrY;
    }
    setTranslateY(lastY);
    onScroll && onScroll(lastY);
  };
  const onTransitionEnd = () => {
    setTransition(0, "");
  };

  const onEnd = (e: TouchEvent) => {
    e.preventDefault();
    if (transfomrY > 0 || transfomrY < -minY.value) {
      return;
    }
    const dis = Math.abs(transfomrY - momentumStartY);
    const now = new Date().getTime();
    const duration = now - startTime;
    if (now - startTime < 200 && dis > 15) {
      momentum(transfomrY, momentumStartY, duration);
    }
  };
  const observerScrollerHeight = ref(0);
  onMounted(() => {
    ro.value = new ResizeObserver((enties) => {
      if (enties.length) {
        observerScrollerHeight.value = scroller.value!.scrollHeight;
      }
    });
    ro.value.observe(scroller.value!);
  });
  onMounted(() => {
    if (!scroller.value) return;
    scroller.value.addEventListener("touchstart", onStart);
    scroller.value!.addEventListener("touchmove", onMove);
    scroller.value!.addEventListener("touchend", onEnd);
    scroller.value!.addEventListener("touchcancel", onEnd);
    scroller.value!.addEventListener("transitionend", onTransitionEnd);
  });
  onBeforeMount(() => {
    ro.value?.disconnect();
    if (!scroller.value) return;
    scroller.value.removeEventListener("touchstart", onStart);
    scroller.value.removeEventListener("touchmove", onMove);
    scroller.value.removeEventListener("touchend", onEnd);
    scroller.value.removeEventListener("touchcancel", onEnd);
    scroller.value.removeEventListener("transitionend", onTransitionEnd);
  });
};
export default useMobile;

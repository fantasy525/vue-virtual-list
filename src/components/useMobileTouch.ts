import { computed, onBeforeMount, onMounted, ref, Ref, watchEffect } from "vue";

const useMobile = (
  scroller: Ref<HTMLElement | undefined>,
  scrollerHeight: Ref<number | undefined>,
  height: Ref<number | undefined>,
  onScroll: (offset: number, type?: "probe" | "default") => void,
  onReachBottom?: () => void
) => {
  let translateY = 0;
  let startY = 0;
  let endY = 0;
  let momentumStartY = 0;
  let startTime = 0;
  const observerScrollerHeight = ref(0);
  const maxY = ref(0);
  let momentStatus: "start" | "doing" | "end" = "end";
  watchEffect(() => {
    if (height.value !== undefined && scrollerHeight.value !== undefined) {
      maxY.value = Math.ceil(scrollerHeight.value! - height.value);
    }
  });
  let refHandler = 0;
  const ro = ref<ResizeObserver>();
  const dispatchOnScroll: typeof onScroll = (offset, type) => {
    if (Math.abs(offset) === maxY.value && momentStatus !== "start") {
      onReachBottom && onReachBottom();
      console.log("到达底部");
    }
    onScroll(offset, type);
  };
  function setTranslateY(y: number) {
    if (y !== translateY) {
      translateY = Math.ceil(y);
      dispatchOnScroll(translateY);
    }

    // scroller.value!.style.transform = `translate3d(0,${y}px,0)`;
    // scroller.value!.style.webkitTransform = `translate3d(0,${y}px,0)`;
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
      return 0;
    }

    return Math.round(+matrix.split(")")[0].split(", ")[5]);
  };
  const probe = (end: number) => {
    momentStatus = "doing";
    cancelAnimationFrame(refHandler);
    const onFrame = () => {
      const c = Math.abs(getCurrentPos());
      const e = Math.abs(end);
      dispatchOnScroll(c, "probe");
      if (c !== e) {
        refHandler = requestAnimationFrame(() => {
          onFrame();
        });
      } else {
        momentStatus = "end";
      }
    };
    refHandler = requestAnimationFrame(onFrame);
  };
  const momentum = (end: number, start: number, duration: number) => {
    momentStatus = "start";
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
    const dis = ((speed * speed) / deceleration) * (distance < 0 ? -1 : 1);
    let momentEndY = 0;

    if (end + dis > 0) {
      setTransition(
        Math.abs((0 - start) / speed),
        "cubic-bezier(.29, .71, .34, .97)"
      );
      setTranslateY(momentEndY);
    } else if (end + dis < -maxY.value) {
      setTransition(
        Math.abs((-maxY.value - end) / speed),
        "cubic-bezier(.29, .71, .34, .97)"
      );
      momentEndY = -maxY.value;
      setTranslateY(momentEndY);
    } else {
      const a = 0.001;
      let time = parseInt(speed / a + "");
      if (time < 900) {
        time = time + 900;
      }
      // 1. cubic-bezier(.29, .71, .34, .97)
      // 2. cubic-bezier(.07,.82,.39,1)
      // 3. cubic-bezier(.2,.96,.5,1) 经过测试这个最合适
      console.log("time", duration, speed, dis, parseInt(speed / a + ""), time);
      setTransition(time, "cubic-bezier(.2,.96,.5,1)");
      momentEndY = parseInt(end + dis + "");
      setTranslateY(momentEndY);
    }
    probe(Math.ceil(momentEndY));
  };
  const stop = () => {
    // 获取当前 translate 的位置
    setTranslateY(getCurrentPos());
  };
  const onStart = (e: TouchEvent) => {
    e.preventDefault();
    stop();
    setTransition(0, "");
    startY = e.changedTouches[0].pageY;
    momentumStartY = endY = translateY;
    startTime = new Date().getTime();
  };

  const onMove = (e: TouchEvent) => {
    e.preventDefault();
    const now = new Date().getTime();
    const movePageY = e.changedTouches[0].pageY;
    const moveDis = movePageY - startY;
    // 上次的Y加本次产生的位移
    let currentY = endY + moveDis;
    if (currentY > 0) {
      currentY = 0;
    }
    if (currentY < -maxY.value) {
      currentY = -maxY.value;
    }
    // 如果时间超过300ms则用此次产生的时间戳和唯一当开始算 momentum的位置起始点
    // 如果没超过300ms则说明用户滑动的很快,用touchStart的起始点就可以
    if (now - startTime > 200) {
      startTime = now;
      momentumStartY = translateY;
    }
    setTranslateY(currentY);
  };
  const onTransitionEnd = () => {
    setTransition(0, "");
  };

  const onEnd = (e: TouchEvent) => {
    e.preventDefault();
    if (translateY > 0 || translateY < -maxY.value) {
      return;
    }
    const dis = Math.abs(translateY - momentumStartY);
    const now = new Date().getTime();
    const duration = now - startTime;
    if (now - startTime < 200 && dis > 15) {
      momentum(translateY, momentumStartY, duration);
    }
  };

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

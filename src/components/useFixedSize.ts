import {
  Ref,
  computed,
  nextTick,
  onMounted,
  onUpdated,
  ref,
  shallowRef,
  toRaw,
  watch,
  watchEffect,
} from "vue";
const useFixedSize = (
  props: { itemHeight: number; dataList: any[] },
  viewportHeight: Ref<number>
) => {
  const listWrapper = ref<HTMLDivElement>();
  const count = ref(2);
  const bufferSize = 2;
  const startIndex = ref(0);
  const endIndex = computed(() => {
    return Math.min(startIndex.value + count.value, props.dataList.length);
  });
  const transform = computed(() => {
    return `translateY(${startIndex.value * props.itemHeight}px)`;
  });
  const visibleList = computed(() => {
    return props.dataList.slice(startIndex.value, endIndex.value);
  });
  const onScroll = (offset: number) => {
    return new Promise<void>((resolve) => {
      const index = Math.floor(Math.abs(offset / props.itemHeight));
      console.log(offset, props.itemHeight, index);
      startIndex.value = index - Math.min(index, bufferSize);
      nextTick(() => {
        resolve();
      });
    });
  };
  const fillViewPort = () => {
    count.value =
      Math.ceil(viewportHeight.value / props.itemHeight) + bufferSize * 2;
  };
  watchEffect(() => {
    fillViewPort();
  });

  return {
    onScroll,
    transform,
    visibleList,
    startIndex,
    listWrapper,
  };
};

export default useFixedSize;

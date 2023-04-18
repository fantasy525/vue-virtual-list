import { onMounted, ref, Ref, onBeforeMount } from "vue";

const useHeightObserve = (
  el: Ref<HTMLElement | undefined>,
  prop: "scrollHeight" | "offsetHeight"
) => {
  const height = ref(0);
  let ro: ResizeObserver;
  onMounted(() => {
    ro = new ResizeObserver((enties) => {
      if (enties.length && el.value) {
        height.value = el.value[prop];
      }
    });
    ro.observe(el.value!);
  });
  onBeforeMount(() => {
    ro?.disconnect();
  });
  return height;
};

export default useHeightObserve;

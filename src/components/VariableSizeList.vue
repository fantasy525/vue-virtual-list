<template>
  <ScrollView
    :on-viewport-height-change="onViewportHeightChange"
    :height="height"
    :on-scroll="onScroll"
    :on-reach-bottom="onReachBottom"
  >
    <div class="virtual-list">
      <div :style="{ height: scrollHeight + 'px', transform }" class="holder">
        <div class="virtual-list-wrapper" ref="listWrapper">
          <div
            ref="itemNodes"
            class="virtual-list-item"
            :data-index="startIndex + index"
            :key="startIndex + index"
            v-for="(item, index) in visibleList"
            :style="{
              height: itemHeight + 'px',
              backgroundColor: item.color,
              ...withItemStyle,
            }"
          >
            <slot :item="item" :index="startIndex + index"></slot>
          </div>
        </div>
      </div>
    </div>
  </ScrollView>
</template>

<script setup lang="ts">
import {
  computed,
  isReactive,
  isRef,
  nextTick,
  onMounted,
  onUpdated,
  ref,
  watch,
  watchEffect,
} from "vue";
import ScrollView from "./ScrollView.vue";
import { CSSProperties, HTMLAttributes } from "vue/types/jsx";
type Prop = {
  itemHeight?: number;
  dataList: any[];
  height?: number;
  itemStyle?: CSSProperties;
  onReachBottom?: () => void;
};
const props = withDefaults(defineProps<Prop>(), {
  itemStyle: () => {
    return {};
  },
});

const withItemStyle = computed(() => {
  return props.itemStyle || {};
});
const estimateItemHeight = 200;
const viewPortHeight = ref(0);
const itemNodes = ref<HTMLDivElement[]>();
const scrollTop = ref(0);

const defaultPos = {
  top: 0,
  height: estimateItemHeight,
  bottom: 0,
};
const onViewportHeightChange = (height: number) => {
  viewPortHeight.value = height;
};
const sectionSize = 200;
const listWrapper = ref<HTMLDivElement>();
if (isReactive(props.dataList) || isRef(props.dataList)) {
  throw new Error("dataList 应该是shallow的,否则大量数据更新会有性能问题");
}

const sections: Record<number, number[]> = {};
const top = 0;
const count = ref(4);
const bufferSize = 2;
const startIndex = ref(0);
let bottom = 0;
const diffHeight = ref(0);
let lastMeasureIndex = 0;
let measureFinish = false;
const nodePositionMap = new Map<
  number,
  {
    top: number;
    bottom: number;
    height: number;
  }
>();
const endIndex = computed(() => {
  return Math.min(startIndex.value + visibleCount.value, props.dataList.length);
});
const transform = computed(() => {
  const pos = nodePositionMap.get(startIndex.value) || { top: 0 };
  bottom = pos.top;
  return `translate3d(0,${bottom}px,0)`;
});
const visibleList = computed(() => {
  return props.dataList.slice(startIndex.value, endIndex.value);
});
const scrollHeight = computed(
  () => props.dataList.length * estimateItemHeight + diffHeight.value
);
// ****** methods ******
const onScroll = (offset) => {
  return new Promise<void>((resolve) => {
    scrollTop.value = offset;
    // 根据当前展示的section来获取section保存的需要展示的cells
    const visibleSet: number[] = [];
    const secStart = Math.max(
      0,
      Math.floor(Math.abs(scrollTop.value) / sectionSize)
    );
    const secEnd = Math.max(
      0,
      Math.floor(
        (Math.abs(scrollTop.value) + viewPortHeight.value) / sectionSize
      )
    );
    for (let x = secStart; x <= secEnd; x++) {
      if (sections[x]) {
        visibleSet.push(...sections[x]);
      }
    }
    if (visibleSet[0] !== startIndex.value) {
      startIndex.value = visibleSet[0] - Math.min(visibleSet[0], bufferSize);
      nextTick(() => {
        resolve();
      });
    } else {
      resolve();
    }
  });
};
const updateNodePoi = () => {
  let curDiffHeight = 0;
  itemNodes.value?.forEach((node) => {
    const nodeIndex = Number(node.dataset["index"]);
    if (nodeIndex > lastMeasureIndex) {
      lastMeasureIndex = nodeIndex;
    }
    if (!nodePositionMap.has(nodeIndex)) {
      nodePositionMap.set(nodeIndex, { ...defaultPos });
    }
    const info = nodePositionMap.get(nodeIndex);
    if (!info) return;
    const marginTop = node.style.marginTop.match(
      /-?\d+(\.\d+)?([eE][-+]?\d+)?/g
    );
    const marginBottom = node.style.marginBottom.match(
      /-?\d+(\.\d+)?([eE][-+]?\d+)?/g
    );
    let margin = 0;
    if (marginBottom && marginBottom[0]) {
      margin += parseInt(marginBottom[0]);
    }
    if (marginTop && marginTop[0]) {
      margin += parseInt(marginTop[0]);
    }
    if (info.height !== node.offsetHeight + margin) {
      curDiffHeight = node.offsetHeight + margin - info.height + curDiffHeight;
      info.height = node.offsetHeight + margin;
    }
    if (nodeIndex === 0) {
      info.top = node.offsetTop;
    } else {
      const prevInfo = nodePositionMap.get(nodeIndex - 1);
      if (!prevInfo) return;
      info.top = prevInfo.bottom;
    }
    info.bottom = info.top + info.height;
  });

  if (curDiffHeight !== 0 && !measureFinish) {
    diffHeight.value += curDiffHeight;
  }
  if (lastMeasureIndex === props.dataList.length - 1) {
    measureFinish = true;
  }
};
const updateSections = () => {
  if (
    !viewPortHeight.value ||
    (listWrapper.value?.scrollHeight &&
      listWrapper.value?.scrollHeight < viewPortHeight.value)
  ) {
    return;
  }

  itemNodes.value?.forEach((el, index) => {
    //
    const itemIndex = Number(el.dataset["index"]);
    const nodePosInfo = nodePositionMap.get(itemIndex) || { ...defaultPos };

    const sectionStart = Math.floor(nodePosInfo.top / sectionSize);
    const sectionEnd = Math.floor(nodePosInfo.bottom / sectionSize);

    const add = (flag) => {
      if (!sections[flag]) {
        sections[flag] = [];
      }
      if (!sections[flag].includes(itemIndex)) {
        sections[flag].push(itemIndex);
      }
    };
    // 先把下边界填充
    // add(sectionStart);

    for (let sectionY = sectionStart; sectionY <= sectionEnd; sectionY++) {
      add(sectionY);
    }
  });
};
const visibleCount = computed(() => {
  return count.value + bufferSize * 2;
});
const fillViewPort = () => {
  if (!listWrapper.value) return;
  if (
    listWrapper.value?.scrollHeight <= viewPortHeight.value &&
    startIndex.value + visibleCount.value < props.dataList.length
  ) {
    count.value += 2;
  }
};

// ****** lifecycle ******

watch([viewPortHeight], () => {
  fillViewPort();
});
onMounted(() => {
  fillViewPort();
  //
  updateNodePoi();
  updateSections();
});

onUpdated(() => {
  fillViewPort();
  updateNodePoi();
  updateSections();
  //
});
</script>

<style>
.virtual-list {
  overflow: hidden;
}
.virtual-list-wrapper {
  position: relative;
}
</style>

<template>
  <div id="app">
    <div>长列表</div>
    <VirtualList
      v-slot="{ index }"
      :item-height="200"
      :height="400"
      :data-list="data.list"
    >
      <div :style="{ backgroundColor: data.list[index].color, height: '100%' }">
        {{ data.list[index].key }}
      </div>
    </VirtualList>
    <!-- <div style="height: 1000px">长列表</div> -->
  </div>
</template>
<script setup lang="ts">
import ScrollView from "@/components/ScrollView.vue";
import VirtualList from "@/components/VirtualList.vue";
import { reactive } from "vue";

const data = reactive({
  list: new Array(1000).fill(0).map((i, index) => {
    return {
      key: index,
      color: `rgba(${parseInt(Math.random() * 255 + "")},${parseInt(
        Math.random() * 255 + ""
      )},${parseInt(Math.random() * 255 + "")},1)`,
    };
  }),
});
</script>

<style scoped lang="less">
.item {
  display: flex;
  align-items: center;
  justify-content: center;
}
.vxe-body--column {
  background-image: linear-gradient(#e8eaec, #e8eaec),
    linear-gradient(#e8eaec, #e8eaec);
  background-repeat: no-repeat;
  background-size: 1px 100%, 100% 1px;
  background-position: 100% 0, 100% 100%;
  height: 48px;
}
</style>

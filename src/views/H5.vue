<template>
  <div class="juejin">
    <span>长列表</span>
    <button @click="toggle">高度固定</button>
    <div @click="cancel">length:{{ data.list.length }}</div>
    <VariableSizeList
      v-if="!fixedHeight"
      :on-reach-bottom="onReachBottom"
      :itemStyle="{ marginBottom: '8px', padding: '20px 20px 0' }"
      v-slot="{ item, index }"
      :height="800"
      :data-list="data.list"
    >
      <Item v-bind="item" :index="index" />
    </VariableSizeList>
    <FixedSizeList
      v-else
      v-slot="{ item, index }"
      :mobile="true"
      :on-reach-bottom="onReachBottom"
      :itemStyle="{ height: '250px', overflow: 'hidden' }"
      :data-list="data.list"
      :height="500"
    >
      <Item v-bind="item" :index="index" />
    </FixedSizeList>
    <div style="height: 1000px">长列表</div>
  </div>
</template>
<script setup lang="ts">
import axios from "axios";
import { VariableSizeList, FixedSizeList } from "@/components/VirtualList";
import Item from "./Item.vue";
import { shallowReactive, reactive, ref, shallowRef } from "vue";
const http = axios.create({
  baseURL: "/api/juejin",
  withCredentials: true,
});
const fixedHeight = ref(true);
const toggle = () => {
  // fixedHeight.value = !fixedHeight.value;
  data.list[1].author_user_info.user_name = "左晓飞";
  setList([...data.list]);
};
const data = shallowReactive<{ list: any[] }>({
  list: [],
});
const pageIndex = 0;
let cursor = "0";
const getList = () => {
  http
    .post<{
      err_no: number;
      has_more: boolean;
      data: any[];
      count: number;
      cursor: string;
    }>(
      "/recommend_api/v1/short_msg/recommend?aid=2608&uuid=7163932049110648333&spider=0",
      {
        cursor,
        id_type: 4,
        limit: 20,
        sort_type: 300,
      }
    )
    .then((res) => {
      if (res.status === 200 && res.data.err_no === 0) {
        cursor = res.data.cursor;
        // const arr = new Array(100).fill(0).map(() => {
        //   return res.data.data[0];
        // });
        setList([...data.list, ...res.data.data]);
      }
    });
};
getList();
const onReachBottom = () => {
  console.log("onReachBottom");
  getList();
};
const getTopic = (content: string) => {
  const newContent = content;
  const resultArr = newContent.match(/(]\s)*[^\s]+/g);
  if (!resultArr) return newContent;
  if (resultArr.length > 1) {
    return resultArr;
  } else {
    return [undefined, resultArr[0]];
  }
};
const setList = (list: any[]) => {
  data.list = list;
};
const add = () => {
  //
};
const cancel = () => {
  data.list.shift();
  data.list = [...data.list];
};
</script>

<style scoped lang="less">
div,
p {
  margin: 0;
}
.juejin {
  background-color: #f2f3f5;
  height: 100%;
  margin: 0 auto;
}
.item {
  overflow: hidden;
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

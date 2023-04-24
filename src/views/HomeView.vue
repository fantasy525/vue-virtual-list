<template>
  <div class="juejin">
    <span>长列表</span>
    <div @click="add">增加</div>
    <div @click="cancel">length:{{ data.list.length }}</div>
    <VariableSizeList
      :itemStyle="{ marginBottom: '8px', padding: '20px 20px 0' }"
      v-slot="{ item, index }"
      :data-list="data.list"
    >
      <Item v-bind="item" :index="index" />
    </VariableSizeList>
    <!-- <div style="height: 1000px">长列表</div> -->
  </div>
</template>
<script setup lang="ts">
import axios from "axios";
import { VariableSizeList } from "@/components/VirtualList";
import Item from "./Item.vue";
import { shallowReactive, reactive, ref, shallowRef } from "vue";
const http = axios.create({
  baseURL: "/api/juejin",
  withCredentials: true,
});

const data = shallowReactive<{ list: any[] }>({
  list: [],
});
const getList = () => {
  http
    .post<{ err_no: number; has_more: boolean; data: any[]; count: number }>(
      "/recommend_api/v1/short_msg/recommend?aid=2608&uuid=7163932049110648333&spider=0",
      {
        cursor: "0",
        id_type: 4,
        limit: 200,
        sort_type: 300,
      }
    )
    .then((res) => {
      if (res.status === 200 && res.data.err_no === 0) {
        setList(res.data.data);
      }
    });
};
getList();
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
  width: 720px;
  height: 100%;
  margin: 0 auto;
}
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

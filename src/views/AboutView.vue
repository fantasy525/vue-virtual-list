<template>
  <div id="app" class="about">
    <ScrollView
      :on-scroll="onScroll"
      :height="500"
      :on-reach-bottom="onReachBottom"
    >
      <ItemVue
        :key="index"
        v-for="(item, index) in data.list"
        v-bind="item"
        :index="index"
      >
      </ItemVue>
    </ScrollView>
  </div>
</template>
<script setup lang="ts">
import ScrollView from "@/components/ScrollView.vue";
import { onMounted, reactive, shallowReactive } from "vue";
import ItemVue from "./Item.vue";
import axios from "axios";
const http = axios.create({
  baseURL: "/api/juejin",
  withCredentials: true,
});
const data = shallowReactive<{ list: any[] }>({
  list: [],
});
const pageIndex = 0;
let cursor = "0";
const setList = (list: any[]) => {
  data.list = list;
};
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
const onScroll = (offset: number) => {
  console.log(offset);
};
</script>

<style scoped lang="less">
.item {
  display: flex;
  align-items: center;
  justify-content: center;
}

.swiper {
  width: 100%;
  height: 100%;
}

.swiper-slide {
  font-size: 18px;
  height: auto;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  padding: 30px;
}
</style>

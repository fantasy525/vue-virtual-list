<template>
  <div id="app">
    <div>长列表</div>
    <div @click="add">增加</div>
    <div @click="cancel">length:{{ data.list.length }}</div>
    <VirtualList
      v-slot="{ index, item }"
      :item-height="101"
      :height="800"
      :data-list="data.list"
    >
      <div class="item" :style="{ height: '100%' }">
        <div class="left">
          <p class="title">
            <span>{{ index }} </span> {{ item.title }}
          </p>
          <p class="desc">{{ item.desc }}</p>
        </div>
        <img class="img" :src="item.img" />
      </div>
    </VirtualList>
    <!-- <div style="height: 1000px">长列表</div> -->
  </div>
</template>
<script setup lang="ts">
import VirtualList from "@/components/VirtualList.vue";
import { shallowReactive, reactive, ref, shallowRef } from "vue";
const imgs = [
  "https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/caaa82fa5d944f8e8946b86df87850fa~tplv-k3u1fbpfcp-no-mark:240:240:240:160.awebp?",
  "https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/30fee3436cb54087b08123a3cec899fc~tplv-k3u1fbpfcp-no-mark:240:240:240:160.awebp?",
  "https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5dc5de2cecf141feb4d60bec706d29bc~tplv-k3u1fbpfcp-no-mark:240:240:240:160.awebp?",
];
const data = shallowRef({
  list: new Array(1000000).fill(0).map((i, index) => {
    return {
      title: "写好文，参与现金奖池瓜分丨金石计划3.0玩法大升级！",
      desc: "金石计划是针对掘金社区创作者等级 lv4-lv8 的优质原创作者发起的奖金瓜分活动，根据要求完成挑战，即可瓜分现金奖池，心动不如行动，从这里开启通往技术大牛之路的第一步吧！",
      key: index,
      img: imgs[Math.floor(Math.random() * 3)],
      color: `rgba(${parseInt(Math.random() * 255 + "")},${parseInt(
        Math.random() * 255 + ""
      )},${parseInt(Math.random() * 255 + "")},1)`,
    };
  }),
});

const add = () => {
  data.value = {
    list: [
      ...data.value.list,
      {
        title: "写好文，参与现金奖池瓜分丨金石计划3.0玩法大升级！",
        desc: "金石计划是针对掘金社区创作者等级 lv4-lv8 的优质原创作者发起的奖金瓜分活动，根据要求完成挑战，即可瓜分现金奖池，心动不如行动，从这里开启通往技术大牛之路的第一步吧！",
        key: data.value.list.length + 1,
        img: imgs[Math.floor(Math.random() * 3)],
        color: `rgba(${parseInt(Math.random() * 255 + "")},${parseInt(
          Math.random() * 255 + ""
        )},${parseInt(Math.random() * 255 + "")},1)`,
      },
    ],
  };
};
const cancel = () => {
  data.value.list.shift();
  data.value.list = [...data.value.list];
};
</script>

<style scoped lang="less">
div,
p {
  margin: 0;
}
.item {
  display: flex;
  align-items: center;
  justify-content: center;

  border-bottom: 1px solid rgba(228, 230, 235, 0.5);
  .left {
    flex: 1 1 auto;
    text-align: left;
    padding-left: 20px;
  }
  .title {
    font-size: 16px;
    color: #1d2129;
    font-weight: 700;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
  .desc {
    color: #86909c;
    font-size: 13px;
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
  .img {
    width: 30vw;
    margin-left: 10vw;
    margin-right: 3vw;
    height: 100%;
  }
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

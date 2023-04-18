<template>
  <div id="app" class="about">
    <ScrollView :on-scroll="onScroll" :height="500">
      <div :key="index" v-for="(item, index) in data.list">
        {{ index }}
        <img :src="require('../assets/logo.png')" />
      </div>
    </ScrollView>
  </div>
</template>
<script setup lang="ts">
import ScrollView from "@/components/ScrollView.vue";
import { onMounted, reactive } from "vue";

const data = reactive({
  list: new Array(10000).fill(0).map((i, index) => {
    return {
      key: index,
      color: `rgba(${parseInt(Math.random() * 255 + "")},${parseInt(
        Math.random() * 255 + ""
      )},${parseInt(Math.random() * 255 + "")},1)`,
    };
  }),
});

onMounted(() => {
  const swiper = new Swiper(".myAboutSwiper", {
    direction: "vertical",
    slidesPerView: "auto",
    freeMode: { momentumBounce: false },
    resistanceRatio: 0,
    scrollbar: {
      el: ".swiper-scrollbar",
    },
    mousewheel: true,
    createElements: true, //自动生成元素
  });
});
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

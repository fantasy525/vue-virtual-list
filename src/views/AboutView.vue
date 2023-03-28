<template>
  <div id="app" class="about">
    <div class="swiper myAboutSwiper">
      <div class="swiper-slide">
        <div :key="index" v-for="(item, index) in data.list">
          {{ index }}
          <img :src="require('../assets/logo.png')" />
        </div>
      </div>
      <div class="swiper-scrollbar"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import ScrollView from "@/components/ScrollView.vue";
import { onMounted, reactive } from "vue";

const data = reactive({
  list: new Array(20).fill(0).map((i, index) => {
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
</script>

<style scoped lang="less">
.about {
  height: 500px;
}
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

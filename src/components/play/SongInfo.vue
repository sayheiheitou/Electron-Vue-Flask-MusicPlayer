<template>
    <div class="song-info">
      <img :src="this.isPlaying ? rainUrl : stopUrl" alt="Cover" class="cover" />
      <div class="details">
        <h3>{{ song.title }}</h3>
        <p>{{ song.artist }}</p>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      song: {},
      isPlaying: false, // 播放状态
    },
    data() {
      return {
        rainUrl: new URL('@/assets/meteor-rain.gif', import.meta.url).href, // 流星雨图片路径
        stopUrl: new URL('@/assets/play1.png', import.meta.url).href, // 停止图片路径
      }
    },

  };
  </script>
  <style scoped>
  .song-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .cover {
    width: 50px;
    height: 50px;
    border-radius: 50%;
  }
  </style>
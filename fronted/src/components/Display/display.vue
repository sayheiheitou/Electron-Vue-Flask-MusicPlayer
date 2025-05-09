
<template>
  <div class="display-component">
    <div class="search-container">
      <input
        type="text"
        v-model="searchQuery"
        placeholder="搜索歌曲..."
        class="search-input"
      />
    </div>
    <div class="song-list">
      <div class="scrollable-container">
      <ul class="scrollable-list">
      <li v-for="(song, index) in songs" :key="index">
        <span @click="playSong(index)">{{ song.title }}</span>
        <img :src="song.like ? black_heart : heart" alt="喜欢" width="15" height="15" @click="toggleImage(song.song_id)"/>
      </li>
    </ul>
    </div>
    </div>
  </div>
  </template>
  
  <script>
  export default {
    name: 'DisplayComponent',
    props: {
      songs: {
        type: Array,
        required: true,
        default: () => [],
      },
    },
    data() {
      return {
        searchQuery:'',
        currentPage: 1,
        pageSize: 8,
        heart:new URL('@/assets/heart.png', import.meta.url).href ,// 心形图片路径
       black_heart:new URL('@/assets/heart_black.png', import.meta.url).href,// 黑心图片路径
      };
    },
    mounted() {
    },
    computed: {
  },
    methods: {
      recurrentPage() {
    this.currentPage = 1; // 重置分页到第一页
  },
      playSong(index){
        this.$emit('playSong',index)
      },
      nextPage() {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
        }
      },
      prevPage() {
        if (this.currentPage > 1) {
          this.currentPage--;
        }
      },
      toggleImage(song_id) {
       // 切换指定索引的like状态
      console.log('This has been swtich', song_id)
      this.$emit('updateSongs', song_id); // 通知父组件更新 songs 数据
      },
  },
   };

  </script>
  
  <style scoped>
  .display-component {
    display: flex;
    flex-direction: column; /* 垂直布局 */
    height: 90%; /* 高度为父容器的100% */
    width: 80%; /* 宽度为父容器的100% */
    align-items: center;/*水平居中*/
    justify-content: flex-start;

  }
    .search-container {
    height: 10%;
    width: 90%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin:0; 
  }
  .song-list {
    text-align: center;
    height: 90%;
    width: 90%;
    background-color: #ffffff;
  }
  li{
    display: flex; /* 使用 flex 布局 */
  align-items: center; /* 垂直居中 */
  justify-content: space-between; /* 左右对齐 */
  padding: 0px 10px; /* 内边距 */
  margin:0px; /* 外边距 */
  background-color: #ffffff; /* 列表项背景色 */
  border-radius: 8px; /* 圆角 */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* 添加阴影 */
  cursor: pointer; /* 鼠标悬停时显示手型 */
  transition: background-color 0.3s, transform 0.2s; /* 添加过渡效果 */
  height: 10%;
  width: calc(100% - 17px);
  box-sizing: border-box; /* 包括内边距和边框在内的宽度计算 */
  }
  li:nth-child(odd) {
    background-color: #f4f4f4; /* 奇数行背景色 */
  }
  li:hover {
    background-color: #c0c6ba; /* 鼠标悬停时背景色变化 */
  }
  .scrollable-list {
    height: 100%; /* 设置固定高度，可根据实际需求调整 */
    width: calc(100% + 17px);
    list-style: none; /* 去除黑点 */
    padding: 0; /* 去除默认内边距 */
    margin: 0; 
    overflow-y: auto; /* 当内容超出高度时显示垂直滚动条 */
    overflow-x:hidden; /* 隐藏水平滚动条 */
  }
    /* 滚动容器，用于隐藏滚动条 */
    .scrollable-container {
    height: 80%; /* 设置固定高度，可根据实际需求调整 */
    width: 90%;
    margin: 20px auto; 
    overflow: hidden; /* 隐藏溢出内容 */
  }
  .search-input{
    width: 20%;
    height: 20%;
  }
  </style>
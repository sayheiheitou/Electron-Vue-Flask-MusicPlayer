<template>
    <div class="app">
      <Function 
      ref="function"
      @showLikeSongs="handleShowLikeSongs"
      @showHomePage="handleHomePage"
      @showHistory="handleShowHistory"
      :nickname = "nickname"
      />
      <Display 
      @playSong="handlePlaySong"
      @updateSongs="updateSong"
      :songs = songs
      ref="displayz"
      />
      <Player ref="player"
      @switch="handleSwitch"
      @playSong="handlePlaySong"
      @prev="prev"
      @next="next"
      />
    </div>
  </template>
  
  <script>
  import Player from '../components/play/Player.vue';
  import Display from '../components/Display/display.vue';
  import Function from '../components/Function/function.vue';
  import service from '../utils/request';
  import { onBeforeMount } from 'vue';//  引入 onBeforeMount 生命周期钩子
  
  export default {
    components: { 
      Player,Display,Function
     },
     data(){
      return {
        likes: [],//存储喜欢的歌曲
        history:[],//存储历史播放
        songs: [], // 用于存储歌曲列表
        currentList: [], // 当前播放列表
        Status_Code: 0, 
        SongCache:{},//缓存歌曲列表
        maxCacheSize: 10, // 最大缓存大小
        currentUrl: null, // 当前播放的音频 URL
        currentSongListIndex: null, // 当前播放的歌曲列表索引
        islogined: false, // 登录状态
        nickname: '登录', // 用户昵称
      }
        
     },
     methods: {
      async fetchSongList(){// 获取歌曲列表
      try{
        const response = await service.get('/home')
        this.songs = response
        this.currentList = this.songs; // 初始化时显示所有歌曲
      }catch(err){
        console.error('get songList faiue', err)
      }
    },
      handleHomePage(){
        console.log("showHomePage")
        this.Status_Code = 0; // 设置状态码为0
        this.currentList = this.songs; 
        if (this.$refs.displayz && typeof this.$refs.displayz.recurrentPage === 'function') {
        this.$refs.displayz.recurrentPage(); // 调用子组件方法
    } else {
      console.error("recurrentPage is not a function or display ref is not available.");
    }
      },
      handleShowLikeSongs() {
        console.log("showLikeSongs");
        // console.log('updated currentPage:',this.$refs.display.currentPage);
        this.Status_Code = 1; // 设置状态码为1
        this.currentList = this.likes; // 显示喜欢的歌曲
        this.$nextTick(() => {
        if (this.$refs.displayz && typeof this.$refs.displayz.recurrentPage === 'function') {
        this.$refs.displayz.recurrentPage(); // 调用子组件方法
    } else {
      console.error("recurrentPage is not a function or display ref is not available.");
    }
  })
        console.log('currentList_Length:',this.currentList.length)
      },
      handleShowHistory(){
        console.log("showHistory")
        this.Status_Code = 2 // 设置状态码为2
        this.currentList = this.history; // 显示历史播放列表
        this.$nextTick(() => {
        if (this.$refs.displayz && typeof this.$refs.displayz.recurrentPage === 'function') {
        this.$refs.displayz.recurrentPage(); // 调用子组件方法
    } else {
      console.error("recurrentPage is not a function or display ref is not available.");
    }
  })
      },
       async handlePlaySong(index) {//传递的是歌曲在当前列表的索引
        const song = this.currentList[index]; // 获取当前歌曲对象
        const song_id = song.song_id; // 获取歌曲主键-ID
        console.log("playSong_id:", song_id);
        let audioUrl;
        //检查缓存中是否有该歌曲
        if(this.SongCache[song_id]) {
          console.log('This song has been cached:', song_id)
          const blob = this.SongCache[song_id]
          audioUrl = URL.createObjectURL(blob);
        }else{
          try{
          console.log('This song has not been cached:', song_id)
          const music_resource =  await service.get(
          '/getMusicResource?id=' + song_id,
          { responseType: 'blob' }
        )
        const blob = music_resource;
        // 检查缓存大小并移除最旧的缓存
        if (Object.keys(this.SongCache).length >= this.maxCacheSize){
          const oldestKey = Object.keys(this.SongCache)[0]; // 获取最旧的缓存键
          delete this.SongCache[oldestKey]; // 删除最旧的缓存
        } 
          this.SongCache[song_id] = blob; // 缓存歌曲
          audioUrl = URL.createObjectURL(blob);
        if(this.currentUrl){
          URL.revokeObjectURL(this.currentUrl); // 释放之前的URL
        }
        this.currentUrl = audioUrl; // 更新当前播放的音频 URL
      }catch(err){
          console.error('get music resource failed:', err.message);
          return; 
        }
      }
      this.$refs.player.transUrl(audioUrl,song); // 播放音乐
      this.currentSongListIndex = index; // 更新当前播放的歌曲列表索引
    },

// 修改歌曲的喜欢状态
      async updateSong(song_id) {
        console.log("updateSong", song_id);
        try{
          const response = await service.get('/updatesongs'+`?id=${song_id}`)
          console.log('updateSong response:', response.message)
        }catch(err){
          console.error('update song failed:', err.message)
        }
      },


      handleSwitch(isPlaying) {
        this.isPlaying = isPlaying; // 更新播放状态
        //保持播放状态一致
        
        console.log("staus have changed:", isPlaying);
        },
        clearAllCache() { // 清空所有缓存
        this.SongCache = {}; // 清空缓存对象
        console.log('All caches have been cleared.');
        URL.revokeObjectURL(this.currentUrl);
      },


      prev() {//播放currentList的上一首
        console.log('currentSongListIndex:', this.currentSongListIndex)
        if(this.currentSongListIndex !== null && this.currentSongListIndex > 0) {
          this.handlePlaySong(this.currentSongListIndex - 1); // 播放上一首
        }else {
          console.log('No previous song available.');
        }
      },
      next() {//播放currentList的下一首
        if(this.currentSongListIndex !== null && this.currentSongListIndex < this.currentList.length - 1) {
          this.handlePlaySong(this.currentSongListIndex + 1); // 播放下一首
        }else {
          console.log('No next song available.');
        }
      },
      async getUserInfo() { // 获取用户信息
        
        const Info = await service.get('/getUserInfo')
        if(Info.nickname){
          this.nickname = Info.nickname;
        }
      },
      //初始化组件，获取歌曲列表
      async init() {
        try{
          await this.fetchSongList(); // 获取歌曲列表
        const loginIn = localStorage.getItem('isLoginedIn')
        console.log('loginIn:', loginIn)
        if(loginIn === 'true'){
          this.islogined = true; // 设置登录状态为true
          await this.getUserInfo(); // 获取用户信息
          console.log('nickname:', this.nickname)
        }
      }catch(err){
          console.error('init failed:', err.message)
        }
      },
      exitLogin(){
        localStorage.removeItem('isLoginedIn'); // 移除登录状态
        localStorage.removeItem('authToken'); // 移除token
      }
    },
      mounted() {
      this.init(); // 初始化组件
      },
      beforeUnmount() {
      this.clearAllCache();
    }
  };
  </script>
  
  <style>
  .app {
    display: flex;
    height: 100%;
    flex-wrap:wrap;
  }
  </style>
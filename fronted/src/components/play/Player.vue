<template>
    <div class="player">
      <SongInfo :song="currentSong"
      :isPlaying="isPlaying" 
      ref="songInfo"
      />
      <PlayControl ref="contorl"
      @switch="status_change"
      @playSong="playSong"
      @prev="prev"
      @next="next"
      />
      <otherControl />
    </div>
  </template>
  
  <script>
  import SongInfo from './SongInfo.vue';
  import PlayControl from './PlayControl.vue';
  import otherControl from './otherControl.vue';
  
  export default {
    components: { SongInfo, PlayControl,otherControl},
    data() {
      return {
        isPlaying: false,
        currentSong: { // 当前播放的歌曲信息
          song_id: 1, // 歌曲ID
          title: 'Song Name', // 歌曲名称
          artist: 'Artist Name', // 歌手名称
        },
        progress: 0, // 播放进度（0-100）
        volume: 50,  // 音量（0-100）
      };
    },
    methods: {
      transUrl(url,song) {
       this.$refs.contorl.playSong(url); // 调用子组件的方法播放音乐
       this.currentSong = song; // 更新当前播放的歌曲信息
       this.isPlaying = true; // 设置播放状态为true
      },
      playSong(songID) {
        this.$emit('playSong', songID); // 通知父组件播放的歌曲
      },
      pause() {
        this.isPlaying = false;
        // 暂停逻辑
      },
      prev() {
        // 上一首逻辑
      },
      next() {
        // 下一首逻辑
      },
      seek(progress) {
        this.progress = progress;
        // 跳转进度逻辑
      },
      changeVolume(volume) {
        this.volume = volume;
        // 调整音量逻辑
      },
      status_change(isPlaying) {
        this.isPlaying = isPlaying;
        this.$emit('switch', isPlaying); // 通知父组件播放状态
    },
    prev() {
      this.$emit('prev'); // 通知父组件播放上一首
    },

    // 播放下一首
    next() {
      this.$emit('next'); // 通知父组件播放下一首
    },
  }
};
  </script>
  
  <style scoped>
  .player {
    display: flex;
    height: 10%;
    width: 100%;
    justify-content: space-around;
    background-color: #ffffff;
  }
  </style>
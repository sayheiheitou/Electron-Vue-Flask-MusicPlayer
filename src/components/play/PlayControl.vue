<template>
    <div class="play_control">
    <div class = "control">
      <!-- 上一首图片 -->
       <img
        :src="prev_url"
        alt="上一首"
        class="control-icon"
        @click="prev"
       >
        <!-- 播放/暂停图片 -->
        <img 
                :src="isPlaying ? image_pause_url : image_play_url" 
                alt="播放/暂停" 
                @click="togglePlay" 
                class="control-icon"
            />
            <!-- 下一首图片 -->
            <img 
                :src="next_url" 
                alt="下一首" 
                @click="next" 
                class="control-icon"
            />
            <!-- 声音设置图片 -->
            <img 
                :src="sound_url" 
                alt="声音" 
                class="control-icon"
            />
    </div>
    <div class="progressBar">
      <input
        type="range"
        min="0"
        max="100"
        :value="progress"
         @input="seek"
         class="custom-slider"
      />
    </div>
    <div>
      <audio  ref= "audio" id="myAudio" @timeupdate="updateProgress">
        </audio>
    </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        progress: 0,
        isPlaying: false, // 播放状态
        currenturl: null, // 当前播放的音乐URL
        image_play_url: new URL('@/assets/play.png', import.meta.url).href, // 播放图片路径
        image_pause_url: new URL('@/assets/pause.png', import.meta.url).href, // 暂停图片路径
        next_url: new URL('@/assets/next.png', import.meta.url).href, // 下一首图片路径
        prev_url: new URL('@/assets/pre.png', import.meta.url).href, // 上一首图片路径
        sound_url: new URL('@/assets/sound.png', import.meta.url).href, // 声音设置图片路径
      };
    },
    
    methods: {
    // 切换播放/暂停
     togglePlay() {
      this.isPlaying = !this.isPlaying;
      if(this.isPlaying) {
       if(this.currenturl) {
        this.$refs.audio.play(); // 继续播放音乐
       }else{
        console.log("NO MUSIC"); // 没有音乐
        this.isPlaying = false; // 设置为暂停状态
       }
      }else {
        this.$refs.audio.pause(); // 暂停音乐
      }
      this.$emit('switch', this.isPlaying); // 通知父组件播放状态
    },

    // 播放上一首
    prev() {
      console.log("prev"); // 调试信息
      this.$emit('prev'); // 通知父组件播放上一首
    },

    // 播放下一首
    next() {
      this.$emit('next'); // 通知父组件播放下一首
    },

    // 播放传递过来的音乐和音乐信息进行渲染
    async playSong(url) {
      this.$refs.audio.src = url;
      this.currenturl = url; // 更新当前播放的音乐URL
      this.$refs.audio.play();
      if(!this.isPlaying) {
        this.$emit('switch', true); // 通知父组件播放状态
      }
      this.isPlaying = true; // 更新播放状态
    },

    // 更新进度条
    updateProgress() {
      const audio = this.$refs.audio;
      this.progress = (audio.currentTime / audio.duration) * 100;
    },

    // 跳转到指定进度
    seek(event) {
      const audio = this.$refs.audio;
      const seekTime = (event.target.value / 100) * audio.duration;
      audio.currentTime = seekTime;
      this.progress = event.target.value;
    },
  },
};
  </script>
  <style scoped>
  button {
  background-color: #4caf50; /* 绿色背景 */
  border: none;
  color: white; /* 白色文字 */
  padding: 15px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 12px; /* 圆角 */
  transition: background-color 0.3s ease; /* 背景色过渡效果 */
}

button:hover {
  background-color: #45a049; /* 悬停时的背景色 */
}
  .play_control {
    display: flex;
    justify-content: center;
    flex-wrap:wrap;
    flex-direction: column;
    width:50%;
    /* box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); 添加阴影效果 */
  }
  .custom-slider {/*自定义滑块*/
    width: 100%; /* 占满父容器宽度 */
    margin-top:10px;
}
.control{
  display: flex;
  justify-content: center;
  margin-top:10px;
}
.control-icon {
    /* 可根据需求修改图片的宽度和高度 */
    width: 30px; 
    height: 30px; 
    margin: 0 8px; 
    cursor: pointer; 
    transition: transform 0.2s; 
}
  </style>
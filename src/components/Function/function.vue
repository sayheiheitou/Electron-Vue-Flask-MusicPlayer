<!-- filepath: e:\projects\my-electron-app\src\components\Function\function.vue -->
<template>
  <div class="function-container">
  <ul class="about-user">
    <li class="avatar-item">
        <img 
          :src="avatarUrl" 
          alt="用户头像" 
          width="30" 
          height="30" 
          class="avatar"
        />
        <p @click="goToLogin">{{ this.nickname }}</p>
      </li>
  </ul>
    <ul class="function-component">
      <li  @click="showHomePage">
        <img src="../../assets/home.png" alt="主页" width="15" height="15" />
        <p>主页</p>
      </li>
      <li @click="showLikeSongs">
        <img src="../../assets/heart.png" alt="喜欢" width="15" height="15" />
        <p>喜欢</p>
      </li>
      <li  @click="showHistory">
        <img src="../../assets/clock.png" alt="历史" width="15" height="15" />
        <p>历史播放</p>
      </li>
    </ul>
  </div>
  </template>
  
  <script>
  export default {
    name: 'FunctionComponent',
    data() {
      return {
        avatarUrl: new URL('@/assets/avatar.png', import.meta.url).href, // 用户头像路径
      };
    },
    props:{
      nickname:{
        type:String,
        default:'登录',
      }
    },

    methods: {
      showLikeSongs() {
        this.$emit('showLikeSongs'); // 触发事件，传递给父组件
      },
      showHomePage(){
        this.$emit('showHomePage'); // 触发事件，传递给父组件
      },
      showHistory(){
        this.$emit('showHistory'); // 触发事件，传递给父组件
      },
      goToLogin(){
        try {
          console.log(this.$router); // 打印路由对象
          this.$router.push('/login'); // 跳转到登录页面
          this.$router.replace('/login')  // 替换当前路由
        }
        catch (error) {
          console.error('jump faiure:', error); // 处理跳转失败的情况
        }
      },
    },
  };
  </script>
  
  <style scoped>
  .function-container{
    height: 90%;
    width: 20%;
    display: flex; /* 采用 flex 布局 */
    flex-direction: column; /* 垂直布局 */
    background-color: #f4f4f4; /* 背景颜色 */
    
  }
  .about-user{
    padding: 0; /* 去除默认内边距 */;
  }
  .function-component {
    display: flex; /* 采用 flex 布局 */
    flex-direction: column; /* 垂直布局 */
    justify-content:center; /* 内容靠上对齐 */
    padding: 0; /* 去除默认内边距 */;
    height: 90%;
    width: 100%;
    text-align: center;
    margin :0;
    overflow: hidden;
    list-style: none;
    box-sizing: border-box;
  }
  li{
    display: flex; /* 采用 flex 布局 */
    flex-direction: row;
    justify-content: flex-start; /* 内容靠左对齐 */
    align-items: center;
    width: 90%;
    height: 50px;
    cursor: pointer;
    padding-left: 10%; /* 添加左内边距，让内容离左侧有一定距离 */
  }
  li:hover{
    background-color: #c0c6ba; /* 鼠标悬停时的背景颜色 */
  }
  p{
    margin: 0; /* 去除默认外边距 */
    padding-left: 10px; /* 添加左内边距，让文本离图片有一定距离 */
    font-size: 16px; /* 设置字体大小 */
    color: #333; /* 设置字体颜色 */
  }
  .avatar-item {
    justify-content: center;
    padding: 20px 0;
    height: auto;
  }
  .avatar {
    border-radius: 50%; /* 圆形头像 */
  }
  </style>
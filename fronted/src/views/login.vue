<!-- 工作：检查登录信息，发送登录信息，获取token并存储到localStorage，跳转到仪表盘页面 -->
<template>
    <div class="login-container">
      <h2>音乐系统登录</h2>
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="username">用户名</label>
          <input
            type="text"
            id="username"
            v-model="username"
            required
            placeholder="请输入用户名"
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            placeholder="请输入密码"
          />
        </div>
        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
      <div class="register-link">
      <p>还没有账号？<router-link to="/register">立即注册</router-link></p>
      <router-link to="/">回到主页</router-link>
    </div>
    </div>
  </template>
  
  <script>
  import service from '../utils/request.js';
  
  export default {
    data() {
      return {
        username: '',
        password: '',
        loading: false,
        error: ''
      };
    },
    methods: {
      async handleLogin() {
        this.loading = true;
        this.error = '';
        
        try {
          const response = await service.post('/login', {
            username: this.username,
            password: this.password
          });
          // 登录成功处理
          if(response.access_token){
            console.log('login success')
            localStorage.setItem('isLoginedIn','true')
            localStorage.setItem('authToken', response.access_token);
            this.$router.push('/'); // 跳转到主页
          }else{
            this.error = 'login failed, please check your username and password';
          }
        } catch (err) {
          this.error = err.message || '登录失败，请重试';
        } finally {
          this.loading = false;
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .login-container {
    max-width: 400px;
    margin: 2rem auto;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    text-align: center;
    color: #333;
    margin-bottom: 1.5rem;
  }
  
  .login-form {
    display: flex;
    flex-direction: column;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: bold;
  }
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  .login-btn {
    background-color: #4CAF50;
    color: white;
    padding: 0.75rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    margin-top: 1rem;
  }
  
  .login-btn:hover {
    background-color: #45a049;
  }
  
  .login-btn:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .error-message {
    color: #ff3333;
    margin-top: 1rem;
    text-align: center;
  }
  </style>
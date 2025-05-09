<template>
  <div class="register-container">
    <h2>注册</h2>
    <form @submit.prevent="handleRegister" class="register-form">
      <div class="form-group">
        <label for="nickname">用户昵称</label>
        <input
          type="text"
          id="nickname"
          v-model="nickname"
          required
          placeholder="请输入用户昵称"
        />
      </div>
      <div class="form-group">
        <label for="username">账号</label>
        <input
          type="text"
          id="username"
          v-model="username"
          required
          placeholder="请输入账号"
        />
      </div>
      <div class="form-group">
        <label for="email">邮箱</label>
        <input
          type="email"
          id="email"
          v-model="email"
          required
          placeholder="请输入邮箱"
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
      <div class="form-group">
        <label for="confirmPassword">确认密码</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="confirmPassword"
          required
          placeholder="请再次输入密码"
        />
      </div>
      <button type="submit" :disabled="loading" class="register-btn">
        {{ loading ? '注册中...' : '注册' }}
      </button>
      <p v-if="error" class="error-message">{{ error }}</p>
      <p v-if="success" class="success-message">{{ success }}</p>
    </form>
    <div class="login-link">
      <p>已有账号？<router-link to="/">立即登录</router-link></p>
    </div>
  </div>
</template>

<script>
import service from '../utils/request.js';
import '../assets/styles/register.css'; 

export default {
  data() {
    return {
      username: '',
      email: '', // 新增邮箱字段
      password: '',
      confirmPassword: '',
      loading: false,
      error: '',
      success: '',
      nickname: '', 
    };
  },
  methods: {
    async handleRegister() {
      this.loading = true;
      this.error = '';
      this.success = '';

      // 检查两次密码是否一致
      if (this.password !== this.confirmPassword) {
        this.error = '两次输入的密码不一致';
        this.loading = false;
        return;
      }

      try {
        const response = await service.post('/register', {
          username: this.username,
          nickname: this.nickname, // 发送昵称字段
          email: this.email, // 发送邮箱字段
          password: this.password,
        });
        console.log(response);
        // 注册成功处理
        this.$router.push('/'); // 跳转到登录页面
        this.success = '注册成功，请前往登录页面';
        this.username = '';
        this.email = ''; // 清空邮箱字段
        this.password = '';
        this.confirmPassword = '';
      } catch (err) {
        this.error = err.message || '注册失败，请重试';
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

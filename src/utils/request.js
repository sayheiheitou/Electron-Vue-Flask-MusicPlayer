import axios from "axios"

const service = axios.create({
  baseURL: ' http://127.0.0.1:5000', // 从环境变量获取基础URL
  timeout: 5000 // 请求超时时间
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 在发送请求之前做些什么
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token
    }
    return config
  },
  error => {
    // 对请求错误做些什么
    console.log(error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // 对响应数据做点什么
    return response.data
  },
  async error => {
    // 提取服务器返回的错误信息
    if (error.response && error.response.status === 401) { // 401 表示未授权，通常是 token 过期
      localStorage.removeItem('authToken');
      localStorage.removeItem('isLoginedIn');
      if(error.response.data instanceof Blob){
        const errorText = await error.response.data.text();
        error.response.data = JSON.parse(errorText);
      } 
      const customError = {
        status: error.response.status, // HTTP 状态码
        message: error.response.data.message || '请求失败', // 服务器返回的错误信息
      };
      alert("请先登录"); // 提示用户
      return Promise.reject(customError); // 将自定义错误传递给调用者
    }
    if (error.response && error.response.data) {
      const customError = {
        status: error.response.status, // HTTP 状态码
        message: error.response.data.message || '请求失败', // 服务器返回的错误信息
      };
      return Promise.reject(customError); // 将自定义错误传递给调用者
    }
    
    // 如果没有响应数据，返回默认错误
    return Promise.reject(error);
  }
)

export default service

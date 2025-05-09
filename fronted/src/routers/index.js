import { createRouter,createWebHistory } from "vue-router"
import Home from "../views/main.vue"
import Login from "../views/login.vue"
import Register from "../views/register.vue"

const router = createRouter({
    history:createWebHistory(),
    routes:[
    {path:'/login',component:Login},
    {path:'/',component:Home},
    {path:'/register',component:Register},
    ]
}
)
export default router
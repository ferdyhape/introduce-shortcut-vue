import { createRouter, createWebHistory } from "vue-router";
import MainPage from "../views/Main.vue";
import OpeningPage from "../views/Opening.vue";

const routes = [
  { path: "/", component: OpeningPage },
  { path: "/main", component: MainPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;

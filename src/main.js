import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { pageTitle } from "./data/config";

const app = createApp(App);
app.use(router);
app.mount("#app");
document.title = pageTitle;

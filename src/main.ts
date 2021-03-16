import { createApp } from "vue";
import "ant-design-vue/dist/antd.css";
import App from "./App";
import router from "./router";
import store from "./store";

createApp(App).use(store).use(router).mount("#app");

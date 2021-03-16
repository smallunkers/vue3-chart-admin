import { defineComponent } from "vue";

export default defineComponent({
  name: "Home",
  setup() {
    return () => (
      <div class="welcome flex f-fd-c f-ai-c">
        <img class="logo" src="@/assets/imgs/logo.png" />
        <div class="title">欢迎来后台系统</div>
      </div>
    );
  },
});

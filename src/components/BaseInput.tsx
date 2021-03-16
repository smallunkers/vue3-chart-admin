import { defineComponent } from "vue";
import { Input as AInput } from "ant-design-vue";
export default defineComponent({
  name: "BaseInput",
  props: {
    placeholder: {
      type: String,
      default: "请输入内容",
    },
    type: {
      type: String,
      default: "text",
    },
    value: {
      type: String,
      default: "",
    },
    style: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["change"],
  setup(props, { emit }) {
    const handleChange = (e: Event) => {
      const inputEl = e.target as HTMLInputElement;
      emit("change", inputEl.value);
    };

    return () => {
      return (
        <AInput
          style={props.style}
          placeholder={props.placeholder}
          value={props.value}
          onChange={handleChange}
        ></AInput>
      );
    };
  },
});

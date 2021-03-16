import { defineComponent, PropType } from "vue";
import { DatePicker as ADatePicker } from "ant-design-vue";
import { Moment } from "moment";

type Value = [Moment, Moment] | string | Moment | Date;
const { RangePicker: ARangePicker } = ADatePicker;
export default defineComponent({
  name: "BaseTimeRange",
  emits: ["change"],
  props: {
    placeholder: {
      type: Array as PropType<string[]>,
      default: [],
    },
    value: {
      type: [Array, null, String] as PropType<Value>,
      default: () => [],
    },
    type: {
      type: String,
      default: "datetime",
    },
    style: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const handleChange = (val: Value) => {
      emit("change", val);
    };
    return () => {
      return (
        <ARangePicker
          style={props.style}
          type={props.type}
          value={props.value}
          onChange={handleChange}
          placeholder={props.placeholder}
        ></ARangePicker>
      );
    };
  },
});

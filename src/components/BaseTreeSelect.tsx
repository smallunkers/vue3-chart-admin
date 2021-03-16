import { defineComponent, PropType } from "vue";
import { TreeSelect as ATreeSelect } from "ant-design-vue";

interface TreeItem extends Record<string, unknown> {
  label?: string;
  value?: string | number;
  leaf?: boolean;
  children?: TreeItem[];
  disabled?: boolean;
}

type Value = number | number[] | string[];

export default defineComponent({
  name: "BaseTreeSelect",
  props: {
    extra: {
      type: Array as PropType<Array<TreeItem>>,
      default: () => [],
      required: true,
    },
    placeholder: {
      type: String,
      default: "请选择",
    },
    allowClear: {
      type: Boolean,
      default: true,
    },
    value: {
      type: [Number, Array] as PropType<Value>,
      default: null,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    style: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["change"],
  setup(props, { emit }) {
    const handleChange = (val: Value) => {
      emit("change", val);
    };
    return () => {
      return (
        <ATreeSelect
          style={props.style}
          placeholder={props.placeholder}
          value={props.value}
          multiple={props.multiple}
          treeData={props.extra}
          onChange={handleChange}
          allowClear={props.allowClear}
        ></ATreeSelect>
      );
    };
  },
});

import { defineComponent, PropType, computed, ComputedRef } from "vue";
import { Select as ASelect } from "ant-design-vue";

type ExtraArray = Array<{ value: any; label: any }>;
type Value = string | number | string[] | number[];
type Mode = "multiple" | "tags" | "SECRET_COMBOBOX_MODE_DO_NOT_USE" | undefined;
const { Option: ASelectOption } = ASelect;

export default defineComponent({
  name: "BaseSelect",
  props: {
    extra: {
      type: [Object, Array] as
        | PropType<ExtraArray>
        | PropType<Record<any, any>>,
      required: true,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: "",
    },
    value: {
      type: [String, Number, Array] as PropType<Value>,
    },
    allowClear: {
      type: Boolean,
      default: true,
    },
    mode: {
      type: String as PropType<Mode>,
    },
    style: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ["change"],
  setup(props, { emit }) {
    const extraList: ComputedRef<ExtraArray> = computed(() => {
      if (Array.isArray(props.extra)) return props.extra;
      const result: ExtraArray = [];
      for (const key in props.extra) {
        result.push({ label: props.extra[key], value: key });
      }
      return result;
    });

    const handleChange = (val: Value) => {
      emit("change", val);
    };
    return () => {
      return (
        <ASelect
          style={props.style}
          onChange={handleChange}
          value={props.value}
          mode={props.mode}
          placeholder={props.placeholder}
          allowClear={props.allowClear}
        >
          {extraList.value.map((item) => (
            <ASelectOption
              key={item.value}
              value={item.value}
              label={item.label}
            >
              {item.label}
            </ASelectOption>
          ))}
        </ASelect>
      );
    };
  },
});

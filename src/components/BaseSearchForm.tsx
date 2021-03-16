import {
  defineComponent,
  PropType,
  reactive,
  onMounted,
  watchEffect,
  Ref,
  ref,
  DefineComponent,
} from "vue";
import { Form as AForm, Button as AButton } from "ant-design-vue";
import BaseInput from "@/components/BaseInput";
import BaseTreeSelect from "@/components/BaseTreeSelect";
import BaseSelect from "@/components/BaseSelect";
import BaseTimeRange from "@/components/BaseTimeRange";

const { Item: AFormItem } = AForm;

interface SearchMapItem {
  compName: string;
  placeholder?: string | string[];
  clearable?: boolean;
  label?: string;
  prop: string;
  handles?: Array<Btn>;
  defaultValue?: any;
  extra?: any;
  keyMaps?: Record<any, any>;
  type?: string;
  width?: number;
  height?: number;
  minWidth?: number;
  allowCreate?: boolean;
  compProps?: Record<any, any>;
  action?: () => void;
}

type BtnType = "default" | "link" | "dashed" | "primary" | "ghost" | "danger";
type BtnKey = "search" | "add" | "reset" | "export";

interface Btn {
  text: string;
  type: BtnType;
  btn: BtnKey;
  action?: string;
  loading?: boolean;
  click: (params: Record<any, any>) => void;
}

interface Layout {
  span: number;
  offset: number;
}

interface SearchMap {
  list: Array<SearchMapItem>;
  labelCol?: Layout;
  wrapperCol?: Layout;
}
export default defineComponent({
  name: "BaseSearchForm",
  components: {
    BaseInput,
    BaseTreeSelect,
    BaseTimeRange,
    BaseSelect,
  },
  props: {
    searchMap: {
      type: Object as PropType<SearchMap>,
      default: () => ({}),
      required: true,
    },
  },
  setup(props) {
    const btnTxt = {
      search: "查询",
      add: "添加",
      reset: "重置",
      export: "导出",
    };

    const form: Record<string, any> = reactive({});
    const actionList: Array<any> = reactive([]);
    const FormRef: Ref<any> = ref(null);

    const componentMap: Record<string, any> = {
      BaseInput: BaseInput,
      BaseSelect: BaseSelect,
      BaseTimeRange: BaseTimeRange,
      BaseTreeSelect: BaseTreeSelect,
    };
    onMounted(() => {
      watchEffect(() => {
        initForm(props.searchMap && props.searchMap.list);
      });
    });

    const initForm = (list: Array<SearchMapItem>): void => {
      list.forEach((item: SearchMapItem) => {
        if (item.prop) form[item.prop] = item.defaultValue;
        if (item.handles) {
          item.handles.forEach((handle) => {
            if (handle.action) actionList.push(handle.action);
          });
        } else {
          if (item.action) {
            actionList.push(item.action);
          }
        }
      });
    };

    const handle = (btn: Btn) => {
      switch (btn.btn) {
        case "search":
          search(btn);
          break;
        case "reset":
          reset(btn);
          break;
        case "export":
          exportTable(btn);
          break;
        default:
          break;
      }
    };

    const search = (btn: Btn) => {
      const params = { ...currentParams(), pageIndex: 1 };
      btn.click(params);
    };

    const reset = (btn: Btn) => {
      FormRef.value.resetFields();
      const params = { ...currentParams(), pageIndex: 1 };
      btn.click(params);
    };

    const exportTable = (btn: Btn) => {
      const params = { ...currentParams() };
      if (btn.click) btn.click(params);
    };

    const currentParams = () => {
      const params = { ...form };
      for (const key in form) {
        if (key.indexOf(",") > -1) {
          // 时间段字段处理
          const start: string | number = form[key]
            ? form[key].length > 0 && form[key][0]
              ? Number(form[key][0].unix())
              : ""
            : "";
          const end: string | number = form[key]
            ? form[key].length > 0 && form[key][1]
              ? Number(form[key][1].unix())
              : ""
            : "";
          const multiKeys = key.split(",");
          params[multiKeys[0]] = start;
          params[multiKeys[1]] = end;
          delete params[key];
        }
      }
      return params;
    };

    return () => {
      const list = props.searchMap.list || [];
      return (
        <AForm ref={FormRef} layout="inline" model={form}>
          {list.map((item, index) => {
            let child: any = null;
            if (item.compName === "handles" && item.handles) {
              child = item.handles.map((btn: Btn, btnIndex) => (
                <AButton
                  class="mr12"
                  key={btnIndex}
                  type={(btn.type as BtnType) || "primary"}
                  loading={btn.loading}
                  onClick={() => handle(btn)}
                >
                  {btn.text || btnTxt[btn.btn]}
                </AButton>
              ));
            } else if (item.compName === "info") {
              child = item.defaultValue;
            } else {
              const MyComponent: DefineComponent = componentMap[item.compName];
              child = (
                <MyComponent
                  allowCreate={item.allowCreate}
                  {...item.compProps}
                  extra={item.extra}
                  placeholder={item.placeholder || item.label}
                  value={form[item.prop]}
                  onChange={(val: any) => {
                    form[item.prop] = val;
                  }}
                  type={item.type || ""}
                  clearable={item.clearable || false}
                  keyMaps={item.keyMaps || {}}
                  style={{
                    width: item.width + "px",
                    minWidth: `${item.minWidth || item.width}px`,
                  }}
                ></MyComponent>
              );
            }
            return (
              <AFormItem
                label={item.label}
                name={item.prop}
                key={`${item.compName}${index}`}
              >
                {child}
              </AFormItem>
            );
          })}
        </AForm>
      );
    };
  },
});

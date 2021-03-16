import { defineComponent, ref } from "vue";
import { Button, Modal } from "ant-design-vue";
import { dataFormat } from "./data";
import ChartSmall from "./ChartSmall";
import ChartMain from "./ChartMain";
import "./Slider.styl";

type YItem = {
  data: number[];
  color: string;
  name?: string;
};

interface ChartDataItem {
  name: string;
  data: { x: number[]; y: YItem[] };
  type: string;
  key: string;
  xName: string;
  ySeriesName?: string;
  xSeriesName: string;
}

export default defineComponent({
  name: "Slider",
  components: {
    ChartSmall,
  },
  setup() {
    const allData = ref(dataFormat());
    const modalVisible = ref(false);
    const nowIndex = ref(0);
    const toggle = () => {
      modalVisible.value = !modalVisible.value;
    };
    const click = (index: number) => {
      nowIndex.value = index;
    };
    return () => {
      return (
        <div class="page-slider">
          <Button onClick={toggle}>打开图表</Button>
          <Modal
            width={1000}
            getContainer={() => document.querySelector(".page-slider")}
            class="chart-modal"
            bodyStyle={{ height: 700 }}
            visible={modalVisible.value}
            destroyOnClose
            onCancel={toggle}
          >
            <div class="chart-container pt24">
              <div class="chart-small flex">
                {allData.value.map((item: any, index: number) => {
                  return (
                    <div
                      class={`flex-1 pl24 pr24 pointer ${
                        index !== allData.value.length - 1 ? "border-right" : ""
                      }`}
                      style={{ height: "100px" }}
                    >
                      <ChartSmall
                        index={index}
                        chartData={item}
                        click={() => click(index)}
                      />
                      <div class="fs12 tac">{item.name}</div>
                    </div>
                  );
                })}
              </div>
              <ChartMain option={allData.value[nowIndex.value]} />
            </div>
          </Modal>
        </div>
      );
    };
  },
});

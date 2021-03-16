import { defineComponent, ref } from "vue";
import { Layout as ALayout, Menu as AMenu } from "ant-design-vue";
import {
  PieChartOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons-vue";
import "./app.stylus";
import router from "./router";

const {
  Header: ALayoutHeader,
  Content: ALayoutContent,
  Sider: ALayoutSider,
} = ALayout;

const { SubMenu: ASubMenu, Item: AMenuItem } = AMenu;

export default defineComponent({
  name: "App",
  components: {},
  setup() {
    const collapsed = ref(false);
    const openKeys = ref<string[]>(["vue3"]);
    const titleSlots = {
      title: () => {
        return (
          <span>
            <PieChartOutlined class="el-icon-setting" />
            <span>vue3.0小试</span>
          </span>
        );
      },
    };
    const toggleCollapsed = () => {
      collapsed.value = !collapsed.value;
    };
    const selectMenu = (pathObj: {
      item: Record<string, any>;
      key: string;
      keyPath: string[];
    }) => {
      const path = pathObj.keyPath.reverse().join("/");
      router.push({
        path: `/${path}`,
      });
    };
    return () => {
      return (
        <div class="layout__wrapper" style={{ height: "100%" }}>
          <ALayout>
            <ALayoutSider
              collapsible
              collapsed={collapsed.value}
              style={{ height: "100vh" }}
            >
              <AMenu
                openKeys={openKeys.value}
                mode="inline"
                theme="dark"
                inlineCollapsed={collapsed.value}
                onClick={(pathObj) => selectMenu(pathObj)}
              >
                <ASubMenu key="vue3" v-slots={titleSlots}>
                  <AMenuItem key="formPage">表格搜索组件</AMenuItem>
                  <AMenuItem key="barChart">d3柱状图组件</AMenuItem>
                  <AMenuItem key="bubbleChart">d3气泡图组件</AMenuItem>
                  <AMenuItem key="pieChart">d3饼图组件</AMenuItem>
                  <AMenuItem key="radiuBar">d3径向柱组件</AMenuItem>
                  <AMenuItem key="rotateChart">d3旋转图组件</AMenuItem>
                  <AMenuItem key="slider">d3滑动折现图组件</AMenuItem>
                  {/* <AMenuItem key="mapChart">d3地图组件</AMenuItem> */}
                </ASubMenu>
              </AMenu>
            </ALayoutSider>
            <ALayoutContent>
              <ALayoutHeader style="background: #fff; padding: 0px; padding-left: 12px">
                {collapsed.value ? (
                  <MenuUnfoldOutlined
                    class="icon trigger"
                    onClick={toggleCollapsed}
                  />
                ) : (
                  <MenuFoldOutlined class="icon" onClick={toggleCollapsed} />
                )}
              </ALayoutHeader>
              <router-view />
            </ALayoutContent>
          </ALayout>
        </div>
      );
    };
  },
});

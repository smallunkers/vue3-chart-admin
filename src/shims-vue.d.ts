/* eslint-disable */
export * from '@vue/runtime-core'
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProps {
    [elemName: string]: any;
  }
}
export const useTippyStore = defineStore('tippy-singleton-store', () => {
  const singletons = ref<Array<Element>>([])
  const addSingleton = (el :Element | globalThis.ComponentPublicInstance | null) => {
    singletons.value.push(el as Element);
  }
  return {
    addSingleton,
    singletons,
  }
})
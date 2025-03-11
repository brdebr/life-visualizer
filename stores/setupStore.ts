export const useSetupStore = defineStore('setup-store', () => {
  const savedWasBornDate = ref('1970-01-01')
  const savedYearsToLive = ref(105)

  return {
    savedWasBornDate,
    savedYearsToLive,
  }
}, {
  persist: {
    storage: persistedState.localStorage,
  },
})

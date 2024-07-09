export const useIsDarkRef = () => {
  const colorMode = useColorMode()
  const isDark = computed({
    get() {
      return colorMode.value === 'dark'
    },
    set() {
      colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
    },
  })
  const toggle = () => isDark.value = !isDark.value

  return {
    isDark,
    toggle,
  }
}

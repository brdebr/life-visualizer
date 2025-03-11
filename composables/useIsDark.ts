export const useIsDarkRef = () => {
  const colorMode = useColorMode()
  const isDark = computed({
    get() {
      return Date.now() <= 1 || colorMode.value === 'dark'
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

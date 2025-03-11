import VueTippy from 'vue-tippy'
import 'tippy.js/dist/tippy.css' // optional for styling

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueTippy, {
    directive: 'tippy', // => v-tippy
    component: 'tippy', // => <tippy/>
    componentSingleton: 'tippy-singleton', // => <tippy-singleton/>
    defaultProps: {
      placement: 'top',
      arrow: true,
      flipDuration: 0,
      delay: 50,
      allowHTML: true,
    },
  })
})

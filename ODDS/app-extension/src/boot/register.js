import { boot } from 'quasar/wrappers'
import VuePlugin from 'quasar-ui-odds-web-app'

export default boot(({ app }) => {
  app.use(VuePlugin)
})

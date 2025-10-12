import { h } from 'vue'
import { QBadge } from 'quasar'

export default {
  name: 'OddsWebApp',

  setup () {
    return () => h(QBadge, {
      class: 'OddsWebApp',
      label: 'OddsWebApp'
    })
  }
}

// Configuration for your app
// https://quasar.dev/quasar-cli/quasar-conf-js

module.exports = function (ctx) {
  return {
    // app boot file (/src/boot)
    boot: [
      'axios',
      'auth'
    ],

    css: [
      'app.sass'
    ],

    extras: [
      'roboto-font',
      'material-icons'
    ],

    framework: {
      config: {
        notify: {},
        loading: {}
      },

      // Quasar plugins
      plugins: [
        'Notify',
        'Loading',
        'Dialog',
        'LocalStorage',
        'SessionStorage'
      ]
    },

    animations: 'all',

    build: {
      vueRouterMode: 'history',
      
      env: {
        API_URL: ctx.dev 
          ? 'http://localhost:5001'
          : process.env.API_URL || 'http://localhost:5001'
      }
    },

    devServer: {
      port: 9000,
      open: true
    },

    ssr: {
      middlewares: [
        ctx.prod ? 'compression' : '',
        'render'
      ]
    }
  }
}

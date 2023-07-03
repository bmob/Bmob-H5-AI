const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true
})

module.exports = {
  /**
     * You will need to set publicPath if you plan to deploy your site under a sub path,
     * for example GitHub Pages. If you plan to deploy your site to https://foo.github.io/bar/,
     * then publicPath should be set to "/bar/".
     * In most cases please use '/' !!!
     * Detail: https://cli.vuejs.org/config/#publicpath
     */
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'static',
  filenameHashing: true,
  // lintOnSave: process.env.NODE_ENV === 'development',
  productionSourceMap: true,
  devServer: {
    // // 开启https >>>
    proxy: {
      '/v1': {
        target: 'http://new.bmobapp.com/',
        ws: false,
        changeOrigin: true,
        pathRewrite: {
          '^/v1': '/v1'
        }
      }
    },
    // https: true,
    // // 开启https <<<

    open: true
  }
}

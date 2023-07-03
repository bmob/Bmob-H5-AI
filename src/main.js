import Vue from 'vue'
import App from './App.vue'

// createApp(App).mount('#app')

new Vue({
    el: '#app',
    render: (h) => h(App)
})
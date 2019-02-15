import Vue from 'vue';
import Vuetify from 'vuetify';
import VueRouter from 'vue-router';
import VeeValidate from 'vee-validate';
import Notifications from 'vue-notification';
import VueSocketIO from 'vue-socket.io';
import App from './App';
import routes from './routes';
import { store } from './store/store';

window.eventBus = new Vue();

Vue.use(VueRouter);
Vue.use(VeeValidate);
Vue.use(Vuetify);
Vue.use(new VueSocketIO({
    debug: false,
    // connection: 'https://boringmess.herokuapp.com/',
    connection: 'localhost:3000',
    vuex: {
        store,
        actionPrefix: 'SOCKET_'
    }
}));
Vue.use(Notifications);

const router = new VueRouter({
    mode: 'history',
    routes
});

router.beforeEach((to, from, next) => {
    // to and from are both route objects
    if (to.matched.some(record => record.meta.requiresAuth && !record.meta.requiresAdmin)) {
        if (store.getters.isLoggedIn) {
            next();
        } else {
            next('/login');
        }
    } else if (to.matched.some(record => record.meta.requiresVisitor)) {
        if (store.getters.isLoggedIn) {
            next('/');
        } else {
            next();
        }
    } else if (to.matched.some(record => record.meta.requiresAdmin && record.meta.requiresAuth)) {
        if (store.getters.isAdmin) {
            next();
        } else {
            next('/');
        }
    }
    else {
        next();
    }
});

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
});

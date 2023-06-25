<template>
    <div class="notification-container">
        <Notification
            v-for="notification in notifications"
            :type="notification.type"
            :duration="notification.duration"
            :title="notification.title"
            :message="notification.message"
        ></Notification>
    </div>
</template>

<script>
import WebViewEvents from '@utility/webViewEvents';
import { defineComponent, defineAsyncComponent } from 'vue';
import Notification from './components/Notification.vue';
const ComponentName = 'Notifications';
export default {
    name: ComponentName,
    components: {
        Notification,
        Icon: defineAsyncComponent(() => import('@components/Icon.vue')),
    },
    data() {
        return {
            notifications: [],
        };
    },
    methods: {
        createNotification(data) {
            this.notifications.push({
                type: data.type,
                duration: data.duration * 1000,
                title: data.title,
                message: data.message,
            });
        },
        getNotificationsHistory() {
            console.log('[START] 📜 LAST SESSION NOTIFICATIONS');
            this.notifications.forEach(element => {

              console.log(element.title + ' | ' + element.message);
            });
            console.log('[END] 📜 LAST SESSION NOTIFICATIONS');
        },
        clearAll(){
            notifications = [];
        },
        debug() {
            setInterval(() => {
                //Add notifications if u want to test it with browser
                this.createNotification({
                    type: 4,
                    duration: 7,
                    title: 'Error',
                    message: 'Lorem ipsum dolor sit amet, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
                });

            }, 4000);
        },
    },
    mounted() {
        if ('alt' in window) {
            WebViewEvents.on('fnkynotifications-webview:create', this.createNotification);
            WebViewEvents.on('fnkynotifications-webview:gethistory', this.getNotificationsHistory);
            WebViewEvents.on('fnkynotifications-webview:clearall', this.clearAll);
            WebViewEvents.emitReady(ComponentName);
        } else {
          this.debug();
        }
    },

};
</script>

<style>
#app {
    font-family: Roboto, sans-serif;
}

.notification-container {
    position: fixed;
    width: 15vw;
    max-height: 100%;
    right: 0;
    bottom: 20vh;
}
</style>

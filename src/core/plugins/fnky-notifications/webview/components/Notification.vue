<template>
    <transition name="notification-slide" @after-enter="afterEnter" @after-leave="afterLeave" appear>
        <div v-if="visible" class="notification">
            <div v-if="showProgressBar"
                :style="{ backgroundColor: getIconColor()}"
                :class="{
                    [`notification-progress smooth-bar-${this.$props.duration / 1000}`]: progressValue > 0,
                }"
                :width="progressValue"
                max="100"
            ></div>

            <div class="notification-icon">
                <Icon :shadow="false" class="icon" :style="{ color: getIconColor() }" :icon="getIcon()" :size=18></Icon>
                <div class="bar-shadow"></div>
            </div>

            <div class="notification-body">
                <span class="body-title" v-html="$props.title"></span
                ><br />
                <span class="body-message" v-html="$props.message"></span>
            </div>
        </div>
    </transition>
</template>

<script>
import { icons, iconColors, showProgressBar } from '../../shared/config';
import Icon from '@ViewComponents/Icon.vue';
export default {
    name: 'Notification',
    components: {
        Icon,
    },
    props: {
        type: {
            type: Number,
            default: 0,
        },
        duration: {
            type: Number,
            default: 1000,
        },
        title: {
            type: String,
            default: '',
        },
        message: {
            type: String,
            default: '',
        },
    },
    data() {
        return {
            visible: false,
            showProgressBar: showProgressBar,
            elapsed: 0,
            progressValue: 100,
        };
    },

    mounted() {
        this.visible = true;
        this.progressValue = 100;
    },
    computed: {
        animation() {
            return `load 1s normal forwards`;
        },
    },
    methods: {
        afterEnter() {
            this.animateProgressbar();
            setTimeout(() => {
                this.hide();
            }, this.$props.duration);
        },
        afterLeave() {
            this.$el.remove();
        },
        hide() {
            this.visible = false;
        },
        getIcon() {
            return icons[this.type];
        },
        getABC() {
            return 'load ' + this.$props.duration + 's normal forwards';
        },
        getIconColor() {
            return iconColors[this.type];
        },
        animateProgressbar() {
            const interval = setInterval(() => {
                this.progressValue -= this.$props.duration / 10000;
                if (this.progressValue <= 0) {
                    clearInterval(interval);
                }
            }, this.$props.duration);
        },

    },
};
</script>

<style scoped>
.notification-slide-enter-from,
.notification-slide-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

.notification-slide-enter-to,
.notification-slide-leave-from {
    opacity: 1;
    transform: translateX(0);
}

.notification-slide-enter-active,
.notification-slide-leave-active {
    transition: all 0.4s ease;
}

.notification {
    position: relative;
    opacity: 0.9;
    display: flex;
    align-items: center;
    flex-direction: row;
    width: 15vw;
    min-height: 4vw;
    background: #15171a;
    border-radius: 16px 0 0 16px;
    margin-top: 0.5vw;
}

.notification-icon {
  position: relative;
  width: 20%;
}

.bar-shadow {
display: block;
position: relative;
margin-left: 0.3vw;
width: 2.2vw;
height: 2.2vw;
border-radius: 50%;
border: 2px solid rgba(0, 0, 0, 0.2);
background: rgba(0, 0, 0, 0.5);
box-shadow: inset 0px 0px 0px 6px rgba(0, 0, 0, 0.3);
z-index: 50;
mix-blend-mode: overlay;
}

.icon {
  position: absolute;
  width: 2.2vw;
  height: 2.2vw;
  left: 50%;
  top: 73%;
  transform: translate(-50%, -50%);
  font-size: 1vw !important;
}

.notification-body {
    justify-content: flex-start;
    z-index: 999;
    position: relative;
    width: 80%;
    min-height: 3vw;
    text-shadow: 0.5px 0.5px black;
    margin-top: 0.3vw;
    margin-bottom: 0.3vw;
}

@font-face {
  font-family: Oswald;
  src: url(../assets/fonts/oswald.ttf) format("truetype");
}

.body-title {
    font-size: 18px;
    font-weight: 600;
    font-family: Oswald, Arial, sans-serif;
}

.body-message {
    font-size: 14px;
    font-weight: 400;
    word-wrap: break-word;
}

.notification-progress {
    position: absolute;
    display: flex;
    align-items: center;
    border-radius: 14px 0 0 14px;
    justify-content: center;
    height: 100%;
    opacity: 0.5;
    width: 100%;
    z-index: 1;
}


.smooth-bar-1 {animation: load 1s normal forwards;}
.smooth-bar-2 {animation: load 2s normal forwards;}
.smooth-bar-3 {animation: load 3s normal forwards;}
.smooth-bar-4 {animation: load 4s normal forwards;}
.smooth-bar-5 {animation: load 5s normal forwards;}
.smooth-bar-6 {animation: load 6s normal forwards;}
.smooth-bar-7 {animation: load 7s normal forwards;}
.smooth-bar-8 {animation: load 8s normal forwards;}
.smooth-bar-9 {animation: load 9s normal forwards;}
.smooth-bar-10 {animation: load 10s normal forwards;}

@keyframes load {
    0% {
        width: 0;
    }
    100% {
        width: 100%;
    }
}

@media only screen and (max-width: 1284px) {
  .notification-icon {
    display: none;

  }
  .notification-body{
    width: 100%;
    margin-left: 0.8vw;
  }
}
</style>
../utils/config
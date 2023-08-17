<template>
    <div class="chat-interface">
        <div class="advertisement">
            <h1 class="header">Lifeinvader</h1>
        </div>
        <div class="message-list" ref="messageList">
            <div v-for="(message, index) in messages" :key="index" class="message">
                <div class="message-content">
                    <span class="message-timestamp">[{{ message.timestamp }}]</span>
                    {{ message.content }}
                </div>
            </div>
        </div>
        <div class="input-box">
            <input v-model="newMessage" @keydown.enter="sendMessage" placeholder="Type a message..." />
        </div>
    </div>
</template>

<script lang="ts">
import WebViewEvents from '@utility/webViewEvents';
import { AdvertisementEvents } from '../shared/enums/AdvertisementEvents';

export default {
    data() {
        return {
            messages: [],
            newMessage: '',
        };
    },
    methods: {
        sendMessage() {
            if (this.newMessage.trim() !== '') {
                const currentTime = new Date().toLocaleTimeString();
                WebViewEvents.emitServer(AdvertisementEvents.SEND_MESSAGE, {
                    content: this.newMessage,
                    timestamp: currentTime,
                });
                this.newMessage = '';
                this.scrollToBottom();
            }
        },
        scrollToBottom() {
            this.$refs.messageList.scrollTop = this.$refs.messageList.scrollHeight;
        },
        setMessages(receivedMessages: Array<string>) {
            this.messages = receivedMessages;
        },
    },
    mounted() {
        WebViewEvents.emitServer(AdvertisementEvents.REQUEST_MESSAGES);
        WebViewEvents.on(AdvertisementEvents.SET_MESSAGE_ARRAY, this.setMessages);

        WebViewEvents.emitReady(`Advertisement`);
    },
};
</script>

<style scoped>
.chat-interface {
    display: flex;
    flex-direction: column;
    height: 40vh;
    width: 30vw;
    margin: auto;
    background: rgba(14, 13, 13, 0.459);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
}
.header {
    margin-left: 10px;
    color: white;
}
.advertisement {
    background: url('gtabanner.jpg') center/cover;
    width: 100%;
    height: 10vh;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    overflow: hidden;
    color: white;
    border-radius: 15px 15px 0px 0px;
}

.advertisement::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: inherit;
    backdrop-filter: blur(10px);
    opacity: 0.2;
}
.message-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.75);
    border-radius: 16px 16px 0 0;
    scrollbar-width: 0px;
    -ms-overflow-style: none;
}

.message {
    margin-bottom: 10px;
}

.message-content {
    display: flex;
    align-items: center;
    padding: 8px;
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 8px;
}

.message-timestamp {
    font-size: 12px;
    color: #999;
    margin-right: 8px;
}

.input-box {
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.75);
    border-radius: 0 0 16px 16px;
}

.input-box input {
    flex: 1;
    padding: 8px;
    border: none;
    border-radius: 8px;
    outline: none;
    background: none;
    color: white;
}

.input-box ::placeholder {
    color: rgba(255, 255, 255, 0.7);
}
</style>

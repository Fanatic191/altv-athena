import * as alt from 'alt-client';
import * as AthenaClient from '@AthenaClient/api';
import { duration } from '../shared/config';
import { onTicksStart } from '@AthenaClient/events/onTicksStart';
import { ConsoleCommander } from '@AthenaShared/utility/consoleCommander';

const PAGE_NAME = 'Notifications';
let page: AthenaClient.webview.Page;

const Internal = {
    init() {
        page = new AthenaClient.webview.Page({
            name: PAGE_NAME,
            callbacks: {
                onClose: Internal.onClose,
                onReady: Internal.onReady,
            },
        });
        AthenaClient.webview.registerOverlay(PAGE_NAME);
        ConsoleCommander.registerConsoleCommand('/history', Internal.getHistory);
    },
    getHistory() {
        AthenaClient.webview.emit('notifications-webview:gethistory');
    },
    onReady() {},
    onClose() {},
};

export function sendNotification(type: number, duration: duration, title: string, message: string) {
    AthenaClient.webview.emit('fnkynotifications-webview:create', {
        type: type,
        duration: duration,
        title: title,
        message: message,
    });
    AthenaClient.systems.sound.play2d(
        `@plugins/sounds/fnky-notifications/come-here-notification.ogg`,
        0.2,
        'fnkynotifications',
    );
}
export function clearAll() {
    AthenaClient.webview.emit('fnkynotifications-webview:clearall');
}

onTicksStart.add(Internal.init);

alt.onServer('fnkynotifications:create', sendNotification);
alt.onServer('fnkynotifications:clearall', clearAll);

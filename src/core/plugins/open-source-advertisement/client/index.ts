import * as alt from 'alt-client';
import * as AthenaClient from '@AthenaClient/api';
import { onTicksStart } from '@AthenaClient/events/onTicksStart';
import { AdvertisementEvents } from '../shared/enums/AdvertisementEvents';

function init() {
    const page = new AthenaClient.webview.Page({
        name: 'Advertisement',
        callbacks: {
            onReady: async () => {},
            onClose: () => {},
        },
        options: {
            onOpen: {
                focus: true,
                hideHud: true,
                hideOverlays: true,
                setIsMenuOpenToTrue: true,
                showCursor: true,
                disableControls: 'all',
                disablePauseMenu: true,
            },
            onClose: {
                hideCursor: true,
                showHud: true,
                showOverlays: true,
                unfocus: true,
                setIsMenuOpenToFalse: true,
                enableControls: true,
                enablePauseMenu: true,
            },
        },
    });

    alt.onServer(AdvertisementEvents.OPEN_UI, () => {
        if (typeof page !== 'undefined') {
            page.open();
        }
    });
}

onTicksStart.add(init);

alt.onServer(AdvertisementEvents.SET_MESSAGE_ARRAY, (messageArray: Array<{ content: string; timestamp: string }>) => {
    AthenaClient.webview.emit(AdvertisementEvents.SET_MESSAGE_ARRAY, messageArray);
});

alt.onServer(AdvertisementEvents.LOAD_MESSAGES, (messagesArray: Array<{ content: string; timestamp: string }>) => {
    AthenaClient.webview.emit(AdvertisementEvents.SET_MESSAGE_ARRAY, messagesArray);
});

import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { duration } from '../shared/config';

const PLUGIN_NAME = 'fnky-notifications';
function onLoad() {}

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, onLoad);
export const NotifyController = {
    /**
     * Sends a webview notification to client.
     *
     *
     * @param {alt.Player} player
     * @param {number} type Type (number when you defined icon in plugin config.ts)
     * @param {duration} duration 1-10 (Time displaying notifications in secounds)
     * @param {string} title Short title of the notification
     * @param {string} message Message you want to send
     * @return {}
     */
    send(player: alt.Player, type: number, duration: duration, title: string, message: string) {
        if (!player || !player.valid) {
            return;
        }

        player.emit('fnkynotifications:create', type, duration, title, message);
    },
    /**
     * Clears notifications on-screen and/or history
     *
     *
     */
    clearAll(player: alt.Player) {
        player.emit('fnkynotifications:clearall');
    },
};

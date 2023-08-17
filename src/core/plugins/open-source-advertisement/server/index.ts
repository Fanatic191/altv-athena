import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { AdvertisementEvents } from '../shared/enums/AdvertisementEvents';

const messageArray: Array<{ content: string; timestamp: string }> = [];
const advertisementLocation = { x: -1081.694091796875, y: -248.21510314941406, z: 37.7633056640625 };

Athena.systems.plugins.registerPlugin(`Advertisement`, () => {
    Athena.controllers.interaction.append({
        description: 'Open Advertisement UI',
        position: { x: advertisementLocation.x, y: advertisementLocation.y, z: advertisementLocation.z - 1 },
        callback: (player: alt.Player) => {
            alt.emitClient(player, AdvertisementEvents.OPEN_UI);
        },
    });
});

alt.onClient(AdvertisementEvents.REQUEST_MESSAGES, (player: alt.Player) => {
    alt.emitClient(player, AdvertisementEvents.LOAD_MESSAGES, messageArray);
});

alt.onClient(
    AdvertisementEvents.SEND_MESSAGE,
    (player: alt.Player, message: { content: string; timestamp: string }) => {
        if (message.content.length > 256) {
            Athena.player.emit.notification(player, `This message is way to long.`);
            return;
        }

        messageArray.push({ content: message.content, timestamp: message.timestamp });
        alt.emitClient(player, AdvertisementEvents.SET_MESSAGE_ARRAY, messageArray);

        const allPlayers = alt.Player.all;

        allPlayers.forEach((p, _index) => {
            Athena.player.emit.notification(p, `There's a new advertisement.. go check Lifeinvader.`);
        });
    },
);

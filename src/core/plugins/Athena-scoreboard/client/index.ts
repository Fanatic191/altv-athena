import * as alt from 'alt-client';
import * as native from 'natives';
import * as AthenaClient from '@AthenaClient/api';
import { onTicksStart } from '@AthenaClient/events/onTicksStart';
import { Page } from '@AthenaClient/webview/page';
import { getTimestamp } from '../shared/timestamp';
import { PLAYER_SYNCED_META } from '@AthenaShared/enums/playerSynced';

let page: Page;
let updateTimer = null;

function init() {
    page = new AthenaClient.webview.Page({
        name: 'Scoreboard',
        callbacks: {
            onReady: async () => {
                updateTimer = alt.setInterval(update, 1000);
                //localplayer
                const localPlayer = alt.Player.local;
                const pos = localPlayer.pos;
                const playername = alt.Player.local.getSyncedMeta(PLAYER_SYNCED_META.NAME) as string;


                const [, streetHash] = native.getStreetNameAtCoord(pos.x, pos.y, pos.z);
                const money = localPlayer.getSyncedMeta(PLAYER_SYNCED_META.PING)

                const mug = native.registerPedheadshotTransparent(localPlayer);
                await alt.Utils.waitFor(() => native.isPedheadshotReady(mug));
                const base64Mug = alt.getHeadshotBase64(mug);
                native.unregisterPedheadshot(mug);
                AthenaClient.webview.emit('updateLocalPlayer', playername, money, native.getStreetNameFromHashKey(streetHash), base64Mug)
              
              },
            onClose: () => {
              if (updateTimer) {
                alt.clearInterval(updateTimer);
                updateTimer = null;
              }
            },
        },
        // keybind: {
        //     key: 113, // F2
        //     useSameKeyToClose: true,
        //     description: 'Scoreboard',
        //     identifier: 'Scoreboard-toggle',
        //     allowInSpecificPage: 'Scoreboard',
        // },
        options: {
            onOpen: {
                focus: true,
                hideHud: true,
                hideOverlays: true,
                setIsMenuOpenToTrue: true,
                showCursor: false,
                disableControls: 'none',
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
}

function update() {
  const currentTime = getTimestamp();

  AthenaClient.webview.emit('updatePlayers',
  alt.Player.all.map((player) => {
    const playername = player.getSyncedMeta(PLAYER_SYNCED_META.NAME) as string;
    const playerping = player.getSyncedMeta(PLAYER_SYNCED_META.PING) as number;
    const joinTime = player.getSyncedMeta('joinTime') as number || 0;
    const onlineTime = new Date(currentTime - joinTime);

    return {
      id: player.id,
      name: playername,
      ping: playerping,
      onlineTime: onlineTime.toLocaleString('default', { minute: '2-digit', second: '2-digit' }),
    };
  }));
}

onTicksStart.add(init);


alt.on('keydown', (key) => {
  if ( key === 113) { //F2
    if (typeof page !== 'undefined') {
              page.open();
          }
  }
});
alt.on('keyup', (key) => {
  if ( key === 113) { //F2
    if (typeof page !== 'undefined') {
              page.close(true);
          }
  }
});
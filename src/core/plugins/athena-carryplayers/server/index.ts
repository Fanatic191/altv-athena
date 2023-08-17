import * as Athena from '@AthenaServer/api';
import * as alt from 'alt-server';
import { ANIMATION_FLAGS } from '@AthenaShared/flags/animationFlags';

const PLUGIN_NAME = 'carry-players';

let interval = null;

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, () => {
    console.log(PLUGIN_NAME + ' loaded');
});

alt.onClient('carry:player:attach', attachPlayer);
async function attachPlayer(player: alt.Player, selectedEntity: number) {
    const TARGETPLAYER = Athena.getters.player.byID(selectedEntity);
    const playerIsCarrying = isCarrying(player);
    const targetPlayerIsCarried = isCarried(TARGETPLAYER);

    if (!playerIsCarrying && !targetPlayerIsCarried) {
        //close weelmenu from targetplayer to avoid he carry you too at same time
        Athena.webview.closePages(TARGETPLAYER);

        TARGETPLAYER.attachTo(player, 0, 0, new alt.Vector3(0.27, 0.15, 0.63), new alt.Vector3(0, 0, 0), false, false);
        Athena.player.emit.animation(TARGETPLAYER, 'nm', 'firemans_carry', ANIMATION_FLAGS.REPEAT);

        //interval not needed, just hate when player is walking through a door the animation is cancelled
        interval = alt.setInterval(() => {
            Athena.player.emit.animation(
                player,
                'missfinale_c2mcs_1',
                'fin_c2_mcs_1_camman',
                ANIMATION_FLAGS.ENABLE_PLAYER_CONTROL | ANIMATION_FLAGS.REPEAT | ANIMATION_FLAGS.UPPERBODY_ONLY,
            );

            if (!TARGETPLAYER.valid || !player.valid) {
                stopCarry(player);
                stopCarry(TARGETPLAYER);
            }
        }, 1000);

        Athena.player.events.on('player-disconnected', () => {
            stopCarry(player);
            stopCarry(TARGETPLAYER);
        });

        Athena.player.events.on('respawned', () => {
            stopCarry(player);
            stopCarry(TARGETPLAYER);
        });

        //no loop needed because carried player cant move, and is not affected by a door
        Athena.player.emit.animation(
            player,
            'missfinale_c2mcs_1',
            'fin_c2_mcs_1_camman',
            ANIMATION_FLAGS.ENABLE_PLAYER_CONTROL | ANIMATION_FLAGS.REPEAT | ANIMATION_FLAGS.UPPERBODY_ONLY,
        );

        setIsCarrying(player, true);
        setIsCarried(TARGETPLAYER, true);
    } else {
        Athena.player.emit.notification(player, 'Youre not able to carry anyone at the moment.');
    }
}

alt.onClient('carry:player:detach', detachPlayer);
async function detachPlayer(player: alt.Player, selectedEntity: number) {
    const TARGETPLAYER = Athena.getters.player.byID(selectedEntity);

    const playerIsCarrying = isCarrying(player);
    const targetPlayerIsCarried = isCarried(TARGETPLAYER);

    if (playerIsCarrying && targetPlayerIsCarried) {
        stopCarry(player);
        stopCarry(TARGETPLAYER);
    } else {
        Athena.player.emit.notification(player, 'Youre not carrying anybody.');
    }
}

alt.on('playerConnect', (player) => {
    setIsCarried(player, false);
    setIsCarrying(player, false);
});

// not really clean, try to avoid entering a vehicle with a carried player
alt.on('playerEnteringVehicle', (player, vehicle, seat) => {
    if (isCarrying(player)) {
        player.pos = player.pos;
        return false;
    }
});

function stopCarry(player: alt.Player) {
    player.detach();
    setIsCarrying(player, false);
    setIsCarried(player, false);
    Athena.player.emit.clearAnimation(player);
    try {
        alt.clearInterval(interval);
    } catch (error) {
        alt.logDebug('not able to clear interval?! ' + error);
    }
    player.setSyncedMeta('isCarrying', false);
}

function setIsCarried(player: alt.Player, isCarried: boolean) {
    player.setSyncedMeta('isCarried', isCarried);
    player.setSyncedMeta('isCarrying', false);
}

function setIsCarrying(player: alt.Player, isCarrying: boolean) {
    player.setSyncedMeta('isCarrying', isCarrying);
}

function isCarried(player: alt.Player): boolean {
    return player.getSyncedMeta('isCarried') === true;
}

function isCarrying(player: alt.Player): boolean {
    return player.getSyncedMeta('isCarrying') === true;
}

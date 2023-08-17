import * as alt from 'alt-client';
import * as AthenaClient from '@AthenaClient/api';
import * as native from 'natives';
import { KEY_BINDS_ADMIN } from '../shared/keybinds';
import { onTicksStart } from '@AthenaClient/events/onTicksStart';
import { ADMIN_MENU_BUILDER } from '../shared/locales';
import { Administrator_Events } from '../shared/events';
import { COLORS, EVENT_MODELHASH, EVENT_PARTICLE } from '../shared/const';

let newPos = { x: 0, y: 0, z: 0 };

function init() {
    AthenaClient.systems.hotkeys.add({
        key: KEY_BINDS_ADMIN.TRIGGER,
        description: 'Open Administrator-Menu',
        modifier: 'ctrl',
        identifier: 'open-administrator-menu',
        keyDown: start,
    })

    AthenaClient.systems.hotkeys.add({
        key: KEY_BINDS_ADMIN.TRIGGER,
        description: 'Trigger NoClip-Mode',
        modifier: 'shift',
        identifier: 'trigger-no-clip-mode',
        keyDown: noclip,
    })

    AthenaClient.systems.hotkeys.add({
        key: KEY_BINDS_ADMIN.TRIGGER,
        description: 'Trigger SessionVehicle',
        modifier: 'alt',
        identifier: 'trigger-session-vehicle-spawn',
        keyDown: session,
    })

    alt.emitServer(Administrator_Events.GETPLAYERS_SERVER)
    alt.emitServer(Administrator_Events.GETCARS_SERVER)
    // alt.emitServer(Administrator_Events.GETRANK_SERVER)
}

function setNewPos() {
    const player = alt.Player.local;
    if(!player) return;
    const position = new alt.Vector3(newPos.x, newPos.y, newPos.z)
    alt.emitServer(Administrator_Events.TELEPORTATION, position)
}

function noclip() {
    alt.emitServer(Administrator_Events.NOCLIP_SERVER)
}

async function session() {
    const model = await AthenaClient.rmlui.input.create({
        placeholder: 'Tippe den Namen des Fahrzeugmodels...(adder, rebla, komoda,...)',
        blur: true,
        darken: true,
        hideHud: true,
    });
    alt.emitServer(Administrator_Events.SESSION, model)
}

function emitClose() {
    const player = alt.Player.local;
    native.setPlayerInvincible(player, false)
    AthenaClient.screen.notification.create('Du hast den Admin-Mode verlassen!')
}

async function start() {
    const player = alt.Player.local;
    // const playerrank = await alt.getSyncedMeta(Administrator_Events.SYNCEDMETA_RANKS) as string;

    if(!player) return;
    // if(!playerrank.includes('admin') || !playerrank.includes('moderator')) {
    //     AthenaClient.screen.notification.create('Du hast keine Rechte!')
    //     return;
    // }

    AthenaClient.webview.setOverlaysVisible(false);
    alt.toggleGameControls(false);
    native.setPlayerInvincible(player, true)
    AthenaClient.screen.notification.create('Du bist im Admin-Mode!')

    AthenaClient.rmlui.menu.create({
        header: {
            title: ADMIN_MENU_BUILDER.ADMINMENU,
            color: COLORS.RED,
        },
        options: [
            {
                type: 'Toggle',
                title: ADMIN_MENU_BUILDER.NOCLIP_STATUS,
                description: ADMIN_MENU_BUILDER.NOCLIP_STATUS_DESC,
                value: false,
                callback(newValue: boolean) {
                    alt.emitServer(Administrator_Events.NOCLIP_SERVER, newValue)
                    alt.toggleGameControls(true);
                    AthenaClient.webview.setOverlaysVisible(true);
                }
            },
            {
                type: 'Invoke',
                title: ADMIN_MENU_BUILDER.EVENTS,
                description: ADMIN_MENU_BUILDER.EVENTS_DESC,
                async callback() {
                    const setMenuPoint = ADMIN_MENU_BUILDER.EVENTS;
                    alt.toggleGameControls(true);
                    AthenaClient.webview.setOverlaysVisible(true);
                    await AthenaClient.rmlui.menu.close();
                    createMenu(setMenuPoint);

                },
            },
            {
                type: 'Invoke',
                title: ADMIN_MENU_BUILDER.GETTER,
                description: ADMIN_MENU_BUILDER.GETTER_DESC,
                async callback() {
                    const setMenuPoint = ADMIN_MENU_BUILDER.GETTER;
                    alt.toggleGameControls(true);
                    AthenaClient.webview.setOverlaysVisible(true);
                    await AthenaClient.rmlui.menu.close();
                    createMenu(setMenuPoint);

                },
            },
            {
                type: 'Invoke',
                title: ADMIN_MENU_BUILDER.CLOSE,
                description: ADMIN_MENU_BUILDER.CLOSE_DESC,
                callback() {
                    alt.toggleGameControls(true);
                    AthenaClient.webview.setOverlaysVisible(true);
                    AthenaClient.rmlui.menu.close();

                },
            },
        ],
        callbackOnClose() {
            emitClose;
        },
    })
}

async function createMenu(menuPoint: string) {
    const player = alt.Player.local;
    const carid = await alt.getSyncedMeta(Administrator_Events.SYNCEDMETA_CARS_ID) as number[];
    const players = await alt.getSyncedMeta(Administrator_Events.SYNCEDMETA_PLAYERS) as string[];
    newPos = { x: 0, y: 0, z: 0 };

    AthenaClient.webview.setOverlaysVisible(false);
    alt.toggleGameControls(false);
    native.setPlayerInvincible(player, true)
    AthenaClient.screen.notification.create('Du bist im Admin-Mode!')

    if(menuPoint === ADMIN_MENU_BUILDER.EVENTS) {
        AthenaClient.rmlui.menu.create({
            header: {
                title: ADMIN_MENU_BUILDER.EVENTS,
                color: COLORS.YELLOW,
            },
            options: [
                {
                    type: 'Range',
                    title: ADMIN_MENU_BUILDER.EVENTS_MODEL,
                    description: ADMIN_MENU_BUILDER.EVENTS_MODEL_DESC,
                    value: 0,
                    min: 0,
                    max: Object.keys(EVENT_MODELHASH).length - 1,
                    increment: 1,
                    onlyUpdateOnEnter: true,
                    async callback(newValue: number) {
                        const models = Object.values(EVENT_MODELHASH);
                        if (newValue >= 0 && newValue < models.length) {
                            const model = models[newValue];
                            const hash = model.hash;
                            alt.emitServer(Administrator_Events.SKIN_SET, hash);
                        }
                    },
                },
                {
                    type: 'Range',
                    title: ADMIN_MENU_BUILDER.EVENTS_COORDS_X,
                    description: ADMIN_MENU_BUILDER.EVENTS_COORDS_DESC,
                    value: 0,
                    min: -4000,
                    max: 7000,
                    increment: 1,
                    async callback(newValue: number) {
                        newPos.x = newValue;
                        setNewPos()
                    },
                },
                {
                    type: 'Range',
                    title: ADMIN_MENU_BUILDER.EVENTS_COORDS_Y,
                    description: ADMIN_MENU_BUILDER.EVENTS_COORDS_DESC,
                    value: 0,
                    min: -4000,
                    max: 7000,
                    increment: 1,
                    async callback(newValue: number) {
                        newPos.y = newValue;
                        setNewPos()
                    },
                },
                {
                    type: 'Range',
                    title: ADMIN_MENU_BUILDER.EVENTS_COORDS_Z,
                    description: ADMIN_MENU_BUILDER.EVENTS_COORDS_DESC,
                    value: 0,
                    min: -4000,
                    max: 7000,
                    increment: 1,
                    async callback(newValue: number) {
                        newPos.z = newValue;
                        setNewPos()
                    },
                },
                {
                    type: 'Range',
                    title: ADMIN_MENU_BUILDER.EVENTS_LOCATION_PARTICLE,
                    description: ADMIN_MENU_BUILDER.EVENTS_LOCATION_PARTICLE_DESC,
                    value: 0,
                    min: 0,
                    max: Object.keys(EVENT_PARTICLE).length - 1,
                    increment: 1,
                    onlyUpdateOnEnter: true,
                    async callback(newValue: number) {
                        const particles = Object.values(EVENT_PARTICLE);
                        if (newValue >= 0 && newValue < particles.length) {
                            const particle = particles[newValue];
                            const dict = particle.dict;
                            const name = particle.name;
                            alt.emitServer(Administrator_Events.EVENTS_SERVER_PARTICLE, dict, name);
                        }
                    },
                },
                {
                    type: 'Toggle',
                    title: ADMIN_MENU_BUILDER.EVENTS_VANISH,
                    description: ADMIN_MENU_BUILDER.EVENTS_VANISH_DESC,
                    value: false,
                    callback(newValue: boolean) {
                        alt.emitServer(Administrator_Events.EVENTS_SERVER_VISIBLE, newValue);
                    }
                },
                {
                    type: 'Invoke',
                    title: ADMIN_MENU_BUILDER.EVENTS_RESET,
                    description: ADMIN_MENU_BUILDER.EVENTS_RESET_DESC,
                    onlyUpdateOnEnter: true,
                    async callback() {
                        alt.emitServer(Administrator_Events.SKIN_RESET);
                    },
                },
                {
                    type: 'Invoke',
                    title: ADMIN_MENU_BUILDER.BACK,
                    description: ADMIN_MENU_BUILDER.BACK_DESC,
                    onlyUpdateOnEnter: true,
                    async callback() {
                        alt.toggleGameControls(true);
                        AthenaClient.webview.setOverlaysVisible(true);
                        await AthenaClient.rmlui.menu.close();
                        start();
                    },
                },
                {
                    type: 'Invoke',
                    title: ADMIN_MENU_BUILDER.CLOSE,
                    description: ADMIN_MENU_BUILDER.CLOSE_DESC,
                    onlyUpdateOnEnter: true,
                    callback() {
                        alt.toggleGameControls(true);
                        AthenaClient.webview.setOverlaysVisible(true);
                        AthenaClient.rmlui.menu.close();
                    },
                },
            ],
            callbackOnClose() {
                emitClose;
            },
        })
    } else if(menuPoint === ADMIN_MENU_BUILDER.GETTER) {
        AthenaClient.rmlui.menu.create({
            header: {
                title: ADMIN_MENU_BUILDER.GETTER,
                color: COLORS.BLUE,
            },
            options: [
                {
                    type: 'Selection',
                    title: ADMIN_MENU_BUILDER.GETTER_CAR,
                    description: ADMIN_MENU_BUILDER.GETTER_CAR_DESC,
                    options: carid,
                    value: 0,
                    onlyUpdateOnEnter: true,
                    async callback(newValue: string) {
                        alt.emitServer(Administrator_Events.GETTER_SERVER_CAR, newValue)
                    },
                },
                {
                    type: 'Selection',
                    title: ADMIN_MENU_BUILDER.GETTER_PLAYER,
                    description: ADMIN_MENU_BUILDER.GETTER_PLAYER_DESC,
                    options: players,
                    value: 0,
                    onlyUpdateOnEnter: true,
                    async callback(newValue: number) {
                        alt.emitServer(Administrator_Events.GETTER_SERVER_PLAYER, newValue)
                    },
                },
                {
                    type: 'Selection',
                    title: ADMIN_MENU_BUILDER.GETTER_GOTO_CAR,
                    description: ADMIN_MENU_BUILDER.GETTER_GOTO_CAR_DESC,
                    options: carid,
                    value: 0,
                    onlyUpdateOnEnter: true,
                    async callback(newValue: string) {
                        alt.emitServer(Administrator_Events.GETTER_SERVER_GOTO_CAR, newValue)
                    },
                },
                {
                    type: 'Selection',
                    title: ADMIN_MENU_BUILDER.GETTER_GOTO_CAR,
                    description: ADMIN_MENU_BUILDER.GETTER_GOTO_CAR_DESC,
                    options: players,
                    value: 0,
                    onlyUpdateOnEnter: true,
                    async callback(newValue: number) {
                        alt.emitServer(Administrator_Events.GETTER_SERVER_GOTO_PLAYER, newValue)
                    },
                },
                {
                    type: 'Toggle',
                    title: ADMIN_MENU_BUILDER.GETTER_VANISH,
                    description: ADMIN_MENU_BUILDER.GETTER_VANISH_DESC,
                    value: false,
                    callback(newValue: boolean) {
                        alt.emitServer(Administrator_Events.EVENTS_SERVER_VISIBLE, newValue);
                    }
                },
                {
                    type: 'Invoke',
                    title: ADMIN_MENU_BUILDER.BACK,
                    description: ADMIN_MENU_BUILDER.BACK_DESC,
                    onlyUpdateOnEnter: true,
                    async callback() {
                        alt.toggleGameControls(true);
                        AthenaClient.webview.setOverlaysVisible(true);
                        await AthenaClient.rmlui.menu.close();
                        start();
                    },
                },
                {
                    type: 'Invoke',
                    title: ADMIN_MENU_BUILDER.CLOSE,
                    description: ADMIN_MENU_BUILDER.CLOSE_DESC,
                    onlyUpdateOnEnter: true,
                    callback() {
                        alt.toggleGameControls(true);
                        AthenaClient.webview.setOverlaysVisible(true);
                        AthenaClient.rmlui.menu.close();
                    },
                },
            ],
            callbackOnClose() {
                emitClose;
            },
        })
    } 
}

onTicksStart.add(init);
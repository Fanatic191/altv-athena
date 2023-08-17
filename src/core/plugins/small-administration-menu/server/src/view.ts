import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { Administrator_Events } from '@AthenaPlugins/small-administration-menu/shared/events';
import { LocaleController } from '@AthenaShared/locale/locale';
import { LOCALE_KEYS } from '@AthenaShared/locale/languages/keys';

class InternalFunctions {
    static noclip(player: alt.Player) {
        const isNoClipping: boolean | null = player.getSyncedMeta('NoClipping') as boolean;
        const data = Athena.document.character.get(player);
        if (typeof data === 'undefined') {
            return;
        }

        if (!isNoClipping && !data.isDead) {
            player.setSyncedMeta('NoClipping', true);
            Athena.player.emit.message(player, `No Clip: ${LocaleController.get(LOCALE_KEYS.LABEL_ON)}`);
            player.visible = false;
            return;
        }

        if (data.isDead) {
            Athena.player.emit.message(player, LocaleController.get(LOCALE_KEYS.CANNOT_PERFORM_WHILE_DEAD));
        }

        player.spawn(player.pos.x, player.pos.y, player.pos.z, 0);
        player.setSyncedMeta('NoClipping', false);
        Athena.player.emit.message(player, `No Clip: ${LocaleController.get(LOCALE_KEYS.LABEL_OFF)}`);
        player.visible = true;
        player.health = 199;
    }

    static teleport(player: alt.Player, pos: alt.Vector3) {
        Athena.player.safe.setPosition(player, pos.x, pos.y, pos.z);
    }

    static visible(player: alt.Player, check: boolean) {
        if (!player) return;
        player.visible = check;
    }

    static session(player: alt.Player, model: string) {
        if (!model) {
            Athena.player.emit.message(player, `Kein Model entspricht dem angegebenem Namen.`);
            return;
        }

        const vehicle = Athena.vehicle.spawn.temporary({ model, pos: player.pos, rot: player.rot }, false);
        if (!vehicle) {
            return;
        }

        player.setIntoVehicle(vehicle, Athena.vehicle.shared.SEAT.DRIVER);
    }

    static eventsparticle(player: alt.Player, dictionary: string, nameOf: string) {
        Athena.player.emit.particle(
            player,
            {
                pos: player.pos,
                dict: dictionary,
                name: nameOf,
                duration: 60000,
                scale: 50,
                delay: 0,
            },
            true,
        );
    }

    static async setSkin(player: alt.Player, model: number) {
        let target = player;
        target.invincible = true;
        target.health = 199;
        await Athena.systems.inventory.clothing.setSkin(target, model);
    }

    static resetSkin(player: alt.Player) {
        let target = player;

        const hash = typeof target.model === 'number' ? target.model : alt.hash(target.model);
        Athena.systems.inventory.clothing.clearSkin(target);
        target.invincible = false;
        let pedInfo = Athena.utility.hashLookup.ped.hash(hash);

        Athena.player.emit.message(player, `Spielermodel ${pedInfo.name} wurde zurückgesetzt.`);
    }

    static gettercar(player: alt.Player, id: string) {
        const tmpID = parseInt(id);
        if (isNaN(tmpID)) {
            return;
        }

        const validVehicle = alt.Vehicle.all.find((veh) => {
            if (!veh || !veh.valid) {
                return false;
            }

            return veh.id === tmpID;
        });

        if (!validVehicle || !validVehicle.valid) {
            return;
        }

        validVehicle.pos = player.pos;
    }

    static getterplayer(player: alt.Player, id: string | undefined) {
        const target = Athena.systems.identifier.getPlayer(id);

        if (!target || !target.valid || !id || target === player) {
            return;
        }

        const data = Athena.document.character.get(target);

        Athena.player.safe.setPosition(target, player.pos.x + 1, player.pos.y, player.pos.z);
        Athena.player.emit.notification(player, `Successfully teleported ${data.name} to your position!`);
    }

    static gettercargoto(player: alt.Player, id: string) {
        const tmpID = parseInt(id);
        if (isNaN(tmpID)) {
            return;
        }

        // Find the vehicle
        const validVehicle = alt.Vehicle.all.find((veh) => {
            if (!veh || !veh.valid) {
                return false;
            }

            return veh.id === tmpID;
        });

        // no spawned vehicle was found
        if (!validVehicle || !validVehicle.valid) {
            return;
        }

        // Move the player to the vehicle.
        player.pos = validVehicle.pos;
    }

    static getterplayergoto(player: alt.Player, id: string | undefined) {
        const target = Athena.systems.identifier.getPlayer(id);

        if (!target || !target.valid || !id || target === player) {
            return;
        }

        Athena.player.safe.setPosition(player, target.pos.x + 1, target.pos.y, target.pos.z);
    }
}

export class AdministratorPlugin {
    static init() {
        alt.onClient(Administrator_Events.NOCLIP_SERVER, InternalFunctions.noclip);
        alt.onClient(Administrator_Events.TELEPORTATION, InternalFunctions.teleport);
        alt.onClient(Administrator_Events.SESSION, InternalFunctions.session);
        alt.onClient(Administrator_Events.SKIN_SET, InternalFunctions.setSkin);
        alt.onClient(Administrator_Events.SKIN_RESET, InternalFunctions.resetSkin);
        alt.onClient(Administrator_Events.EVENTS_SERVER_PARTICLE, InternalFunctions.eventsparticle);
        alt.onClient(Administrator_Events.EVENTS_SERVER_VISIBLE, InternalFunctions.visible);
        alt.onClient(Administrator_Events.GETTER_SERVER_CAR, InternalFunctions.gettercar);
        alt.onClient(Administrator_Events.GETTER_SERVER_PLAYER, InternalFunctions.getterplayer);
        alt.onClient(Administrator_Events.GETTER_SERVER_GOTO_CAR, InternalFunctions.gettercargoto);
        alt.onClient(Administrator_Events.GETTER_SERVER_GOTO_PLAYER, InternalFunctions.getterplayergoto);
        // alt.onClient(Administrator_Events.GETRANK_SERVER, AdministratorPlugin.getRank);
        alt.onClient(Administrator_Events.GETPLAYERS_SERVER, AdministratorPlugin.getPlayers);
        alt.onClient(Administrator_Events.GETCARS_SERVER, AdministratorPlugin.getCars);
    }

    // static async getRank() {
    //     let player: alt.Player;
    //     if(!player) return;
    //     const target = Athena.systems.identifier.getPlayer(player.id);
    //     const account = Athena.document.account.get(target);

    //     alt.setSyncedMeta(Administrator_Events.SYNCEDMETA_RANKS, account.permissions.join())
    //     return;
    // }

    static getPlayers() {
        let player: alt.Player;
        if (!player) return;
        const players = alt.Player.all;
        const playerList = players.map((player) => player.name);

        alt.setSyncedMeta(Administrator_Events.SYNCEDMETA_PLAYERS, playerList);
    }

    static getCars() {
        let player: alt.Player;
        let vehicle: alt.Vehicle;
        if (!player) return;
        if (!vehicle) return;
        const vehicles = alt.Vehicle.all;
        const vehicleListID = vehicles.map((vehicle) => vehicle.id);

        alt.setSyncedMeta(Administrator_Events.SYNCEDMETA_CARS_ID, vehicleListID);
    }
}

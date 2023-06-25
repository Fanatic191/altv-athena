import alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { LOCALE_KEYS } from '@AthenaShared/locale/languages/keys';
import { LocaleController } from '@AthenaShared/locale/locale';
import { VehicleState } from '@AthenaShared/interfaces/vehicleState';
import IVehicleTuning from '@AthenaShared/interfaces/vehicleTuning';
import IVehicleMod from '@AthenaShared/interfaces/vehicleMod';
import VehicleExtra from '@AthenaShared/interfaces/vehicleExtra';
import Database from '@stuyk/ezmongodb';
import { NotifyController } from '@AthenaPlugins/fnky-notifications/server';

Athena.systems.messenger.commands.register(
    'dv',
    '/dv (amibe ülsz!!!) - Jármű végleges törlése!!!',
    ['admin'],
    async (player: alt.Player) => {
        if (!player || !player.valid) {
            return;
        }

        // This is an alt:V ID btw. Not the Database ID, or anything else.
        const vehicleData = Athena.document.vehicle.get(player.vehicle);

        if (!vehicleData) {
            // Athena.player.emit.message(player, 'Nem ülsz járműben.');
            NotifyController.send(
                player,
                4,
                7,
                'Sikertelen',
                'A jármű törlése <b><font color="#CC394F">sikertelen</b></font>! Nem ülsz benne..',
            );
            NotifyController.clearAll(player); // to clear history or/and notifications on screen
            return;
        }

        if (vehicleData) {
            const isDeleted = await Database.deleteById(vehicleData._id.toString(), 'vehicles');

            alt.log(`~r~Az ~w~autó ~g~törlése ~w~=> ~g~${isDeleted}`);
            // Athena.player.emit.message(player, 'A járművet sikeresen törölted.');
            NotifyController.send(
                player,
                2,
                7,
                'Sikeres',
                'Az autó, amiben ültél, <b><font color="#3DBA39">sikeresen törölve.</b></font>',
            );
            NotifyController.clearAll(player); // to clear history or/and notifications on screen

            try {
                player.vehicle.destroy();
            } catch (err) {}
        }
    },
);

Athena.commands.register(
    'tempvehicle',
    '/tempvehicle [model] - Adds a temporary vehicle to drive around. Despawns on exit.',
    ['admin'],
    (player: alt.Player, model: string) => {
        if (!model) {
            Athena.player.emit.message(player, `No model specified.`);
            return;
        }

        const vehicle = Athena.vehicle.spawn.temporary({ model, pos: player.pos, rot: player.rot }, true);
        if (!vehicle) {
            return;
        }

        player.setIntoVehicle(vehicle, Athena.vehicle.shared.SEAT.DRIVER);
        NotifyController.send(
            player,
            3,
            7,
            'Figyelmeztetés',
            '<b><font color="#00ff00">Sikeres</b></font> létrehozás. Figyelem, az autó kiszállás után <b><font color="#ff0000">TÖRLŐDIK!</b></font>',
        );
        NotifyController.clearAll(player); // to clear history or/and notifications on screen
    },
);

Athena.commands.register('mv', '/mv [model]', ['admin'], (player: alt.Player, model: string) => {
    if (!model) {
        Athena.player.emit.message(player, `No model specified.`);
        NotifyController.send(
            player,
            2,
            7,
            'Sikeres',
            `${player} <b><font color="#3DBA39">sikeresen </b></font> létrehozott egy ${model}-t.`,
        );
        NotifyController.clearAll(player); // to clear history or/and notifications on screen
        return;
    }

    const data = Athena.document.character.get(player);
    if (data.isDead) {
        return;
    }
    const name = Athena.database.collections.Characters.indexOf('name');
    const fwd = Athena.utility.vector.getVectorInFrontOfPlayer(player, 5);
    Athena.vehicle.add.toPlayer(player, model, fwd);
    // Athena.player.emit.message(player, `Sikeresen létrehoztad az autót: ${model}`);
    alt.logWarning(`${player} létrehozott egy ${model}-t.`);
    NotifyController.send(
        player,
        2,
        7,
        'Sikeres',
        `${name} <b><font color="#3DBA39">sikeresen </b></font> létrehozott egy ${model}-t.`,
    );
    NotifyController.clearAll(player); // to clear history or/and notifications on screen
});

Athena.commands.register('fixveh', '', ['admin'], (player: alt.Player) => {
    const vehicle = player.vehicle ? player.vehicle : Athena.utility.closest.getClosestVehicle(player.pos);

    if (!vehicle) {
        // Athena.player.emit.message(player, 'No spawned vehicle.');
        NotifyController.send(
            player,
            4,
            5,
            'Sikertelen',
            '<b><font color="#3DBA39">Hiba. Nincs érvényes autó!</b></font>',
        );
        NotifyController.clearAll(player); // to clear history or/and notifications on screen
        return;
    }

    if (Athena.utility.vector.distance(player.pos, vehicle.pos) > 4 && !player.vehicle) {
        // Athena.player.emit.message(player, 'No vehicle in range.');
        NotifyController.send(
            player,
            3,
            5,
            'Figyelmeztetés',
            'Nincs a közeledben jármű. <b><font color="#3DBA39">Ülj bele az autóba, amit javítani szeretnél!</b></font>',
        );
        NotifyController.clearAll(player); // to clear history or/and notifications on screen
        return;
    }

    Athena.vehicle.damage.repair(vehicle);
    Athena.vehicle.controls.updateLastUsed(vehicle);
    Athena.vehicle.controls.update(vehicle);

    const hash = typeof vehicle.model === 'number' ? vehicle.model : alt.hash(vehicle.model);

    let vehInfo = Athena.utility.hashLookup.vehicle.hash(hash);

    // Athena.player.emit.message(player, `${vehInfo.displayName} got repaired.`);
    NotifyController.send(player, 2, 5, 'Sikeres', 'A jármű <b><font color="#3DBA39">sikeresen</b></font> megjavítva.');
    NotifyController.clearAll(player); // to clear history or/and notifications on screen

    alt.logWarning(`${player} megjavította a(z): ${vehInfo.displayName}`);
});

// The setLivery command has two possible commands that call both the same function. This is needed since it's not possible anymore to declare more than one name like in V4.

Athena.commands.register(
    'setVehicleLivery',
    LocaleController.get(LOCALE_KEYS.COMMAND_SET_VEHICLE_LIVERY, '/setVehicleLivery'),
    ['admin'],
    setLivery,
);

Athena.commands.register(
    'svl',
    LocaleController.get(LOCALE_KEYS.COMMAND_SET_VEHICLE_LIVERY, '/svl'),
    ['admin'],
    setLivery,
);

function setLivery(player: alt.Player, livery: string) {
    const vehicle = player.vehicle ? player.vehicle : Athena.utility.closest.getClosestVehicle(player.pos);

    if (!vehicle) {
        Athena.player.emit.message(player, 'No spawned vehicle.');
        return;
    }

    if (Athena.utility.vector.distance(player.pos, vehicle.pos) > 4 && !player.vehicle) {
        // Athena.player.emit.message(player, 'No vehicle in range.');
        NotifyController.send(
            player,
            3,
            5,
            'Figyelmeztetés',
            'Nincs a közeledben jármű. <b><font color="#3DBA39">Ülj bele az autóba, amit javítani szeretnél!</b></font>',
        );
        NotifyController.clearAll(player); // to clear history or/and notifications on screen
        return;
    }

    if (vehicle.modKit == 0 && vehicle.modKitsCount > 0) {
        Athena.vehicle.tuning.applyTuning(vehicle, { modkit: 1 });
    }

    if (vehicle.modKit == 0) {
        Athena.player.emit.message(player, LocaleController.get(LOCALE_KEYS.VEHICLE_HAS_NO_MOD_KIT));
        return;
    }

    if (isNaN(parseInt(livery))) {
        // Athena.player.emit.message(player, `Livery passed was not a number.`);
        NotifyController.send(
            player,
            3,
            5,
            'Figyelmeztetés',
            'Nem megfelelő matrica <b><font color="#3DBA39">azonosító. CSAK szám lehet!</b></font>',
        );
        NotifyController.clearAll(player); // to clear history or/and notifications on screen
        return;
    }

    Athena.vehicle.tuning.applyTuning(vehicle, { mods: [{ id: 48, value: parseInt(livery) }] });
    Athena.vehicle.controls.updateLastUsed(vehicle);
    Athena.vehicle.controls.update(vehicle);

    const tuningData: IVehicleTuning = Athena.vehicle.tuning.getTuning(vehicle);

    Athena.document.vehicle.set(vehicle, 'tuning', tuningData);

    const hash = typeof vehicle.model === 'number' ? vehicle.model : alt.hash(vehicle.model);

    let vehInfo = Athena.utility.hashLookup.vehicle.hash(hash);

    // Athena.player.emit.message(player, `Livery of ${vehInfo.displayName} was set to ID ${livery}.`);
    NotifyController.send(
        player,
        2,
        5,
        'Sikeres',
        `A ${vehInfo.displayName} matricája mostantól a(z) <b><font color="#3DBA39">${livery}</b></font>.`,
    );
    NotifyController.clearAll(player); // to clear history or/and notifications on screen
}

Athena.commands.register(
    'setvehicledirtLevel',
    LocaleController.get(LOCALE_KEYS.COMMAND_SET_VEH_DIRT_LEVEL, '/setvehicledirtLevel'),
    ['admin'],
    setVehicleDirtlevel,
);

Athena.commands.register(
    'svdl',
    LocaleController.get(LOCALE_KEYS.COMMAND_SET_VEH_DIRT_LEVEL, '/svdl'),
    ['admin'],
    setVehicleDirtlevel,
);

function setVehicleDirtlevel(player: alt.Player, dirtLevel: string) {
    const vehicle = player.vehicle ? player.vehicle : Athena.utility.closest.getClosestVehicle(player.pos);

    if (!vehicle) {
        Athena.player.emit.message(player, 'No spawned vehicle.');
        return;
    }

    if (Athena.utility.vector.distance(player.pos, vehicle.pos) > 4 && !player.vehicle) {
        // Athena.player.emit.message(player, 'No vehicle in range.');
        NotifyController.send(
            player,
            3,
            5,
            'Figyelmeztetés',
            'Nincs a közeledben jármű. <b><font color="#3DBA39">Ülj bele az autóba, amit szeretnél beállítani!</b></font>',
        );
        NotifyController.clearAll(player); // to clear history or/and notifications on screen
        return;
    }

    if (isNaN(parseInt(dirtLevel))) {
        // Athena.player.emit.message(player, `Dirt level passed was not a number.`);
        NotifyController.send(
            player,
            3,
            5,
            'Figyelmeztetés',
            'Nem megfelelő matrica <b><font color="#3DBA39">azonosító. CSAK szám lehet!</b></font>',
        );
        NotifyController.clearAll(player); // to clear history or/and notifications on screen
        return;
    }

    const dirtlevelState: Partial<VehicleState> = { dirtLevel: parseInt(dirtLevel) };

    Athena.vehicle.tuning.applyState(vehicle, dirtlevelState);
    Athena.vehicle.controls.updateLastUsed(vehicle);
    Athena.vehicle.controls.update(vehicle);

    const hash = typeof vehicle.model === 'number' ? vehicle.model : alt.hash(vehicle.model);

    let vehInfo = Athena.utility.hashLookup.vehicle.hash(hash);

    // Athena.player.emit.message(player, `Dirtlevel of ${vehInfo.displayName} was set to ID ${dirtLevel}.`);
    NotifyController.send(
        player,
        2,
        5,
        'Sikeres',
        `A ${vehInfo.displayName} matricája mostantól a(z) <b><font color="#3DBA39">${dirtLevel}</b></font>.`,
    );
    NotifyController.clearAll(player); // to clear history or/and notifications on screen
}

Athena.commands.register(
    'sessionvehicle',
    LocaleController.get(LOCALE_KEYS.COMMAND_SESSION_VEHICLE, '/sessionvehicle'),
    ['admin'],
    (player: alt.Player, model: string) => {
        if (!model) {
            Athena.player.emit.message(player, `No model specified.`);
            return;
        }

        const vehicle = Athena.vehicle.spawn.temporary({ model, pos: player.pos, rot: player.rot }, false);
        if (!vehicle) {
            return;
        }

        player.setIntoVehicle(vehicle, Athena.vehicle.shared.SEAT.DRIVER);
    },
);

Athena.commands.register(
    'ft',
    LocaleController.get(LOCALE_KEYS.COMMAND_FULL_TUNE_VEHICLE, '/fullTuneVehicle'),
    ['admin'],
    (player: alt.Player) => {
        const vehicle = player.vehicle ? player.vehicle : Athena.utility.closest.getClosestVehicle(player.pos);

        if (!vehicle) {
            Athena.player.emit.message(player, 'No spawned vehicle.');
            return;
        }

        if (Athena.utility.vector.distance(player.pos, vehicle.pos) > 4 && !player.vehicle) {
            // Athena.player.emit.message(player, 'No vehicle in range.');
            NotifyController.send(
                player,
                3,
                7,
                'Figyelmeztetés',
                'Nincs a közeledben <b><font color="#FFE13A">jármű</b></font>',
            );
            NotifyController.clearAll(player); // to clear history or/and notifications on screen
            return;
        }

        if (vehicle.modKit == 0 && vehicle.modKitsCount > 0) {
            Athena.vehicle.tuning.applyTuning(vehicle, { modkit: 1 });
        }

        if (vehicle.modKit == 0) {
            Athena.player.emit.message(player, LocaleController.get(LOCALE_KEYS.VEHICLE_HAS_NO_MOD_KIT));
            return;
        }

        for (let i = 0; i < 70; ++i) {
            const maxId = vehicle.getModsCount(i);

            if (i == 48) {
                continue;
            }

            if (maxId > 0) {
                Athena.vehicle.tuning.applyTuning(vehicle, { mods: [{ id: i, value: maxId }] });
            }
        }
        Athena.vehicle.controls.updateLastUsed(vehicle);
        Athena.vehicle.controls.update(vehicle);

        const tuningData: IVehicleTuning = Athena.vehicle.tuning.getTuning(vehicle);

        Athena.document.vehicle.set(vehicle, 'tuning', tuningData);
    },
);

Athena.commands.register(
    'modveh',
    '/modveh [modID] [value]',
    ['admin'],
    (player: alt.Player, id: string, value: string) => {
        const vehicle = player.vehicle ? player.vehicle : Athena.utility.closest.getClosestVehicle(player.pos);

        if (!vehicle) {
            Athena.player.emit.message(player, 'No spawned vehicle.');
            return;
        }

        if (Athena.utility.vector.distance(player.pos, vehicle.pos) > 4 && !player.vehicle) {
            // Athena.player.emit.message(player, 'No vehicle in range.');
            NotifyController.send(
                player,
                3,
                7,
                'Figyelmeztetés',
                'Nincs a közeledben <b><font color="#FFE13A">jármű</b></font>',
            );
            NotifyController.clearAll(player); // to clear history or/and notifications on screen
            return;
        }

        if (vehicle.modKit == 0 && vehicle.modKitsCount > 0) {
            Athena.vehicle.tuning.applyTuning(vehicle, { modkit: 1 });
        }

        if (vehicle.modKit == 0) {
            Athena.player.emit.message(player, LocaleController.get(LOCALE_KEYS.VEHICLE_HAS_NO_MOD_KIT));
            return;
        }

        if (isNaN(parseInt(id)) || isNaN(parseInt(value))) {
            // Athena.player.emit.message(player, `Id, or value was not a number.`);
            NotifyController.send(
                player,
                3,
                5,
                'Figyelmeztetés',
                'Nem megfelelő tuning <b><font color="#3DBA39">azonosító. CSAK szám lehet!</b></font>',
            );
            NotifyController.clearAll(player); // to clear history or/and notifications on screen
            return;
        }

        Athena.vehicle.tuning.applyTuning(vehicle, { mods: [{ id: parseInt(id), value: parseInt(value) }] });
        Athena.vehicle.controls.updateLastUsed(vehicle);
        Athena.vehicle.controls.update(vehicle);

        const tuningData: IVehicleTuning = Athena.vehicle.tuning.getTuning(vehicle);

        Athena.document.vehicle.set(vehicle, 'tuning', tuningData);

        const hash = typeof vehicle.model === 'number' ? vehicle.model : alt.hash(vehicle.model);

        let vehInfo = Athena.utility.hashLookup.vehicle.hash(hash);

        // Athena.player.emit.message(player, `Mod ID: ${id} of ${vehInfo.displayName} was set to ${value}.`);
        NotifyController.send(
            player,
            2,
            5,
            'Sikeres',
            `A ${vehInfo.displayName} ${id} tuningja mostantól a(z) <b><font color="#3DBA39">${value}</b></font>.`,
        );
        NotifyController.clearAll(player); // to clear history or/and notifications on screen
    },
);

Athena.commands.register('activateExtra', '/activateExtra [id]', ['admin'], (player: alt.Player, id: string) => {
    const vehicle = player.vehicle ? player.vehicle : Athena.utility.closest.getClosestVehicle(player.pos);

    if (!vehicle) {
        Athena.player.emit.message(player, 'No spawned vehicle.');
        return;
    }

    if (Athena.utility.vector.distance(player.pos, vehicle.pos) > 4 && !player.vehicle) {
        Athena.player.emit.message(player, 'No vehicle in range.');
        return;
    }

    if (isNaN(parseInt(id))) {
        Athena.player.emit.message(player, `Dirt level passed was not a number.`);
        return;
    }

    Athena.vehicle.tuning.setExtra(vehicle, [{ id: parseInt(id), state: true }]);
    Athena.vehicle.controls.updateLastUsed(vehicle);
    Athena.vehicle.controls.update(vehicle);

    const extraData: Array<VehicleExtra> = Athena.vehicle.tuning.getExtras(vehicle);

    Athena.document.vehicle.set(vehicle, 'extras', extraData);

    const hash = typeof vehicle.model === 'number' ? vehicle.model : alt.hash(vehicle.model);

    let vehInfo = Athena.utility.hashLookup.vehicle.hash(hash);

    Athena.player.emit.message(player, `Extra ${id} of ${vehInfo.displayName} was activated.`);
});

Athena.commands.register('deactivateExtra', '/deactivateExtra [id]', ['admin'], (player: alt.Player, id: string) => {
    const vehicle = player.vehicle ? player.vehicle : Athena.utility.closest.getClosestVehicle(player.pos);

    if (!vehicle) {
        Athena.player.emit.message(player, 'No spawned vehicle.');
        return;
    }

    if (Athena.utility.vector.distance(player.pos, vehicle.pos) > 4 && !player.vehicle) {
        Athena.player.emit.message(player, 'No vehicle in range.');
        return;
    }

    if (isNaN(parseInt(id))) {
        Athena.player.emit.message(player, `Dirt level passed was not a number.`);
        return;
    }

    Athena.vehicle.tuning.setExtra(vehicle, [{ id: parseInt(id), state: false }]);
    Athena.vehicle.controls.updateLastUsed(vehicle);
    Athena.vehicle.controls.update(vehicle);

    const extraData: Array<VehicleExtra> = Athena.vehicle.tuning.getExtras(vehicle);

    Athena.document.vehicle.set(vehicle, 'extras', extraData);

    const hash = typeof vehicle.model === 'number' ? vehicle.model : alt.hash(vehicle.model);

    let vehInfo = Athena.utility.hashLookup.vehicle.hash(hash);

    Athena.player.emit.message(player, `Extra ${id} of ${vehInfo.displayName} was deactivated.`);
});

// import { command } from '@AthenaServer/decorators/commands';
// import { PERMISSIONS } from '@AthenaShared/flags/permissionFlags';
// import { LOCALE_KEYS } from '@AthenaShared/locale/languages/keys';
// import { LocaleController } from '@AthenaShared/locale/locale';
// import { getClosestEntity } from '@AthenaServer/utility/vector';

// class VehicleCommands {
//

//     @command(
//         ['setVehicleHandling', 'sh'],
//         LocaleController.get(LOCALE_KEYS.COMMAND_SET_VEHICLE_HANDLING, '/sh'),
//         PERMISSIONS.ADMIN,
//     )
//     private static setVehicleHandlingCommand(player: alt.Player, key: string, value: string): void {
//         const vehicle = player.vehicle;
//         if (!vehicle?.valid) return;
//         if (!vehicle?.data) return;
//         if (!vehicle.data.tuning) vehicle.data.tuning = {};
//         if (!vehicle.data.tuning.handling) vehicle.data.tuning.handling = {};
//         const nValue = parseInt(value) ?? 0;
//         vehicle.data.tuning.handling[key] = nValue;
//         vehicle.setStreamSyncedMeta('handlingData', vehicle.data.tuning.handling);
//         Athena.vehicle.funcs.save(vehicle, vehicle.data);
//     }

//     @command(
//         ['toggleneonlights', 'tnl'],
//         LocaleController.get(LOCALE_KEYS.COMMAND_TOGGLE_VEH_NEON_LIGHTS, '/tnl'),
//         PERMISSIONS.ADMIN,
//     )
//     private static toggleVehicleNeonLightsCommand(player: alt.Player): void {
//         const vehicle = player.vehicle;

//         if (!vehicle?.valid || vehicle.isTemporary) return;

//         const lightsEnabled = !(vehicle.data.tuning.neonEnabled ?? false);

//         Athena.vehicle.funcs.setNeonLightsEnabled(vehicle, lightsEnabled);
//         Athena.vehicle.funcs.save(vehicle, vehicle.data);
//     }

//     @command(
//         ['setneonlights', 'snl'],
//         LocaleController.get(LOCALE_KEYS.COMMAND_SET_VEH_NEON_LIGHTS, '/snl'),
//         PERMISSIONS.ADMIN,
//     )
//     private static setVehicleNeonLightsCommand(
//         player: alt.Player,
//         left: string,
//         right: string,
//         front: string,
//         back: string,
//     ): void {
//         const vehicle = player.vehicle;

//         if (!vehicle?.valid || vehicle.isTemporary) return;

//         Athena.vehicle.funcs.setNeon(vehicle, {
//             left: left === '1',
//             right: right === '1',
//             front: front === '1',
//             back: back === '1',
//         });
//         Athena.vehicle.funcs.save(vehicle, vehicle.data);
//     }
// }

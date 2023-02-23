import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';

import Database from '@stuyk/ezmongodb';
import { Character } from '@AthenaShared/interfaces/character';
import { Account } from '@AthenaServer/interface/iAccount';

/**
 * Gets an online player by account identifier based on their MongoDB account _id.
 *
 * @param {string} id
 * @return {(alt.Player | undefined)}
 */
export function byAccount(id: string): alt.Player | undefined {
    return alt.Player.all.find((p) => {
        if (!p.valid) {
            return false;
        }

        const accountData = Athena.document.account.get(p);
        if (typeof accountData === 'undefined') {
            return false;
        }

        if (accountData._id !== id) {
            return false;
        }

        return true;
    });
}

/**
 * Gets an online player by their name.
 * Not case sensitive and returns the first player it finds matching that name.
 *
 * @param {string} name
 * @return {(alt.Player | undefined)}
 */
export function byName(name: string): alt.Player | undefined {
    name = name.toLowerCase().replace(/\s|_+/g, ''); // Normalize 'John_Fetterman Joe' to 'john_fettermanjoe'
    return alt.Player.all.find((p) => {
        if (!p.valid) {
            return false;
        }

        const data = Athena.document.character.get(p);
        if (typeof data === 'undefined') {
            return false;
        }

        return data.name.toLowerCase().replace(/\s|_+/g, '') === name;
    });
}

/**
 * Gets an online player by their partial name.
 * Not case sensitive and returns the first player it finds that includes the partial
 *
 * @param {string} partialName
 * @return {(alt.Player | undefined)}
 */
export function byPartialName(partialName: string): alt.Player | undefined {
    partialName = partialName.toLowerCase().replace(/\s|_+/g, ''); // Normalize 'John_Fetterman Joe' to 'john_fettermanjoe'
    return alt.Player.all.find((p) => {
        if (!p.valid) {
            return false;
        }

        const data = Athena.document.character.get(p);
        if (typeof data === 'undefined') {
            return false;
        }

        return data.name.toLowerCase().replace(/\s|_+/g, '').includes(partialName);
    });
}

/**
 * Get an online player based on their MongoDB _id
 *
 * @param {string} id
 * @return {(alt.Player | undefined)}
 */
export function byDatabaseID(id: string): alt.Player | undefined {
    return alt.Player.all.find((p) => {
        if (!p.valid) {
            return false;
        }

        const data = Athena.document.character.get(p);
        if (typeof data === 'undefined') {
            return false;
        }

        return data._id === id;
    });
}

/**
 * Return a player based on their ID given the Identifier strategy currently setup.
 * Use this to get the player in-game that you see with your eyes.
 *
 * @param {number} id
 * @return {(alt.Player | undefined)}
 */
export function byID(id: number): alt.Player | undefined {
    return Athena.systems.identifier.getPlayer(id);
}

/**
 * Creates a temporary ColShape in front of the player.
 * The ColShape is then used to check if the entity is present within the ColShape.
 * It will keep subtract distance until it finds a player near the player that is in the ColShape.
 * Works best on flat land or very close distances.
 *
 * @param {alt.Player} player
 * @param {number} [startDistance=2]
 * @return {(alt.Player | undefined)}
 */
export async function inFrontOf(player: alt.Player, startDistance = 6): Promise<alt.Player | undefined> {
    const fwdVector = Athena.utility.vector.getForwardVector(player.rot);
    const closestPlayers = [...alt.Player.all].filter((p) => {
        if (p.id === player.id) {
            return false;
        }

        const dist = Athena.utility.vector.distance2d(player.pos, p.pos);
        if (dist > startDistance) {
            return false;
        }

        return true;
    });

    if (closestPlayers.length <= 0) {
        return undefined;
    }

    while (startDistance > 1) {
        for (const target of closestPlayers) {
            const fwdPos = {
                x: player.pos.x + fwdVector.x * startDistance,
                y: player.pos.y + fwdVector.y * startDistance,
                z: player.pos.z - 1,
            };

            const colshape = new alt.ColshapeSphere(fwdPos.x, fwdPos.y, fwdPos.z, 2);

            await alt.Utils.wait(10);

            const isInside = colshape.isEntityIn(target);
            colshape.destroy();

            if (isInside) {
                return target;
            }
        }

        startDistance -= 0.5;
    }

    return undefined;
}

/**
 * Checks if a player is within 3 distance of a position.
 *
 * @param {alt.Player} player
 * @param {alt.IVector3} pos
 */
export function isNearPosition(player: alt.Player, pos: alt.IVector3, dist = 3): boolean {
    return Athena.utility.vector.distance(player.pos, pos) <= dist;
}
/**
 * Get the current waypoint marked on a player's map.
 * Will return undefined it is not currently set.
 *
 * @param {alt.Player} player
 * @return {(alt.IVector3 | undefined)}
 */
export function waypoint(player: alt.Player): alt.IVector3 | undefined {
    return player.currentWaypoint;
}

/**
 * The player closest to a player.
 *
 * @param {alt.Player} player
 * @return {(alt.Player | undefined)}
 */
export function closestToPlayer(player: alt.Player): alt.Player | undefined {
    return Athena.utility.closest.getClosestPlayer(player.pos, [player.id]);
}

/**
 * The player closest to a vehicle.
 *
 * @param {alt.Vehicle} vehicle
 * @return {(alt.Player | undefined)}
 */
export function closestToVehicle(vehicle: alt.Vehicle): alt.Player | undefined {
    return Athena.utility.closest.getClosestPlayer(vehicle.pos);
}

/**
 * Returns the closest owned vehicle for a given player.
 * Counts any owned vehicles from other players that have supplied an injection for ownership.
 * Ignores vehicles with keyless for start.
 *
 * @param {alt.Player} player
 * @return {(alt.Vehicle | undefined)}
 */
export function closestOwnedVehicle(player: alt.Player): alt.Vehicle | undefined {
    // const vehicles = alt.Vehicle.all.filter((veh) => {
    //     if (!veh || !veh.valid || !veh.data) {
    //         return false;
    //     }

    //     if (isFlagEnabled(veh.behavior, Vehicle_Behavior.NO_KEY_TO_START)) {
    //         return false;
    //     }

    //     return VehicleFuncs.hasOwnership(player, veh);
    // });

    // if (vehicles.length <= 0) {
    //     return undefined;
    // }

    // if (vehicles.length <= 1) {
    //     return vehicles[0];
    // }

    // vehicles.sort((a, b) => {
    //     const distA = Athena.utility.vector.distance(player.pos, a.pos);
    //     const distB = Athena.utility.vector.distance(player.pos, b.pos);

    //     return distA - distB;
    // });

    // return vehicles[0];

    return undefined;
}

/**
 * Returns all characters that belong to a player.
 * Requires account info, player, or account id string.
 *
 * @param {alt.Player} player
 * @return {Promise<Array<CharacterData>>}
 */
export async function characters(playerOrAccount: alt.Player | Account | string): Promise<Array<Character>> {
    if (playerOrAccount instanceof alt.Player) {
        const accountData = Athena.document.account.get(playerOrAccount);
        if (!accountData) {
            return [];
        }

        return await Database.fetchAllByField('account_id', accountData._id, Athena.database.collections.Characters);
    }

    if (typeof playerOrAccount === 'string') {
        return await Database.fetchAllByField(
            'account_id',
            playerOrAccount.toString(),
            Athena.database.collections.Characters,
        );
    }

    return await Database.fetchAllByField(
        'account_id',
        playerOrAccount._id.toString(),
        Athena.database.collections.Characters,
    );
}

import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import * as events from '@AthenaServer/events';
import { PLAYER_SYNCED_META } from '@AthenaShared/enums/playerSynced';

type IdentifierStrategy = 'account_id' | 'character_id' | 'server_id';

let strategy: IdentifierStrategy = 'server_id';

/**
 * Initialize player selection identifier creation
 *
 */
function init() {
    events.player.on('selected-character', setPlayerIdentifier);
}

/**
 * Should be set during the server startup phase to change player identification strategies.
 * This will apply to all players when they select a character.
 * DO NOT CHANGE THIS AFTER SERVER STARTUP.
 *
 * @static
 * @param {IdentifierStrategy} _strategy
 * @memberof Identifier
 */
export function setIdentificationStrategy(_strategy: IdentifierStrategy) {
    strategy = _strategy;
}

/**
 * Automatically sets the player identification by strategy to the synced meta.
 *
 * @static
 * @memberof Identifier
 */
export function setPlayerIdentifier(player: alt.Player) {
    if (!player || !player.valid) {
        return;
    }

    const identifier = getIdByStrategy(player);
    const data = Athena.document.character.get(player);
    if (typeof data === 'undefined') {
        throw new Error(`Could not set identifier for player: ${player.id}, data was not defined.`);
    }

    alt.log(`${data.name} ID join and set to ${identifier} using id strategy ${strategy}.`);
    player.setSyncedMeta(PLAYER_SYNCED_META.IDENTIFICATION_ID, identifier);
}

/**
 * Returns the player by the currently set identification strategy.
 *
 * @static
 * @param {(number | string)} id
 * @memberof Identifier
 */
export function getPlayer(id: number | string): alt.Player {
    if (typeof id === 'string') {
        id = parseInt(id);
    }

    return alt.Player.all.find((target) => {
        if (!target || !target.valid) {
            return false;
        }

        if (strategy === 'account_id') {
            const accountData = Athena.document.account.get(target);
            if (typeof accountData === 'undefined') {
                return false;
            }

            return accountData.id === id;
        }

        if (strategy === 'character_id') {
            const data = Athena.document.character.get(target);
            if (typeof data === 'undefined') {
                return false;
            }

            return data.character_id === id;
        }

        if (target.id !== id) {
            return false;
        }

        return true;
    });
}

/**
 * Returns the current numerical identifier based on current strategy.
 *
 * @static
 * @param {alt.Player} player
 * @return {number}
 * @memberof Identifier
 */
export function getIdByStrategy(player: alt.Player): number {
    const accountData = Athena.document.account.get(player);
    const data = Athena.document.character.get(player);

    if (typeof accountData === 'undefined' || typeof data === 'undefined') {
        alt.logWarning(`Could not fetch player identifier for player: ${player.id} (${player.name})`);
        return -1;
    }

    if (!player || !accountData || !data || !data._id) {
        return -1;
    }

    if (strategy === 'account_id') {
        return accountData.id;
    }

    if (strategy === 'character_id') {
        return data.character_id;
    }

    return player.id;
}

init();

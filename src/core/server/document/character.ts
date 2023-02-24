import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { Character } from '@AthenaShared/interfaces/character';
import { KnownKeys } from '@AthenaShared/utility/knownKeys';
import Database from '@stuyk/ezmongodb';

type KeyChangeCallback = (player: alt.Player, newValue: any, oldValue: any) => void;

const callbacks: { [key: string]: Array<KeyChangeCallback> } = {};
const cache: { [id: string]: Character } = {};
const DEBUG_MODE = false; // Use this to see what state is being set.

/**
 * Binds a player identifier to a Character document.
 * This document is cleared on disconnected automatically.
 * This should be the first thing you do after having a user authenticate.
 *
 * @param {alt.Player} player
 * @param {Character} document
 */
export function bind(player: alt.Player, document: Character) {
    if (Overrides.bind) {
        return Overrides.bind(player, document);
    }

    if (document._id) {
        document._id = document._id.toString();
    }

    cache[player.id] = document;
}

/**
 * Unbind stored player character cache data.
 *
 * @param {number} id
 */
export function unbind(id: number) {
    if (Overrides.unbind) {
        return Overrides.unbind(id);
    }

    delete cache[id];
}

/**
 * Return current player data and their associated character object.
 *
 * Can also append custom objects to the generic type to obtain custom data from the database.
 *
 * ```ts
 * interface Testing {
 *     myProperty: string;
 * }
 *
 * function someFunction(player: alt.Player) {
 *      const data = Athena.document.character.get<Testing>(player);
 *      if (typeof data === 'undefined') {
 *          // Player likely not logged in...
 *          return;
 *      }
 *
 *      if (data.myProperty) {
 *          console.log(data.myProperty);
 *      }
 * }
 * ```
 *
 * @template T
 * @param {alt.Player} player
 * @return {T = Character}
 */
export function get<T = Character>(player: alt.Player): T | undefined {
    if (Overrides.get) {
        return Overrides.get(player);
    }

    return cache[player.id] as T;
}

/**
 * Get the current value of a specific field inside of the player data object.
 * Can be extended to obtain any value easily.
 *
 * @template T
 * @param {alt.Player} player
 * @param {(keyof KnownKeys<Character & T>)} fieldName
 * @return {*}
 */
export function getField<T = {}, ReturnType = any>(
    player: alt.Player,
    fieldName: keyof KnownKeys<Character & T>,
): ReturnType | undefined {
    if (Overrides.getField) {
        return Overrides.getField(player, fieldName);
    }

    if (!cache[player.id]) {
        return undefined;
    }

    return cache[player.id][String(fieldName)];
}

/**
 * Sets a player document value, and saves it automatically to the selected character's database.
 * Automatically calls all callbacks associated with the field name.
 *
 * @template T
 * @param {alt.Player} player
 * @param {(keyof KnownKeys<Character & T>)} fieldName
 * @param {*} value
 * @return {void}
 */
export async function set<T = {}, Keys = keyof KnownKeys<Character & T>>(
    player: alt.Player,
    fieldName: Keys,
    value: any,
    skipCallbacks = false,
) {
    if (Overrides.set) {
        return Overrides.set(player, fieldName, value, skipCallbacks);
    }

    if (!cache[player.id]) {
        return undefined;
    }

    const typeSafeFieldName = String(fieldName);
    let oldValue = undefined;
    if (cache[player.id][typeSafeFieldName]) {
        oldValue = JSON.parse(JSON.stringify(cache[player.id][typeSafeFieldName]));
    }

    const newData = { [typeSafeFieldName]: value };

    cache[player.id] = Object.assign(cache[player.id], newData);
    await Database.updatePartialData(cache[player.id]._id, newData, Athena.database.collections.Characters);

    if (DEBUG_MODE) {
        alt.logWarning(
            `DEBUG: ${cache[player.id].name} state updated for ${typeSafeFieldName} with value: ${JSON.stringify(
                newData,
            )}`,
        );
    }

    if (typeof callbacks[typeSafeFieldName] === 'undefined') {
        return;
    }

    if (skipCallbacks) {
        return;
    }

    for (let cb of callbacks[typeSafeFieldName]) {
        cb(player, value, oldValue);
    }
}

/**
 * Sets player document values, and saves it automatically to the selected character's database.
 * Automatically calls all callbacks associated with the field name.
 *
 * @template T
 * @param {alt.Player} player
 * @param {(Partial<Character & T>)} fields
 * @returns {void}
 */
export async function setBulk<T = {}, Keys = Partial<Character & T>>(player: alt.Player, fields: Keys) {
    if (Overrides.setBulk) {
        return Overrides.setBulk(player, fields);
    }

    const oldValues = {};

    Object.keys(fields).forEach((key) => {
        oldValues[key] = JSON.parse(JSON.stringify(cache[player.id][key]));
    });

    cache[player.id] = Object.assign(cache[player.id], fields);
    await Database.updatePartialData(cache[player.id]._id, fields, Athena.database.collections.Characters);

    Object.keys(fields).forEach((key) => {
        if (typeof callbacks[key] === 'undefined') {
            return;
        }

        for (let cb of callbacks[key]) {
            cb(player, cache[player.id][key], oldValues[key]);
        }
    });
}

/**
 * Listen for individual player document changes.
 *
 * @param {string} fieldName
 * @param {KeyChangeCallback} callback
 * @return {void}
 */
export function onChange<T = {}>(fieldName: keyof KnownKeys<Character & T>, callback: KeyChangeCallback) {
    if (Overrides.onChange) {
        return Overrides.onChange(fieldName, callback);
    }

    const actualFieldName = String(fieldName);

    if (typeof callbacks[actualFieldName] === 'undefined') {
        callbacks[actualFieldName] = [callback];
    } else {
        callbacks[actualFieldName].push(callback);
    }
}

alt.on('playerDisconnect', (player: alt.Player) => {
    if (typeof player.id === 'undefined' || player.id === null) {
        return;
    }

    unbind(player.id);
});

interface CharacterDocFuncs {
    bind: typeof bind;
    unbind: typeof unbind;
    get: typeof get;
    getField: typeof getField;
    set: typeof set;
    setBulk: typeof setBulk;
    onChange: typeof onChange;
}

const Overrides: Partial<CharacterDocFuncs> = {};

export function override(functionName: 'bind', callback: typeof bind);
export function override(functionName: 'unbind', callback: typeof unbind);
export function override(functionName: 'get', callback: typeof get);
export function override(functionName: 'getField', callback: typeof getField);
export function override(functionName: 'set', callback: typeof set);
export function override(functionName: 'setBulk', callback: typeof setBulk);
export function override(functionName: 'onChange', callback: typeof onChange);
/**
 * Used to override any character document functionality
 *
 * @export
 * @param {keyof CharacterDocFuncs} functionName
 * @param {*} callback
 */
export function override(functionName: keyof CharacterDocFuncs, callback: any): void {
    Overrides[functionName] = callback;
}

import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import * as Athena from '@AthenaServer/api';
import { ItemDrop, StoredItem } from '@AthenaShared/interfaces/item';
import { deepCloneObject } from '@AthenaShared/utility/deepCopy';

type UnpushedItemDrop = Omit<ItemDrop, '_id'>;

const DEFAULT_EXPIRATION = 60000 * 5; // 5 Minutes
const drops: Array<ItemDrop> = [];
const markAsTaken: { [key: string]: boolean } = {};

/**
 * Initialize all item drops stored in the database.
 *
 */
async function init() {
    await Database.createCollection(Athena.database.collections.Drops);

    const results = await Database.fetchAllData<ItemDrop>(Athena.database.collections.Drops);
    for (let i = 0; i < results.length; i++) {
        results[i]._id = String(results[i]._id);
        drops.push(results[i]);
        Athena.controllers.itemDrops.append(results[i]);
        markAsTaken[String(results[i]._id)] = false;
    }
}

/**
 * Adds a new item drop to the database.
 *
 * @param {StoredItem} storedItem
 * @return {Promise<ItemDrop>}
 */
async function addToDatabase(storedItem: UnpushedItemDrop): Promise<ItemDrop> {
    storedItem = deepCloneObject<UnpushedItemDrop>(storedItem);
    const document = await Database.insertData<UnpushedItemDrop>(storedItem, Athena.database.collections.Drops, true);

    const convertedDoc = <ItemDrop>document;
    convertedDoc._id = String(convertedDoc._id);
    markAsTaken[String(convertedDoc._id)] = false;
    drops.push(convertedDoc);
    return convertedDoc;
}

/**
 * Simply tries to remove an entry from the database.
 *
 * @param {string} id
 */
async function removeFromDatabase(id: string) {
    await Database.deleteById(id, Athena.database.collections.Drops);
}

/**
 * Add a dropped item.
 *
 * @param {StoredItem} item
 * @param {alt.IVector3} pos
 * @return {Promise<string>}
 */
export async function add(item: StoredItem, pos: alt.IVector3, player: alt.Player = undefined): Promise<string> {
    const baseItem = Athena.systems.inventory.factory.getBaseItem(item.dbName);
    if (typeof baseItem === 'undefined') {
        return undefined;
    }

    const expiration =
        typeof baseItem.msTimeout === 'number' ? Date.now() + baseItem.msTimeout : Date.now() + DEFAULT_EXPIRATION;

    item.isEquipped = false;

    const document = await addToDatabase({
        ...item,
        name: baseItem.name,
        pos,
        expiration,
        model: baseItem.model,
    });

    Athena.controllers.itemDrops.append(document);

    if (typeof player !== 'undefined') {
        Athena.player.events.trigger('drop-item', player, item);
    }

    return document._id as string;
}

/**
 * Get the current item drop.
 *
 * @param {string} id
 * @return {(ItemDrop | undefined)}
 */
export function get(id: string): ItemDrop | undefined {
    return drops.find((x) => x._id === id);
}
/**
 * Remove the dropped item based on identifier.
 *
 * @param {string} id
 * @return {(Promise<StoredItem | undefined>)}
 */
export async function sub(id: string): Promise<StoredItem | undefined> {
    let itemClone: StoredItem = undefined;

    for (let i = drops.length - 1; i >= 0; i--) {
        if (Date.now() > drops[i].expiration && drops[i]._id !== id) {
            delete markAsTaken[id];
            drops.splice(i, 1);
            continue;
        }

        if (drops[i]._id !== id) {
            continue;
        }

        delete markAsTaken[id];

        Athena.controllers.itemDrops.remove(id);
        const newItem = deepCloneObject<ItemDrop>(drops.splice(i, 1));
        await removeFromDatabase(id);
        delete newItem._id;
        delete newItem.pos;
        delete newItem.expiration;
        delete newItem.pos;
        delete newItem.name;
        itemClone = newItem;
    }

    return itemClone;
}

/**
 * Check if an item is available by database id
 *
 * @export
 * @param {string} _id
 * @return {*}
 */
export function isItemAvailable(_id: string) {
    return typeof markAsTaken[_id] !== 'undefined' && markAsTaken[_id] === false;
}

/**
 * Mark an item as being taken
 *
 * @export
 * @param {string} _id
 * @param {boolean} value
 */
export function markForTaken(_id: string, value: boolean) {
    markAsTaken[_id] = value;
}

init();

import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import * as Athena from '@AthenaServer/api';

import { BaseItem, StoredItem, Item, DefaultItemBehavior, ClothingComponent } from '@AthenaShared/interfaces/item';
import { deepCloneObject } from '@AthenaShared/utility/deepCopy';
import { sha256 } from '@AthenaServer/utility/hash';

let databaseItems: Array<BaseItem<DefaultItemBehavior, {}>> = [];
let isDoneLoading = false;

const InternalFunctions = {
    async init() {
        await Database.createCollection(Athena.database.collections.Items);
        databaseItems = await Database.fetchAllData<BaseItem>(Athena.database.collections.Items);

        // Convert all MongoDB _id entries to strings.
        for (let i = 0; i < databaseItems.length; i++) {
            databaseItems[i]._id = databaseItems[i]._id.toString();
        }

        isDoneLoading = true;
    },
};

/**
 * Wait until the `isDoneLoading` variable is set to `true` before continuing.
 */
export async function isDoneLoadingAsync(): Promise<void> {
    return new Promise((resolve: Function) => {
        const interval = alt.setInterval(() => {
            if (!isDoneLoading) {
                return;
            }

            alt.clearInterval(interval);
            resolve();
        }, 0);
    });
}

/**
 * Get a base item based on dbName, and version if supplied.
 *
 * @template CustomData
 * @template CustomBehavior
 * @param {string} dbName
 * @param {number} [version=undefined]
 * @return {(BaseItem<DefaultItemBehavior & CustomBehavior, CustomData>)}
 */
export async function getBaseItemAsync<CustomData = {}, CustomBehavior = {}>(
    dbName: string,
    version: number = undefined,
): Promise<BaseItem<DefaultItemBehavior & CustomBehavior, CustomData>> {
    await isDoneLoadingAsync();

    const index = databaseItems.findIndex((item) => {
        const hasMatchingName = item.dbName === dbName;

        if (!hasMatchingName) {
            return false;
        }

        const hasMatchingVersion = item.version === version;
        if (!hasMatchingVersion) {
            return false;
        }

        return true;
    });

    if (index <= -1) {
        alt.logWarning(`Could not find item with dbName: ${dbName} in getBaseItem`);
        return undefined;
    }

    return deepCloneObject<BaseItem<DefaultItemBehavior & CustomBehavior, CustomData>>(databaseItems[index]);
}

/**
 * Updates or inserts a new database item into the database.
 * If a verison is specified and it does not find a matching version it will add a new item.
 * If a version is not specified; it will find a non-versioned item to replace.
 *
 * @param {BaseItem} baseItem
 */
export async function upsertAsync(baseItem: BaseItem) {
    await isDoneLoadingAsync();

    const index = databaseItems.findIndex((item) => {
        const hasMatchingName = item.dbName === baseItem.dbName;

        if (!hasMatchingName) {
            return false;
        }

        const hasMatchingVersion = item.version === baseItem.version;
        if (!hasMatchingVersion) {
            return false;
        }

        return true;
    });

    // Create New Item Entry
    if (index <= -1) {
        const document = await Database.insertData<BaseItem>(baseItem, Athena.database.collections.Items, true);

        document._id = document._id.toString();
        databaseItems.push(document);
        return;
    }

    const itemClone = deepCloneObject<BaseItem>(baseItem);
    delete itemClone._id;
    if (sha256(JSON.stringify(itemClone)) === sha256(JSON.stringify(baseItem))) {
        return;
    }

    // Update Existing Item
    databaseItems[index] = deepCloneObject<BaseItem>(baseItem);
    await Database.updatePartialData(baseItem._id, databaseItems[index], Athena.database.collections.Items);
}

/**
 * Converts an item from a player inventory, equipment, or toolbar to a full item set.
 * Also performs weight calculations.
 *
 * @template CustomData
 * @template CustomBehavior
 * @param {StoredItem<CustomData>} item
 * @return {(Item<CustomBehavior & DefaultItemBehavior, CustomData> | undefined)}
 */
export async function fromStoredItemAsync<CustomData = {}, CustomBehavior = {}>(
    item: StoredItem<CustomData>,
): Promise<Item<CustomBehavior & DefaultItemBehavior, CustomData> | undefined> {
    await isDoneLoadingAsync();

    const baseItem = await getBaseItemAsync<CustomData, CustomBehavior>(item.dbName, item.version);
    if (typeof baseItem === 'undefined') {
        return undefined;
    }

    const combinedItem = Object.assign(baseItem, item) as Item<CustomBehavior & DefaultItemBehavior, CustomData>;

    if (typeof combinedItem.weight === 'number') {
        combinedItem.totalWeight = combinedItem.weight * combinedItem.quantity;
    }

    return combinedItem;
}
/**
 * Converts a full item, into a storeable version of the item.
 * Only certain parts of the item will be stored.
 *
 * @template CustomData
 * @param {Item<DefaultItemBehavior, CustomData>} item
 * @return {StoredItem<CustomData>}
 */
export async function toStoredItemAsync<CustomData = {}>(
    item: Item<DefaultItemBehavior, CustomData>,
): Promise<StoredItem<CustomData>> {
    await isDoneLoadingAsync();

    const storedItem: StoredItem<CustomData> = {
        dbName: item.dbName,
        data: item.data,
        quantity: item.quantity,
        slot: item.slot,
    };

    if (typeof item.weight === 'number') {
        item.totalWeight = item.quantity * item.weight;
    }

    if (typeof item.version !== 'undefined') {
        storedItem.version = item.version;
    }

    return storedItem;
}

export async function fromBaseToStoredAsync<CustomData = {}>(
    baseItem: BaseItem<DefaultItemBehavior, CustomData>,
    quantity: number,
): Promise<StoredItem<CustomData>> {
    await isDoneLoadingAsync();

    const storedItem: StoredItem<CustomData> = {
        dbName: baseItem.dbName,
        data: baseItem.data,
        quantity: quantity,
        slot: -1,
    };

    if (typeof baseItem.weight === 'number') {
        storedItem.totalWeight = quantity * baseItem.weight;
    }

    if (typeof baseItem.version !== 'undefined') {
        storedItem.version = baseItem.version;
    }

    return storedItem;
}

/**
 * Get a base item based on dbName, and version if supplied.
 * Does not wait for database of items to load first.
 * Use when usage is not at server-start.
 *
 * @template CustomData
 * @template CustomBehavior
 * @param {string} dbName
 * @param {number} [version=undefined]
 * @return {(BaseItem<DefaultItemBehavior & CustomBehavior, CustomData>)}
 */
export function getBaseItem<CustomData = {}, CustomBehavior = {}>(
    dbName: string,
    version: number = undefined,
): BaseItem<DefaultItemBehavior & CustomBehavior, CustomData> {
    const index = databaseItems.findIndex((item) => {
        const hasMatchingName = item.dbName === dbName;

        if (!hasMatchingName) {
            return false;
        }

        const hasMatchingVersion = item.version === version;
        if (!hasMatchingVersion) {
            return false;
        }

        return true;
    });

    if (index <= -1) {
        alt.logWarning(`Could not find item with dbName: ${dbName} in getBaseItem`);
        return undefined;
    }

    return deepCloneObject<BaseItem<DefaultItemBehavior & CustomBehavior, CustomData>>(databaseItems[index]);
}
/**
 * Converts an item from a player inventory, or toolbar to a full item set.
 * Also performs weight calculations.
 * Use when usage is not at server-start.
 *
 * @template CustomData
 * @template CustomBehavior
 * @param {StoredItem<CustomData>} item
 * @return {(Item<CustomBehavior & DefaultItemBehavior, CustomData> | undefined)}
 */
export function fromStoredItem<CustomData = {}, CustomBehavior = DefaultItemBehavior>(
    item: StoredItem<CustomData>,
): Item<CustomBehavior & DefaultItemBehavior, CustomData> | undefined {
    const baseItem = getBaseItem<CustomData, CustomBehavior>(item.dbName, item.version);
    if (typeof baseItem === 'undefined') {
        return undefined;
    }

    const combinedItem = Object.assign(baseItem, item) as Item<CustomBehavior & DefaultItemBehavior, CustomData>;

    if (typeof combinedItem.weight === 'number') {
        combinedItem.totalWeight = combinedItem.weight * combinedItem.quantity;
    }

    return combinedItem;
}
/**
 * Converts a full item, into a storeable version of the item.
 * Only certain parts of the item will be stored.
 * Use when usage is not at server-start.
 *
 * @template CustomData
 * @param {Item<DefaultItemBehavior, CustomData>} item
 * @return {StoredItem<CustomData>}
 */
export function toStoredItem<CustomData = {}>(item: Item<DefaultItemBehavior, CustomData>): StoredItem<CustomData> {
    const storedItem: StoredItem<CustomData> = {
        dbName: item.dbName,
        data: item.data,
        quantity: item.quantity,
        slot: item.slot,
    };

    if (typeof item.weight === 'number') {
        item.totalWeight = item.quantity * item.weight;
    }

    if (typeof item.version !== 'undefined') {
        storedItem.version = item.version;
    }

    return storedItem;
}
export function fromBaseToStored<CustomData = {}>(
    baseItem: BaseItem<DefaultItemBehavior, CustomData>,
    quantity: number,
) {
    const storedItem: StoredItem<CustomData> = {
        dbName: baseItem.dbName,
        data: baseItem.data,
        quantity: quantity,
        slot: -1,
    };

    if (typeof baseItem.weight === 'number') {
        storedItem.totalWeight = quantity * baseItem.weight;
    }

    if (typeof baseItem.version !== 'undefined') {
        storedItem.version = baseItem.version;
    }

    return storedItem;
}

InternalFunctions.init();

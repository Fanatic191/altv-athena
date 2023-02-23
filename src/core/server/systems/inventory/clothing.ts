import * as alt from 'alt-server';

import * as Athena from '@AthenaServer/api';
import { Appearance } from '@AthenaShared/interfaces/appearance';
import { ClothingComponent, ClothingInfo, StoredItem } from '@AthenaShared/interfaces/item';
import { isNullOrUndefined } from '@AthenaShared/utility/undefinedCheck';

const fModel = alt.hash('mp_f_freemode_01');
const mModel = alt.hash(`mp_m_freemode_01`);

// There is a item that will exist.
// Inside of the item's data it will contain information about how to equip an item
// The equipped item will be sent to some form of clothing handler

/**
 * Used to set a uniform on a player.
 *
 * @param {alt.Player} player
 * @param {Array<ClothingComponent>} components
 * @return {Promise<boolean>}
 */
export async function setUniform(player: alt.Player, components: Array<ClothingComponent>): Promise<boolean> {
    const data = Athena.document.character.get(player);
    if (typeof data === 'undefined') {
        return false;
    }

    await Athena.document.character.set(player, 'uniform', components);
    update(player);
    Athena.events.player.trigger('player-uniform-set', player);
    return true;
}

/**
 * Used to clear a uniform on a player.
 *
 * @param {alt.Player} player
 * @return {Promise<void>}
 */
export async function clearUniform(player: alt.Player): Promise<void> {
    await Athena.document.character.set(player, 'uniform', undefined);
    Athena.events.player.trigger('player-uniform-cleared', player);
}

/**
 * Set a custom model on a player.
 * If a custom model is set; no appearance or clothing updates will be called.
 *
 * @param {alt.Player} player
 * @param {(string | number)} model
 * @return {*}
 */
export async function setSkin(player: alt.Player, model: string | number) {
    const data = Athena.document.character.get(player);
    if (typeof data === 'undefined') {
        return false;
    }

    await Athena.document.character.set(player, 'skin', typeof model === 'string' ? alt.hash(model) : model);
    update(player);
    Athena.events.player.trigger('player-skin-set', player);
    return true;
}

/**
 * Clears a custom model on a player.
 *
 * @param {alt.Player} player
 */
export async function clearSkin(player: alt.Player) {
    const data = Athena.document.character.get(player);
    await Athena.document.character.set(player, 'skin', undefined);
    Athena.player.sync.appearance(player, data.appearance as Appearance);
    update(player);
    Athena.events.player.trigger('player-skin-cleared', player);
}

/**
 * Create a clothing item from DLC components.
 *
 * @param {(0 | 1)} sex
 * @param {Array<ClothingComponent>} componentList
 * @return {StoredItem<ClothingInfo>}
 */
export function outfitFromDlc(sex: 0 | 1, componentList: Array<ClothingComponent>): StoredItem<ClothingInfo> {
    const storableItem: StoredItem<ClothingInfo> = {
        dbName: 'clothing',
        quantity: 1,
        slot: -1,
        isEquipped: false,
        data: {
            sex,
            components: componentList,
        },
    };

    return storableItem;
}

/**
 * Create a clothing item from the current clothes applies to a player.
 * Specify which ids you want to include in the outfit; and mark whichever as props.
 *
 * @param {alt.Player} player
 * @param {Array<{ id: number; isProp?: boolean }>} components
 * @return {(StoredItem | undefined)}
 */
export function outfitFromPlayer(
    player: alt.Player,
    components: Array<{ id: number; isProp?: boolean }>,
    equipOnAdd = false,
): StoredItem | undefined {
    if (!player || !player.valid) {
        return undefined;
    }

    const data = Athena.document.character.get(player);
    if (typeof data === 'undefined' || typeof data.appearance === 'undefined') {
        return undefined;
    }

    const componentList: Array<ClothingComponent> = [];
    for (let i = 0; i < components.length; i++) {
        componentList.push({
            id: components[i].id,
            ...(components[i].isProp ? player.getDlcProp(components[i].id) : player.getDlcClothes(components[i].id)),
        });
    }

    const storableItem: StoredItem<ClothingInfo> = {
        dbName: 'clothing',
        quantity: 1,
        slot: -1,
        isEquipped: equipOnAdd,
        data: {
            sex: data.appearance.sex,
            components: componentList,
        },
    };

    return storableItem;
}

/**
 * Loop through all isEquipped items; and synchronize appearance.
 *
 * @param {alt.Player} player
 * @return {*}
 */
export function update(player: alt.Player) {
    if (!player || !player.valid) {
        return;
    }

    const data = Athena.document.character.get(player);
    if (typeof data === 'undefined' || typeof data.inventory === 'undefined') {
        return;
    }

    const propComponents = [0, 1, 2, 6, 7];
    for (let i = 0; i < propComponents.length; i++) {
        player.clearProp(propComponents[i]);
    }

    if (isNullOrUndefined(data.skin)) {
        const useModel = data.appearance.sex === 1 ? mModel : fModel;
        if (player.model !== useModel) {
            player.model = useModel;
        }
    } else {
        const customModel = typeof data.skin !== 'number' ? alt.hash(data.skin) : data.skin;
        if (player.model === customModel) {
            return;
        }

        player.model = customModel;
        return;
    }

    if (!data.appearance.sex) {
        player.setDlcClothes(0, 1, 0, 0, 0); // mask
        player.setDlcClothes(0, 3, 15, 0, 0); // torso
        player.setDlcClothes(0, 4, 14, 0, 0); // pants
        player.setDlcClothes(0, 5, 0, 0, 0); // bag
        player.setDlcClothes(0, 6, 35, 0, 0); // shoes
        player.setDlcClothes(0, 7, 0, 0, 0); // accessories
        player.setDlcClothes(0, 8, 15, 0, 0); // undershirt
        player.setDlcClothes(0, 9, 0, 0, 0); // body armour
        player.setDlcClothes(0, 11, 15, 0, 0); // top
    } else {
        player.setDlcClothes(0, 1, 0, 0, 0); // mask
        player.setDlcClothes(0, 3, 15, 0, 0); // torso
        player.setDlcClothes(0, 5, 0, 0, 0); // bag
        player.setDlcClothes(0, 4, 14, 0, 0); // pants
        player.setDlcClothes(0, 6, 34, 0, 0); // shoes
        player.setDlcClothes(0, 7, 0, 0, 0); // accessories
        player.setDlcClothes(0, 8, 15, 0, 0); // undershirt
        player.setDlcClothes(0, 9, 0, 0, 0); // body armour
        player.setDlcClothes(0, 11, 91, 0, 0); // top
    }

    const inventoryBySlot = data.inventory.sort((a, b) => {
        return a.slot - b.slot;
    });

    for (let i = 0; i < inventoryBySlot.length; i++) {
        const item = inventoryBySlot[i] as StoredItem<{ components: Array<ClothingComponent> }>;
        if (typeof item === 'undefined' || typeof item.data === 'undefined') {
            continue;
        }

        if (!item.isEquipped) {
            continue;
        }

        if (!Object.hasOwn(item.data, 'components')) {
            continue;
        }

        // We look at the equipped item data sets; and find compatible clothing information in the 'data' field.
        // Check if the data property is the correct format for the item.
        for (let component of item.data.components) {
            if (component.isProp) {
                player.setDlcProp(component.dlc, component.id, component.drawable, component.texture);
            } else {
                const palette = typeof component.palette === 'number' ? component.palette : 0;
                player.setDlcClothes(component.dlc, component.id, component.drawable, component.texture, palette);
            }
        }
    }

    if (typeof data.uniform === 'undefined') {
        return;
    }

    for (let i = 0; i < data.uniform.length; i++) {
        const component = data.uniform[i];

        // We look at the equipped item data sets; and find compatible clothing information in the 'data' field.
        // Check if the data property is the correct format for the item.
        if (component.isProp) {
            player.setDlcProp(component.dlc, component.id, component.drawable, component.texture);
        } else {
            const palette = typeof component.palette === 'number' ? component.palette : 0;
            player.setDlcClothes(component.dlc, component.id, component.drawable, component.texture, palette);
        }
    }
}

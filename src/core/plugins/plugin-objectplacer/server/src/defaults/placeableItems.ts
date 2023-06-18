import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';

import { BaseItem, StoredItem } from '@AthenaShared/interfaces/item';
import { ObjectPlacerEvents } from '@AthenaPlugins/plugin-objectplacer/shared/objectPlacerEvents';

const placeableBehavior = {
    canDrop: true,
    canStack: true,
    canTrade: true,
    destroyOnDrop: true,
    isToolbar: true,
};

export const placeableItems: Array<BaseItem> = [
    {
        name: 'Palm Tree',
        icon: '@AthenaPlugins/icons/plugin-objectplacer/palmtree',
        dbName: 'palm_tree',
        data: {
            model: 'apa_mp_h_acc_plant_palm_01',
        },
        consumableEventToCall: ObjectPlacerEvents.PlaceObject,
        maxStack: 64,
        behavior: placeableBehavior,
    },
    {
        name: 'Generator',
        icon: 'crate',
        dbName: 'objectplacer-generator',
        data: {
            model: 'prop_generator_03b',
            readdInventory: false,
        },
        consumableEventToCall: ObjectPlacerEvents.PlaceObject,
        maxStack: 64,
        behavior: placeableBehavior,
    },
];

Athena.systems.inventory.effects.add(
    ObjectPlacerEvents.PlaceObject,
    async (player: alt.Player, slot: number, type: 'inventory' | 'toolbar') => {
        if (type !== 'toolbar') return;

        const item = Athena.player.toolbar.getAt(player, slot) as StoredItem<{ model: string }>;
        const isRemoved = await Athena.player.toolbar.sub(player, {
            dbName: item.dbName,
            quantity: 1,
            data: item.data,
        });

        if (!isRemoved) {
            return;
        }

        player.emit(ObjectPlacerEvents.EnableEditMode, item.data.model);
    },
);

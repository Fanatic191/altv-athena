import alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { NotifyController } from '@AthenaPlugins/fnky-notifications/server';

Athena.commands.register(
    'giveitem',
    '/additem [partialName] [amount] [version?]',
    ['admin'],
    async (player: alt.Player, partialName: string, amount: string, version: string | undefined) => {
        if (typeof partialName === 'undefined') {
            // Athena.player.emit.message(player, `Must specify a partialName to add an item.`);
            NotifyController.send(
                player,
                3,
                7,
                'Figyelmeztetés',
                'Megkell határoznod a <b><font color="#3DBA39">nevét!</b></font>',
            );
            NotifyController.clearAll(player); // to clear history or/and notifications on screen
            return;
        }

        if (typeof amount === 'undefined') {
            // Athena.player.emit.message(player, `Must specify an amount to add.`);
            NotifyController.send(
                player,
                3,
                7,
                'Figyelmeztetés',
                'Megkell határoznod a <b><font color="#3DBA39">mennyiséget!</b></font>',
            );
            NotifyController.clearAll(player); // to clear history or/and notifications on screen
            return;
        }

        const actualAmount = parseInt(amount);
        if (isNaN(actualAmount)) {
            // Athena.player.emit.message(player, `Amount is not a number.`);
            NotifyController.send(
                player,
                1,
                7,
                'Figyelem!',
                'A mennyiség nem egy <b><font color="#3DBA39">szám!</b></font>',
            );
            NotifyController.clearAll(player); // to clear history or/and notifications on screen
            return;
        }

        let actualVersion = undefined;
        if (typeof version !== 'undefined') {
            actualVersion = parseInt(version);
            if (isNaN(actualVersion)) {
                Athena.player.emit.message(player, `Version must be a number.`);
                return;
            }
        }

        const baseItem = Athena.systems.inventory.factory.getBaseItemByFuzzySearch(partialName);
        if (typeof baseItem === 'undefined') {
            // Athena.player.emit.message(player, `Item '${partialName}' does not exist!`);
            NotifyController.send(
                player,
                4,
                7,
                'Hiba',
                'Ilyen nevű item <b><font color="#3DBA39">nem létezik!</b></font>',
            );
            NotifyController.clearAll(player); // to clear history or/and notifications on screen
            return;
        }

        const result = await Athena.player.inventory.add(player, {
            dbName: baseItem.dbName,
            quantity: actualAmount,
            data: {},
            version: actualVersion,
        });

        if (!result) {
            // Athena.player.emit.notification(player, `Could not add. Inventory full?`);
            NotifyController.send(
                player,
                3,
                7,
                'Figyelmeztetés',
                'Az item addolása sikertelen, lehetséges, hogy <b><font color="#3DBA39">az inventory tele van!?</b></font>',
            );
            NotifyController.clearAll(player); // to clear history or/and notifications on screen
            return;
        }

        // Athena.player.emit.notification(player, `Item Added`);
        NotifyController.send(
            player,
            2,
            7,
            'Sikeres',
            'Az item megtalálható a <b><font color="#3DBA39">leltáradban (I)</b></font>',
        );
        NotifyController.clearAll(player); // to clear history or/and notifications on screen
    },
);

Athena.commands.register(
    'delitem',
    '/delitem [dbName] [amount] [version?]',
    ['admin'],
    async (player: alt.Player, dbName: string, amount: string, version: string | undefined) => {
        if (typeof dbName === 'undefined') {
            //Athena.player.emit.message(player, `Must specify a dbName to remove an item.`);
            NotifyController.send(
                player,
                3,
                7,
                'Figyelmeztetés',
                'Megkell határoznod a <b><font color="#3DBA39">nevét!</b></font>',
            );
            NotifyController.clearAll(player); // to clear history or/and notifications on screen
            return;
        }

        if (typeof amount === 'undefined') {
            //Athena.player.emit.message(player, `Must specify an amount to remove.`);
            NotifyController.send(
                player,
                3,
                7,
                'Figyelmeztetés',
                'Megkell határoznod a <b><font color="#3DBA39">mennyiséget!</b></font>',
            );
            NotifyController.clearAll(player); // to clear history or/and notifications on screen
            return;
        }

        const actualAmount = parseInt(amount);
        if (isNaN(actualAmount)) {
            //Athena.player.emit.message(player, `Amount is not a number.`);
            NotifyController.send(
                player,
                1,
                7,
                'Figyelem!',
                'A mennyiség nem egy <b><font color="#3DBA39">szám!</b></font>',
            );
            NotifyController.clearAll(player); // to clear history or/and notifications on screen
            return;
        }

        let actualVersion = undefined;
        if (typeof version !== 'undefined') {
            actualVersion = parseInt(version);
            if (isNaN(actualVersion)) {
                Athena.player.emit.message(player, `Version must be a number.`);
                return;
            }
        }

        const result = await Athena.player.inventory.sub(player, {
            dbName,
            quantity: actualAmount,
            version: actualVersion,
        });

        if (!result) {
            //Athena.player.emit.notification(player, `Could not remove?`);
            NotifyController.send(
                player,
                3,
                7,
                'Figyelmeztetés',
                'Az item eltávolítása sikertelen, lehetséges, hogy <b><font color="#3DBA39">nem létezik?</b></font>',
            );
            NotifyController.clearAll(player); // to clear history or/and notifications on screen
            return;
        }

        // Athena.player.emit.notification(player, `Item Removed`);
        NotifyController.send(player, 2, 7, 'Sikeres', 'Az item törlése <b><font color="#3DBA39">sikeres.</b></font>');
        NotifyController.clearAll(player); // to clear history or/and notifications on screen
    },
);

async function exampleItems() {
    Athena.systems.inventory.factory.upsertAsync({
        dbName: 'clothing',
        data: {},
        icon: 'clothing',
        name: 'Clothing',
        maxStack: 1,
        weight: 1,
        behavior: {
            isClothing: true,
            canDrop: true,
            canStack: false,
            canTrade: true,
            destroyOnDrop: false,
            isToolbar: false,
        },
    });

    Athena.systems.inventory.factory.upsertAsync({
        dbName: 'burger',
        data: { health: 5 },
        icon: 'burger',
        name: 'Burger',
        maxStack: 8,
        weight: 1,
        behavior: { canDrop: true, canStack: true, canTrade: true, destroyOnDrop: false, isToolbar: true },
        consumableEventToCall: 'edible',
    });

    Athena.systems.inventory.factory.upsertAsync({
        dbName: 'potato',
        data: {
            health: 2,
        },
        icon: 'potato',
        name: 'Potato',
        maxStack: 24,
        weight: 0.2,
        behavior: { canDrop: true, canStack: true, canTrade: true, destroyOnDrop: false, isToolbar: true },
        consumableEventToCall: 'edible',
    });

    Athena.systems.inventory.factory.upsertAsync({
        dbName: 'cheese',
        data: {
            health: 1,
        },
        icon: 'cheese',
        name: 'Cheese',
        maxStack: 24,
        weight: 0.1,
        behavior: { canDrop: true, canStack: true, canTrade: true, destroyOnDrop: false, isToolbar: true },
        consumableEventToCall: 'edible',
    });

    Athena.systems.inventory.factory.upsertAsync({
        dbName: 'potato-with-cheese',
        data: {
            health: 5,
        },
        icon: 'potato-with-cheese',
        name: 'Potato with Cheese',
        maxStack: 24,
        weight: 0.3,
        behavior: { canDrop: true, canStack: true, canTrade: true, destroyOnDrop: false, isToolbar: true },
        consumableEventToCall: 'edible',
    });

    Athena.systems.inventory.crafting.addRecipe({
        uid: 'potato-with-cheese',
        combo: ['potato', 'cheese'],
        quantities: [1, 1],
        result: { dbName: 'potato-with-cheese', quantity: 1 },
    });

    Athena.systems.inventory.factory.upsertAsync({
        dbName: 'burger',
        data: { health: 5 },
        icon: 'burger',
        name: 'Burger',
        maxStack: 8,
        weight: 25,
        behavior: { canDrop: true, canStack: true, canTrade: true, destroyOnDrop: false, isToolbar: true },
        consumableEventToCall: 'edible',
    });

    Athena.systems.inventory.effects.add(
        'edible',
        async (player: alt.Player, slot: number, type: 'inventory' | 'toolbar') => {
            const propertyName = String(type);
            const data = Athena.document.character.get(player);
            if (typeof data === 'undefined' || typeof data[propertyName] === 'undefined') {
                return;
            }

            // This is an item reference; do not modify it directly.
            const item = Athena.systems.inventory.slot.getAt<{ health: number }>(slot, data[propertyName]);
            if (typeof item === 'undefined') {
                return;
            }

            const index = data[propertyName].findIndex((x) => x.slot === slot);
            if (index <= -1) {
                // Item was not found with matching slot
                return;
            }

            // Instead you can directly apply data changes...
            Athena.systems.inventory.manager.setData<{ health: number }>(item, { health: item.data.health + 5 });

            const didRemove = await Athena.player.inventory.sub(player, { dbName: item.dbName, quantity: 1 });
            if (!didRemove) {
                Athena.player.emit.notification(player, `Could not eat ${item.dbName}`);
                return;
            }

            Athena.player.safe.addHealth(player, item.data.health);
            Athena.player.emit.notification(player, `You ate 1 ${item.dbName}`);
        },
    );
}

exampleItems();

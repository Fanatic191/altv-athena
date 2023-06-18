import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { Interaction } from '../../../../shared/interfaces/interaction';
import { ClothingComponent, Item, ItemEx } from '../../../../shared/interfaces/item';
import { deepCloneObject } from '../../../../shared/utility/deepCopy';
import { CLOTHING_CONFIG } from '../../shared/config';
import { CLOTHING_STORE_PAGE, DLC_CLOTH_HASH } from '../../shared/enums';
import { CLOTHING_INTERACTIONS } from '../../shared/events';
import { CLOTHING_DLC_INFO, IClothingStore, IClothingStorePage } from '../../shared/interfaces';
import clothingStores from './stores';
import { PolygonShape } from '@AthenaServer/extensions/extColshape';
import { sha256 } from '@AthenaServer/utility/hash';
import { Blip } from '@AthenaShared/interfaces/blip';

// Do not change order
const icons = [
    'hat',
    'mask',
    'shirt',
    'bottoms',
    'shoes',
    'glasses',
    'ear',
    'backpack',
    'armour',
    'watch',
    'bracelet',
    'accessory',
];

const wearableRef: Item = {
    name: `Item`,
    description: `An Item`,
    icon: 'crate',
    slot: 0,
    quantity: 1,
    behavior: { canDrop: true, canTrade: true, isEquippable: true },
    data: {},
};

const DefaultClothingData: IClothingStore = {
    hiddenComponents: {},
    hiddenPages: [],
    pagePrices: {
        [CLOTHING_STORE_PAGE.ARMOUR]: 1000,
        [CLOTHING_STORE_PAGE.BAG]: 125,
        [CLOTHING_STORE_PAGE.BOTTOMS]: 25,
        [CLOTHING_STORE_PAGE.BRACELET]: 5,
        [CLOTHING_STORE_PAGE.EARRINGS]: 5,
        [CLOTHING_STORE_PAGE.GLASSES]: 50,
        [CLOTHING_STORE_PAGE.HATS]: 75,
        [CLOTHING_STORE_PAGE.MASK]: 250,
        [CLOTHING_STORE_PAGE.SHIRT]: 25,
        [CLOTHING_STORE_PAGE.SHOES]: 25,
        [CLOTHING_STORE_PAGE.WATCH]: 200,
        [CLOTHING_STORE_PAGE.ACCESSORY]: 50,
    },
    clothingPrices: {},
};

let clothingStoreList: Array<IClothingStore> = [];
let isClothingStoresReady = false;

export class ClothingFunctions {
    /**
     * Initializes all clothing stores on server-start.
     * @static
     * @memberof ClothingFunctions
     */
    static init() {
        for (let i = 0; i < clothingStores.length; i++) {
            const position = new alt.Vector3(clothingStores[i].x, clothingStores[i].y, clothingStores[i].z);
            const uid = `clothing-store-${i}`;

            // Do not change.
            const defaultBlip: Blip = {
                text: 'Clothing Store',
                color: 11,
                sprite: 73,
                scale: 1,
                shortRange: true,
                pos: position,
                uid,
            };

            // Do not change.
            const defaultInteraction: Interaction = {
                position,
                description: 'Browse Clothing Store',
            };

            if (clothingStores[i].vertices) {
                const polygon = new PolygonShape(position.z, position.z + 2.5, clothingStores[i].vertices, true, false);

                polygon.addEnterCallback(ClothingFunctions.enter);
                polygon.addLeaveCallback(ClothingFunctions.leave);
                polygon.isPlayerOnly = true;
            }

            const clothingData = deepCloneObject<IClothingStore>(DefaultClothingData);
            clothingData.uid = uid;

            ClothingFunctions.create(
                position,
                clothingData,
                deepCloneObject(defaultBlip),
                deepCloneObject(defaultInteraction),
            );
        }

        isClothingStoresReady = true;
    }

    /**
     * Used to create dynamic clothing stores.
     * @static
     * @param {IClothingStore} store
     * @memberof ClothingFunctions
     */
    static create(position: alt.Vector3, store: IClothingStore, blip: Blip, interaction: Interaction) {
        if (!store.uid) {
            store.uid = sha256(JSON.stringify(store));
        }

        blip.uid = store.uid;
        blip.pos = position;
        interaction.position = {
            x: position.x,
            y: position.y,
            z: position.z - 1,
        };
        interaction.isPlayerOnly = true;

        interaction.callback = (player: alt.Player) => {
            const playerData = Athena.document.character.get(player);
            playerData._id
            if (!playerData) return;

            const data = ClothingFunctions.getClothingStoreData(store.uid);
            alt.emitClient(player, CLOTHING_INTERACTIONS.OPEN, data, playerData.appearance, playerData.equipment);
        };

        Athena.controllers.blip.append(blip);
        Athena.controllers.interaction.append(interaction);
        clothingStoreList.push(store);
    }

    /**
     * Used to get the clothing store data and pass it down to the player.
     * @static
     * @param {string} uid
     * @return {*}
     * @memberof ClothingFunctions
     */
    static getClothingStoreData(uid: string): IClothingStore {
        const index = clothingStoreList.findIndex((x) => x.uid === uid);
        if (index <= -1) {
            return null;
        }

        return clothingStoreList[index];
    }

    /**
     * Used to override default clothing store data.
     * @static
     * @param {string} uid
     * @param {IClothingStore} data
     * @return {*}
     * @memberof ClothingFunctions
     */
    static async overrideClothingData(uid: string, data: IClothingStore) {
        await this.waitForReady();
        const index = clothingStoreList.findIndex((x) => x.uid === uid);
        if (index <= -1) {
            console.error(new Error(`Clothing store with ${uid} does not exist.`));
            return;
        }

        data.uid = clothingStoreList[index].uid;
        clothingStoreList[index] = data;
    }

    /**
     * Used to wait for the clothing store to be ready before
     * overriding any data.
     * @private
     * @static
     * @return {*}  {Promise<void>}
     * @memberof ClothingFunctions
     */
    private static waitForReady(): Promise<void> {
        return new Promise((resolve: Function) => {
            const interval = alt.setInterval(() => {
                if (!isClothingStoresReady) {
                    return;
                }

                alt.clearInterval(interval);
                return resolve();
            }, 100);
        });
    }

    /**
     * Forces re-synchronization so that the player's equipment and clothing
     * are set to what they currently have equipped after leaving.
     * @static
     * @param {alt.Player} player
     * @memberof ClothingFunctions
     */
    static exit(player: alt.Player) {
        Athena.systems.inventory.clothing.update(player);
    }

    /**
     * Returns a string if it's non-gtav based hash.
     *
     * @static
     * @param {number} sex
     * @param {number} id
     * @param {number} drawable
     * @param {boolean} [isProp=false]
     * @return {*}
     * @memberof ClothingFunctions
     */
    static getDlcHash(
        player: alt.Player,
        id: number,
        drawable: number,
        texture: number,
        isProp: boolean = false,
    ): { dlcName: string | number; drawable: number; texture: number } {
        if (!player || !player.valid) {
            return null;
        }

        const playerData = Athena.document.character.get(player);
        if (!playerData) return null;

        const defaultMaxSize = isProp
            ? CLOTHING_CONFIG.MAXIMUM_PROP_VALUES[playerData.appearance.sex][id]
            : CLOTHING_CONFIG.MAXIMUM_COMPONENT_VALUES[playerData.appearance.sex][id];

        alt.log('defaultMaxSize: ' + defaultMaxSize);
        alt.log('drawable: ' + drawable);
        if (drawable <= defaultMaxSize) {
            const dlcData = isProp ? player.getDlcProp(id) : player.getDlcClothes(id);
            return {
                dlcName: dlcData.dlc,
                drawable: dlcData.drawable,
                texture: dlcData.texture,
            };
        }

        // Knowing the maximum drawable size. Anything greater than that should be considered DLC.
        // So it's usually MAXIMUM_GTAV_DEFAULT_AMOUNT + DLC_COUNTS_PER_ID
        // We can then use the total count per dlc data to find a relative hash based on the array order.
        // Example if the maximum is 48, and our dlc is located on 49.
        // When a clothing component is set for a DLC item, it uses the dlc hash and the relative id number for
        // the dlc to determine it's position.
        // Example being:
        // Vanilla GTA has a hash of 0
        // The drawable at 1 is always 1.
        // A DLC will have a longer hash like 5321532532
        // The drawable at 1 is always 1; granted you provide the hash.
        // Otherwise if DLC order shifts or changes position it will never be correct if you use the absolute id from the client.
        // That being said it is important that DLC order matches resource order.
        let currentSize = defaultMaxSize;
        const dataSet: Array<CLOTHING_DLC_INFO> = isProp
            ? CLOTHING_CONFIG.DLC_PROPS[id]
            : CLOTHING_CONFIG.DLC_CLOTHING[id];

        if (!dataSet) {
            return null;
        }

        for (const info of dataSet) {
            for (let drawableIndex = 0; drawableIndex < info.count[playerData.appearance.sex]; drawableIndex++) {
                currentSize += 1;

                if (currentSize === drawable) {
                    alt.log('DLC INIT WHAT EVER!!!!!!!: ' + info.dlcName);
                    return {
                        dlcName: DLC_CLOTH_HASH[playerData.appearance.sex] + info.dlcName,
                        drawable: drawableIndex,
                        texture,
                    };
                }
            }
        }

        return null;
    }

    static async update(player: alt.Player, pages: Array<IClothingStorePage>, justSync = false, populateData = false) {
        alt.logWarning('update serverside: ' + JSON.stringify(pages));
        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            if (!page || !page.drawables) {
                continue;
            }

            for (let index = 0; index < page.drawables.length; index++) {
                alt.logWarning('update serverside: ' + JSON.stringify(page));
                const id = page.ids[index];
                let drawable = page.drawables[index];
                const texture = page.textures[index];
                const isProp = page.isProp;
                let palette = 0;
                if(page.palettes && page.palettes.length >= index){
                    palette = page.palettes[index];
                }

                if (page.dlcs && page.dlcs.length >= 1) {
                    let dlc = page.dlcs[index];
                    if (typeof dlc === 'string') {
                        dlc = alt.hash(dlc);
                    }
                    if (isProp) {
                        if (drawable <= -1) {
                            player.clearProp(id);
                        } else {
                            player.setDlcProp(dlc, id, drawable, texture);
                        }
                    } else {
                        player.setDlcClothes(dlc, id, drawable, texture, palette);
                    }               
                } else {
                    if (isProp) {
                        if (drawable <= -1) {
                            player.clearProp(id);
                        } else {
                            player.setProp(id, drawable, texture);
                        }
                    } else {
                        player.setClothes(id, drawable, texture, palette);
                    }  
                }
            }          
        }

        // const result = await Athena.systems.inventory.manager.get(storableItem, data.inventory, 'inventory');
        // const result = await Athena.systems.inventory.manager.add(storableItem, data.inventory, 'inventory');
        // if (typeof result === 'undefined') {
        //     return;
        // }

        // await Athena.document.character.set(player, 'inventory', result);

        if (justSync) {
            return;
        }
    }

    /**
     * How clothing purchases are handled.
     * @static
     * @param {alt.Player} player
     * @param {number} equipmentSlot
     * @param {ClothingComponent} component
     * @param {string} name
     * @param {string} desc
     * @return {*}
     * @memberof ClothingFunctions
     */
    static async purchase(
        player: alt.Player,
        shopUID: string,
        pages: Array<IClothingStorePage>,
        noSound = false,
    ): Promise<boolean> {
        if (pages.length <= 0) {
            return false;
        }

        const index = clothingStoreList.findIndex((x) => x.uid === shopUID);
        if (index <= -1) {
            Athena.player.emit.sound2D(player, 'item_error');
            return false;
        }

        const playerData = Athena.document.character.get(player);
        if (!playerData) return false;

        const shop = clothingStoreList[index];
        let clothes: Array<ClothingComponent> = [];
        let totalCost: number = 0;

        for (const page of pages) {
            for (let i = 0; i < page.drawables.length; i++) {
                const id: number = page.ids[i];
                const drawable: number = page.drawables[i];
                const texture: number = page.textures[i];
                const isProp: boolean = page.isProp;

                const dlcInfo = ClothingFunctions.getDlcHash(
                    player,
                    id,
                    drawable,
                    texture,
                    isProp,
                );

                if(dlcInfo && (typeof dlcInfo.dlcName === "number")) 
                {
                    clothes.push({ id: id, drawable: dlcInfo.drawable, texture: dlcInfo.texture, dlc: dlcInfo.dlcName, isProp: isProp });
                } else {
                    clothes.push({ id: id, drawable: dlcInfo.drawable, texture: dlcInfo.texture, dlc: 0, isProp: isProp});
                }
                

                // Price based on component id in individual shop.
                if (shop.clothingPrices[id]) {
                    const componentInfo = shop.clothingPrices[id].find((item) => {
                        if (item.id === id) {
                            return true;
                        }

                        return false;
                    });

                    if (componentInfo && componentInfo.price) {
                        totalCost += componentInfo.price;
                        continue;
                    }
                }

                // Get individual page cost for all items if component has no price.
                if (shop.pagePrices[id]) {
                    totalCost += shop.pagePrices[id];
                }
            }
        }

        if (totalCost >= 1) {
            if (playerData.cash + playerData.bank < totalCost) {
                Athena.player.emit.sound2D(player, 'item_error');
                return false;
            }
        }

        await alt.Utils.wait(500);

        const storableItem = Athena.systems.inventory.clothing.outfitFromPlayer(player, clothes);
        const result = await Athena.systems.inventory.manager.add(storableItem, playerData.inventory, 'inventory');
        if (typeof result === 'undefined') {
            return false;
        }

        await Athena.document.character.set(player, 'inventory', result);

        if (!noSound) {
            Athena.player.emit.sound2D(player, 'item_purchase');
        }       

        return true;
    }

    /**
     * When a player enters a stream polygon, play a sound.
     * @param {uniontype} player - The player that entered the polygon.
     * @param {IStreamPolygon} _polygon - The polygon that the player is entering.
     */
    static enter(_polygon: PolygonShape, player: alt.Player) {
        if (!(player instanceof alt.Player)) {
            return;
        }

        Athena.player.emit.sound2D(player, 'shop_enter', 0.5);
    }

    /**
     * When a player leaves a polygon, the function is called.
     * @param {T} _player - The player that is leaving the polygon.
     * @param {IStreamPolygon} _polygon - The polygon that the player is leaving.
     */
    static leave(_polygon: PolygonShape, _player: alt.Player) {
        // Not Important. Just a placeholder _Name for placeholder variable.
    }
}

alt.onClient(CLOTHING_INTERACTIONS.EXIT, ClothingFunctions.exit);
alt.onClient(CLOTHING_INTERACTIONS.PURCHASE, ClothingFunctions.purchase);
alt.onClient(CLOTHING_INTERACTIONS.UPDATE, ClothingFunctions.update);

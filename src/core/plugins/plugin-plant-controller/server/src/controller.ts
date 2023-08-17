import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import * as PlantItems from '@AthenaPlugins/plugin-plant-controller/server/src/general/items';
import * as PlantEnum from '@AthenaPlugins/plugin-plant-controller/server/src/enums/index';

import Database from '@stuyk/ezmongodb';
import { ObjectId } from 'mongodb';

import { PlantControllerConfig } from './configs/main';
import { IPlant } from './interfaces/IPlants';
import { distance2d } from '@AthenaShared/utility/vector';
import { TextLabel } from '@AthenaShared/interfaces/textLabel';
import IAttachable from '@AthenaShared/interfaces/iAttachable';
import { PlantAnimationList } from './general/animationList';
import { IPlantAnim } from './interfaces/IPlantAnim';
import { StoredItem } from '@AthenaShared/interfaces/item';

let allPlants: Array<IPlant> = [];

const PlantControllerConst = {
    async initialize() {
        const itemsToCreate = [...PlantItems.defaultItems, ...PlantItems.strains, ...PlantItems.outcomes];

        for (let i = 0; i < itemsToCreate.length; i++) {
            const item = itemsToCreate[i];
            await Athena.systems.inventory.factory.upsertAsync(item);
        }

        await Database.createCollection(PlantControllerConfig.collection);
    },

    async loadAllPlants() {
        const dbPlants = await Database.fetchAllData<IPlant>(PlantControllerConfig.collection);

        dbPlants.forEach((plant) => {
            if (!plant.data.object) return;
            Athena.controllers.object.append({
                uid: plant.data.object.uid,
                model: plant.data.object.model,
                pos: plant.data.object.pos,
                rot: plant.data.object.rot,
            });

            if (PlantControllerConfig.showTextLabels) {
                let label = `${plant.data.seed ? plant.data.seed : 'No Seed'}\n${
                    plant.data.water ? plant.data.water.toFixed(2) : '0'
                }% Water\n${plant.data.fertilized ? 'Ferttilized' : 'No Fertilizer'}\n${
                    plant.data.duration ? plant.data.duration : 'N/A'
                } Seconds`;
                if (plant.data.duration <= 0 && plant.data.seed) {
                    label = `~g~Ready to Harvest`;
                }

                Athena.controllers.textLabel.append({
                    uid: plant.data.object.uid,
                    text: label,
                    pos: {
                        x: plant.data.object.pos.x,
                        y: plant.data.object.pos.y,
                        z: plant.data.object.pos.z + 1,
                    },
                });
            }
        });
        allPlants.push(...dbPlants);

        PlantController.debug(`Loaded ${allPlants.length} plants.`);
    },

    updatePlants() {
        setInterval(() => {
            for (const plant of allPlants) {
                if (
                    !plant.data.seed ||
                    plant.data.duration <= 0 ||
                    plant.data.water === null ||
                    plant.data.water <= PlantControllerConfig.waterTreshold
                ) {
                    continue;
                }

                plant.data.duration -= 1;
                plant.data.water -= PlantControllerConfig.waterLossPerSecond;

                if (plant.data.duration <= 0) {
                    PlantController.handleHarvestState(plant);
                }

                if (plant.data.water >= 100) {
                    plant.data.water = 100;
                }

                PlantController.handleObjectState(plant);
                PlantController.invokeDatabaseUpdate(plant);
            }
        }, 1000);
    },

    async addPlant(player: alt.Player, slot: number, type: 'inventory' | 'toolbar') {
        const playerData = Athena.document.character.get(player);
        const item = Athena.player.toolbar.getAt(player, slot);

        if (typeof item === 'undefined' || typeof playerData === 'undefined') return;

        PlantController.debug(`${playerData.name} is attempting to plant a ${item.dbName} => Inventory Type ${type}`);

        if (allPlants.length >= PlantControllerConfig.maxPlants) {
            PlantController.playerNotification(player, `Server has reached the maximum amount of plants.`);
            return;
        }

        // TODO: Fix this
        /* const playerPlants = allPlants.filter((plant) => plant.owner === playerData.name);
        if (playerPlants.length >= PlantControllerConfig.maxPlantsPerPlayer) {
            PlantController.playerNotification(player, `You have reached the maximum amount of plants.`);
            return;
        } */

        const isInRangeOfPlant = allPlants.some((plant) => {
            const distance = distance2d(plant.data.object.pos, player.pos);
            return distance <= PlantControllerConfig.rangeBetweenPots;
        });

        if (isInRangeOfPlant) {
            PlantController.playerNotification(player, `You are too close to another plant.`);
            return;
        }

        const animation = PlantAnimationList.find((_, index) => index === 0);
        const isResolve = await PlantController.timeout(player, animation.duration, animation, animation.attachable);
        if (!isResolve) return;

        const fwdVector = Athena.utility.vector.getVectorInFrontOfPlayer(player, 1);
        const plantDocument: IPlant = {
            owner: playerData.name,
            data: {
                pos: player.pos,
                object: {
                    uid: new ObjectId().toString(),
                    model: PlantEnum.Models.PLANTED,
                    pos: {
                        x: fwdVector.x,
                        y: fwdVector.y,
                        z: fwdVector.z - 1,
                    },
                    rot: player.rot,
                },
                seed: null,
                water: null,
                fertilized: null,
                duration: null,
                durationStart: null,
                outcome: null,
            },
        };

        const plant = await Database.insertData(plantDocument, PlantControllerConfig.collection, true);

        Athena.controllers.object.append({
            uid: plant.data.object.uid,
            model: plant.data.object.model,
            pos: plant.data.object.pos,
            rot: plant.data.object.rot,
        });

        PlantController.handleToolbarItem(player, slot, type);
        allPlants.push(plant);

        if (PlantControllerConfig.showTextLabels) {
            Athena.controllers.textLabel.append({
                uid: plant.data.object.uid,
                text: `${plant.data.seed ? plant.data.seed : 'No Seed'}\n${
                    plant.data.water ? plant.data.water.toFixed(2) : '0'
                }% Water\n${plant.data.fertilized ? 'Fertilized' : 'No Fertilizer'}\n${
                    plant.data.duration ? plant.data.duration : 'N/A'
                } Seconds`,
                pos: {
                    x: plant.data.object.pos.x,
                    y: plant.data.object.pos.y,
                    z: plant.data.object.pos.z + 1,
                },
            });
        }
    },

    async placeSeed(player: alt.Player, slot: number, type: 'toolbar') {
        const playerData = Athena.document.character.get(player);

        const storedItemRef = Athena.systems.inventory.slot.getAt<{
            seed: string;
            duration: number;
            outcome: string;
        }>(slot, playerData[type]);

        if (typeof playerData === 'undefined' || typeof storedItemRef === 'undefined') return;

        PlantController.debug(
            `${playerData.name} is attempting to place a ${storedItemRef.dbName} => Inventory Type ${type}`,
        );

        const plant = allPlants.find((plant) => distance2d(plant.data.pos, player.pos) < 2);

        if (!plant) {
            PlantController.debug(`No plant found within range.`);
            PlantController.playerNotification(player, `No plant found within range.`);
            return;
        }

        const animation = PlantAnimationList.find((_, index) => index === 1);
        const isResolve = await PlantController.timeout(player, animation.duration, animation, animation.attachable);
        if (!isResolve) return;

        if (storedItemRef.data.seed === null) {
            PlantController.debug(`Cannot place seed on plant.`);
            return;
        }

        if (!storedItemRef.data.seed || !storedItemRef.data.duration) {
            PlantController.debug(`This seed-item does not have a seed or duration set.`);
            return;
        }

        plant.data.seed = storedItemRef.data.seed;
        plant.data.duration = storedItemRef.data.duration;
        plant.data.durationStart = storedItemRef.data.duration;
        plant.data.outcome = storedItemRef.data.outcome;

        PlantController.updateLabels(plant.data.object.uid, {
            text: `${plant.data.seed ? plant.data.seed : 'No Seed'}\n${
                plant.data.water ? plant.data.water.toFixed(2) : '0'
            }% Water\n${plant.data.fertilized ? 'Fertilized' : 'No Fertilizer'}\n${
                plant.data.duration ? plant.data.duration : 'N/A'
            } Seconds`,
        });

        PlantController.handleToolbarItem(player, slot, type);
        PlantController.invokeDatabaseUpdate(plant);
    },

    async fertilizePlant(player: alt.Player, slot: number, type: 'inventory' | 'toolbar') {
        const playerData = Athena.document.character.get(player);
        PlantController.debug(`${playerData.name} is attempting to fertilize a plant => Inventory Type ${type}`);
        const plant = allPlants.find((plant) => distance2d(plant.data.pos, player.pos) < 2);
        if (!playerData.toolbar.find((x) => x.slot === slot)) return;

        if (!plant) {
            PlantController.debug(`No plant found within range.`);
            return;
        }

        if (!plant.data.seed) {
            PlantController.playerNotification(player, `You cannot fertilize a plant without a seed.`);
            return;
        }

        if (plant.data.fertilized) {
            PlantController.playerNotification(player, `This plant is already fertilized.`);
            return;
        }

        const animation = PlantAnimationList.find((_, index) => index === 2);
        const isResolve = await PlantController.timeout(player, animation.duration, animation, animation.attachable);
        if (!isResolve) return;

        if (plant.data.fertilized) {
            PlantController.playerNotification(player, `This plant is already fertilized.`);
            return;
        }

        if (plant.data.fertilized === null) {
            plant.data.fertilized = true;
            plant.data.duration = plant.data.duration * (1 - PlantControllerConfig.fertilizerPercentage);
        }

        PlantController.updateLabels(plant.data.object.uid, {
            text: `${plant.data.seed ? plant.data.seed : 'No Seed'}\n${
                plant.data.water ? plant.data.water.toFixed(2) : '0'
            }% Water\n${plant.data.fertilized ? 'Fertilized' : 'No Fertilizer'}\n${
                plant.data.duration ? plant.data.duration : 'N/A'
            } Seconds`,
        });

        PlantController.handleToolbarItem(player, slot, type);
        PlantController.invokeDatabaseUpdate(plant);
    },

    async waterPlant(player: alt.Player, slot: number, type: 'toolbar') {
        const playerData = Athena.document.character.get(player);
        const plant = allPlants.find((plant) => distance2d(plant.data.pos, player.pos) < 2);
        const item = Athena.player.toolbar.getAt(player, slot);
        const currentItem = item as StoredItem<{
            waterAmount: number;
        }>;

        if (typeof item === 'undefined' || typeof playerData === 'undefined' || !plant || plant.data.duration === 0) {
            return;
        }

        if (!currentItem.data.waterAmount) {
            return;
        }

        PlantController.debug(`${playerData.name} is attempting to water a plant => Inventory Type ${type}`);

        const animation = PlantAnimationList.find((_, index) => index === 3);
        const isResolve = await PlantController.timeout(player, animation.duration, animation, animation.attachable);
        if (!isResolve) return;

        if (plant.data.water >= 100) {
            PlantController.playerNotification(player, 'This plant has enough water.');
            plant.data.water = 100;
            return;
        }

        plant.data.water += currentItem.data.waterAmount;

        PlantController.updateLabels(plant.data.object.uid, {
            text: `${plant.data.seed ? plant.data.seed : 'No Seed'}\n${
                plant.data.water ? plant.data.water.toFixed(2) : '0'
            }% Water\n${plant.data.fertilized ? 'Fertilized' : 'No Fertilizer'}\n${
                plant.data.duration ? plant.data.duration : 'N/A'
            } Seconds`,
        });

        PlantController.handleToolbarItem(player, slot, type);
        PlantController.invokeDatabaseUpdate(plant);
    },

    async harvestPlant(player: alt.Player, slot: number, type: 'toolbar') {
        const playerData = Athena.document.character.get(player);
        const plant = allPlants.find((plant) => distance2d(plant.data.pos, player.pos) < 2);
        const item = Athena.player.toolbar.getAt(player, slot);

        if (typeof playerData === 'undefined' || typeof item === 'undefined' || !plant) return;

        PlantController.debug(`${playerData.name} is attempting to harvest a plant => Inventory Type ${type}`);

        const animation = PlantAnimationList.find((_, index) => index === 4);
        const isResolve = await PlantController.timeout(player, animation.duration, animation, animation.attachable);
        if (!isResolve) return;

        if (plant.data.duration > 0 || plant.data.duration === null) {
            PlantController.playerNotification(player, 'This plant is not ready to be harvested.');
            return;
        }

        await PlantController.generatePlantOutcome(player, plant);

        Athena.controllers.object.remove(plant.data.object.uid);
        Athena.controllers.textLabel.remove(plant.data.object.uid);

        allPlants.splice(allPlants.indexOf(plant), 1);

        await Database.deleteById(plant._id, PlantControllerConfig.collection);
        PlantController.handleToolbarItem(player, slot, type);
    },

    async generatePlantOutcome(player: alt.Player, plant: IPlant) {
        const itemToSearch = PlantItems.outcomes.find((x) => x.dbName === plant.data.outcome);
        if (!itemToSearch) {
            PlantController.debug(`Cannot find item with dbName ${plant.data.outcome} in outcomes list.`);
            return;
        }

        const itemToAdd = await Athena.systems.inventory.factory.getBaseItemAsync(itemToSearch.dbName);
        if (!itemToAdd) {
            PlantController.debug(`Cannot find item ${itemToSearch.dbName} in the item factory.`);
            return;
        }

        const isAdded = await Athena.player.inventory.add(player, {
            dbName: itemToAdd.dbName,
            quantity: 1,
            data: itemToAdd.data,
        });

        if (!isAdded) {
            PlantController.debug(`Can't add item ${itemToAdd.name} - Inventory full? - ${player.name}`);
            return;
        }
        // PlantController.playerNotification(player, `You harvested ${itemToAdd.name} x${itemToAdd.quantity}.`);
    },

    async invokeDatabaseUpdate(plant: IPlant) {
        const index = allPlants.findIndex((p) => p._id === plant._id);

        if (allPlants[index] === undefined) {
            PlantController.debug(`Cannot find plant ${plant._id} in the plant array.`);
            return;
        }

        allPlants[index] = plant;

        await Database.updatePartialData(plant._id, plant, PlantControllerConfig.collection);
    },

    handleObjectState(plant: IPlant) {
        if (
            plant.data.duration <= plant.data.durationStart / 2 &&
            plant.data.object.model !== PlantEnum.Models.MEDIUM
        ) {
            Athena.controllers.object.remove(plant.data.object.uid);
            plant.data.object.model = PlantEnum.Models.MEDIUM;
            Athena.controllers.object.append(plant.data.object);
            PlantController.debug(`Plant ${plant._id} has reached its medium growth.`);
            PlantController.invokeDatabaseUpdate(plant);
        }

        if (plant.data.duration <= 0) {
            Athena.controllers.object.remove(plant.data.object.uid);
            plant.data.object.model = PlantEnum.Models.LARGE;
            Athena.controllers.object.append(plant.data.object);
            PlantController.updateLabels(plant.data.object.uid, {
                text: '~g~Ready to Harvest!',
            });
            PlantController.debug(`Plant ${plant._id} has reached its maximum growth.`);
            PlantController.invokeDatabaseUpdate(plant);
        }
    },

    handleHarvestState(plant: IPlant) {
        if (plant.data.duration > 0) {
            PlantController.updateLabels(plant.data.object.uid, {
                text: `${plant.data.seed ? plant.data.seed : 'No Seed'}\n${
                    plant.data.water ? plant.data.water.toFixed(2) : '0'
                }% Water\n${plant.data.fertilized ? 'Fertilized' : 'No Fertilizer'}\n${
                    plant.data.duration ? plant.data.duration : 'N/A'
                } Seconds`,
            });
        }
    },

    async handleToolbarItem(player: alt.Player, slot: number, type: 'inventory' | 'toolbar') {
        const playerData = Athena.document.character.get(player);
        const item = Athena.player.toolbar.getAt(player, slot);

        if (typeof playerData === 'undefined' || typeof item === 'undefined') return;

        const isRemoved = await Athena.player.toolbar.sub(player, {
            dbName: item.dbName,
            quantity: 1,
            data: item.data,
        });

        if (!isRemoved) {
            PlantController.debug(`Can't remove item. Amount not available?`);
            return;
        }

        PlantController.debug(`${playerData.name} has used a ${item.dbName} on a plant. Removed 1 from toolbar.`);
    },

    updateLabels(uid: string, label: Partial<TextLabel>) {
        if (!PlantControllerConfig.showTextLabels) return;

        Athena.controllers.textLabel.update(uid, {
            text: label.text,
        });
    },

    playerNotification(player: alt.Player, msg: string) {
        if (!PlantControllerConfig.playerNotifications) return;

        Athena.player.emit.notification(player, msg);
    },

    async timeout(
        player: alt.Player,
        ms: number,
        animation: Partial<IPlantAnim>,
        attachable?: IAttachable,
    ): Promise<boolean> {
        if (player.getMeta('PlantController:Timeout')) {
            PlantController.playerNotification(player, 'You are already doing something.');
            return Promise.resolve(false);
        }

        player.setMeta('PlantController:Timeout', true);

        if (attachable) {
            Athena.player.emit.objectAttach(
                player,
                {
                    model: attachable.model,
                    bone: attachable.bone,
                    pos: attachable.pos,
                    rot: attachable.rot,
                },
                ms,
            );
        }

        alt.log(`ATTACHABLE: ${JSON.stringify(attachable)}`);
        Athena.player.emit.animation(player, animation.dict, animation.name, animation.flag, ms);
        player.frozen = true;

        return new Promise((resolve: Function) => setTimeout(resolve, ms)).then(() => {
            player.frozen = false;
            player.deleteMeta('PlantController:Timeout');
            return true;
        });
    },

    debug(msg: string) {
        if (!PlantControllerConfig.debug) return;

        alt.log(`[PlantController] ${msg}`);
    },
};

export const PlantController = {
    ...PlantControllerConst,
};

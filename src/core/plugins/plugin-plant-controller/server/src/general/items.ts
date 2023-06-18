import * as PlantEnum from '@AthenaPlugins/plugin-plant-controller/server/src/enums/index';
import { BaseItem } from '@AthenaShared/interfaces/item';

const itemBehavior = {
    canStack: true,
    canDrop: true,
    isToolbar: true,
};

const outcomeBehavior = {
    canStack: true,
    canDrop: true,
    isToolbar: false,
};

const strainBehavior = {
    canStack: true,
    canDrop: true,
    isToolbar: true,
};

export const defaultItems: Array<BaseItem> = [
    {
        name: 'Pot',
        model: 'sf_prop_sf_weed_01_small_01a',
        dbName: 'pot',
        behavior: itemBehavior,
        icon: '@AthenaPlugins/icons/plugin-plant-controller/pot',
        data: {},
        consumableEventToCall: PlantEnum.Events.ADD_POT,
        maxStack: 50,
    },
    {
        name: 'Plant Harvester',
        model: 'prop_weed_01',
        dbName: 'plant_harvester',
        behavior: itemBehavior,
        icon: '@AthenaPlugins/icons/plugin-plant-controller/plantharvester',
        data: {},
        consumableEventToCall: PlantEnum.Events.HARVEST_PLANT,
    },
    {
        name: 'Watering Can',
        model: 'prop_weed_01',
        dbName: 'watering_can',
        behavior: itemBehavior,
        icon: '@AthenaPlugins/icons/plugin-plant-controller/wateringcan',
        data: {
            waterAmount: 25,
        },
        consumableEventToCall: PlantEnum.Events.WATER_PLANT,
    },
    {
        name: 'Plant Fertilizer',
        model: 'prop_weed_01',
        dbName: 'plant_fertilizer',
        behavior: itemBehavior,
        icon: '@AthenaPlugins/icons/plugin-plant-controller/fertilizer',
        data: {},
        consumableEventToCall: PlantEnum.Events.FERTILIZE_PLANT,
    },
];

export const outcomes: Array<BaseItem> = [
    {
        name: 'Northern Haze',
        model: 'prop_weed_01',
        dbName: 'northern_haze',
        behavior: outcomeBehavior,
        icon: '@AthenaPlugins/icons/plugin-plant-controller/northern_haze.png',
        data: {},
    },
];

export const strains: Array<BaseItem> = [
    {
        name: 'Northern Haze Seed',
        dbName: 'northern_haze_seed',
        model: 'prop_weed_01',
        behavior: strainBehavior,
        icon: '@AthenaPlugins/icons/plugin-plant-controller/seeds.png',
        data: {
            seed: 'Northern Haze',
            duration: 30, // 5 minutes
            outcome: 'northern_haze', // Database name of "Northern Haze"
        },
        consumableEventToCall: PlantEnum.Events.PLACE_SEED,
    },
];

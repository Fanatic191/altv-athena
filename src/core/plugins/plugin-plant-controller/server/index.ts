import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import * as PlantEnum from '@AthenaPlugins/plugin-plant-controller/server/src/enums/index';

import { PlantController } from './src/controller';

const PLUGIN_NAME = '🪴 PlantController';

Athena.systems.plugins.registerPlugin(`PlantController`, async () => {
    await PlantController.initialize();
    await PlantController.loadAllPlants();
    PlantController.updatePlants();

    alt.log(`~g~${PLUGIN_NAME} has been loaded.`);
    Athena.systems.inventory.effects.add(PlantEnum.Events.ADD_POT, PlantController.addPlant);
    Athena.systems.inventory.effects.add(PlantEnum.Events.HARVEST_PLANT, PlantController.harvestPlant);
    Athena.systems.inventory.effects.add(PlantEnum.Events.WATER_PLANT, PlantController.waterPlant);
    Athena.systems.inventory.effects.add(PlantEnum.Events.PLACE_SEED, PlantController.placeSeed);
    Athena.systems.inventory.effects.add(PlantEnum.Events.FERTILIZE_PLANT, PlantController.fertilizePlant);
});

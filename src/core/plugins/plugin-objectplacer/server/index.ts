import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import * as ObjectPlacer from '@AthenaPlugins/plugin-objectplacer/server/src/objectPlacer';
import Database from '@stuyk/ezmongodb';

import { placeableItems } from './src/defaults/placeableItems';
import { objectPlacerConfig } from './src/defaults/config';

import './src/events';
import './src/commands';

export const PLUGIN_NAME = 'Objectplacer';
const AUTHOR = ['Köerts', 'Der Lord!'];

const itemsToGenerate = [...placeableItems];

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, async () => {
    for (const item of itemsToGenerate) {
        await Athena.systems.inventory.factory.upsertAsync(item);
    }

    await Database.createCollection(objectPlacerConfig.dbCollection);
    await ObjectPlacer.populateObjects();
    alt.log(`~lg~[Hypedmedia | Plugin] ==> ${PLUGIN_NAME} has been loaded! (~w~Author: ${AUTHOR.join(', ')}~lg~)`);
});

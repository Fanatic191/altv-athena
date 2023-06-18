import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { createDefaultInteriors } from './src/interiors';
import { InteriorSystem } from './src/system';

const PLUGIN_NAME = 'Athena Interiors';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, async () => {
    await InteriorSystem.init();
    await createDefaultInteriors();
    alt.log(`~lg~CORE ==> ${PLUGIN_NAME} was Loaded`);
});

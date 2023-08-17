import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { PaydaySystem } from './src/server';

const PLUGIN_NAME = 'Payday-System';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, async () => {
    PaydaySystem.init();
    alt.log(`~lb~${PLUGIN_NAME} was Loaded`);
});

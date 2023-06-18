import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';

import { VitalsSystem } from './src/system';

import './src/commands';
import { VitalsEffects } from './src/effects';

const PLUGIN_NAME = 'Vitals Plugin';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, () => {
    VitalsSystem.init();
    VitalsEffects.init();
    alt.log(`~lg~CORE ==> ${PLUGIN_NAME} was Loaded`);
});

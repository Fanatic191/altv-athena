import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { RentalSystem } from './src/view';

const PLUGIN_NAME = 'Rental Service';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, () => {
    RentalSystem.init();
    alt.log(`~lb~CORE ==> ${PLUGIN_NAME} was Loaded`);
});
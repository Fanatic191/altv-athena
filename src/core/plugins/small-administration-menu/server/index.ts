import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { AdministratorPlugin } from './src/view';

const PLUGIN_NAME = 'ADMIN-MENU';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, () => {
    AdministratorPlugin.init();
    alt.log(`~lb~CORE ==> ${PLUGIN_NAME} was Loaded`);
});

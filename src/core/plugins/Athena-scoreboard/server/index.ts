import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import './src/server'

const PLUGIN_NAME = 'Athena Scoreboard';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, async () => {
    alt.log(`~lg~CORE ==> ${PLUGIN_NAME} was Loaded`);
});

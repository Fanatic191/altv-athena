import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';

import { BankAccountNumber } from './src/bankAccountNumber';
import { AtmFunctions } from './src/view';

const PLUGIN_NAME = 'Athena ATM';

Athena.systems.plugins.registerPlugin(PLUGIN_NAME, () => {
    AtmFunctions.init();
    BankAccountNumber.init();
    alt.log(`~lg~CORE ==> ${PLUGIN_NAME} was Loaded`);
});

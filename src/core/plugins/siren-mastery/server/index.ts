// # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

/*

    Only change these lines if you know what you are doing.

*/
import './lib/sirenMastery';

// # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # # #

/*

    Example area
    This masterpiece of NodeJS engineering can be used in any other file. Even in another resource.
    We don't import the functionality from the module, we use local alt:V events to communicate with the siren mastery module

*/
import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';

Athena.vehicle.events.on('vehicle-spawned', (vehicle: alt.Vehicle) => {
    alt.emit('sirenMastery:setSirens', vehicle);
});

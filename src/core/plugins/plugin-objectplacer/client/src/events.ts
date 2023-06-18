import * as alt from 'alt-client';
import * as native from 'natives';
import * as AthenaClient from '@AthenaClient/api';

import { ObjectPlacer } from './objectPlacer';
import { ObjectPlacerEvents } from '@AthenaPlugins/plugin-objectplacer/shared/objectPlacerEvents';

alt.onServer(ObjectPlacerEvents.EnableEditMode, (model: string) => {
    ObjectPlacer.enableEditMode(model);

    native.beginTextCommandPrint('STRING');
    native.addTextComponentSubstringPlayerName('~INPUT_ENTER~ Scroll Mouse Wheel [UP/DOWN] to rotate the object.');
    native.endTextCommandPrint(10000, true);
});

AthenaClient.systems.hotkeys.add({
    key: 190, // .
    description: 'Used to pickup placed objects',
    identifier: 'pickup-placed-object',
    keyDown: ObjectPlacer.pickupObject,
});

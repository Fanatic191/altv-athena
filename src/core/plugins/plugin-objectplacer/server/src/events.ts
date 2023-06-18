import * as alt from 'alt-server';
import * as ObjectPlacer from '@AthenaPlugins/plugin-objectplacer/server/src/objectPlacer';

import { Vector3 } from 'alt-server';
import { ObjectPlacerEvents } from '@AthenaPlugins/plugin-objectplacer/shared/objectPlacerEvents';

alt.onClient(ObjectPlacerEvents.ObjectPlaced, (player: alt.Player, model: string, pos: Vector3, rot: Vector3) => {
    console.log(model);
    console.log(JSON.stringify(pos));
    console.log(JSON.stringify(rot));

    ObjectPlacer.addObject(player, model, pos, rot);
});

alt.onClient(
    ObjectPlacerEvents.PickupObject,
    async (player: alt.Player, modelHash: number, pos: Vector3, rot: Vector3) => {
        await ObjectPlacer.pickupObject(player, modelHash, pos, rot);
    },
);

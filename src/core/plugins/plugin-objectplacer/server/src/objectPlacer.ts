import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';

import { Vector3 } from 'alt-server';
import Database from '@stuyk/ezmongodb';
import { objectPlacerConfig } from '@AthenaPlugins/plugin-objectplacer/server/src/defaults/config';
import { IPlacerObject } from '@AthenaPlugins/plugin-objectplacer/server/src/interfaces/iPlacerObject';

let localObjects: IPlacerObject[] = [];

export async function populateObjects() {
    const objects = await Database.fetchAllData<IPlacerObject>(objectPlacerConfig.dbCollection);
    for (const object of objects) {
        Athena.controllers.object.append({
            uid: object._id.toString(),
            model: object.model,
            pos: object.pos,
            rot: object.rot,
            dimension: object.dimension,
            maxDistance: 100,
        });

        localObjects.push(object);
    }
}

export async function addObject(player: alt.Player, model: string, pos: Vector3, rot: Vector3): Promise<void> {
    const playerData = Athena.document.character.get(player);
    const playerObjects = localObjects.filter((object: IPlacerObject) => object.owner === playerData._id.toString());

    if (objectPlacerConfig.playerObjectLimit > 0 && playerObjects.length >= objectPlacerConfig.playerObjectLimit) {
        Athena.player.emit.notification(player, 'Limit reached');
        return;
    }

    const object = await Database.insertData<IPlacerObject>(
        {
            model: model,
            pos: pos,
            rot: rot,
            dimension: player.dimension,
            owner: playerData._id.toString(),
        },
        objectPlacerConfig.dbCollection,
        true,
    );

    Athena.controllers.object.append({
        uid: object._id.toString(),
        model: model,
        pos: pos,
        rot: rot,
        dimension: player.dimension,
    });

    localObjects.push(object);
}

export async function pickupObject(player: alt.Player, modelHash: number, pos: Vector3, rot: Vector3): Promise<void> {
    const playerId = Athena.document.character.getField(player, '_id').toString();
    const object = localObjects.find(
        (object: IPlacerObject) => object.owner === playerId && JSON.stringify(object.pos) === JSON.stringify(pos),
    );

    if (!object || alt.hash(object.model) !== modelHash) {
        alt.logWarning('object not found');
        return;
    }

    if (!(await Database.deleteById(object._id.toString(), objectPlacerConfig.dbCollection))) {
        alt.logWarning('error while deleting from db');
        return;
    }

    localObjects = localObjects.filter((object: IPlacerObject) => JSON.stringify(object.pos) !== JSON.stringify(pos));

    Athena.controllers.object.remove(object._id.toString());

    // TODO: Give Item To User (Follows in a later version)
}

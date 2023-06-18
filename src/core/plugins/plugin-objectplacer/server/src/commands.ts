import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { ObjectPlacerEvents } from '@AthenaPlugins/plugin-objectplacer/shared/objectPlacerEvents';

Athena.systems.messenger.commands.register(
    'objectplacer',
    '/objectplacer - model_name',
    ['admin'],
    (player: alt.Player, model: string) => {
        if (!player || !player.valid) {
            return;
        }
        if (!model) {
            //just for testing
            model = 'apa_mp_h_acc_plant_palm_01';
        }
        alt.emitClient(player, ObjectPlacerEvents.EnableEditMode, model);
    },
);

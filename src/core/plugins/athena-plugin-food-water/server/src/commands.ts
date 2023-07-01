import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { VITAL_NAMES } from '../../shared/enums';
import { VitalsSystem } from './system';
import { NotifyController } from '@AthenaPlugins/fnky-notifications/server';

Athena.systems.messenger.commands.register('setfood', '/setfood [amount]', ['admin'], setFoodCommand);
Athena.systems.messenger.commands.register('setwater', '/setwater [amount]', ['admin'], setWaterCommand);
Athena.systems.messenger.commands.register('setneeds', '/setneeds [amount]', ['admin'], setNeedsCommand);
function setFoodCommand(player: alt.Player, commandValue: string) {
    let value = parseInt(commandValue);

    if (isNaN(value)) {
        // Athena.player.emit.message(player, 'Value must be a number.');
        NotifyController.send(
            player,
            3,
            7,
            'Figyelmeztetés',
            'Az értéknek <b><font color="#3DBA39">számnak</b></font> kell lennie! ',
        );
        NotifyController.clearAll(player); // to clear history or/and notifications on screen
        return;
    }

    value = VitalsSystem.normalizeVital(value);
    VitalsSystem.adjustVital(player, VITAL_NAMES.FOOD, value, true);
}
function setWaterCommand(player: alt.Player, commandValue: string) {
    let value = parseInt(commandValue);

    if (isNaN(value)) {
        // Athena.player.emit.message(player, 'Value must be a number.');
        NotifyController.send(
            player,
            3,
            7,
            'Figyelmeztetés',
            'Az értéknek <b><font color="#3DBA39">számnak</b></font> kell lennie! ',
        );
        NotifyController.clearAll(player); // to clear history or/and notifications on screen
        return;
    }

    value = VitalsSystem.normalizeVital(value);
    VitalsSystem.adjustVital(player, VITAL_NAMES.WATER, value, true);
}
function setNeedsCommand(player: alt.Player, commandValue: string) {
    let value = parseInt(commandValue);

    if (isNaN(value)) {
        // Athena.player.emit.message(player, 'Value must be a number.');
        NotifyController.send(
            player,
            3,
            7,
            'Figyelmeztetés',
            'Az értéknek <b><font color="#3DBA39">számnak</b></font> kell lennie! ',
        );
        NotifyController.clearAll(player); // to clear history or/and notifications on screen
        return;
    }

    value = VitalsSystem.normalizeVital(value);
    VitalsSystem.adjustVital(player, VITAL_NAMES.WATER, value, true);
    VitalsSystem.adjustVital(player, VITAL_NAMES.FOOD, value, true);
}

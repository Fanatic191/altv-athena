import * as alt from 'alt-client';
import * as AthenaClient from '@AthenaClient/api';
import { IWheelOptionExt } from '@AthenaShared/interfaces/wheelMenu';

class internalFunctions {
    static init() {
        AthenaClient.menu.player.addInjection(internalFunctions.addPlayerMenuOptions);
    }

    static addPlayerMenuOptions(targetPlayer: alt.Player, options: Array<IWheelOptionExt>): Array<IWheelOptionExt> {
        if (!alt.Player.local.getSyncedMeta('isCarried') && !alt.Player.local.getSyncedMeta('isCarrying')) {
            alt.logDebug(targetPlayer.id + ' - ' + alt.Player.local.id);
            options.push({
                name: 'Carry',
                color: 'white',
                callback: () => {
                    if (AthenaClient.systems.entitySelector.getSelection().type === 'player') {
                        const targettedPlayer = AthenaClient.systems.entitySelector.getSelection().id;
                        alt.emitServer('carry:player:attach', targetPlayer.id);
                    }
                },
                icon: 'icon-arrow-long-up',
            });
        }
        if (!alt.Player.local.getSyncedMeta('isCarried') && alt.Player.local.getSyncedMeta('isCarrying')) {
            options.push({
                name: 'Drop',
                color: 'white',
                callback: () => {
                    if (AthenaClient.systems.entitySelector.getSelection().type === 'player') {
                        const targettedPlayer = AthenaClient.systems.entitySelector.getSelection().id;
                        alt.emitServer('carry:player:detach', targetPlayer.id);
                    }
                },
                icon: 'icon-arrow-long-down',
            });
        }
        return options;
    }
}

internalFunctions.init();

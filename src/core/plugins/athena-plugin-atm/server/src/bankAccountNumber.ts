import * as alt from 'alt-server';
import * as charRef from '../../../../shared/interfaces/character';
import * as Athena from '@AthenaServer/api';
import { BANK_CONFIG } from './config';

const metaName = 'bankNumber';

// Extends the player interface.
declare module 'alt-server' {
    export interface Character extends Partial<charRef.Character> {
        [metaName]?: null | undefined | number;
    }
}

class InternalFunctions {
    static async handleSelect(player: alt.Player) {
        const data = Athena.document.character.get(player);
        if (typeof data === 'undefined') return;

        if (data.bankNumber !== undefined && data.bankNumber !== null) {
            Athena.player.emit.meta(player, metaName, data[metaName]);
            return;
        }

        // Increase the value outright
        await Athena.systems.global.increase(metaName, 1, BANK_CONFIG.BANK_ACCOUNT_START_NUMBER);
        const bankNumber = await Athena.systems.global.getKey<number>(metaName);
        Athena.document.character.set(player, metaName, bankNumber);
        Athena.player.emit.meta(player, metaName, data[metaName]);
        alt.log(`Created Bank Account # ${data[metaName]} for ${data.name}`);
    }
}

export class BankAccountNumber {
    static init() {
        Athena.player.events.on('selected-character', InternalFunctions.handleSelect);
    }
}

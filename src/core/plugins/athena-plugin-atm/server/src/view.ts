import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';

import atms from '@AthenaShared/information/atms';
import { CurrencyTypes } from '@AthenaShared/enums/currency';
import { LocaleController } from '@AthenaShared/locale/locale';
import { LOCALE_KEYS } from '@AthenaShared/locale/languages/keys';
import { Character } from '@AthenaShared/interfaces/character';
import { ATM_INTERACTIONS } from '../../shared/events';
import Database from '@stuyk/ezmongodb';

const INTERACTION_RANGE = 1.5;
class InternalFunctions {
    /**
     * Determines what function to call based on action passed.
     * @static
     * @param {alt.Player} player
     * @param {string} type
     * @param {(string | number)} amount
     * @param {(null | number)} id
     * @return {*}
     * @memberof InternalFunctions
     */
    static action(player: alt.Player, type: string, amount: string | number, id: null | number) {
        if (isNaN(amount as number)) {
            Athena.player.sync.currencyData(player);
            return;
        }

        amount = parseFloat(amount as string);

        if (!amount || amount <= 0) {
            Athena.player.sync.currencyData(player);
            return;
        }

        if (!ActionHandlers[type]) {
            Athena.player.sync.currencyData(player);
            return;
        }

        const result = ActionHandlers[type](player, amount, id);
        Athena.player.sync.currencyData(player);

        if (!result) {
            Athena.player.emit.soundFrontend(player, 'Hack_Failed', 'DLC_HEIST_BIOLAB_PREP_HACKING_SOUNDS');
        } else {
            Athena.player.emit.soundFrontend(player, 'Hack_Success', 'DLC_HEIST_BIOLAB_PREP_HACKING_SOUNDS');
        }
    }

    /**
     * Deposit money into the players bank account from their cash.
     * @static
     * @param {alt.Player} player
     * @param {number} amount
     * @return {*}  {boolean}
     * @memberof InternalFunctions
     */
    static deposit(player: alt.Player, amount: number): boolean {
        const data = Athena.document.character.get(player);
        if (typeof data === 'undefined') return false;

        if (data.cash < amount) {
            return false;
        }

        if (!Athena.player.currency.sub(player, CurrencyTypes.CASH, amount)) {
            return false;
        }

        if (!Athena.player.currency.add(player, CurrencyTypes.BANK, amount)) {
            return false;
        }

        return true;
    }

    /**
     * Withdraws bank balance to cash balance.
     * @static
     * @param {alt.Player} player
     * @param {number} amount
     * @return {*}  {boolean}
     * @memberof InternalFunctions
     */
    static withdraw(player: alt.Player, amount: number): boolean {
        const data = Athena.document.character.get(player);
        if (typeof data === 'undefined') return false;

        if (data.bank < amount) {
            return false;
        }

        if (!Athena.player.currency.sub(player, CurrencyTypes.BANK, amount)) {
            return false;
        }

        if (!Athena.player.currency.add(player, CurrencyTypes.CASH, amount)) {
            return false;
        }

        return true;
    }

    /**
     * Transfer bank from self to target player id.
     * @static
     * @param {alt.Player} player
     * @param {number} amount
     * @param {(string | number)} id
     * @return {*}  {boolean}
     * @memberof InternalFunctions
     */
    static async transfer(player: alt.Player, amount: number, bankNumber: string | number): Promise<boolean> {
        const data = Athena.document.character.get(player);
        if (typeof data === 'undefined') return false;

        if (typeof bankNumber === 'string') {
            bankNumber = parseInt(bankNumber);
        }

        // Check they are not transferring to self.
        if (data.bankNumber === bankNumber) {
            return false;
        }

        const onlinePlayer = [...alt.Player.all].find(
            (x) =>
                Athena.document.character.get(x).bankNumber &&
                Athena.document.character.get(x).bankNumber === bankNumber,
        );

        if (amount > data.bank) {
            return false;
        }

        if (onlinePlayer) {
            // Update by Online Player Route
            if (!Athena.player.currency.sub(player, CurrencyTypes.BANK, amount)) {
                return false;
            }

            if (!Athena.player.currency.add(onlinePlayer, CurrencyTypes.BANK, amount)) {
                return false;
            }

            const msg = LocaleController.get(LOCALE_KEYS.PLAYER_RECEIVED_BLANK, `$${amount}`, data.name);
            Athena.player.emit.message(onlinePlayer, msg);
        } else {
            // Update by Document Route
            const document = await Database.fetchData<Character>(
                'bankNumber',
                bankNumber,
                Athena.database.collections.Characters,
            );
            if (!document) {
                return false;
            }

            if (!Athena.player.currency.sub(player, CurrencyTypes.BANK, amount)) {
                return false;
            }

            document.bank += amount;
            await Database.updatePartialData(
                document._id.toString(),
                { bank: document.bank },
                Athena.database.collections.Characters,
            );
        }

        return true;
    }

    /**
     * Transfer cash from self to target player id.
     * @static
     * @param {alt.Player} player
     * @param {number} amount
     * @param {(string | number)} id
     * @return {*}  {boolean}
     * @memberof InternalFunctions
     */
    static transferCash(player: alt.Player, amount: number, id: string | number): boolean {
        const data = Athena.document.character.get(player);
        if (typeof data === 'undefined') return false;

        const target: alt.Player = [...alt.Player.all].find((x) => `${x.id}` === `${id}`);
        if (!target) {
            return false;
        }

        if (target.id === player.id) {
            return false;
        }

        if (amount > data.cash) {
            return false;
        }

        if (!Athena.player.currency.sub(player, CurrencyTypes.CASH, amount)) {
            return false;
        }

        if (!Athena.player.currency.add(target, CurrencyTypes.CASH, amount)) {
            return false;
        }

        const msg = LocaleController.get(LOCALE_KEYS.PLAYER_RECEIVED_BLANK, `$${amount}`, data.name);
        Athena.player.emit.message(target, msg);
        return true;
    }
}

export class AtmFunctions {
    /**
     * Create blips for all ATMs and add an interaction to them.
     */
    static init() {
        for (let i = 0; i < atms.length; i++) {
            const position = atms[i];

            Athena.controllers.blip.append({
                text: 'ATM',
                color: 11,
                sprite: 207,
                scale: 1,
                shortRange: true,
                pos: position,
                uid: `atm-${i}`,
            });

            Athena.controllers.interaction.append({
                position,
                description: 'Access ATM',
                range: INTERACTION_RANGE,
                callback: (player: alt.Player) => {
                    alt.emitClient(player, ATM_INTERACTIONS.OPEN);
                },
                isPlayerOnly: true,
                debug: false,
            });
        }
    }
}

const ActionHandlers = {
    deposit: InternalFunctions.deposit,
    withdraw: InternalFunctions.withdraw,
    transfer: InternalFunctions.transfer,
    transferCash: InternalFunctions.transferCash,
};

alt.onClient(ATM_INTERACTIONS.ACTION, InternalFunctions.action);

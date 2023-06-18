import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';

import EFFECT from '@AthenaShared/enums/effects';
import IAttachable from '@AthenaShared/interfaces/iAttachable';
import { ANIMATION_FLAGS } from '@AthenaShared/flags/animationFlags';
import { VITAL_NAMES } from '../../shared/enums';
import { VitalsSystem } from './system';

export class InternalFunctions {
    /**
     * When the player eats or drinks, the player's vital is adjusted by the amount of the item.
     * An animation or a sound is also played dependent on the data passed inside of the item itself.
     *
     * @param player - alt.Player - The player who is receiving the item.
     * @param {VITAL_NAMES} vitalsName - The name of the vital that was changed.
     */
    static async handleVitalsChange(
        player: alt.Player,
        slot: number,
        type: 'inventory' | 'toolbar',
        vitalsName: VITAL_NAMES,
    ) {
        const data = Athena.document.character.get(player);
        if (typeof data === 'undefined') return;

        let item = null;
        item =
            type === 'toolbar'
                ? Athena.player.toolbar.getAt(player, slot)
                : Athena.player.inventory.getAt(player, slot);
        VitalsSystem.adjustVital(player, vitalsName, item.data.amount);

        if (item.data.sound) {
            Athena.player.emit.sound3D(player, item.data.sound, player);
        }

        if (vitalsName === VITAL_NAMES.FOOD) {
            const attachedObject: IAttachable = {
                model: 'prop_cs_burger_01',
                bone: 71,
                pos: { x: 0.15, y: -0.02, z: -0.05 },
                rot: { x: -180, y: -150, z: -95 },
            };

            Athena.player.emit.objectAttach(player, attachedObject, 6000);
            Athena.player.emit.animation(
                player,
                'amb@code_human_wander_eating_donut@male@idle_a',
                'idle_c',
                ANIMATION_FLAGS.UPPERBODY_ONLY | ANIMATION_FLAGS.ENABLE_PLAYER_CONTROL,
                6000,
            );

            VitalsSystem.adjustVital(player, VITAL_NAMES.FOOD, item.data.amount);
        }

        if (vitalsName === VITAL_NAMES.WATER) {
            const attachedObject: IAttachable = {
                model: 'prop_beer_bottle',
                bone: 71,
                pos: { x: 0.13, y: -0.12, z: -0.05 },
                rot: { x: 100, y: -220, z: 180 },
            };

            Athena.player.emit.objectAttach(player, attachedObject, 5000);
            Athena.player.emit.animation(
                player,
                'amb@world_human_drinking@beer@male@idle_a',
                'idle_c',
                ANIMATION_FLAGS.UPPERBODY_ONLY | ANIMATION_FLAGS.ENABLE_PLAYER_CONTROL,
                5000,
            );

            VitalsSystem.adjustVital(player, VITAL_NAMES.WATER, item.data.amount);
        }
        type === 'toolbar'
            ? await Athena.player.toolbar.sub(player, { dbName: item.dbName, quantity: 1, data: item.data })
            : await Athena.player.inventory.sub(player, { dbName: item.dbName, quantity: 1 });
    }
}

export class VitalsEffects {
    /**
     * It adds an effect to the item that will change the player's vitals when the item is consumed.
     */
    static init() {
        Athena.systems.inventory.effects.add(
            EFFECT.EFFECT_FOOD,
            (player: alt.Player, slot: number, type: 'inventory' | 'toolbar') => {
                InternalFunctions.handleVitalsChange(player, slot, type, VITAL_NAMES.FOOD);
            },
        );

        Athena.systems.inventory.effects.add(
            EFFECT.EFFECT_WATER,
            (player: alt.Player, slot: number, type: 'inventory' | 'toolbar') => {
                InternalFunctions.handleVitalsChange(player, slot, type, VITAL_NAMES.WATER);
            },
        );
    }
}

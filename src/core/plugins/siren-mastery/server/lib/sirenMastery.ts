import * as alt from 'alt-server';
import { Config } from '../data/config/config';

class SirenMastery {
    constructor() {
        alt.on('sirenMastery:setSirens', this.onSetSirenMastery.bind(this));
        alt.on('sirenMastery:setSirensManually', this.onSetSirensManually.bind(this));
        alt.onClient('sirenMastery:toggleSiren', this.onToggleSiren.bind(this));
        alt.onClient('sirenMastery:toggleLights', this.onToggleLights.bind(this));
        alt.onClient('sirenMastery:pressHorn', this.onToggleHorn.bind(this));
    }

    onSetSirenMastery(vehicle: alt.Vehicle) {
        let vehConfig = Config.vehicles.find((v) => alt.hash(v.model) == vehicle.model);

        if (vehConfig) {
            vehicle.setStreamSyncedMeta('hasSirenMastery', vehConfig.sirens);
            vehicle.setStreamSyncedMeta('sirenMastery', []);

            if (vehConfig.lights) vehicle.setStreamSyncedMeta('sirenMasteryLights', false);

            if (vehConfig.horn) vehicle.setStreamSyncedMeta('sirenMasteryHorn', null);
        }
    }

    onToggleSiren(player: alt.Player, sirenId: number) {
        if (!player || !player.valid || !player.vehicle || !Config.seats.includes(player.seat)) return;

        let vehicle = player.vehicle;

        let vehConfig: any = vehicle.getStreamSyncedMeta('hasSirenMastery');
        let activeSirens: any = vehicle.getStreamSyncedMeta('sirenMastery');

        if (vehConfig && activeSirens) {
            if (vehConfig.includes(sirenId)) {
                let i = activeSirens.indexOf(sirenId);

                if (i > -1) {
                    activeSirens.splice(i, 1);
                } else activeSirens.push(sirenId);

                vehicle.setStreamSyncedMeta('sirenMastery', activeSirens);
            }
        }
    }

    onToggleHorn(player: alt.Player, sirenId: number, toggle: boolean) {
        if (!player || !player.valid || !player.vehicle || !Config.seats.includes(player.seat)) return;

        player.vehicle.setStreamSyncedMeta('sirenMasteryHorn', toggle ? sirenId : null);
    }

    onToggleLights(player: alt.Player) {
        if (!player || !player.valid || !player.vehicle || !Config.seats.includes(player.seat)) return;

        let currentLights = player.vehicle.getStreamSyncedMeta('sirenMasteryLights');

        player.vehicle.setStreamSyncedMeta('sirenMasteryLights', !currentLights);
    }

    onSetSirensManually(
        vehicle: alt.Vehicle,
        sirens: Array<number>,
        hasLights: boolean = true,
        hasHorn: boolean = true,
    ) {
        vehicle.setStreamSyncedMeta('hasSirenMastery', sirens);
        vehicle.setStreamSyncedMeta('sirenMastery', []);

        if (hasLights) vehicle.setStreamSyncedMeta('sirenMasteryLights', false);

        if (hasHorn) vehicle.setStreamSyncedMeta('sirenMasteryHorn', null);
    }
}

export default new SirenMastery();

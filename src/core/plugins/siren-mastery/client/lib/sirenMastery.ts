import * as alt from 'alt-client';
import * as natives from 'natives';
import { Config } from '../data/config/config';
import { ISiren } from '../data/interfaces/siren';

class SirenMastery {
    private tick: number;
    private interval: number;
    private floodTimer: number;
    private hornSelected: number = 0;
    private floodCount: number = 0;
    private backlightOn: boolean = false;

    constructor() {
        alt.on('streamSyncedMetaChange', this.onStreamSyncedMetaChange.bind(this));
        alt.on('gameEntityDestroy', this.onGameEntityDestroy.bind(this));
        alt.on('gameEntityCreate', this.onGameEntityCreate.bind(this));
        alt.on('enteredVehicle', this.onEnteredVehicle.bind(this));
        alt.on('leftVehicle', this.onLeftVehicle.bind(this));
        alt.on('keydown', this.onKeyDown.bind(this));
        alt.on('keyup', this.onKeyUp.bind(this));
    }

    onGameEntityCreate(entity: alt.Entity) {
        if (!(entity instanceof alt.Vehicle)) return;

        if (entity.hasStreamSyncedMeta('sirenMasteryLights')) natives.setVehicleHasMutedSirens(entity, true);
    }

    onGameEntityDestroy(entity: alt.Entity) {
        if (!(entity instanceof alt.Vehicle)) return;

        if (entity.hasStreamSyncedMeta('sirenMastery')) this.remove(entity);
    }

    onStreamSyncedMetaChange(entity: alt.Entity, key: string, value: any) {
        if (!(entity instanceof alt.Vehicle)) return;

        if (entity.hasStreamSyncedMeta('hasSirenMastery') && !Object.hasOwn(entity, 'sirens')) entity.sirens = [];

        if (entity.hasStreamSyncedMeta('sirenMasteryHorn') && !Object.hasOwn(entity, 'sirenHorn'))
            entity.sirenHorn = null;

        if (entity.hasStreamSyncedMeta('sirenMasteryLights') && !Object.hasOwn(entity, 'sirenLights'))
            entity.sirenLights = false;

        switch (key) {
            case 'sirenMastery':
                const timer = alt.setInterval(() => {
                    if (entity.isSpawned) {
                        this.onToggleSirens(entity, value);

                        alt.clearInterval(timer);
                    }
                }, 10);
                break;
            case 'sirenMasteryHorn':
                this.onToggleHorn(entity, value);
                break;
            case 'sirenMasteryLights':
                this.onToggleLights(entity, value);
                break;
        }
    }

    onEnteredVehicle(vehicle: alt.Vehicle, seat: number) {
        if (vehicle.hasStreamSyncedMeta('hasSirenMastery') && Config.seats.includes(seat)) {
            this.onInterval();
            this.onTick();
        }
    }

    onLeftVehicle() {
        this.destroy();
    }

    onKeyDown(keyCode: number) {
        if (
            alt.Player.local &&
            alt.Player.local.vehicle &&
            alt.Player.local.vehicle.hasStreamSyncedMeta('hasSirenMastery') &&
            Config.seats.includes(alt.Player.local.seat)
        ) {
            let controlConfig = Config.controls.find((c) => c.key == keyCode);

            if (controlConfig) {
                switch (controlConfig.action) {
                    case 'toggleHorn':
                        if (this.floodCount < Config.maxFloodCount) {
                            this.toggleHorn(this.hornSelected, true);

                            this.floodCount++;
                        }
                        break;
                    case 'toggleSiren':
                        if (this.floodTimer) return;

                        let vehicleSirens = alt.Player.local.vehicle.getStreamSyncedMeta('hasSirenMastery');

                        this.toggleSiren(vehicleSirens[controlConfig.index]);

                        this.floodTimer = alt.setTimeout(() => {
                            alt.clearTimeout(this.floodTimer);
                            this.floodTimer = null;
                        }, Config.floodTimeout);
                        break;
                    case 'toggleLights':
                        if (this.floodTimer) return;

                        this.toggleLights();

                        this.floodTimer = alt.setTimeout(() => {
                            alt.clearTimeout(this.floodTimer);
                            this.floodTimer = null;
                        }, Config.floodTimeout);
                        break;
                }
            }

            if (keyCode == 9 || keyCode == 18) {
                if (alt.Player.local.vehicle.sirenHorn) this.toggleHorn(alt.Player.local.vehicle.sirenHorn.id, false);
            }
        }
    }

    onKeyUp(keyCode: number) {
        let controlConfig = Config.controls.find((c) => c.key == keyCode);

        if (controlConfig) {
            switch (controlConfig.action) {
                case 'toggleHorn':
                    this.toggleHorn(this.hornSelected, false);
                    break;
            }
        }
    }

    async onToggleSirens(vehicle: alt.Vehicle, sirensOn: Array<number>) {
        if (!vehicle || !vehicle.valid) return;

        let disable = vehicle.sirens.filter((s) => sirensOn.indexOf(s.id) < 0);
        let enable = sirensOn.filter((s) => vehicle.sirens.find((vs) => vs.id == s) == null);

        if (disable.length) await this.removeSirens(vehicle, disable);

        for (let d of enable) this.addSiren(vehicle, d);
    }

    onToggleHorn(vehicle: alt.Vehicle, sirenId: number) {
        if (!vehicle || !vehicle.valid) return;

        if (sirenId != null) {
            let soundId = this.addSiren(vehicle, sirenId, true);

            if (soundId != null) vehicle.sirenHorn = { id: sirenId, soundId: soundId };
        } else if (vehicle.sirenHorn) {
            natives.stopSound(vehicle.sirenHorn.soundId);
            natives.releaseSoundId(vehicle.sirenHorn.soundId);

            vehicle.sirenHorn = null;
        }
    }

    onToggleLights(vehicle: alt.Vehicle, toggle: boolean) {
        if (!vehicle || !vehicle.valid) return;

        natives.setVehicleHasMutedSirens(vehicle, true);
        natives.setVehicleSiren(vehicle, toggle);

        vehicle.sirenLights = toggle;
    }

    addSiren(vehicle: alt.Vehicle, sirenId: number, isHorn: boolean = false) {
        if (!vehicle || !vehicle.valid) return;

        let siren = this.getSirenById(sirenId);
        let soundId;

        if (siren) {
            soundId = natives.getSoundId();

            natives.playSoundFromEntity(soundId, siren.name, vehicle, '', false, 0);

            if (!isHorn) {
                vehicle.sirens.push({ id: sirenId, soundId: soundId });
            }
        }

        return soundId;
    }

    removeSirens(vehicle: alt.Vehicle, sirens: Array<ISiren>, all: boolean = false) {
        return new Promise((resolve) => {
            if (!vehicle || !vehicle.valid) return resolve(false);

            let i = 0;

            for (let siren of sirens) {
                let index = vehicle.sirens.indexOf(siren);

                if (index > -1) {
                    let disableSiren = vehicle.sirens[index];

                    if (disableSiren) {
                        natives.stopSound(disableSiren.soundId);

                        natives.releaseSoundId(disableSiren.soundId);
                    }

                    if (!all) vehicle.sirens.splice(index, 1);
                }

                if (i == sirens.length - 1) {
                    if (all) vehicle.sirens = [];

                    resolve(true);
                }

                i++;
            }
        });
    }

    toggleHorn(sirenId: number, toggle: boolean) {
        alt.emitServer('sirenMastery:pressHorn', sirenId, toggle);
    }

    toggleSiren(sirenId: number) {
        alt.emitServer('sirenMastery:toggleSiren', sirenId);
    }

    toggleLights() {
        alt.emitServer('sirenMastery:toggleLights');
    }

    getSirenById(sirenId: number) {
        return Config.sirens.find((s) => s.id == sirenId);
    }

    remove(vehicle: alt.Vehicle) {
        this.removeSirens(vehicle, vehicle.sirens, true);
        this.onToggleHorn(vehicle, null);
    }

    destroy() {
        if (this.interval) {
            alt.clearInterval(this.interval);
            this.interval = null;
        }

        if (this.tick) {
            alt.clearEveryTick(this.tick);
            this.tick = null;
        }

        if (this.backlightOn) this.backlightOn = false;
    }

    onTick() {
        if (this.tick) return;

        this.tick = alt.everyTick(() => {
            if (!alt.Player.local.vehicle) return;

            let veh = alt.Player.local.vehicle;

            natives.disableControlAction(1, 86, true);

            if (Config.disableRadioSelect) {
                natives.disableControlAction(1, 81, true);
                natives.disableControlAction(1, 82, true);
                natives.disableControlAction(1, 83, true);
                natives.disableControlAction(1, 84, true);
                natives.disableControlAction(1, 85, true);
            }
        });
    }

    onInterval() {
        if (this.interval) return;

        this.interval = alt.setInterval(() => {
            if (this.floodCount > 0) this.floodCount--;
        }, 1000);
    }
}

export default new SirenMastery();

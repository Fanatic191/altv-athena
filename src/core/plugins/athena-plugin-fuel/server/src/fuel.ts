import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { VEHICLE_CLASS } from '@AthenaShared/enums/vehicleTypeFlags';
import { VehicleData } from '@AthenaShared/information/vehicles';
import { isFlagEnabled } from '@AthenaShared/utility/flags';
import { VEHICLE_STATE } from '../../shared/vehicle';
import { distance2d } from '@AthenaShared/utility/vector';
import { LOCALE_FUEL } from '../../shared/locales';
import { FuelCommands } from './commands';
import { FUEL_CONFIG } from './config';
import { ATHENA_EVENTS_VEHICLE } from '../../shared/events';

export class FuelSystem {
    /**
     * This function is used to create an interval for the fuel system
     */
    static init() {
        alt.setInterval(FuelSystem.updateDrivingPlayers, FUEL_CONFIG.TIME_BETWEEN_UPDATES);

        Athena.vehicle.events.on('engine-started', (vehicle: alt.Vehicle) => {
            //TOODO
            /*if (!vehicle.driver || vehicle.driver.id !== player.id) {
                Athena.player.emit.notification(player, LOCALE_FUEL.VEHICLE_IS_NOT_DRIVER);
                return { status: false, response: LOCALE_FUEL.VEHICLE_IS_NOT_DRIVER };
            }*/

            if (!vehicle.engineOn && !FuelSystem.hasFuel(vehicle)) {
                //Athena.player.emit.notification(player, LOCALE_FUEL.VEHICLE_NO_FUEL);
                return { status: false, response: LOCALE_FUEL.VEHICLE_NO_FUEL };
            }

            if (vehicle['isRefueling']) {
                //Athena.player.emit.notification(player, LOCALE_FUEL.VEHICLE_IS_BEING_REFUELED);
                return { status: false, response: LOCALE_FUEL.VEHICLE_IS_BEING_REFUELED };
            }

            return { status: true, response: '' };
        });
        /*Athena.injections.vehicle.add('vehicle-add-start', (document: IVehicle) => {
            const vehicleInfo = VehicleData.find((x) => x.name === document.model);

            document.fuel = FUEL_CONFIG.FUEL_ON_NEW_VEHICLE_CREATE;

            if (vehicleInfo && vehicleInfo.class === VEHICLE_CLASS.CYCLE) {
                document.fuel = FUEL_CONFIG.MAXIMUM_FUEL;
                document.behavior = Vehicle_Behavior.UNLIMITED_FUEL | Vehicle_Behavior.NEED_KEY_TO_START;
            }

            return document;
        });*/

        FuelCommands.init();
    }

    /**
     * For each vehicle in the game, check if it has a driver and if so, tick the fuel system
     */
    static updateDrivingPlayers() {
        const vehicles = [...alt.Vehicle.all];
        for (let i = 0; i < vehicles.length; i++) {
            const vehicle = vehicles[i];
            if (!vehicle || !vehicle.valid || !vehicle.engineOn) {
                continue;
            }

            FuelSystem.tick(vehicle);
        }
    }

    /**
     * If the vehicle has unlimited fuel, return true. If the vehicle has no fuel data, return true. If
     * the vehicle has no fuel, return false. Otherwise, return true
     * @param vehicle - The vehicle that is being checked.
     * @returns {boolean}
     */
    static hasFuel(vehicle: alt.Vehicle) {
        /*if (isFlagEnabled(vehicle.behavior, Vehicle_Behavior.UNLIMITED_FUEL)) {
            return true;
        }*/
        const vehicleData = Athena.document.vehicle.get(vehicle);

        if (!vehicleData) {
            return true;
        }

        if (vehicleData.fuel === undefined || vehicleData.fuel === null) {
            vehicleData.fuel = FUEL_CONFIG.MAXIMUM_FUEL;
            return true;
        }

        if (vehicleData.fuel <= 0) {
            return false;
        }

        return true;
    }

    /**
     * The tick function is called every time the vehicle is updated
     * @param vehicle - alt.Vehicle
     * @returns Nothing.
     */
    static tick(vehicle: alt.Vehicle) {
        if (!vehicle || !vehicle.valid) {
            return;
        }
        const vehicleData = Athena.document.vehicle.get(vehicle);
        if (!vehicleData) {
            //vehicle.setSyncedMeta(VEHICLE_STATE.FUEL, FUEL_CONFIG.MAXIMUM_FUEL);
            Athena.document.vehicle.set(vehicle, 'fuel', FUEL_CONFIG.MAXIMUM_FUEL);
            return;
        }

        /*if (!vehicleData.behavior) {
            vehicle.setSyncedMeta(VEHICLE_STATE.FUEL, FUEL_CONFIG.MAXIMUM_FUEL);
            return;
        }*/

        // Has unlimited fuel. Always set to 100.
        /*if (isFlagEnabled(vehicle.behavior, Vehicle_Behavior.UNLIMITED_FUEL)) {
            vehicle.setSyncedMeta(VEHICLE_STATE.FUEL, FUEL_CONFIG.MAXIMUM_FUEL);
            return;
        }*/

        if (vehicleData.fuel === undefined || vehicleData.fuel === null) {
            vehicleData.fuel = 100;
        }

        // Emits the distance travelled from one point to another.
        // Does not emit if distance is less than 5
        if (!vehicle.lastPosition) {
            vehicle.lastPosition = vehicle.pos;
        }

        const dist = distance2d(vehicle.pos, vehicle.lastPosition);
        if (dist >= 5) {
            // const potentialSpeed = (dist / timeBetweenUpdates) * 1000;
            // const feetPerSecond = potentialSpeed * 1.4666666667;
            // const distanceTraveled = (potentialSpeed / 3600) * timeBetweenUpdates;

            Athena.events.vehicle.trigger(ATHENA_EVENTS_VEHICLE.DISTANCE_TRAVELED, vehicle, dist);
            vehicle.lastPosition = vehicle.pos;
        }

        // Do nothing with the fuel if the engine is off.
        if (!vehicle.engineOn) {
            vehicle.setSyncedMeta(VEHICLE_STATE.FUEL, vehicleData.fuel);
            //Athena.document.vehicle.set(vehicle, 'fuel', vehicleData.fuel);
            return;
        }

        vehicleData.fuel = vehicleData.fuel - FUEL_CONFIG.FUEL_LOSS_PER_TICK;

        if (vehicleData.fuel < 0) {
            vehicleData.fuel = 0;

            if (vehicle.engineOn) {
                vehicle.engineOn = false;
            }
        }

        vehicle.setSyncedMeta(VEHICLE_STATE.FUEL, vehicleData.fuel);
        vehicle.setSyncedMeta(VEHICLE_STATE.POSITION, vehicle.pos);

        if (!vehicle.nextSave || Date.now() > vehicle.nextSave) {
            //Athena.vehicle.funcs.save(vehicle, { fuel: vehicleData.fuel });
            Athena.document.vehicle.set(vehicle, 'fuel', vehicleData.fuel);
            vehicle.nextSave = Date.now() + 15000;
        }
    }

    static enterVehicle(player: alt.Player, vehicle: alt.Vehicle) {
        const vehicleData = Athena.document.vehicle.get(vehicle);
        if (!vehicleData) {
            vehicle.setSyncedMeta(VEHICLE_STATE.FUEL, FUEL_CONFIG.MAXIMUM_FUEL);
            //Athena.document.vehicle.set(vehicle, 'fuel', FUEL_CONFIG.MAXIMUM_FUEL);
            return;
        }

        if (vehicleData.fuel === undefined || vehicleData.fuel === null) {
            vehicleData.fuel = 100;
        }

        vehicle.setSyncedMeta(VEHICLE_STATE.FUEL, vehicleData.fuel);
        //Athena.document.vehicle.set(vehicle, 'fuel', vehicleData.fuel);
    }
}

alt.on('playerEnteredVehicle', FuelSystem.enterVehicle);

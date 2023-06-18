import * as alt from 'alt-shared';
import { Vehicle_Behavior } from '../vehicle';

export default interface IVehicle {
    /**
     * Behavior of this vehicle.
     * Determines what players can do with this vehicle.
     * @type {Vehicle_Behavior}
     * @memberof IVehicle
     */
    behavior?: Vehicle_Behavior;

    /**
     * The amount of fuel left in this vehicle.
     * @type {number}
     * @memberof IVehicle
     */
    fuel?: number;

    /**
     * The model of this vehicle.
     * @type {string}
     * @memberof IVehicle
     */
    model: string;
}

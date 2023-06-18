import * as alt from 'alt-server';
import { Vehicle_Behavior } from '@AthenaPlugins/athena-plugin-fuel-stations/shared/vehicle';

// Extends the player interface.
declare module 'alt-server' {
    export interface Vehicle {
        /**
         * The last position of the vehicle.
         * This is only defined for vehicles that use fuel.
         * As well as vehicles that can be saved.
         * @type {alt.IVector3}
         * @memberof Vehicle
         */
        lastPosition?: alt.IVector3;

        /**
         * The next time this vehicle will be saved in the database.
         * @type {number}
         * @memberof Vehicle
         */
        nextSave?: number;
    }
}

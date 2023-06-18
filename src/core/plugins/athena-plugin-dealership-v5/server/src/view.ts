import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { VehicleInfo } from '@AthenaShared/interfaces/vehicleInfo';
import { DEALERSHIP_EVENTS } from '../../shared/events';
import { IDealership } from '../../shared/interfaces';
import { DEALERSHIP_LOCALE } from '../../shared/locale';
import Parkingspot from './spot';

const dealerships: Array<IDealership> = [];
let inDealership: { [key: string]: string } = {};

class InternalFunctions {
    /**
     * It creates a blip, marker, and interaction for a dealership
     * @param {IDealership} dealership - IDealership - This is the dealership object that is being
     * passed to the function.
     */
    static propogate(dealership: IDealership) {
        Athena.controllers.interaction.append({
            uid: dealership.uid,
            description: dealership.name,
            isPlayerOnly: true,
            position: dealership.pos,
            range: 3,
            callback: (player: alt.Player) => {
                DealershipView.load(player, dealership);
            },
        });

        Athena.controllers.blip.append({
            uid: dealership.uid,
            color: 43, // Light Green
            text: dealership.name,
            pos: dealership.pos,
            shortRange: true,
            scale: 1,
            sprite: 669,
        });

        Athena.controllers.marker.append({
            uid: dealership.uid,
            type: 36,
            color: new alt.RGBA(0, 255, 0, 100),
            pos: new alt.Vector3(dealership.pos.x, dealership.pos.y, dealership.pos.z + 0.5),
            maxDistance: 25,
            scale: new alt.Vector3(1, 1, 1),
        });

        Athena.controllers.textLabel.append({
            text: dealership.name,
            pos: dealership.pos,
            uid: dealership.uid,
            maxDistance: 10,
        });
    }
}

let isInitialized = false;

export class DealershipView {
    static init() {
        if (isInitialized) {
            return;
        }

        isInitialized = true;
        alt.onClient(DEALERSHIP_EVENTS.PURCHASE, DealershipView.purchase);
    }

    /**
     * Add a dealership to the dealerships array and then propogate the dealership to the other
     * functions.
     * @param {IDealership} dealership - IDealership - This is the dealership that is being added to
     * the list.
     */
    static add(dealership: IDealership) {
        dealerships.push(dealership);
        InternalFunctions.propogate(dealership);
    }

    /**
     * If the dealership exists, remove it from the array and return true, otherwise return false.
     * @param {string} uid - string - The unique identifier of the dealership to remove.
     * @returns The return value is a boolean.
     */
    static remove(uid: string): boolean {
        const index = dealerships.findIndex((dealership) => dealership.uid === uid);
        if (index <= -1) {
            return false;
        }

        dealerships.splice(index, 1);
        return true;
    }

    /**
     * It takes a dealership object and loads it into the player's client.
     * @param player - The player who is interacting with the dealership.
     * @param {IDealership} dealership - IDealership
     */
    static load(player: alt.Player, dealership: IDealership) {
        alt.emitClient(player, DEALERSHIP_EVENTS.LOAD, dealership);
        inDealership[player.id] = dealership.uid;
    }

    static async purchase(player: alt.Player, vehicle: VehicleInfo, color: number) {
        const playerData = Athena.document.character.get(player);
        if (!inDealership[player.id]) {
            Athena.player.emit.soundFrontend(player, 'Hack_Failed', 'DLC_HEIST_BIOLAB_PREP_HACKING_SOUNDS');
            return;
        }

        const dealership = dealerships.find((x) => x.uid === inDealership[player.id]);
        delete inDealership[player.id];

        if (!dealership) {
            Athena.player.emit.soundFrontend(player, 'Hack_Failed', 'DLC_HEIST_BIOLAB_PREP_HACKING_SOUNDS');
            return;
        }

        const vehicleInfo = dealership.vehicles.find((x) => x.name === vehicle.name);
        if (!vehicleInfo || !vehicleInfo.sell) {
            Athena.player.emit.message(player, DEALERSHIP_LOCALE.INVALID_MODEL);
            Athena.player.emit.soundFrontend(player, 'Hack_Failed', 'DLC_HEIST_BIOLAB_PREP_HACKING_SOUNDS');
            return;
        }

        if (playerData.bank + playerData.cash < vehicleInfo.price) {
            Athena.player.emit.message(player, DEALERSHIP_LOCALE.NOT_ENOUGH_MONEY);
            Athena.player.emit.soundFrontend(player, 'Hack_Failed', 'DLC_HEIST_BIOLAB_PREP_HACKING_SOUNDS');
            return;
        }

        if (!Athena.player.currency.subAllCurrencies(player, vehicleInfo.price)) {
            Athena.player.emit.message(player, DEALERSHIP_LOCALE.NOT_ENOUGH_MONEY);
            Athena.player.emit.soundFrontend(player, 'Hack_Failed', 'DLC_HEIST_BIOLAB_PREP_HACKING_SOUNDS');
            return;
        }

        const openSpot = await DealershipView.getVehicleSpawnPoint();
        if (!openSpot) {
            Athena.player.emit.soundFrontend(player, 'Hack_Failed', 'DLC_HEIST_BIOLAB_PREP_HACKING_SOUNDS');
            Athena.player.emit.notification(player, `~r~Nincs szabad kiálló, kérlek várj...`);
            return;
        }

        Athena.vehicle.add.toDatabase(playerData._id.toString(), vehicleInfo.name, { x: 0, y: 0, z: 0 });

        Athena.player.emit.notification(player, DEALERSHIP_LOCALE.VEHICLE_MOVED_TO_NEAREST_GARAGE);
        const name = vehicleInfo.name;
        Athena.player.events.trigger<'PURCHASED_VEHICLE'>('PURCHASED_VEHICLE', player, name);

        Athena.player.emit.sound2D(player, 'item_purchase');
    }
    /**
     * Creates and checks if a vehicle is in a spot and returns a spot if it is open.
     * @static
     * @return {({ pos: Vector3; rot: Vector3 } | null)}
     * @memberof Dealership
     */
    static async getVehicleSpawnPoint(): Promise<{ pos: alt.Vector3; rot: alt.Vector3 } | null> {
        for (let i = 0; i < Parkingspot.PARKING_POINTS.length; i++) {
            const point = Parkingspot.PARKING_POINTS[i];
            const pointTest = new alt.ColshapeSphere(point.pos.x, point.pos.y, point.pos.z - 1, 2);

            // Have to do a small sleep to the ColShape propogates entities inside of it.
            await new Promise((resolve: Function) => {
                alt.setTimeout(() => {
                    resolve();
                }, 250);
            });

            const spaceOccupied = alt.Vehicle.all.find((veh) => veh && veh.valid && pointTest.isEntityIn(veh));

            try {
                pointTest.destroy();
            } catch (err) {}

            if (spaceOccupied) {
                continue;
            }

            return point;
        }

        return null;
    }
}

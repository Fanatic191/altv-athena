import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { RENTAL_SHOPS } from './rentalspots';
import { RentalInterface } from '@AthenaPlugins/vehicle-rental/shared/interfaces';
import { RENTAL_LOCALES } from '@AthenaPlugins/vehicle-rental/shared/locales';
import { RENTAL_EVENTS } from '@AthenaPlugins/vehicle-rental/shared/events';
import Database from '@stuyk/ezmongodb';
import { OwnedVehicle } from '@AthenaShared/interfaces/vehicleOwned';
import { CurrencyTypes } from '@AthenaShared/enums/currency';
import { Collections } from '@AthenaServer/database/collections';

const currentDate = new Date();
export interface VehicleTimePatrol extends OwnedVehicle {
    rentedStartTime: Date;
}

class InternalFunctions {
    static async updateTime() {
        let player: alt.Player;
        if(!player) return;
        const currentDate = new Date();
        const vehicles = await Database.fetchAllData<VehicleTimePatrol>(Athena.database.collections.Vehicles);
        
        for (let vehicle of vehicles) {
            if (vehicle.rentedStartTime) {
                const rentedStartTime = new Date(vehicle.rentedStartTime);
                const twentyFourHoursLater = new Date(rentedStartTime.getTime() + 24 * 60 * 60 * 1000);
                const oneHourBefore = new Date(twentyFourHoursLater.getTime() - 60 * 60 * 1000);
                
                if (oneHourBefore) {
                    Athena.player.emit.notification(player, 'Ende der Ausleihe: '+twentyFourHoursLater)
                }

                if (twentyFourHoursLater <= currentDate) {
                    Athena.vehicle.despawn.one(vehicle.id);
                    Database.deleteById(vehicle.id, Collections.Vehicles);
                }
            }
        }
    }

    static async selectedVehicle(player: alt.Player, vehiclename: string, spawnspot: alt.Vector3, price: number) {

        if(!player || !vehiclename) return;

        const data = Athena.document.character.get(player);
        if (data.isDead) {
            return;
        }

        const playerData = Athena.document.character.get(player);

        if (!vehiclename) {
            Athena.player.emit.message(player, RENTAL_LOCALES.INVALID_MODEL);
            Athena.player.emit.soundFrontend(player, 'Hack_Failed', 'DLC_HEIST_BIOLAB_PREP_HACKING_SOUNDS');
            return;
        }

        if (playerData.bank + playerData.cash < price) {
            Athena.player.emit.message(player, RENTAL_LOCALES.NOT_ENOUGH_MONEY);
            Athena.player.emit.soundFrontend(player, 'Hack_Failed', 'DLC_HEIST_BIOLAB_PREP_HACKING_SOUNDS');
            return;
        }

        if (!Athena.player.currency.subAllCurrencies(player, price)) {
            Athena.player.emit.message(player, RENTAL_LOCALES.NOT_ENOUGH_MONEY);
            Athena.player.emit.soundFrontend(player, 'Hack_Failed', 'DLC_HEIST_BIOLAB_PREP_HACKING_SOUNDS');
            return;
        }

        await Athena.vehicle.add.toDatabase(playerData._id.toString(), vehiclename, spawnspot);
        const vehicle = alt.Vehicle.all.find((veh) => {
            if (!veh || !veh.valid) {
                return false;
            }

            const distance = veh.pos.distanceTo(spawnspot);
            if (distance > 1) {
                return false;
            }
        
            if (veh.model !== alt.hash(vehiclename)) {
                return false;
            }
        
            const owner = Athena.vehicle.ownership.getAsPlayer(veh)
            if (owner !== player) {
                return false;
            }
        
            return true;
        });

        Athena.document.vehicle.set<VehicleTimePatrol>(vehicle, 'rentedStartTime', currentDate)
        Athena.player.currency.sub(player, CurrencyTypes.CASH, price)
        const twentyFourHoursLater = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000)
        Athena.player.emit.notification(player, 'Du hast dir ein Auto ausgeliehen!')
        Athena.player.emit.notification(player, 'Ende der Ausleihe: '+twentyFourHoursLater)
        Athena.player.emit.sound2D(player, 'item_purchase');
    }
}

export class RentalSystem {
    static init() {
        for (let i = 0; i < RENTAL_SHOPS.length; i++) {
            RentalSystem.register(RENTAL_SHOPS[i]);
        }

        alt.onClient(RENTAL_EVENTS.SELECTED, InternalFunctions.selectedVehicle)
        Athena.events.vehicle.on('vehicle-spawned', InternalFunctions.updateTime);
        setInterval(InternalFunctions.updateTime);
    }

    static register(shop: RentalInterface) {
        if (!shop.uid) {
            shop.uid = Athena.utility.hash.sha256Random(JSON.stringify(shop));
        }
        const list = shop.vehicles.listname;
        const uid = shop.vehicles.uid;
        const vehicles = shop.vehicles.vehiclenames;

        Athena.controllers.blip.append({
            text: RENTAL_LOCALES.RENTAL_SERVICE,
            color: 46,
            sprite: 524,
            scale: 1,
            shortRange: true,
            pos: new alt.Vector3(shop.pos.x, shop.pos.y, shop.pos.z - 1),
            uid: `rental-shop-blip-${shop.uid}`,
        });

        Athena.controllers.interaction.append({
            uid: `rental-shop-interact-${shop.uid}`,
            position: new alt.Vector3(shop.pos.x, shop.pos.y, shop.pos.z-1),
            description: 'Rent a Vehicle with Shift + E',
            callback: (player: alt.Player) => {
                RentalSystem.createMenu(player, list, uid, vehicles, shop.spawnspot, shop.price)
            },
            debug: false,
        });

        Athena.controllers.marker.append({
            pos: new alt.Vector3(shop.pos.x, shop.pos.y, shop.pos.z),
            type: 36,
            color: new alt.RGBA(200, 100, 10, 100),
            scale: new alt.Vector3(2, 2, 2),
            maxDistance: 50,
            uid: `rental-shop-marker-interact-${shop.uid}`,
            bobUpAndDown: true,
        })

        Athena.controllers.marker.append({
            pos: new alt.Vector3(shop.spawnspot.x, shop.spawnspot.y, shop.spawnspot.z-1),
            type: 23,
            color: new alt.RGBA(200, 200, 10, 50),
            scale: new alt.Vector3(2, 2, 2),
            maxDistance: 50,
            uid: `rental-shop-marker-spawnspot-${shop.uid}`,
        })
    }

    static createMenu(player: alt.Player, list: string, uid: string, vehicles: {name: string, hash: number}[], spawnspot: alt.Vector3, price: number) {
        Athena.player.emit.sound2D(player, `@plugins/sounds/vehicle-rental/car_startup.ogg`, 0.3);
        alt.emitClient(player, RENTAL_EVENTS.MENU, list, uid, vehicles, spawnspot, price);
    }
}
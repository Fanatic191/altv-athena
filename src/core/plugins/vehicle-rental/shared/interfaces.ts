import * as alt from "alt-shared";

export interface RentalInterface {
    name: string;
    uid: string;
    price: number;
    pos: alt.Vector3;
    spawnspot: alt.Vector3;
    vehicles: RentalVehicleList;
}

export interface RentalVehicleList {
    listname: string;
    uid: string;
    vehiclenames: {
        name: string;
        hash: number;
    }[];
}
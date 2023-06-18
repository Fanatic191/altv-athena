import * as alt from 'alt-client';
import * as natives from 'natives';
import { Config } from '../data/config/config';
class SmoothDriving {
    onEnteredVehicle(vehicle, seat) {
        if (seat == 1) this.onTick();
    }
    onLeftVehicle(vehicle) {
        this.destroy(vehicle);
    }
    destroy(vehicle = null) {
        if (this.tick) {
            alt.clearEveryTick(this.tick);
            this.tick = null;
        }
    }
    onTick() {
        if (this.tick) return;
        this.tick = alt.everyTick(()=>{
            let veh = alt.Player.local.vehicle;
            if (veh) {
                if (veh.rpm < Config.untilRpm || veh.speedVector.length < 4 && veh.rpm < Config.untilRpm + 0.2) natives.setVehicleCheatPowerIncrease(veh, 0.3);
            } else this.destroy();
        });
    }
    constructor(){
        alt.on("enteredVehicle", this.onEnteredVehicle.bind(this));
        alt.on("leftVehicle", this.onLeftVehicle.bind(this));
    }
}
export default new SmoothDriving();

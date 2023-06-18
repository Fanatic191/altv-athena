import * as alt from 'alt-client';
import * as native from 'natives';

import { CONTROLS } from '@AthenaShared/enums/controls';
import { disableAllAttacks } from '@AthenaClient/utility/disableControls';
import { ObjectPlacerEvents } from '@AthenaPlugins/plugin-objectplacer/shared/objectPlacerEvents';

import Raycast from '@AthenaClient/utility/raycast';

export const ObjectPlacer = {
    model: null as string,
    object: null as alt.Object,
    objectPosition: null as alt.Vector3,
    objectRotation: null as alt.Vector3,
    interval: null as number,

    enableEditMode(model: string) {
        this.disableEditMode();

        this.objectRotation = alt.Player.local.rot;
        this.objectPosition = alt.Player.local.pos;
        this.model = model;
        this.object = new alt.Object(model, alt.Player.local.pos, alt.Player.local.rot);
        this.object.alpha = 100;
        this.object.toggleCollision(false, false);

        this.interval = alt.setInterval(this.onTickEditMode.bind(this), 5);
        disableAllAttacks(true);
    },

    disableEditMode(): void {
        if (this.interval !== null) {
            alt.clearInterval(this.interval);
            this.interval = null;
        }

        if (this.object !== null) {
            this.object.destroy();
            this.object = null;
        }
        disableAllAttacks(false);
    },

    onTickEditMode(): void {
        const { x, y } = alt.getCursorPos();
        const cursorWorldPos = alt.screenToWorld(x, y);
        const cameraPos = alt.getCamPos();
        const direction = cursorWorldPos.sub(cameraPos);
        const from = cameraPos.add(direction.mul(0.05));
        const to = cameraPos.add(direction.mul(10000));
        const ray = native.startExpensiveSynchronousShapeTestLosProbe(
            from.x,
            from.y,
            from.z,
            to.x,
            to.y,
            to.z,
            -1,
            alt.Player.local,
            0,
        );

        const [_, didHit, hitCoords] = native.getShapeTestResult(ray);

        if (!didHit) {
            return;
        }

        if (native.isControlJustPressed(0, CONTROLS.PHONE_SELECT)) {
            alt.emitServer(ObjectPlacerEvents.ObjectPlaced, this.model, this.object.pos, this.object.rot);
            this.disableEditMode();
            return;
        }

        if (native.isControlJustPressed(0, CONTROLS.PHONE_CANCEL)) {
            this.disableEditMode();
            return;
        }

        if (native.isControlJustPressed(0, CONTROLS.PHONE_SCROLL_FORWARD)) {
            this.rotate(false);
        } else if (native.isControlJustPressed(0, CONTROLS.PHONE_SCROLL_BACKWARD)) {
            this.rotate(true);
        }

        if (native.isControlJustPressed(0, 172)) {
            this.changeHeight(true);
        } else if (native.isControlJustPressed(0, 173)) {
            this.changeHeight(false);
        }

        this.object.pos = { x: hitCoords.x, y: hitCoords.y, z: this.objectPosition.z };
        this.object.rot = this.objectRotation;

        console.log(this.objectPosition);
    },

    rotate(upDirection: boolean): void {
        const maxRotation = this.degToRad(180);
        const step = this.degToRad(5);

        let zRotation = this.objectRotation.z;
        zRotation += upDirection ? step : -step;

        if (zRotation > maxRotation) {
            zRotation = -maxRotation;
        } else if (zRotation < -maxRotation) {
            zRotation = maxRotation;
        }

        this.objectRotation = new alt.Vector3(this.objectRotation.x, this.objectRotation.y, zRotation);
    },

    changeHeight(upDirection: boolean) {
        const step = 0.1;

        let zPosition = this.objectPosition.z;

        zPosition += upDirection ? step : -step;

        this.objectPosition = new alt.Vector3(this.objectPosition.x, this.objectPosition.y, zPosition);
    },

    degToRad(deg: number): number {
        return (deg * Math.PI) / 180.0;
    },

    pickupObject(): void {
        const result = Raycast.simpleRaycastPlayersView(16, 10);
        if (!result.didComplete || !result.didHit) {
            return;
        }

        const modelHash = native.getEntityModel(result.entityHit);
        console.log(native.getEntityCoords(result.entityHit, false));

        alt.emitServer(
            ObjectPlacerEvents.PickupObject,
            modelHash,
            native.getEntityCoords(result.entityHit, false),
            native.getEntityRotation(result.entityHit, 2),
        );

        console.log(result);
    },
};

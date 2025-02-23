import * as alt from 'alt-client';
import * as native from 'natives';
import * as nativeHelpText from './nativeTextHelper';

const editableScriptConstants = {
    higherSpeedKey: 107, // Num+
    lowerSpeedKey: 109, // Num-
    startKey: 76, // Key L
};

const scriptConstants = {
    changeValue: 10,
    startValue: 30,
    maxSpeed: 150,
    changeValueIngame: 2.7777777777777777777777777777778,
    startValueIngame: 22.2222222222222222222222222222222,
    stopColor: {
        r: 211,
        g: 52,
        b: 52,
    },
    doneColor: {
        r: 0,
        g: 161,
        b: 27,
    },
    workingColor: {
        r: 220,
        g: 224,
        b: 47,
    },
};

let playerSeat = 1;
let playerVehicle = null;
let isInVehicle = false;
let currentMaxVehicleSpeed = scriptConstants.startValueIngame;
let maxVehicleSpeed = scriptConstants.startValue;
let speedLimiter = false;
let isSpeedlimiterWorking = false;
let currentColor = scriptConstants.stopColor;

alt.everyTick(() => {
    if (!isInVehicle) return;

    nativeHelpText.Draw2DText(
        maxVehicleSpeed + ' km/h',
        0.6,
        0.95,
        0.5,
        currentColor.r,
        currentColor.g,
        currentColor.b,
    );
});

alt.on('enteredVehicle', (vehicle, seat) => {
    playerSeat = seat;
    playerVehicle = vehicle;
    isInVehicle = true;

    currentColor = scriptConstants.stopColor;
});

alt.on('changedVehicleSeat', (vehicle, oldSeat, seat) => {
    playerSeat = seat;
    playerVehicle = vehicle;
    isInVehicle = true;
});

alt.on('leftVehicle', (vehicle, seat) => {
    native.setVehicleMaxSpeed(vehicle, 0); // Reset VehicleMaxSpeed
    playerSeat = null;
    playerVehicle = null;
    isInVehicle = false;
    currentMaxVehicleSpeed = scriptConstants.startValueIngame;
    maxVehicleSpeed = scriptConstants.startValue;
    speedLimiter = false;
    isSpeedlimiterWorking = false;
});

alt.on('keydown', (key) => {
    if (!playerSeat) return;

    switch (key) {
        case editableScriptConstants.higherSpeedKey:
            SetCruiseControlHigher();
            break;
        case editableScriptConstants.lowerSpeedKey:
            SetCruiseControlLower();
            break;
        case editableScriptConstants.startKey:
            StartCruiseControl();
            break;
    }
});

function SetCruiseControlHigher() {
    if (!isInVehicle) return;
    if (maxVehicleSpeed == scriptConstants.maxSpeed) return;

    currentMaxVehicleSpeed += scriptConstants.changeValueIngame;
    maxVehicleSpeed += scriptConstants.changeValue;

    if (!speedLimiter) return;

    native.setVehicleMaxSpeed(playerVehicle.scriptID, currentMaxVehicleSpeed);
}

function SetCruiseControlLower() {
    if (!isInVehicle) return;
    if (maxVehicleSpeed == scriptConstants.changeValue) return;

    currentMaxVehicleSpeed -= scriptConstants.changeValueIngame;
    maxVehicleSpeed -= scriptConstants.changeValue;

    if (!speedLimiter) return;

    speedLimiter = false;
    SyncCruiseControl();
}

function StartCruiseControl() {
    if (isSpeedlimiterWorking) {
        speedLimiter = true;
        return;
    }
    SyncCruiseControl();
}

function SyncCruiseControl() {
    if (!isInVehicle) return;

    if (!speedLimiter) {
        let currentSpeed = native.getEntitySpeed(playerVehicle.scriptID);
        if (currentSpeed >= currentMaxVehicleSpeed) {
            isSpeedlimiterWorking = true;

            currentColor = scriptConstants.workingColor;

            alt.setTimeout(() => {
                native.setVehicleMaxSpeed(playerVehicle.scriptID, currentSpeed - 1);
                SyncCruiseControl();
            }, 100);
            return;
        }
        isSpeedlimiterWorking = false;
        speedLimiter = true;

        currentColor = scriptConstants.doneColor;

        native.setVehicleMaxSpeed(playerVehicle.scriptID, currentMaxVehicleSpeed);
        return;
    }

    isSpeedlimiterWorking = false;
    speedLimiter = false;

    currentColor = scriptConstants.stopColor;

    native.setVehicleMaxSpeed(playerVehicle.scriptID, 0);
}

export enum Vehicle_Behavior {
    CONSUMES_FUEL = 1,
    UNLIMITED_FUEL = 2,
    NEED_KEY_TO_START = 4,
    NO_KEY_TO_START = 8,
    NO_KEY_TO_LOCK = 16,
    NO_SAVE = 32,
}

export const VEHICLE_STATE = {
    LOCK: `Vehicle-Lock`,
    KEYS: `Vehicle-Keys`,
    OWNER: 'Vehicle-Owner',
    ENGINE: 'Vehicle-Engine',
    FUEL: 'Vehicle-Fuel',
    POSITION: 'Vehicle-Position',
    LOCKSYMBOL: 'Vehicle-Locksymbol',
    LOCK_INTERACTION_INFO: 'Vehicle-LockInteractionInfo',
};

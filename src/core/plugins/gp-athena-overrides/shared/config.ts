export const Config = {
    ENTITY_SELECTOR_MARKER_OFF: false, //Turn the marker off
    MAPOBJECT_SELECTOR_MARKER_OFF: false, //Turn the marker off
    ENTITY_SELECTOR_AUTOMODE: false, //Find the closest entity and not allow cycling targets.
    DISABLE_VEHICLE_SPAWN_DESPAWN: false, //Disable the ability to spawn/despawn vehicles on disconnect or connect. Instead all vehicles which are not in garage will spawn on server start.
    DISABLE_DEFAULT_WEAPON_ITEMS: false, //Disable the default weapon items.
    DISABLE_DEFAULT_AMMO: false, //Disable the default ammo.
    DISABLE_DEFAULT_TIME_SYNC: false, //Disable the default time sync.
    DISABLE_HOSPITAL_BLIPS: false, //Disable the hospital blips.
    WEATHER_SYNC_INTERVAL: 1000 * 60 * 1, //1 minutes, DO NOT SET IT BELOW 1 MINUTE.
};

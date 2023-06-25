import * as alt from 'alt-client';
import * as native from 'natives';

import { SHARED_CONFIG } from '@AthenaShared/configurations/shared';
import { SYSTEM_EVENTS } from '@AthenaShared/enums/system';
import { onTicksStart } from './onTicksStart';
import { drawText2D } from '@AthenaClient/screen/text';

alt.on('connectionComplete', handleConnectionComplete);
alt.setWatermarkPosition(0);

async function handleConnectionComplete() {
    native.destroyAllCams(true);
    native.renderScriptCams(false, false, 0, false, false, 0);
    native.doScreenFadeOut(0);
    native.triggerScreenblurFadeOut(0);
    native.freezeEntityPosition(alt.Player.local.scriptID, true);
    native.setStreamedTextureDictAsNoLongerNeeded('athena_icons');

    if (SHARED_CONFIG.DISABLE_IDLE_CAM) {
        alt.setConfigFlag('DISABLE_IDLE_CAMERA', true);
    }

    // Calls the login functionality
    alt.emitServer(SYSTEM_EVENTS.BEGIN_CONNECTION);
    handleTick();
}

alt.everyTick(() => {
    native.hideHudComponentThisFrame(6); // Vehicle Name
    if (alt.Player.local.vehicle) {
        native.hideHudComponentThisFrame(7); // Area Name
    }
    native.hideHudComponentThisFrame(8); // Vehicle Class
    native.hideHudComponentThisFrame(9); // Street Name
    const color = new alt.RGBA(255, 255, 255, 150);
    const position = new alt.Vector2(0.955, 0.97);
    drawText2D('MonsterV, v0.0.6.0', position, 0.35, color);
});

function handleTick() {
    native.startAudioScene(`CHARACTER_CHANGE_IN_SKY_SCENE`);
    native.startAudioScene('FBI_HEIST_H5_MUTE_AMBIENCE_SCENE'); // Used to stop police sound in town
    native.cancelAllPoliceReports(); // Used to stop default police radio around/In police vehicle
    native.clearAmbientZoneState('AZ_COUNTRYSIDE_PRISON_01_ANNOUNCER_GENERAL', false); // Turn off prison sound
    native.clearAmbientZoneState('AZ_COUNTRYSIDE_PRISON_01_ANNOUNCER_WARNING', false); // Turn off prison sound
    native.clearAmbientZoneState('AZ_COUNTRYSIDE_PRISON_01_ANNOUNCER_ALARM', false); // Turn off prison sound
    native.setAmbientZoneState('', false, false);
    native.clearAmbientZoneState('AZ_DISTANT_SASQUATCH', false);
    native.setAudioFlag('LoadMPData', true);
    native.setAudioFlag('DisableFlightMusic', true);
}

onTicksStart.add(handleTick);

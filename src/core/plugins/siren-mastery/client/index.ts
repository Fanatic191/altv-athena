import * as AthenaClient from '@AthenaClient/api/';
import './lib/sirenMastery';

const THE_LETTER_J = 74;

function toggleSiren() {
    alt.emit('sirenMastery:ToggleSiren');
}

AthenaClient.systems.hotkeys.checkValidation(THE_LETTER_J);

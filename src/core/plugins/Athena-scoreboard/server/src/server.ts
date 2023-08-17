import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { getTimestamp } from '@AthenaPlugins/Athena-scoreboard/shared/timestamp';

alt.on('playerConnect', (player) => {
  player.setSyncedMeta('joinTime', getTimestamp());
});

import alt from 'alt-server';
import * as Athena from '@AthenaServer/api';

Athena.commands.register('clearinv', '/clearinv [id]', ['admin'], async (player: alt.Player, id: string) => {
    const target = Athena.systems.identifier.getPlayer(id);

    if (!target || !target.valid || !id) {
        return;
    }

    Athena.document.character.set(target, 'inventory', []);
});

Athena.commands.register('cleartoolbar', '/cleartoolbar [id]', ['admin'], async (player: alt.Player, id: string) => {
    const target = Athena.systems.identifier.getPlayer(id);

    if (!target || !target.valid || !id) {
        return;
    }

    Athena.document.character.set(target, 'toolbar', []);
});

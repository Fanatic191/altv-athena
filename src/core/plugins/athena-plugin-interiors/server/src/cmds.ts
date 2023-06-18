import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { INTERIOR_SYSTEM } from '../../shared/flags';
import { Interior } from '../../shared/interfaces';
import { isFlagEnabled } from '../../../../shared/utility/flags';
import { InteriorSystem } from './system';
import { InputMenu, InputOptionType, InputResult } from '@AthenaPlugins/gp-athena-utils/shared/interfaces/inputMenus';

Athena.systems.messenger.commands.register(
    'addhouse',
    '/addhouse - Adds a house entry at current position',
    ['admin'],
    addhouse,
);

async function addhouse(player: alt.Player) {
    const menu: InputMenu = {
        title: 'Create House (Unchecked. Do it right.)',
        options: [
            {
                id: 'name',
                desc: 'Name of Property',
                placeholder: 'Property Name',
                type: InputOptionType.TEXT,
                error: 'Must specify property name.',
            },
            {
                id: 'price',
                desc: 'Price of Property',
                placeholder: '5000...',
                type: InputOptionType.NUMBER,
                error: 'Must specify property value.',
            },
            {
                id: 'interior',
                desc: 'Position of Property Interior. As JSON String.',
                placeholder: '{ "x": 0, "y": 0, "z": 0 }',
                type: InputOptionType.TEXT,
                error: 'Must specify property position.',
            },
            {
                id: 'ipl',
                desc: 'Optional IPL to load on enter if necessary.',
                placeholder: 'Google it.',
                type: InputOptionType.TEXT,
            },
        ],
        serverEvent: 'cmd:Create:House',
    };

    const gpUtils = await Athena.systems.plugins.useAPI('gputils');
    gpUtils.inputMenu(player, menu);
}

alt.onClient('cmd:Create:House', async (player: alt.Player, results: InputResult[]) => {
    if (!results) {
        return;
    }

    if (!Athena.player.permission.hasAccountPermission(player, 'admin')) {
        return;
    }

    const [name, price, interior, ipl] = results;

    if (!name || !price || !interior) {
        Athena.player.emit.message(player, `Please make sure all fields are valid.`);
        return;
    }

    if (!name.value || !price.value || !interior.value) {
        Athena.player.emit.message(player, `Please make sure all fields are valid.`);
        return;
    }

    let actualPos: alt.Vector3;

    try {
        actualPos = JSON.parse(interior.value);
    } catch (err) {
        Athena.player.emit.message(player, `Not a valid alt.Vector3 JSON`);
        return;
    }

    if (!actualPos) {
        Athena.player.emit.message(player, `Not a valid alt.Vector3 JSON`);
        return;
    }

    const houseData: Interior = {
        name: name.value,
        outside: new alt.Vector3({ x: player.pos.x, y: player.pos.y, z: player.pos.z }),
        inside: actualPos,
        objects: [],
        price: parseInt(price.value),
        isUnlocked: true,
        system:
            INTERIOR_SYSTEM.HAS_LOCK |
            INTERIOR_SYSTEM.HAS_OWNER |
            INTERIOR_SYSTEM.HAS_PRICE |
            INTERIOR_SYSTEM.HAS_STORAGE,
    };

    if (ipl && ipl.value) {
        houseData.ipl = ipl.value;
    }

    await InteriorSystem.add(houseData);
    Athena.player.emit.message(player, `Created House`);
});

import alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { CHAT_CONFIG } from '@AthenaPlugins/core-chat/shared/config';

Athena.commands.register('do', '', [], (player: alt.Player, ...args: string[]) => {
    if (args.length <= 0) {
        const commandInfo = Athena.commands.get('do');
        Athena.player.emit.message(player, commandInfo.description);
        return;
    }

    const fullMessage = args.join(' ');
    const closestPlayers = Athena.getters.players.inRange(player.pos, CHAT_CONFIG.settings.commands.doDistance);
    const data = Athena.document.character.get(player);
    if (typeof data === 'undefined') {
        return;
    }

    Athena.systems.messenger.messaging.sendToPlayers(
        closestPlayers,
        `${CHAT_CONFIG.settings.commands.doColour}* ${fullMessage} ((${data.name}))`,
    );
});

Athena.commands.register('low', '', [], (player: alt.Player, ...args: string[]) => {
    if (args.length <= 0) {
        const commandInfo = Athena.commands.get('low');
        Athena.player.emit.message(player, commandInfo.description);
        return;
    }

    const fullMessage = args.join(' ');
    const closestPlayers = Athena.getters.players.inRange(player.pos, CHAT_CONFIG.settings.commands.lowDistance);
    const data = Athena.document.character.get(player);
    if (typeof data === 'undefined') {
        return;
    }

    Athena.systems.messenger.messaging.sendToPlayers(
        closestPlayers,
        `${CHAT_CONFIG.settings.commands.lowColour}${data.name} ${fullMessage}`,
    );
});

Athena.commands.register('me', '', [], (player: alt.Player, ...args: string[]) => {
    if (args.length <= 0) {
        const commandInfo = Athena.commands.get('me');
        Athena.player.emit.message(player, commandInfo.description);
        return;
    }

    const fullMessage = args.join(' ');
    const closestPlayers = Athena.getters.players.inRange(player.pos, CHAT_CONFIG.settings.commands.meDistance);
    const data = Athena.document.character.get(player);
    if (typeof data === 'undefined') {
        return;
    }

    Athena.systems.messenger.messaging.sendToPlayers(
        closestPlayers,
        `${CHAT_CONFIG.settings.commands.roleplayColour}${data.name} ${fullMessage}`,
    );
});

Athena.commands.register('b', '', [], (player: alt.Player, ...args: string[]) => {
    if (args.length <= 0) {
        const commandInfo = Athena.commands.get('ooc');
        Athena.player.emit.message(player, commandInfo.description);
        return;
    }

    const fullMessage = args.join(' ');
    const closestPlayers = Athena.getters.players.inRange(player.pos, CHAT_CONFIG.settings.commands.oocDistance);
    const data = Athena.document.character.get(player);
    if (typeof data === 'undefined') {
        return;
    }

    Athena.systems.messenger.messaging.sendToPlayers(
        closestPlayers,
        `${CHAT_CONFIG.settings.commands.oocColour}${data.name}: ((${fullMessage}))`,
    );
});

// Athena.commands.register(
//     'whisper',
//     '/whisper [id] [...message] - Whisper to another player.',
//     [],
//     (player: alt.Player, id: string, ...args: string[]) => {
//         const commandInfo = Athena.commands.get('whisper');
//         if (args.length <= 0) {
//             Athena.player.emit.message(player, commandInfo.description);
//             return;
//         }

//         if (typeof id === 'undefined') {
//             Athena.player.emit.message(player, commandInfo.description);
//             return;
//         }

//         const target = Athena.systems.identifier.getPlayer(id);
//         if (typeof target === 'undefined') {
//             Athena.player.emit.message(player, `Cannot find that player.`);
//             return;
//         }

//         if (target.id === player.id) {
//             Athena.player.emit.message(player, `You speak to yourself.`);
//             return;
//         }

//         const fullMessage = args.join(' ');
//         const data = Athena.document.character.get(player);
//         const targetData = Athena.document.character.get(player);
//         if (typeof data === 'undefined' || typeof targetData === 'undefined') {
//             return;
//         }

//         Athena.systems.messenger.messaging.send(
//             player,
//             `${CHAT_CONFIG.settings.commands.whisperColour}You whisper: '${fullMessage}' to ${targetData.name}`,
//         );

//         Athena.systems.messenger.messaging.send(
//             target,
//             `${CHAT_CONFIG.settings.commands.whisperColour}${data.name}: ((${fullMessage}))`,
//         );
//     },
// );

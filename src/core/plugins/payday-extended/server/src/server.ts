import * as alt from 'alt-server';
import * as Athena from '@AthenaServer/api';
import { Character } from '@AthenaShared/interfaces/character';
import { CurrencyTypes } from '@AthenaShared/enums/currency';

const registrationPosition = new alt.Vector3(233.3926544189453,-409.99188232421875,48.111900329589844-1);
const paydayPosition = new alt.Vector3(-68.81234741210938,-801.4829711914062,44.2272834777832-1);
const newregistrationPosition = new alt.Vector3(-540.0734252929688,-205.29226684570312,37.6506729125976561-1);
const currentDate = new Date();
const cashBonus = 4000;
const cashCheck = 3000;

interface PlayerPayday extends Character{
    payday:{
        setup: boolean;
        bonus: boolean;
        stampPaydayRegistration: Date;
        stampPaydayCollected: Date;
        paydayRegistration: boolean;
        paydayCollected: boolean;
        nextRegistration: Date;
        nextPayday: Date;
    }
}

class InternalFunctions{
    static async setup(player: alt.Player){
        if(!player) return;
        let setupInit = await Athena.document.character.get<PlayerPayday>(player);
        if(!setupInit) return;
        if(setupInit.payday === undefined) {
            setupInit.payday = {
                setup: true,
                bonus: false,
                stampPaydayRegistration: undefined,
                stampPaydayCollected: undefined,
                paydayRegistration: false,
                paydayCollected: false,
                nextRegistration: undefined,
                nextPayday: undefined
            };
            Athena.document.character.set<PlayerPayday>(player, 'payday', setupInit.payday);
        }
    }

    static async startUp(player: alt.Player) {
        if(!player) return;
        let setupInit = await Athena.document.character.get<PlayerPayday>(player);
        if(!setupInit) return;
        if(setupInit.payday.setup === false){
            setupInit.payday.setup = true;
            Athena.document.character.set<PlayerPayday>(player, 'payday', setupInit.payday)
        } else if(setupInit.payday.setup === true) {
            InternalFunctions.checkRegistration(player);
            InternalFunctions.checkPayday(player);
            InternalFunctions.checkBonus(player);
        }
    }

    static async dataGetFetch(player: alt.Player) {
        if(!player) return undefined;
        let data = await Athena.document.character.get<PlayerPayday>(player);
        return data.payday;
    }

    static async checkRegistration(player: alt.Player){
        if(!player) return;
        let data = await InternalFunctions.dataGetFetch(player);
        if(data.nextRegistration === undefined || data.paydayRegistration === false) {
            return;
        } else if(data.nextRegistration != undefined && data.paydayCollected === true) {
            if (data.nextRegistration <= currentDate) {
                Athena.player.emit.notification(player, 'Deine Registrierung ist ausgelaufen!')
                data.paydayRegistration = false;
                Athena.document.character.set<PlayerPayday>(player, 'payday', data)
            }
        }
    }

    static async checkPayday(player: alt.Player){
        if(!player) return;
        let data = await InternalFunctions.dataGetFetch(player);
        if(data.nextPayday === undefined || data.paydayCollected === true) {
            return;
        } else if(data.nextPayday != undefined && data.paydayCollected === false) {
            if (data.nextPayday <= currentDate) {
                Athena.player.emit.notification(player, 'Dein Bürgergeld ist bald abholbereit!')
                data.paydayCollected = false;
                Athena.document.character.set<PlayerPayday>(player, 'payday', data)
            }
        }
    }

    static async checkBonus(player: alt.Player){
        if(!player) return;
        let data = await InternalFunctions.dataGetFetch(player);
        if(data.bonus === undefined || data.bonus === false) {
            return;
        } else if(data.bonus === true) {
            Athena.player.emit.notification(player, 'Du hast deine Bonuszahlung schon erhalten!')
        }
    }

}

export class PaydaySystem {
    static init () {

        Athena.controllers.blip.append({
            sprite: 108,
            color: 25,
            pos: paydayPosition,
            scale: 0.6,
            shortRange: true,
            text: 'Bürgergeld-Auszahlung',
        });

        Athena.controllers.marker.append({
            pos: paydayPosition,
            color: new alt.RGBA(255, 0, 0, 150),
            type: 1,
            scale: new alt.Vector3(1, 1, 1),
        });

        Athena.controllers.interaction.append({
            uid: `citizen-money-payout-1`,
            position: paydayPosition,
            description: 'Bürgergeld-Auszahlung - Shift + E',
            callback: (player: alt.Player) => {
                PaydaySystem.collect(player)
            },
            isPlayerOnly: true,
            debug: false,
        });

        Athena.controllers.blip.append({
            sprite: 108,
            color: 25,
            pos: registrationPosition,
            scale: 0.6,
            shortRange: true,
            text: 'Bürgergeld-Registrierung',
        });

        Athena.controllers.marker.append({
            pos: registrationPosition,
            color: new alt.RGBA(255, 0, 0, 150),
            type: 1,
            scale: new alt.Vector3(1, 1, 1),
        });

        Athena.controllers.interaction.append({
            uid: `citizen-money-register-1`,
            position: registrationPosition,
            description: 'Bürgergeld-Registrierung - Shift + E',
            callback: (player: alt.Player) => {
                PaydaySystem.register(player)
            },
            isPlayerOnly: true,
            debug: false,
        });

        Athena.controllers.blip.append({
            sprite: 108,
            color: 25,
            pos: newregistrationPosition,
            scale: 0.6,
            shortRange: true,
            text: 'Neuregistrierung',
        });

        Athena.controllers.marker.append({
            pos: newregistrationPosition,
            color: new alt.RGBA(255, 0, 0, 150),
            type: 1,
            scale: new alt.Vector3(1, 1, 1),
        });

        Athena.controllers.interaction.append({
            uid: `citizen-money-new-register-1`,
            position: newregistrationPosition,
            description: 'Neuregistrierung - Shift + E',
            callback: (player: alt.Player) => {
                PaydaySystem.register(player)
            },
            isPlayerOnly: true,
            debug: false,
        });

        Athena.player.events.on('selected-character', InternalFunctions.setup);

        setInterval(InternalFunctions.startUp, 10000); 
    }

    static async collect(player: alt.Player) {
        if(!player) return;

        let collect = await InternalFunctions.dataGetFetch(player);
        if(!collect) return;
        if(!collect.setup) return;
        if(collect.setup === true) {
            if(collect.paydayRegistration === false) {
                Athena.player.emit.notification(player, `Deine Registrierung ist abgelaufen. Stelle einen neuen Antrag!`);
            }

            if(collect.paydayCollected === true) {
                Athena.player.emit.notification(player, `Du hast dein Bürgergeld schon erhalten!`);
            }

            if(collect.bonus === false && collect.paydayRegistration === true && collect.paydayCollected === false) {
                Athena.player.currency.add(player, CurrencyTypes.BANK, cashBonus)
                Athena.player.currency.add(player, CurrencyTypes.BANK, cashCheck)
                const value = cashBonus + cashCheck
                Athena.player.emit.notification(player, `Du hast deine erste Zahlung von $ ${value} erhalten`);
                collect.bonus = true;
                collect.paydayCollected = true;
                collect.stampPaydayCollected = currentDate;
                collect.nextPayday = new Date(collect.stampPaydayCollected.getTime() + 24 * 60 * 60 * 1000)
                Athena.document.character.set<PlayerPayday>(player, 'payday', collect)
            } else if(collect.bonus === true && collect.paydayRegistration === true && collect.paydayCollected === false) {
                Athena.player.currency.add(player, CurrencyTypes.BANK, cashCheck)
                Athena.player.emit.notification(player, `Du hast deine Zahlung von $ ${cashCheck} erhalten`);
                collect.paydayCollected = true;
                collect.stampPaydayCollected = currentDate;
                collect.nextPayday = new Date(collect.stampPaydayCollected.getTime() + 24 * 60 * 60 * 1000)
                Athena.document.character.set<PlayerPayday>(player, 'payday', collect)
            }
        }
    }

    static async register(player: alt.Player) {
        if(!player) return;

        let register = await InternalFunctions.dataGetFetch(player);
        if(!register) return;
        if(!register.setup) return;
        if(register.setup === true) {
            if(register.paydayRegistration === true) {
                Athena.player.emit.notification(player, `Du bist bereits Registriert!`);
            }

            if (register.paydayRegistration === false) {
                register.paydayRegistration = true;
                register.stampPaydayRegistration = currentDate;
                register.nextRegistration = new Date(register.stampPaydayRegistration.getTime() + 7 * 24 * 60 * 60 * 1000);
                Athena.player.emit.notification(player, `Du hast dich erfolgreich registriert!`);
                Athena.document.character.set<PlayerPayday>(player, 'payday', register);
            }
        }
    }

    static async msgNext(player: alt.Player) {
        if(!player) return;
        let paynext = await InternalFunctions.dataGetFetch(player);
        if(!paynext) return;
        let paynextdate = new Date(paynext.nextPayday);
        let paynexthour = paynextdate.getHours();
        let paynextminute = paynextdate.getMinutes();
        let paynextsecond = paynextdate.getSeconds();
        if (paynexthour <= 0) {
            Athena.player.emit.notification(player, 'Nächste Auszahlung in: '+ paynextminute +' Minuten und '+ paynextsecond +' Sekunden. ' );
        } else if (paynexthour <= 0 && paynextminute <= 0) {
            Athena.player.emit.notification(player, 'Nächste Auszahlung in: '+ paynextsecond +' Sekunden. ' );
        } else {
            Athena.player.emit.notification(player, 'Nächste Auszahlung in: '+ paynexthour +' Stunden, '+ paynextminute +' Minuten und '+ paynextsecond +' Sekunden. ' );
        }
    }

    static async msgRegi(player: alt.Player) {
        if(!player) return;
        let payreg = await InternalFunctions.dataGetFetch(player);
        if(!payreg) return;
        let payregdate = new Date(payreg.nextRegistration);
        let payregday = payregdate.getDate();
        let payreghour = payregdate.getHours();
        let payregminute = payregdate.getMinutes();
        let payregsecond = payregdate.getSeconds();
        if (payregday <= 0) {
            Athena.player.emit.notification(player, 'Nächste Registrierung in: '+ payreghour +' Stunden,  '+ payregminute +' Minuten und '+ payregsecond+' Sekunden. '  );
        } else if (payregday <= 0 && payreghour <= 0) {
            Athena.player.emit.notification(player, 'Nächste Registrierung in: '+ payregminute +' Minuten und '+ payregsecond+' Sekunden. '  );
        } else if (payregday <= 0 && payreghour <= 0 && payregminute <= 0) {
            Athena.player.emit.notification(player, 'Nächste Registrierung in: '+ payregsecond+' Sekunden. '  );
        } else {
            Athena.player.emit.notification(player, 'Nächste Registrierung in: '+ payregday +' Tagen, '+ payreghour +' Stunden, '+ payregminute +' Minuten und '+ payregsecond+' Sekunden. '  );
        }
    }

    static async msgInfoReg(player: alt.Player) {
        if(!player) return;
        const payInfo = await InternalFunctions.dataGetFetch(player);
        if(!payInfo) return;

        const nextRegistration = new Date(payInfo.nextRegistration);

        if(nextRegistration === undefined || nextRegistration === null) {
            Athena.player.emit.createShard(player, {
                duration: 4000,
                title: 'Registrierung',
                text: 'Du bist noch nicht registriert!',
            });
            return;
        }

        if (payInfo.paydayRegistration) {
            Athena.player.emit.createShard(player, {
                duration: 4000,
                title: 'Registrierung',
                text: 'Gültig bis: '+nextRegistration.getDate()+'.'+nextRegistration.getMonth()+'.'+nextRegistration.getFullYear()+' um '+nextRegistration.getHours()+':'+nextRegistration.getMinutes()+':'+nextRegistration.getSeconds(),
            });
        } else {
            Athena.player.emit.createShard(player, {
                duration: 4000,
                title: 'Registrierung',
                text: 'Ungültig seit: '+nextRegistration.getDate()+'.'+nextRegistration.getMonth()+'.'+nextRegistration.getFullYear()+' um '+nextRegistration.getHours()+':'+nextRegistration.getMinutes()+':'+nextRegistration.getSeconds(),
            });
        }
    }

    static async msgInfoPay(player: alt.Player) {
        if(!player) return;
        const payInfo = await InternalFunctions.dataGetFetch(player);
        if(!payInfo) return;

        const nextPayday = new Date(payInfo.nextPayday);
    
        if(nextPayday === undefined || nextPayday === null) {
            Athena.player.emit.createShard(player, {
                duration: 4000,
                title: 'Bürgergeld',
                text: 'Du hast noch keine Abholung getätigt!',
            });
            return;
        }

        if (!payInfo.paydayCollected) {
            Athena.player.emit.createShard(player, {
                duration: 4000,
                title: 'Bürgergeld',
                text: 'Abholbereit seit: '+nextPayday.getDate()+'.'+nextPayday.getMonth()+'.'+nextPayday.getFullYear()+' um '+nextPayday.getHours()+':'+nextPayday.getMinutes()+':'+nextPayday.getSeconds(),
            });
        } else {
            Athena.player.emit.createShard(player, {
                duration: 4000,
                title: 'Bürgergeld',
                text: 'Nicht Abholbereit bis: '+nextPayday.getDate()+'.'+nextPayday.getMonth()+'.'+nextPayday.getFullYear()+' um '+nextPayday.getHours()+':'+nextPayday.getMinutes()+':'+nextPayday.getSeconds(),
            });
        }
    }

    static async msgInfoBonus(player: alt.Player) {
        if(!player) return;
        let payInfo = await InternalFunctions.dataGetFetch(player);
        if(!payInfo) return;
    
        if(payInfo.bonus === undefined || payInfo.bonus === null) {
            Athena.player.emit.createShard(player, {
                duration: 4000,
                title: 'Einmalzahlung',
                text: 'Deine Einmalzahlung ist noch in Bearbeitung!',
            });
            return;
        }

        if (!payInfo.bonus) {
            Athena.player.emit.createShard(player, {
                duration: 4000,
                title: 'Einmalzahlung',
                text: 'Nicht Erhalten!',
            });
        } else {
            Athena.player.emit.createShard(player, {
                duration: 4000,
                title: 'Einmalzahlung',
                text: 'Erhalten!',
            });
        }
    }
}

Athena.commands.register(
    'payday',
    '/payday',
    ['player', 'admin', 'moderator'],
    async (player: alt.Player) => {
        PaydaySystem.msgNext(player);
    },
);

Athena.commands.register(
    'registration',
    '/registration',
    ['player', 'admin', 'moderator'],
    async (player: alt.Player) => {
        PaydaySystem.msgRegi(player)
    },
);

Athena.commands.register(
    'citizenreg',
    '/citizenreg',
    ['player', 'admin', 'moderator'],
    async (player: alt.Player) => {
        await PaydaySystem.msgInfoReg(player)
    },
);

Athena.commands.register(
    'citizenpay',
    '/citizenpay',
    ['player', 'admin', 'moderator'],
    async (player: alt.Player) => {
        await PaydaySystem.msgInfoPay(player)
    },
);

Athena.commands.register(
    'citizenbonus',
    '/citizenbonus',
    ['player', 'admin', 'moderator'],
    async (player: alt.Player) => {
        await PaydaySystem.msgInfoBonus(player)
    },
);
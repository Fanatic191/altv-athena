import * as alt from 'alt-client';
import * as AthenaClient from '@AthenaClient/api';
import { RENTAL_EVENTS } from '../shared/events';
import { RENTAL_LOCALES } from '../shared/locales';

function menuCreation(list: string, uid: string, vehicles: {name: string, hash: number}[], spawnspot: alt.Vector3, price: number) {
    const player = alt.Player.local;

    if (!player || !list || !uid || !vehicles || !spawnspot) return;

    const options = vehicles.map((vehicle) => vehicle.name);

    alt.toggleGameControls(false);
    AthenaClient.webview.setOverlaysVisible(false);

    AthenaClient.screen.shard.create({
        duration: 5000,
        title: RENTAL_LOCALES.RENTAL_SERVICE,
        text: list,
    })

    AthenaClient.rmlui.menu.create({
        header: {
            title: RENTAL_LOCALES.RENTAL_SERVICE,
            color: new alt.RGBA(0, 170, 200, 255),
        },
        options: [
            {
                type: 'Selection',
                title: RENTAL_LOCALES.VEHICLES,
                description: RENTAL_LOCALES.VEHICLES_DESC,
                options: options,
                value: 0,
                onlyUpdateOnEnter: true,
                async callback(newValue: string) {
                    const vehiclename = newValue;

                    await AthenaClient.rmlui.menu.close();

                    const question = AthenaClient.rmlui.question.create({
                        buttons: {
                            accept: 'Ja',
                            decline: 'Nein',
                        },
                        placeholder: `Möchtest du das Fahrzeug 24 Stunden für $ ${price} ausleihen?`,
                        blur: true,
                        darken: true,
                        hideHud: true,
                    });

                    question.then(async (result) => {
                        if (result) {
                            alt.emitServer(RENTAL_EVENTS.SELECTED, vehiclename, spawnspot, price);
                        } else{
                            alt.toggleGameControls(true);
                            AthenaClient.webview.setOverlaysVisible(true);
                            await AthenaClient.rmlui.menu.close();
                        }
                    })
                }
            },
            {
                type: 'Invoke',
                title: RENTAL_LOCALES.CLOSE,
                description: RENTAL_LOCALES.CLOSE_DESC,
                onlyUpdateOnEnter: true,
                async callback() {
                    alt.toggleGameControls(true);
                    AthenaClient.webview.setOverlaysVisible(true);
                    await AthenaClient.rmlui.menu.close();
                },
            },
        ],
        callbackOnClose(){
            emitClose
        }
    })
}

function emitClose() {
    //CLOSE
}

alt.onServer(RENTAL_EVENTS.MENU, menuCreation);
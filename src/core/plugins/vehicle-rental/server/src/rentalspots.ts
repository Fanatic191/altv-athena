import * as alt from 'alt-shared';
import { RentalInterface } from '../../shared/interfaces';
import { RENTAL_LOCALES } from '@AthenaPlugins/vehicle-rental/shared/locales';
import { RENTAL_THINGS } from '@AthenaPlugins/vehicle-rental/shared/const';

export const RENTAL_SHOPS: Array<RentalInterface> = [
    {
        name: RENTAL_LOCALES.RENTAL_SERVICE+' '+RENTAL_LOCALES.RENTAL_BEACH,
        uid: 'uid-rental-service-1',
        price: RENTAL_THINGS.PRICE.BROKE,
        pos: new alt.Vector3( -1658.2171630859375, -951.6867065429688, 7.7229132652282715 ),
        spawnspot: new alt.Vector3( -1649.062255859375, -931.4432373046875, 8.24307918548584 ),
        vehicles: {
            listname: 'Broke-Line',
            uid: 'rental-broke-1',
            vehiclenames: [
                {name:'voodoo2', hash: 523724515},
                {name:'ratloader', hash: 3627815886},
                {name:'asea', hash: 2485144969},
                {name:'emperor', hash: 3609690755},
                {name:'regina', hash: 4280472072},
                {name:'tornado3', hash: 1762279763},
            ],
        },
    },
    {
        name: RENTAL_LOCALES.RENTAL_SERVICE+' '+RENTAL_LOCALES.RENTAL_SANDY,
        uid: 'uid-rental-service-2',
        price: RENTAL_THINGS.PRICE.MID,
        pos: new alt.Vector3( 1705.9334716796875, 3592.043701171875, 35.44408416748047 ),
        spawnspot: new alt.Vector3( 1694.90185546875, 3603.119384765625, 35.509437561035156 ),
        vehicles: {
            listname: 'Offroad-Line',
            uid: 'rental-offroad-1',
            vehiclenames: [
                {name:'sandking', hash: 3105951696},
                {name:'kamacho', hash: 4173521127},
                {name:'dubsta3', hash: 3057713523},
                {name:'caracara2', hash: 2945871676},
                {name:'l35', hash: 2531292011},
                {name:'monstrociti', hash: 802856453},
            ],
        },
    },
    {
        name: RENTAL_LOCALES.RENTAL_SERVICE+' '+RENTAL_LOCALES.RENTAL_PALETO,
        uid: 'uid-rental-service-3',
        price: RENTAL_THINGS.PRICE.HIGH,
        pos: new alt.Vector3( 160.1122589111328, 6587.2783203125, 32.0949821472168 ),
        spawnspot: new alt.Vector3( 150.81512451171875, 6596.49951171875, 31.84488868713379 ),
        vehicles: {
            listname: 'Sports-Line',
            uid: 'rental-sports-1',
            vehiclenames: [
                {name:'coquette', hash: 108773431},
                {name:'schlagen', hash: 3787471536},
                {name:'r300', hash: 1076201208},
                {name:'neon', hash: 2445973230},
                {name:'stingertt', hash: 1447690049},
                {name:'tenf', hash: 3400983137},
            ],
        },
    },
    {
        name: RENTAL_LOCALES.RENTAL_SERVICE+' '+RENTAL_LOCALES.RENTAL_AIRPORT,
        uid: 'uid-rental-service-4',
        price: RENTAL_THINGS.PRICE.LOW,
        pos: new alt.Vector3( -1010.7025146484375, -2701.021240234375, 13.982720375061035 ),
        spawnspot: new alt.Vector3( -980.0281982421875, -2696.787109375, 13.842474937438965 ),
        vehicles: {
            listname: 'Citizen-Line',
            uid: 'rental-citizen-1',
            vehiclenames: [
                {name:'panto', hash: 3863274624},
                {name:'club', hash: 2196012677},
                {name:'asbo', hash: 1118611807},
                {name:'rhapsody', hash: 841808271},
                {name:'blista', hash: 3950024287},
                {name:'issi2', hash: 3117103977},
            ],
        },
    },
    {
        name: RENTAL_LOCALES.RENTAL_SERVICE+' '+RENTAL_LOCALES.RENTAL_CITY,
        uid: 'uid-rental-service-5',
        price: RENTAL_THINGS.PRICE.RICH,
        pos: new alt.Vector3( 100.35076141357422, -1073.2796630859375, 29.374114990234375 ),
        spawnspot: new alt.Vector3( 118.88858795166016, -1062.0882568359375, 29.19234275817871 ),
        vehicles: {
            listname: 'Luxury-Line',
            uid: 'rental-luxury-1',
            vehiclenames: [
                {name:'vacca', hash: 338562499},
                {name:'zentorno', hash: 2891838741},
                {name:'reaper', hash: 234062309},
                {name:'tempesta', hash: 272929391},
                {name:'zorrusso', hash: 3612858749},
                {name:'torero2', hash: 4129572538},
            ],
        },
    },
];

import * as alt from 'alt-client';
export const Config = {
    sirens: [
        {
            // Don't remove -1, it's a static button for the lights. Set it in the server-side config to false or set it manually to false
            id: -1,
            name: '',
            displayName: 'LIGHTS',
        },
        {
            // Don't remove 0, it's a static button for the airhorn. Set it in the server-side config to false or set it manually to false
            id: 0,
            name: 'SIRENS_AIRHORN',
            displayName: 'HORN',
        },
        {
            id: 1,
            name: 'VEHICLES_HORNS_SIREN_1',
            displayName: 'WAILA',
        },
        {
            id: 2,
            name: 'VEHICLES_HORNS_SIREN_2',
            displayName: 'YELP',
        },
        {
            id: 3,
            name: 'RESIDENT_VEHICLES_SIREN_FIRETRUCK_QUICK_01',
            displayName: 'WAIL3',
        },
        {
            id: 4,
            name: 'RESIDENT_VEHICLES_SIREN_FIRETRUCK_WAIL_01',
            displayName: 'WAIL4',
        },
        {
            id: 5,
            name: 'RESIDENT_VEHICLES_SIREN_QUICK_01',
            displayName: 'WAIL5',
        },
        {
            id: 6,
            name: 'RESIDENT_VEHICLES_SIREN_WAIL_01',
            displayName: 'WAIL6',
        },
        {
            id: 7,
            name: 'RESIDENT_VEHICLES_SIREN_QUICK_02',
            displayName: 'YELPB',
        },
        {
            id: 8,
            name: 'RESIDENT_VEHICLES_SIREN_WAIL_02',
            displayName: 'WAILB',
        },
        {
            id: 9,
            name: 'RESIDENT_VEHICLES_SIREN_QUICK_03',
            displayName: 'YELPC',
        },
        {
            id: 10,
            name: 'RESIDENT_VEHICLES_SIREN_WAIL_03',
            displayName: 'WAILC',
        },
        {
            id: 11,
            name: 'VEHICLES_HORNS_AMBULANCE_WARNING',
            displayName: 'PHLO',
        },
        {
            id: 12,
            name: 'VEHICLES_HORNS_POLICE_WARNING',
            displayName: 'PHHI',
        },
    ],
    controls: [
        {
            key: 81, // Q
            action: 'toggleLights',
        },
        {
            key: 69, // E
            action: 'toggleHorn',
        },
        {
            key: 97, // num1
            action: 'toggleSiren',
            index: 0,
        },
        {
            key: 98, // num2
            action: 'toggleSiren',
            index: 1,
        },
        {
            key: 99, // num3
            action: 'toggleSiren',
            index: 2,
        },
        {
            key: 100, // num4
            action: 'toggleSiren',
            index: 3,
        },
        {
            key: 101, // num5
            action: 'toggleSiren',
            index: 4,
        },
        {
            key: 102, // num6
            action: 'toggleSiren',
            index: 5,
        },
        {
            key: 103, // num7
            action: 'toggleSiren',
            index: 6,
        },
        {
            key: 104, // num8
            action: 'toggleSiren',
            index: 7,
        },
        {
            key: 105, // 9
            action: 'toggleSiren',
            index: 8,
        },
        {
            key: 96, // 0
            action: 'toggleSiren',
            index: 9,
        },
    ],
    maxFloodCount: 20,
    floodTimeout: 150,
    seats: [1, 2],
    disableRadioSelect: true,
};

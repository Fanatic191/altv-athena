import { CLOTHING_IDS, ORIENTATION, PROP_IDS } from './enums';
import { IClothingConfig } from './interfaces';

export const CLOTHING_CONFIG: IClothingConfig = {
    /**
     * Adjusting this may result in game crashing. Use with caution.
     */
    MAXIMUM_COMPONENT_VALUES: {
        // Female
        [ORIENTATION.MALE]: {
            [CLOTHING_IDS.MASKS]: 215, // Masks (01/2023)
            [CLOTHING_IDS.TORSOS]: 209, // Torsos (01/2023)
            [CLOTHING_IDS.LEGS]: 159, // Legs (01/2023)
            [CLOTHING_IDS.BAGS]: 110, // Bags (01/2023)
            [CLOTHING_IDS.SHOES]: 125, // Shoes (01/2023)
            [CLOTHING_IDS.ACCESSORIES]: 153, // Accessories (01/2023)
            [CLOTHING_IDS.UNDERSHIRTS]: 192, // Undershirts (01/2023)
            [CLOTHING_IDS.BODY_ARMOUR]: 28, // body armour (01/2023)
            [CLOTHING_IDS.TOP]: 441, // Tops / Shirts (01/2023)
        },
        // Male
        [ORIENTATION.FEMALE]: {
            [CLOTHING_IDS.MASKS]: 215, // Masks (01/2023)
            [CLOTHING_IDS.TORSOS]: 243, // Torsos (01/2023)
            [CLOTHING_IDS.LEGS]: 168, // Legs (01/2023)
            [CLOTHING_IDS.BAGS]: 110, // Bags (01/2023)
            [CLOTHING_IDS.SHOES]: 129, // Shoes (01/2023)
            [CLOTHING_IDS.ACCESSORIES]: 122, // Accessories (01/2023)
            [CLOTHING_IDS.UNDERSHIRTS]: 237, // Undershirts (01/2023)
            [CLOTHING_IDS.BODY_ARMOUR]: 33, // body armour (01/2023)
            [CLOTHING_IDS.TOP]: 472, // Tops / Shirts (01/2023)
        },
    },
    /**
     * Adjusting this may result in game crashing. Use with caution.
     */
    MAXIMUM_PROP_VALUES: {
        [ORIENTATION.FEMALE]: {
            [PROP_IDS.HATS]: 171, // Hats
            [PROP_IDS.GLASSES]: 42, // Glasses
            [PROP_IDS.EARS]: 22, // Ears
            [PROP_IDS.WATCHES]: 33, // Watches
            [PROP_IDS.BRACELETS]: 17, // Bracelets
        },
        [ORIENTATION.MALE]: {
            [PROP_IDS.HATS]: 172, // Hats
            [PROP_IDS.GLASSES]: 41, // Glasses
            [PROP_IDS.EARS]: 41, // Ears
            [PROP_IDS.WATCHES]: 44, // Watches
            [PROP_IDS.BRACELETS]: 9, // Bracelets
        },
    },
    DLC_CLOTHING: {
        // A word of warning before adding DLCs
        // The DLC order is **VERY IMPORTANT**
        // Make sure that your configuration in configs/prod, configs/dev, configs/devtest all match dlc order here.
        // Otherwise the wrong hash will be used for everything.
        // Always append to the bottom of the array. Never the top.
        [CLOTHING_IDS.MASKS]: [
            // This is the array
            // {
            //     This is the dlc name without the mp_f_ or mp_m_
            //     dlcName: 'athenaclothtest',
            //     These are the total drawables available in the dlc
            //     count: {
            //         How many female drawables are available
            //         [ORIENTATION.FEMALE]: 1,
            //         How many male drawables are available
            //         [ORIENTATION.MALE]: 1,
            //     },
            // },
        ],
        [CLOTHING_IDS.TORSOS]: [],
        [CLOTHING_IDS.LEGS]: [],
        [CLOTHING_IDS.BAGS]: [{ dlcName: 'rucksack', count: { [ORIENTATION.FEMALE]: 0, [ORIENTATION.MALE]: 3 } }],
        [CLOTHING_IDS.SHOES]: [],
        [CLOTHING_IDS.ACCESSORIES]: [],
        [CLOTHING_IDS.UNDERSHIRTS]: [],
        [CLOTHING_IDS.BODY_ARMOUR]: [],
        [CLOTHING_IDS.TOP]: [
            { dlcName: 'gpfemale', count: { [ORIENTATION.FEMALE]: 1, [ORIENTATION.MALE]: 0 } },
            { dlcName: 'addon_clothing_u', count: { [ORIENTATION.FEMALE]: 7, [ORIENTATION.MALE]: 7 } },
        ],
    },
    DLC_PROPS: {
        [PROP_IDS.HATS]: [],
        [PROP_IDS.GLASSES]: [],
        [PROP_IDS.EARS]: [],
        [PROP_IDS.WATCHES]: [],
        [PROP_IDS.BRACELETS]: [],
    },
};

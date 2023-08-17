import { PedBone } from '@AthenaShared/enums/boneIds';
import { ANIMATION_FLAGS } from '@AthenaShared/flags/animationFlags';
import { IPlantAnim } from '../interfaces/IPlantAnim';

export const PlantAnimationList: IPlantAnim[] = [
    // This should be the animation to create a pot (Index 0). DO NOT CHANGE ORDER. It uses index search!
    {
        dict: 'amb@world_human_gardener_plant@male@base',
        name: 'base',
        flag: ANIMATION_FLAGS.REPEAT,
        duration: 3000,
    },
    // This should be the animation to place a seed (Index 1). DO NOT CHANGE ORDER. It uses index search!
    {
        dict: 'amb@world_human_gardener_plant@male@base',
        name: 'base',
        flag: 49,
        duration: 3000,
        attachable: {
            bone: PedBone.IK_R_Hand,
            model: 'prop_cs_trowel',
            pos: { x: 0.1, y: 0.01, z: -0.03 },
            rot: { x: 130, y: 70, z: -5 },
        },
    },
    // This should be the animation to fertilize a plant (Index 2). DO NOT CHANGE ORDER. It uses index search!
    {
        dict: 'amb@world_human_gardener_plant@male@base',
        name: 'base',
        flag: 49,
        duration: 3000,
    },
    // This should be the animation to water a plant (Index 3). DO NOT CHANGE ORDER. It uses index search!
    {
        dict: 'amb@code_human_wander_gardener_leaf_blower@base',
        name: 'static',
        flag: ANIMATION_FLAGS.REPEAT,
        duration: 3000,
        attachable: {
            bone: PedBone.IK_R_Hand,
            model: 'prop_wateringcan',
            pos: { x: 0.4, y: 0, z: 0 },
            rot: { x: 348, y: 325, z: 0 },
        },
    },
    // This should be the animation to harvest a plant (Index 4). DO NOT CHANGE ORDER. It uses index search!
    {
        dict: 'anim@amb@business@cfm@cfm_machine_oversee@',
        name: 'button_press_operator',
        flag: ANIMATION_FLAGS.REPEAT,
        duration: 3000,
        attachable: {
            bone: PedBone.IK_R_Hand,
            model: 'v_ret_gc_scissors',
            pos: { x: 0.2, y: 0.09, z: 0.05 },
            rot: { x: -55, y: -145, z: 10 },
        },
    },
];

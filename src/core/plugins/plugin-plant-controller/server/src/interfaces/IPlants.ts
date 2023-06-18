import * as alt from 'alt-server';
import { IObject } from '@AthenaShared/interfaces/iObject';
import IAttachable from '@AthenaShared/interfaces/iAttachable';
import { Animation } from '@AthenaShared/interfaces/animation';

export interface IPlant {
    _id?: string;

    owner: string;

    data: {
        pos: alt.Vector3;
        object: IObject;
        seed: string | null;
        water: number | null;
        fertilized: boolean | null;
        duration: number | null;
        durationStart: number | null;
        outcome: string | null; // Database name of outcome.
    };
}

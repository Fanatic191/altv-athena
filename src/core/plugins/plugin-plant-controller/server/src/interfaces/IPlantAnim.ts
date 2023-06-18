import IAttachable from '@AthenaShared/interfaces/iAttachable';

export interface IPlantAnim {
    dict: string; // Animation dictionary.
    name: string; // Animation name.
    flag: number; // Animation flag.
    duration: number; // Animation duration.
    attachable?: IAttachable;
}

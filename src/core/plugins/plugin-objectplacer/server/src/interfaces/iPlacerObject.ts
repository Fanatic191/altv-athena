import { Vector3 } from 'alt-shared';

export interface IPlacerObject {
    _id?: string;
    model: string;
    pos: Vector3;
    rot: Vector3;
    dimension: number;
    owner: string;
}

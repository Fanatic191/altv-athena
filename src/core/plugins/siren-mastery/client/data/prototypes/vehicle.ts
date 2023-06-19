import { ISiren } from '../interfaces/siren';

declare module 'alt-client' {
    export interface Vehicle {
        sirens?: Array<ISiren>;
        sirenHorn: ISiren;
        sirenLights: boolean;
    }
}

import * as alt from 'alt-shared';

export function distance(vector1: alt.IVector3, vector2: alt.IVector3) {
    return distanceWithRef('ref not specified', vector1, vector2);
}

export function distanceWithRef(referenceName: string, vector1: alt.IVector3, vector2: alt.IVector3) {
    if (vector1 === undefined || vector2 === undefined) {
        throw new Error('Distance AddVector => vector1 or vector2 is undefined, reference:' + referenceName);
    }

    return Math.sqrt(
        Math.pow(vector1.x - vector2.x, 2) + Math.pow(vector1.y - vector2.y, 2) + Math.pow(vector1.z - vector2.z, 2),
    );
}

export function distance2d(vector1: alt.IVector2, vector2: alt.IVector2) {
    if (vector1 === undefined || vector2 === undefined) {
        throw new Error('Distance2d AddVector => vector1 or vector2 is undefined');
    }

    return Math.sqrt(Math.pow(vector1.x - vector2.x, 2) + Math.pow(vector1.y - vector2.y, 2));
}

export function distance2dWithRef(referenceName: string, vector1: alt.IVector2, vector2: alt.IVector2) {
    if (vector1 === undefined || vector2 === undefined) {
        throw new Error('Distance2d AddVector => vector1 or vector2 is undefined, reference:' + referenceName);
    }

    return Math.sqrt(Math.pow(vector1.x - vector2.x, 2) + Math.pow(vector1.y - vector2.y, 2));
}

export function getClosestVector(pos: alt.IVector3, arrayOfPositions: alt.IVector3[]) {
    arrayOfPositions.sort((a, b) => {
        return distanceWithRef('vector3.ts', pos, a) - distanceWithRef('vector2.ts', pos, b);
    });

    return arrayOfPositions[0];
}

export function getClosestVectorByPos<T>(pos: alt.IVector3, arrayOfPositions: T[], posVariable: string = 'pos'): T {
    arrayOfPositions.sort((a, b) => {
        return distanceWithRef('vector4.ts', pos, a[posVariable]) - distanceWithRef('vector1.ts', pos, b[posVariable]);
    });

    return arrayOfPositions[0];
}

/**
 * Gets an array of the closest types.
 * @export
 * @template T
 * @param {alt.IVector3} pos
 * @param {Array<{ pos: alt.IVector3; valid: boolean }>} elements
 * @param {number} maxDistance
 * @return {*}  {Array<T>}
 */
export function getClosestTypes<T extends { pos: alt.IVector3; valid: boolean }>(
    pos: alt.IVector3,
    elements: Array<T>,
    maxDistance: number,
    mustHaveProperties: Array<string> = [],
    positionName: string = 'pos',
): Array<T> {
    const newElements: Array<T> = [];

    for (let i = 0; i < elements.length; i++) {
        if (!elements[i] || !elements[i].valid) {
            continue;
        }

        if (mustHaveProperties.length >= 1) {
            let isValid = true;
            for (let x = 0; x < mustHaveProperties.length; x++) {
                if (!elements[i][mustHaveProperties[x]]) {
                    isValid = false;
                    break;
                }
            }

            if (!isValid) {
                continue;
            }
        }

        if (distance2d(pos, elements[i][positionName]) > maxDistance) {
            continue;
        }

        newElements.push(elements[i] as T);
    }

    return newElements;
}

export function lerp(a: number, b: number, t: number) {
    return (1 - t) * a + t * b;
}

export function vectorLerp(vector1: alt.IVector3, vector2: alt.IVector3, l: number, clamp: boolean) {
    if (clamp) {
        if (l < 0.0) {
            l = 0.0;
        }

        if (l > 0.0) {
            l = 1.0;
        }
    }

    let x = lerp(vector1.x, vector2.x, l);
    let y = lerp(vector1.y, vector2.y, l);
    let z = lerp(vector1.z, vector2.z, l);

    return { x: x, y: y, z: z };
}

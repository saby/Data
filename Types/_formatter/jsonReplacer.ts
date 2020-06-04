import {ISerializableSignature} from '../entity';

type TLink = 'link';
type TSpecial = '+inf' | '-inf' | 'undef' | 'NaN';

export interface ILinkSignature {
    '$serialized$': TLink;
    id: number;
}

export interface ISpecialSignature {
    '$serialized$': TSpecial;
    id: number;
}

export type ISignature = ISerializableSignature | ILinkSignature | ISpecialSignature;

let linksStorage = {};

function serializeLink(value: ISerializableSignature): ISerializableSignature | ILinkSignature {
    if (
        value &&
        typeof value === 'object' &&
        value.$serialized$ === 'inst' &&
        value.hasOwnProperty('id')
    ) {
        const id = value.id;
        if (linksStorage.hasOwnProperty(id)) {
            return {
                $serialized$: 'link',
                id
            };
        } else {
            linksStorage[id] = value;
        }
    }

    return value;
}

export default function jsonReplacer<T = unknown>(name: string, value: T): ISignature | T {
    let result;
    if (value as unknown === Infinity) {
        result = {
            $serialized$: '+inf'
        };
    } else if (value as unknown === -Infinity) {
        result = {
           $serialized$: '-inf'
        };
    } else if (value === undefined) {
        result = {
            $serialized$: 'undef'
        };
    } else if (Number.isNaN(value as unknown as number)) {
        result = {
            $serialized$: 'NaN'
        };
    } else {
        result = serializeLink(value as unknown as ISerializableSignature);
    }

    // Resolve links and instances at root
    if (name === '' && (!this || Object.keys(this).length === 1)) {
        linksStorage = {};
    }

    return result;
}

export default function jsonReplacer(name: string, value: any): any {
    if (value === Infinity) {
        return {
            $serialized$: '+inf'
        };
    } else if (value === -Infinity) {
        return {
            $serialized$: '-inf'
        };
    } else if (value === undefined) {
        return {
            $serialized$: 'undef'
        };
    } else if (Number.isNaN(value)) {
        return {
            $serialized$: 'NaN'
        };
    }

    return value;
}

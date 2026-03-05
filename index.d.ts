export function encodeCustomId(
    action: string,
    values?: (string | number | bigint | boolean)[]
): string;

export function decodeCustomId(encodedId: string): {
    action: string;
    values: (string | number | boolean)[];
};

export function encodeToken(value: string | number | bigint | boolean): string;
export function decodeToken(token: string): string | number | boolean;

export function encodeValue(value: string | number | bigint | boolean): string;
export function decodeValue(string: string, position?: number): { value: string | number | boolean; next: number };

export function toBase62(number: bigint): string;
export function fromBase62(string: string): bigint;

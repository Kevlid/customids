const characters = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

function toBase62(number) {
    if (number === 0n) {
        return "0";
    }
    let result = "";
    while (number > 0n) {
        result = characters[Number(number % 62n)] + result;
        number = number / 62n;
    }
    return result;
}

function fromBase62(string) {
    let result = 0n;
    for (let i = 0; i < string.length; i++) {
        result = result * 62n + BigInt(characters.indexOf(string[i]));
    }
    return result;
}

function checkIsUnsignedInteger(string) {
    if (string.length === 0) {
        return false;
    }
    for (let i = 0; i < string.length; i++) {
        if (string[i] < "0" || string[i] > "9") {
            return false;
        }
    }
    return true;
}

function getTrailingDigits(string) {
    let lastNonDigitIndex = -1;
    for (let i = 0; i < string.length; i++) {
        if (string[i] < "0" || string[i] > "9") {
            lastNonDigitIndex = i;
        }
    }
    if (lastNonDigitIndex === -1 || lastNonDigitIndex === string.length - 1) {
        return null;
    }
    const prefix = string.slice(0, lastNonDigitIndex + 1);
    const digits = string.slice(lastNonDigitIndex + 1);
    return [prefix, digits];
}

function encodeToken(value) {
    if (typeof value === "boolean") {
        if (value) {
            return "b1";
        } else {
            return "b0";
        }
    } else if (typeof value === "bigint") {
        return "n" + toBase62(value);
    } else if (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER) {
        return "n" + toBase62(BigInt(value));
    } else {
        const stringValue = String(value);
        if (checkIsUnsignedInteger(stringValue)) {
            return "n" + toBase62(BigInt(stringValue));
        } else {
            const match = getTrailingDigits(stringValue);
            if (match) {
                const prefixLengthEncoded = toBase62(BigInt(match[0].length));
                const numberEncoded = toBase62(BigInt(match[1]));
                return "m" + prefixLengthEncoded + match[0] + numberEncoded;
            } else {
                return "s" + stringValue;
            }
        }
    }
}

function decodeToken(token) {
    const tag = token[0];
    const rest = token.slice(1);
    if (tag === "b") {
        return rest === "1";
    } else if (tag === "n") {
        const number = fromBase62(rest);
        if (number > BigInt(Number.MAX_SAFE_INTEGER)) {
            return number.toString();
        } else {
            return Number(number);
        }
    } else if (tag === "m") {
        const prefixLength = Number(fromBase62(rest[0]));
        const prefix = rest.slice(1, 1 + prefixLength);
        const number = fromBase62(rest.slice(1 + prefixLength));
        return prefix + number.toString();
    } else {
        return rest;
    }
}

function encodeValue(value) {
    const token = encodeToken(value);
    return toBase62(BigInt(token.length)) + token;
}

function decodeValue(string, position = 0) {
    const length = Number(fromBase62(string[position]));
    const token = string.slice(position + 1, position + 1 + length);
    const value = decodeToken(token);
    return { value, next: position + 1 + length };
}

function encodeCustomId(values = []) {
    let customId = toBase62(BigInt(values.length));
    for (const value of values) {
        customId += encodeValue(value);
    }
    if (customId.length > 100) {
        throw new Error(`Custom ID too long: ${customId.length}/100 — "${customId}"`);
    }
    return customId;
}

function decodeCustomId(customId) {
    let position = 0;
    const valueCount = Number(fromBase62(customId[position++]));
    const values = [];
    for (let i = 0; i < valueCount; i++) {
        const result = decodeValue(customId, position);
        values.push(result.value);
        position = result.next;
    }
    return { values };
}

module.exports = {
    encodeCustomId,
    decodeCustomId,
    encodeToken,
    decodeToken,
    toBase62,
    fromBase62,
};
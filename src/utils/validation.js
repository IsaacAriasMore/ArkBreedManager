export function normalizeText(value) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");
}

export function isValidNonNegativeInteger(value) {
    return Number.isInteger(value) && value >= 0;
}

export function isPropagatorAvailable(cooldownUntil) {
    if (!cooldownUntil) return true;

    return new Date(cooldownUntil) <= new Date();
}
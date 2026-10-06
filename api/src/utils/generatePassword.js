const crypto = require('crypto');

const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%&*?';
const ALL = UPPER + LOWER + DIGITS + SYMBOLS;

function pick(charset) {
    return charset[crypto.randomInt(charset.length)];
}

function generatePassword(length = 8) {
    const chars = [
        pick(UPPER),
        pick(LOWER),
        pick(DIGITS),
        pick(SYMBOLS),
        ...Array.from({ length: length - 4 }, () => pick(ALL)),
    ];

    // Shuffle so required characters aren't always in the same positions
    for (let i = chars.length - 1; i > 0; i--) {
        const j = crypto.randomInt(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars.join('');
}

module.exports = generatePassword;

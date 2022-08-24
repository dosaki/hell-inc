module.exports = {};

module.exports.pick = (...args) => {
    if (!args.length) {
        return null;
    }
    return args[module.exports.int(0, args.length - 1)];
};

/**
 * Generate a random Integer.
 * @param { integer } min Minimum Integer in the range (inclusive)
 * @param { integer } max Maximum Integer in the range (inclusive)
 * @returns { integer }
 */
module.exports.int = (min, max) => {
    return Math.floor(Math.random() * ((max + 1) - min) + min);
};
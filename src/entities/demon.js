const { pick, int } = require('../utils/random-utils');

class Demon {
    constructor(id, n, f, mb, mc) {
        this.id = id || null;
        this.f = f || !int(0, 1); // is Female
        const na = n || (pick(..."aefgikqrtxz") +
            pick("'", "", "-") +
            pick(..."aeiou") +
            Math.random().toString(36).substring(2, 3).replace(/[0-9]*/g, '') +
            (this.f ? pick(..."ai") : pick(..."ou")));
        this.n = na[0].toUpperCase() + na.slice(1); // name
        this.mb = mb || int(85, 150) * 0.01; // misery bonus
        this.mc = mc || Math.max(1, Math.round(this.mb * 5 + Math.log(this.mb) * 50) + int(-2, 2)); // misery cost
        this.m = null; // machine being operated
    }

    clone(id) {
        return new Demon(id, this.n, this.f, this.mb, this.mc);
    }
}
export default Demon;
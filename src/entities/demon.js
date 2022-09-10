const { pick, int } = require('../utils/random-utils');

class Demon {
    constructor(id, name, hueRotation, miseryBonus, miseryCost, expertise) {
        this.id = id || null;
        this.hr = hueRotation || int(0, 380); // hue rotate
        const na = name || (pick(..."aefgikqrtxz") +
            pick("'", "") +
            pick(..."aeiou") +
            Math.random().toString(36).substring(2, 4).replace(/[0-9]*/g, '') +
            pick(..."aiou"));
        this.n = na[0].toUpperCase() + na.slice(1); // name
        this.mb = miseryBonus || int(85, 150) * 0.01; // misery bonus
        this.e = expertise || int(50, 150) * 0.01; // expertise (i.e. whether they allow the souls to withstand torture better)
        this.mc = miseryCost || Math.max(1, Math.round(((this.mb * 5 + Math.log(this.mb) * 50)+(this.e * 5 + Math.log(this.e) * 50))/2) + int(-2, 2)); // misery cost
        this.m = null; // machine that this demon is operating
    }

    clone(id) {
        return new Demon(id, this.n, this.f, this.mb, this.mc, this.e);
    }
}
export default Demon;
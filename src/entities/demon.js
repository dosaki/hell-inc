const { pick } = require('../utils/random-utils');

class Demon {
    constructor() {
        this.gender = pick("male", "female");
        this.miseryExtractionBonus = pick(1, 1, 1, 1.1, 1.2, 1.3, 1.4, 1.5);
        this.miseryCost = Math.round(this.miseryExtractionBonus * 10 + Math.log(this.miseryExtractionBonus) * 100);
        this.operatingDevice = null;
    }
}
export default Demon;
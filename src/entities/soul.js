import { int, pick } from '../utils/random-utils';

class Soul {
    constructor(id, x, z) {
        this.id = id;
        this.sin = int(-1, 10);
        this.gender = pick("male", "female");
        this.coins = Math.max(int(0, 10), 1);
        this.misery = 0;
        this.chanceOfBeingDestroyed = int(1, 5);
        this.honesty = int(1, 9);
        this.x = x;
        this.z = z;
    }
}

export default Soul;
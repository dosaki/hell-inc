import { int, pick } from '../utils/random-utils';

class Soul {
    constructor() {
        this.sin = int(-1, 10);
        this.gender = pick("male", "female");
        this.coins = Math.min(int(0, 10), 1);
        this.misery = 0;
        this.chanceOfBeingDestroyed = int(1, 5);
        this.honesty = int(1, 9);
    }
}

export default Soul;
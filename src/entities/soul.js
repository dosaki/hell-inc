import { int, pick } from '../utils/random-utils';

class Soul {
    constructor(id, x, z) {
        this.id = id;
        this._s = int(0, 10); //sin
        this.c = int(0, 5); // coins
        this.m = 0; // misery
        this.cod = int(5, 35); // chance of being destroyed
        this.h = int(0, 10 - this._s); // honesty - influences how much they report the level of sin
        this.x = x;
        this.z = z;
        this.s = Math.round((this._s * this.h + int(0, 10) * (10 - this.h)) * 0.05); // sin filtered by honesty 
        this.a = false; // accepted
        this.g = null; // goal
        this.lg = 0; // last selected a goal
        this.p = []; // path to goal
        this.d = false; // is dead
        this.im = false; // is moving
    }

    /**
     * Suffer
     * @param {*} misery 
     */
    su(misery) {
        if (!this.d) {
            this.m += Math.floor(misery + (10 - this._s) * 0.2);
            this.d = int(0, 100) < (this.cod + this.m * 0.1);
        }
    }

    /**
     * Find Goal
     * @param {*} machines 
     */
     fg(machines) {
        if (new Date().getTime() - this.lg >= 5000) {
            if (!this.g && this.m < 10) {
                this.g = pick(...machines.filter(m => (!m.m.nd || m.m.do) && m.m.t !== "plane" && m.m.n !== "Misery Extractor" && !m.m.s));
            }
            if (this.m >= 10) {
                if (this.g) {
                    this.g.m.s = null;
                }
                this.g = pick(...machines.filter(m => (!m.m.nd || m.m.do) && m.m.n === "Misery Extractor" && !m.m.s));
            }
            this.lg = new Date().getTime();
        }
    }

    get desch() { // honesty description
        return ["They",
        this.h < 3 ? "seem dishonest" :
            this.h < 5 ? "seem a bit dishonest" :
                this.h < 7 ? "seem honest enough" :
                    "seem honest"].join(" ");
    }

    get descs() { // soul strength description
        return this.cod < 7 ? "and strong willed" :
            this.cod < 15 ? "and sturdy" :
                this.cod < 25 ? "and sensitive" :
                    "and very weak";
    }
}

export default Soul;
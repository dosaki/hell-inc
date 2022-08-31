import { int, pick } from '../utils/random-utils';
import resources from './resources';

class Soul {
    constructor(id, x, z) {
        this.id = id;
        this._s = int(0, 10); //sin
        this.c = int(0, 5); // coins
        this.m = 0; // misery
        this.cod = int(0, 35); // chance of being destroyed
        this.h = int(0, 10 - this._s); // honesty - influences how much they report the level of sin
        this.x = x;
        this.z = z;
        this.s = this.h < 2 || pick(0, 1) ? this._s : Math.round((this._s * this.h + int(0, 10) * (10 - this.h)) * 0.05); // sin filtered by honesty 
        this.a = false; // accepted
        this.g = null; // goal
        this.lg = 0; // last selected a goal
        this.p = []; // path to goal
        this.d = false; // is dead
        this.im = false; // is moving
        this.om = 0; // old misery
        this.mlc = 0; // misery last changed
    }

    get md() {
        return 1 + (10 * this._s * 0.5);
    }

    u() {
        this.mlc = this.om !== this.m ? 0 : this.mlc + 1;
        // console.log(this.mlc);
        this.d = this.mlc > 30;
        resources.ds += this.d ? 1 : 0;
    }

    /**
     * Suffer
     * @param {*} misery 
     */
    su(misery, demonExpertise) {
        if (!this.d) {
            this.om = this.m;
            this.m = Math.min(this.md, this.m + Math.floor(misery + (10 - this._s) * 0.2));
            this.d = int(0, 1500 * demonExpertise) < this.cod;
            resources.ds += this.d ? 1 : 0;
        }
    }

    /**
     * Find Goal
     * @param {*} machines 
     */
    fg(machines) {
        if (new Date().getTime() - this.lg >= 5000) {
            // console.log("finding goal...");
            if (!this.g && this.m < 10) {
                // console.log(this.id, "Finding new goal...");
                this.g = pick(...machines.filter(m => (!m.m.nd || m.m.do) && m.m.t !== "plane" && m.m.n !== "Misery Extractor" && !m.m.s));
            }
            if (this.m >= (10 * this._s * 0.5)) {
                // console.log(this.id, "Finding Extractor...");
                if (this.g && this.g.m.n !== "Misery Extractor") {
                    this.g.m.s = null;
                }
                this.g = pick(...machines.filter(m => (!m.m.nd || m.m.do) && m.m.n === "Misery Extractor" && !m.m.s));
            }
            // console.log(this.g);
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
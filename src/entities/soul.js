import { Note } from '../utils/audio-utils';
import { int, pick } from '../utils/random-utils';
import resources from './resources';

const sinList = [
    "Abandoned their pet",
    "Blocked anti-climate-change law",
    "Looks innocent",
    "Micromanaged their reports",
    "Sent soldiers to their deaths",
    "Sins were too horrific to describe",
    "Sold snake-oil",
    "Used a newline before {",
    "Was a dictator",
    "Was a murderer",
    "Was a thief",
    "Was too greedy",
]
class Soul {
    constructor(id, x, z) {
        this.id = id;
        this._s = int(0, 10); //sin
        this.sd = this._s ? sinList[0] : pick(...sinList); // sin description
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
        this._d = false; // is dead
        this.im = false; // is moving
        this.om = 0; // old misery
        this.mlc = 0; // misery last changed
        this.rm = !int(0, 20) && this._s ? int(3, 6) : 0; // requires specific machine
    }

    get d() {
        return this._d;
    }

    set d(value) {
        if (value !== this._d) {
            setTimeout(() => {
                Note.new("b", 3, 0.5).play(0.5);
                setTimeout(() => {
                    Note.new("b", 2, 0.3).play(0.5);
                }, 200);
            }, 0);
            this._d = value;
        }
    }

    get md() {
        return 1 + (10 * this._s * 0.5);
    }

    u(isTutorial) {
        if (isTutorial) {
            return;
        }
        this.mlc = this.om !== this.m ? 0 : this.mlc + 1;
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
            if (!this.g && this.m < 10) {
                this.g = pick(...machines.filter(m => (!m.m.nd || m.m.do) && m.m.t !== "plane" && m.m.n !== "Misery Extractor" && !m.m.s && (!this.rm || this.rm && m.m.n === resources.ml[this.rm].n)));
            }
            if (this.m >= (10 * this._s * 0.5)) {
                if (this.g && this.g.m.n !== "Misery Extractor") {
                    this.g.m.s = null;
                }
                this.g = pick(...machines.filter(m => (!m.m.nd || m.m.do) && m.m.n === "Misery Extractor" && !m.m.s));
            }
            this.lg = new Date().getTime();
        }
    }

    get desc() {
        const honestyDescription = this.h < 3 ? "seem dishonest" :
            this.h < 5 ? "seem a bit dishonest" :
                this.h < 7 ? "seem honest enough" :
                    "seem honest";
        const strengthDescription = this.cod < 7 ? "and strong willed" :
            this.cod < 15 ? "and sturdy" :
                this.cod < 25 ? "and sensitive" :
                    "and very weak";
        return ["They " + honestyDescription,
            strengthDescription].join("\n");
    }
}

export default Soul;
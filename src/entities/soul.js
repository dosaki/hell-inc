import { int, pick } from '../utils/random-utils';

class Soul {
    constructor(id, x, z) {
        this.id = id;
        this._sin = int(0, 10);
        this.gender = pick("male", "female");
        this.colour = pick("#ffff00", "#ff00ff", "#00ffff", "#ff0000", "#00ff00", "#0000ff");
        this.coins = int(0, 5);
        this.misery = 0;
        this.chanceOfBeingDestroyed = int(10, 50);
        this.honesty = int(0, 10 - this._sin); //influences how much they report the level of sin
        this.x = x;
        this.z = z;
        this.sin = Math.round((this._sin * this.honesty + int(0, 10) * (10 - this.honesty)) * 0.05);
        this.accepted = false;
        this.goal = null;
        this.lastSelectedAGoal = 0;
        this.path = [];
        console.log(`_sin: ${this._sin}, honesty: ${this.honesty}, sin: ${this.sin}`);
    }

    shouldDie() {
        return int(0, 100) < (this.chanceOfBeingDestroyed + this.misery * 0.5);
    }

    suffer(misery) {
        this.misery += misery + (10 - this._sin) * 0.05;
        console.log("Suffering...", this.misery)
        return this.shouldDie();
    }

    findGoal(machines) {
        if (new Date().getTime() - this.lastSelectedAGoal >= 5000) {
            if (!this.goal && this.misery < 10) {
                this.goal = pick(...machines.filter(m => m.m.isFunctional && m.m.type !== "plane" && m.m.name !== "Misery Extractor" && !m.m.soul));
            }
            if (this.misery >= 10) {
                if(this.goal){
                    this.goal.m.soul = null;
                }
                this.goal = pick(...machines.filter(m => m.m.isFunctional && m.m.name === "Misery Extractor" && !m.m.soul));
            }
            this.lastSelectedAGoal = new Date().getTime();
        }
    }

    get honestyDesc() {
        return [this.gender === "male" ? 'He' : 'She',
        this.honesty < 3 ? "seems dishonest" :
            this.honesty < 5 ? "seems a bit dishonest" :
                this.honesty < 7 ? "seems honest enough" :
                    "seems honest"].join(" ");
    }

    get strDesc() {
        return this.chanceOfBeingDestroyed < 15 ? "and strong willed" :
            this.chanceOfBeingDestroyed < 25 ? "and sturdy" :
                this.chanceOfBeingDestroyed < 38 ? "and sensitive" :
                    "and very weak";
    }
}

export default Soul;
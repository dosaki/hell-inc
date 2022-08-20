import Demon from './demon';
import Machine from './machine';

class Resources {
    constructor() {
        this.misery = 0;
        this.coins = 0;
        this.soulsAccepted = 0;
        this.soulsExtracted = 0;
        this.demonsToHire = [new Demon(), new Demon(), new Demon(), new Demon()];
        this.machines = [
            new Machine("Path", 3, false, 0, 1, "#ffffcc", "plane", 1, 1),
            new Machine("Misery Extractor", 5, true, 2, 1, "#4466aa", "cube", 3, 3, 5),
            new Machine("Dispair Room", 10, false, 1, 1, "#440099", "cube", 5, 5, 8),
            new Machine("Iron Maiden", 25, true, 5, 2, "#886666", "cube", 2, 1, 2),
            new Machine("Human Puzzle", 50, true, 20, 3, "#448811", "cube", 2, 2, 1),
            new Machine("Masticator", 100, true, 50, 4, "#881144", "cube", 2, 2, 3),
            new Machine("JS Dev Terminal", 200, true, 100, 5, "#221111", "cube", 1, 1, 2)
        ];
    }

    get currentLevel() {
        return Math.floor(Math.sqrt(this.soulsExtracted + 15) / Math.sqrt(10));
    }

    get activeMachines() {
        return this.machines.filter(m => m.requiredLevel <= this.currentLevel);
    }

    reset() {
        this.misery = 0;
        this.coins = 0;
        this.soulsAccepted = 0;
        this.soulsExtracted = 0;
        this.demonsToHire = [new Demon(), new Demon(), new Demon(), new Demon()];
        this.machines = [];
    }
    refreshDemons() {
        this.demonsToHire = [new Demon(), new Demon(), new Demon(), new Demon()];
    }

    addNewDemon() {
        this.demonsToHire = [...this.demonsToHire.slice(1), new Demon()];
    }
}
let resources = new Resources();
export default resources;
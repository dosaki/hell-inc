import Demon from './demon';
import Machine from './machine';

class Resources {
    constructor() {
        this.m = 5; // misery
        this.c = 6000; // coins
        this.sa = 0; // souls accepted
        this.sd = 0; // souls declined
        this.se = 0; // souls extracted
        this.ds = 0; // dead souls
        this.dl = [new Demon(null, null, null, 0.85), new Demon(), new Demon(), new Demon()]; // demons to hire list
        this.ml = [ // machines list
            new Machine("Path", 3, false, 0, 1, bimg, "plane", 1, 1),
            new Machine("Misery Extractor", 5, true, 0, 1, "#4466aa", "cube", 3, 3, 5),
            new Machine("Dispair Room", 10, false, 1, 1, "#440099", "cube", 5, 5, 8),
            new Machine("Iron Maiden", 25, true, 2, 2, "#886666", "cube", 1, 1, 2),
            new Machine("Cauldron", 50, true, 3, 3, "#448811", "cube", 3, 3, 1),
            new Machine("Blender", 100, true, 4, 4, "#881144", "cube", 1, 1, 5),
            new Machine("Javascript Terminal", 150, false, 5, 5, "#221111", "cube", 1, 1, 2)
        ];
    }

    get l() { // level
        return 20;//Math.floor(Math.sqrt(this.se + 15) / Math.sqrt(10));
    }
}
let resources = new Resources();
export default resources;
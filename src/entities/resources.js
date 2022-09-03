import { createPerlinImage } from '../utils/perlin';
import Demon from './demon';
import Machine from './machine';

class Resources {
    constructor() {
        this.m = 10; // misery
        this.c = 20; // coins
        this.sa = 0; // souls accepted
        this.sd = 0; // souls declined
        this.se = 0; // souls extracted
        this.ds = 0; // dead souls
        this.dl = [new Demon(null, null, null, 0.85), new Demon(), new Demon(), new Demon()]; // demons to hire list
        this.ml = [ // machines list
            new Machine("Path", 1, false, 0, 1, createPerlinImage(4, [0, 1, 2]), "plane", 1, 1),
            new Machine("Misery Extractor", 5, true, 0, 1, createPerlinImage(4, [1, 2]), "cube", 3, 3, 5),
            new Machine("Dispair Room", 10, false, 1, 1, createPerlinImage(8, [0, 2]), "cube", 5, 5, 8),
            new Machine("Iron Maiden", 25, true, 2, 2, createPerlinImage(2, [0, 1]), "cube", 1, 1, 2),
            new Machine("Cauldron", 50, true, 3, 3, createPerlinImage(4, [1]), "cube", 3, 3, 1),
            new Machine("Blender", 100, true, 4, 4, createPerlinImage(4, [2]), "cube", 1, 1, 5),
            new Machine("Javascript Terminal", 150, false, 5, 5, createPerlinImage(2, []), "cube", 1, 1, 2)
        ];
    }

    get l() { // level
        return Math.floor(Math.sqrt(this.se + 15) / Math.sqrt(10));
    }

    get md() { //maximum destroyed souls
        return Math.floor(10 + 40 * (this.l / 20));
    }
}
let resources = new Resources();
export default resources;
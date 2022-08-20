import { int, pick } from '../utils/random-utils';

class Map {
    constructor(s, h, t, w) {
        this.s = s;
        this.bi = 0;
        this.m = [];
        this.mi = 0;
        this.w = w;

        this.map = [...new Array(s)].map((_, j) => [...new Array(s)].map((_, i) => {
            if (!i) {
                return { h, t: pick(...t), o: null };
            }
            if (j === s - 1) {
                return { h, t: pick(...t), o: null };
            }
            if (j === 0 && [(this.s / 2) + 1, this.s / 2, (this.s / 2) - 1].includes(i)) {
                return { h: 0, t: pick(...t), o: true };
            }
            if (i === s - 1) {
                return { h: 2, t: pick(...t), o: null };
            }
            if (!j) {
                return { h: 2, t: pick(...t), o: null };
            }
            return { h: 0, t: pick(...t), o: null };
        }));
    }

    isAreaOccupied(x, y, width, depth) {
        if (x - Math.floor(width / 2) === 0 || x + Math.floor(width / 2) === this.s - 1 || y - Math.floor(depth / 2) === 0 || y + Math.floor(depth / 2) === this.s - 1) {
            return true;
        }
        for (let j = y - Math.floor(depth / 2); j <= y + Math.floor(depth / 2); j++) {
            for (let i = x - Math.floor(width / 2); i <= x + Math.floor(width / 2); i++) {
                if (!this.map[j] || !this.map[j][i] || this.map[j][i].o) {
                    return true;
                }
            }
        }
        return false;
    }

    addToArea(x, y, width, depth, m) {
        for (let j = y - Math.floor(depth / 2); j <= y + Math.floor(depth / 2); j++) {
            for (let i = x - Math.floor(width / 2); i <= x + Math.floor(width / 2); i++) {
                this.map[j][i].o = m;
            }
        }
    }

    doClicks(selectedItem, x, y, inMapArea, isDragging, startX, startY) {
        this.w.delete("placement");
        if (!inMapArea) {
            return;
        }
        if (isDragging && selectedItem && selectedItem.type === "plane") {
            for (let j = Math.min(y, startY); j <= Math.max(y, startY); j++) {
                for (let i = Math.min(x, startX); i <= Math.max(x, startX); i++) {
                    this.doClicks(selectedItem, i, j, inMapArea);
                }
            }
            return;
        }

        if (selectedItem && !this.isAreaOccupied(x, y, selectedItem.width, selectedItem.depth)) {
            const m = selectedItem.clone(this.mi);
            this.m.push({ m, x, y });
            this.addToArea(x, y, selectedItem.width, selectedItem.depth, m);
            this.mi++;
            let opts = {
                n: `b-${this.mi}`,
                x,
                y: selectedItem.height / 2,
                d: selectedItem.depth, w: selectedItem.width, h: selectedItem.height,
                z: y
            };
            selectedItem.colour[0] === '#' ? opts["b"] = selectedItem.colour : opts["t"] = pick(...selectedItem.colour);
            if (selectedItem.type === "cube") {
                this.w["cube"](opts);
            }
            if (selectedItem.type === "plane") {
                opts["y"] = 0;
                opts["h"] = 0.1;
                opts["b"] = "#00000000"
                opts["mix"] = "0.25"
                this.w["cube"](opts);
            }
        }
    }

    doRightClicks() {
        this.w.delete("placement");
    }

    doHovers(selectedItem, x, z, inMapArea, isDragging, startX, startZ) {
        if (selectedItem && inMapArea) {
            if (selectedItem.type === "cube") {
                this.w["cube"]({
                    n: "placement",
                    x,
                    y: selectedItem.height / 2,
                    z,
                    d: selectedItem.depth,
                    w: selectedItem.width,
                    h: selectedItem.height,
                    b: this.isAreaOccupied(x, z, selectedItem.width, selectedItem.depth) ? "#ff000060" : "#aaaa0050"
                });
            }
            if (selectedItem.type === "plane") {
                this.w["cube"]({
                    n: "placement",
                    x: isDragging ? ((x < startX ? startX : x) - Math.abs(x - startX) / 2) : x,
                    y: 0,
                    z: isDragging ? ((z < startZ ? startZ : z) - Math.abs(z - startZ) / 2) : z,
                    w: isDragging ? Math.floor(x < startX ? startX - x : x - startX) + selectedItem.width : selectedItem.width,
                    d: isDragging ? Math.floor(z < startZ ? startZ - z : z - startZ) + selectedItem.width : selectedItem.width,
                    h: 0.1,
                    b: this.isAreaOccupied(x, z, selectedItem.width, selectedItem.depth) && !isDragging ? "#ff000060" : "#aaaa0050"
                });
            }
        }
    }

    removeMachine(id) {
        this.m.filter(m => m.m.id !== id);
    }

    drawMap(scale) {
        for (let j = 0; j < this.map.length; j++) {
            for (let i = 0; i < this.map[j].length; i++) {
                if (!this.map[j][i].h) {
                    this.w.plane({ g: "map", x: i * scale, y: 0, z: j * scale, size: scale, t: this.map[j][i].t, rx: -90 });
                } else {
                    this.w.cube({
                        g: "map", x: i * scale, y: (this.map[j][i].h / 2) * scale, z: j * scale,
                        h: this.map[j][i].h * scale,
                        w: scale, d: scale, t: this.map[j][i].t
                    });
                }
            }
        }
    };
}

export default Map;
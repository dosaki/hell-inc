import { astar, Graph } from '../utils/astar';
import { int, pick } from '../utils/random-utils';
import resources from './resources';
import Soul from './soul';

class Map {
    constructor(s, h, w) {
        this.s = s; //size
        this.m = []; //machines
        this.mi = 0; //machine id iterator
        this.sl = []; //soul list
        this.is = []; //idle souls (waiting for approval)
        this.sli = 0; //soul id iterator
        this.w = w; // w lib

        this.map = [...new Array(s)].map((_, j) => [...new Array(s)].map((_, i) => {
            if (!i) {
                return { h, t: hell1, r: pick(0, 90, 180, 270), b: pick("#661111", "#441111", "#330000"), o: null };
            }
            if (j === s - 1) {
                return { h, t: hell1, r: pick(0, 90, 180, 270), b: pick("#661111", "#441111", "#330000"), o: null };
            }
            if (j < 4 && [(this.s / 2) + 1, this.s / 2, (this.s / 2) - 1].includes(i)) {
                return { h: 0, t: bones1, r: pick(0, 90, 180, 270), b: "#aa3300", o: true };
            }
            if (i === s - 1) {
                return { h: 2, t: hell1, r: pick(0, 90, 180, 270), b: pick("#661111", "#441111", "#330000"), o: null };
            }
            if (!j) {
                return { h: 2, t: hell1, r: pick(0, 90, 180, 270), b: pick("#661111", "#441111", "#330000"), o: null };
            }
            return { h: 0, t: hell1, r: pick(0, 90, 180, 270), b: pick("#661111", "#441111", "#330000"), o: null };
        }));

        this.graph = new Graph(this.map.map(col => col.map(c => !c.o ? 999 : (c.o.name === "Path" ? 1 : 25))));
    }

    freeSoulSpot() {
        return [
            [(this.s / 2) + 1, 2],
            [(this.s / 2) - 1, 2],
            [(this.s / 2), 1]
        ].find(([x, z]) => !this.is.find(s => s.x === x && s.z === z));
    }

    spawnSoul() {
        if (this.is.length < 3) {
            const [x, z] = this.freeSoulSpot();
            const s = new Soul(this.sli, x, z);
            console.log(`Spawning soul ${s.id} at (${s.x},${s.z})`);
            this.sl.push(s);
            this.is.push(s);
            this.sli++;

            this.w.plane({ n: `s-${s.id}`, x: s.x, y: 1, z: s.z, h: 2, w: 1, ry: 135, t: soul });
        }
    }

    updateMachines() {
        this.m.forEach(i => i.m.updateSouls());
    }

    moveSouls() {
        this.sl.forEach(s => {
            if (s.accepted) {
                s.findGoal(this.m);
                if (s.goal && s.goal.m.soul && s.goal.m.soul !== s) {
                    s.goal = null;
                }
                if (s.goal && !s.isMoving && s.path.length === 0) {
                    s.path = astar.search(this.graph, this.graph.get(s.x, s.z), this.graph.get(s.goal.x, s.goal.z));
                    console.log(s.path);
                }
                if (!s.isMoving && s.path.length > 0) {
                    this.w.move({
                        n: `s-${s.id}`,
                        x: s.path[0].x,
                        z: s.path[0].y,
                        a: 100,
                    });
                    s.isMoving = true;
                    setTimeout(() => {
                        s.x = s.path[0].x;
                        s.z = s.path[0].y;
                        s.path = s.path.slice(1);
                        s.isMoving = false;
                        if (s.path.length === 0 && s.goal) {
                            s.goal.m.soul = s;
                            s.goal = null;
                        }
                    }, 100);
                }
            }
        });
    }

    animateSouls(offset) {
        this.sl.forEach((s, i) => {
            if (!s.markedForDeletion) {
                this.w.move({ n: `s-${s.id}`, y: 1 + offset, a: 250 }, (i % 5) * 100);
            }
        });
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

        this.graph = new Graph(this.map.map(col => col.map(c => !c.o ? 999 : (c.o.name === "Path" ? 1 : 25))));
    }

    doClicks(selectedItem, x, z, inMapArea, isDragging, startX, startZ, mX, mY) {
        this.w.delete("placement");
        if (!inMapArea) {
            return;
        }
        if (isDragging && selectedItem && selectedItem.type === "plane") {
            for (let j = Math.min(z, startZ); j <= Math.max(z, startZ); j++) {
                for (let i = Math.min(x, startX); i <= Math.max(x, startX); i++) {
                    this.doClicks(selectedItem, i, j, inMapArea);
                }
            }
            return;
        }

        if (selectedItem && !this.isAreaOccupied(x, z, selectedItem.width, selectedItem.depth)) {
            const m = selectedItem.clone(this.mi);
            this.m.push({ m, x, z });
            this.addToArea(x, z, selectedItem.width, selectedItem.depth, m);
            this.mi++;
            let opts = {
                n: `b-${this.mi}`,
                x,
                y: selectedItem.height / 2,
                d: selectedItem.depth, w: selectedItem.width, h: selectedItem.height,
                z
            };
            selectedItem.colour[0] === '#' ? opts["b"] = selectedItem.colour : opts["t"] = selectedItem.colour;
            if (selectedItem.type === "cube") {
                this.w["cube"](opts);
            }
            if (selectedItem.type === "plane") {
                opts["y"] = 0;
                opts["h"] = 0.1;
                opts["b"] = "#00000000";
                opts["mix"] = int(10, 15) / 40;
                opts["ry"] = pick(0, 90, 180, 270);
                this.w["cube"](opts);
            }
        }

        if (!selectedItem) {
            const s = this.sl.find(s => s.x === x && s.z === z);
            return s ? {
                removeOthers: true,
                popup: (ctx, ui, r) => {
                    ctx.fillStyle = '#331111dd';
                    ctx.strokeStyle = '#774444';
                    ctx.fillRect(mX, mY - r(110), r(200), r(100));
                    ctx.strokeRect(mX, mY - r(110), r(200), r(100));


                    ctx.fillStyle = '#ffffff';
                    ctx.font = `${r(10)}px luminari, fantasy`;
                    ctx.fillText("Sin", mX + 10, mY - r(90));
                    ctx.fillStyle = '#ffffff60';
                    ctx.fillRect(mX + 10, mY - r(80), r(12), r(60));
                    ctx.fillStyle = '#ff0000';
                    ctx.fillRect(mX + 10, mY - r(80 - (60 - (s.sin * 6))), r(12), r(s.sin * 6)); //(sin * meterHeight) / maxSin
                    ctx.strokeRect(mX + 10, mY - r(80), r(12), r(60));

                    ctx.fillStyle = '#ffffff';
                    ctx.fillText("Mis", mX + 32, mY - r(90));
                    ctx.fillStyle = '#ffffff60';
                    ctx.fillRect(mX + 32, mY - r(80), r(12), r(60));
                    ctx.fillStyle = '#8800ff';
                    ctx.fillRect(mX + 32, mY - r(80 - (60 - (s.misery * 6))), r(12), r(s.misery * 6)); //(sin * meterHeight) / maxSin
                    ctx.strokeRect(mX + 32, mY - r(80), r(12), r(60));

                    ctx.font = `${r(12)}px luminari, fantasy`;
                    ctx.fillStyle = '#ffffff';
                    ctx.fillText(s.honestyDesc, mX + 54, mY - r(70));
                    ctx.fillText(s.strDesc, mX + 54, mY - r(55));

                    ctx.fillStyle = ui.coordinatesMatchItem([mX + r(200 - 60), mY - r(40), r(20), r(20)], ui.x, ui.y) ? '#ff2222' : '#dd1111';
                    ctx.fillRect(mX + r(200 - 60), mY - r(40), r(20), r(20));
                    ctx.strokeRect(mX + r(200 - 60), mY - r(40), r(20), r(20));

                    ctx.fillStyle = ui.coordinatesMatchItem([mX + r(200 - 30), mY - r(40), r(20), r(20)], ui.x, ui.y) ? '#22ff22' : '#11dd11';
                    ctx.fillRect(mX + r(200 - 30), mY - r(40), r(20), r(20));
                    ctx.strokeRect(mX + r(200 - 30), mY - r(40), r(20), r(20));

                    if (this.is.includes(s) && !s.accepted) {
                        const decbtn = {
                            type: "soul-btn",
                            belongsTo: `s-${s.id}`,
                            pos: [mX + r(200 - 60), mY - r(40), r(20), r(20)],
                            onClick: (x, y) => {
                                setTimeout(() => {
                                    this.is = this.is.filter(i => i !== s);
                                    this.sl = this.sl.filter(i => i !== s);
                                    this.w.delete(`s-${s.id}`, 100);
                                }, 1000);
                                s.markedForDeletion = true;
                            }
                        };
                        const accbtn = {
                            type: "soul-btn",
                            belongsTo: `s-${s.id}`,
                            pos: [mX + r(200 - 30), mY - r(40), r(20), r(20)],
                            onClick: (x, y) => {
                                this.is = this.is.filter(i => i.id !== s.id);
                                s.z = 3;
                                this.w.move({ n: `s-${s.id}`, z: 3, a: 250 });
                                s.accepted = true;
                                resources.soulsAccepted++;
                                console.log("Accepting soul...");
                            }
                        };
                        if (ui.worldItems.filter(i => i.type === "soul-btn").length === 0) {
                            ui.worldItems.push(decbtn);
                            ui.worldItems.push(accbtn);
                        } else if (ui.worldItems.filter(i => i.type === "soul-btn" && i.belongsTo !== `s-${s.id}`).length > 0) {
                            ui.worldItems = ui.worldItems.filter(i => i.type !== "soul-btn");
                        }
                    }
                }
            } : { removeOthers: true };
        }
        return;
    }

    doRightClicks() {
        this.w.delete("placement");
    }

    doHovers(selectedItem, x, z, inMapArea, isDragging, startX, startZ) {
        if (inMapArea) {
            if (selectedItem && selectedItem.type === "cube") {
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
            if (selectedItem && selectedItem.type === "plane") {
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
            if (!selectedItem) {
                this.w["cube"]({
                    n: "selector",
                    x,
                    y: 0,
                    z,
                    w: this.scale,
                    d: this.scale,
                    h: 0.1,
                    t: selector
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
                    this.w.plane({
                        g: "map",
                        x: i * scale,
                        y: 0,
                        z: j * scale,
                        size: scale,
                        t: this.map[j][i].t,
                        b: this.map[j][i].b,
                        mix: int(3, 7) / 10,
                        rx: -90,
                        ry: this.map[j][i].r
                    });
                } else {
                    this.w.cube({
                        g: "map",
                        x: i * scale,
                        y: (this.map[j][i].h / 2) * scale,
                        z: j * scale,
                        h: this.map[j][i].h * scale,
                        w: scale,
                        d: scale,
                        t: this.map[j][i].t,
                        b: this.map[j][i].b,
                        mix: int(3, 7) / 10,
                        ry: this.map[j][i].r
                    });
                }
            }
        }
    };
}

export default Map;
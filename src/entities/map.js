import { astar, Graph } from '../utils/astar';
import { Note } from '../utils/audio-utils';
import { int, pick } from '../utils/random-utils';
import Demon from './demon';
import resources from './resources';
import Soul from './soul';

class Map {
    constructor(s, h, w) {
        this.s = s; //size
        this.m = []; //machines
        this.mi = 1; //machine id iterator
        this.dl = []; //demon list
        this.dli = 1; //demon id iterator
        this.sl = []; //soul list
        this.is = []; //idle souls (waiting for approval)
        this.sli = 1; //soul id iterator
        this.w = w; // w lib
        this.mcc = []; // machines with changed colour
        this.h = h; // max height

        this.map = [...new Array(s)].map((_, j) => [...new Array(s)].map((_, i) => {
            if (j < 4 && [(this.s / 2) + 1, this.s / 2, (this.s / 2) - 1].includes(i)) {
                return { h: 0, t: bimg, r: pick(0, 90, 180, 270), b: "#aa3300", o: true };
            }
            if (i === s - 1) {
                return { h, t: himg, r: pick(0, 90, 180, 270), b: pick("#661111", "#441111", "#330000"), o: null };
            }
            if (!j) {
                return { h, t: himg, r: pick(0, 90, 180, 270), b: pick("#661111", "#441111", "#330000"), o: null };
            }
            if (!i) {
                return { h: 2, t: himg, r: pick(0, 90, 180, 270), b: pick("#661111", "#441111", "#330000"), o: null };
            }
            if (j === s - 1) {
                return { h: 2, t: himg, r: pick(0, 90, 180, 270), b: pick("#661111", "#441111", "#330000"), o: null };
            }
            return { h: 0, t: himg, r: pick(0, 90, 180, 270), b: pick("#661111", "#441111", "#330000"), o: null };
        }));

        this.graph = new Graph(this.map.map(col => col.map(c => !c.o ? 999 : (c.o.n === "Path" ? 1 : 25))));
    }

    freeSoulSpot(preChoice) {
        const spots = [
            [(this.s / 2) + 1, 2],
            [(this.s / 2) - 1, 2],
            [(this.s / 2), 1]
        ].filter(([x, z]) => !this.is.find(s => s.x === x && s.z === z));
        return preChoice === null ? pick(...spots) : spots[preChoice];
    }

    spawnSoul(isTutorial, spotChoice) {
        if (this.is.length < 3) {
            const [x, z] = this.freeSoulSpot(isTutorial ? spotChoice : null);
            const s = new Soul(this.sli, x, z);
            if (isTutorial) {
                s._s = 9;
                s.h = 4;
                s.c = 2;
                s.cod = 0;
                // console.log(s);
            }
            this.sl.push(s);
            this.is.push(s);
            this.sli++;

            this.w.plane({ n: `s-${s.id}`, x: s.x, y: 1, z: s.z, h: 2, w: 1, ry: -45, t: simg });
        }
    }

    updateMachines() {
        this.m.forEach(i => {
            const result = i.m.ups();
            if (result && result.extracted) {
                resources.m = result.extracted;
            }
        });
    }

    /**
     * Update Souls
     */
    ups() {
        this.sl.forEach((s, i) => {
            if (s.a && !s.d) {
                s.fg(this.m);
                if (s.g && s.g.m.s && s.g.m.s !== s) {
                    s.g = null;
                    s.p = astar.s(this.graph, this.graph.g[s.z][s.x], this.graph.g[int(1, this.s - 2), int(1, this.s - 2)]);
                }
                if (s.g && !s.im && s.p.length === 0) {
                    s.p = astar.s(this.graph, this.graph.g[s.z][s.x], this.graph.g[s.g.z][s.g.x]);
                    // console.log(s.p, this.graph.g[s.z][s.x], this.graph.g[s.g.z][s.g.x]);
                }
                if (!s.im && s.p.length > 0) {
                    this.w.move({
                        n: `s-${s.id}`,
                        x: s.p[0].x,
                        z: s.p[0].y,
                        a: s.p[0].w === 999 ? 500 : 100,
                    });
                    s.im = true;
                    setTimeout(() => {
                        if (s.p && s.p.length > 0) {
                            s.x = s.p[0].x;
                            s.z = s.p[0].y;
                            s.p = s.p.slice(1);
                            s.im = false;
                            if (s.p.length === 0 && s.g) {
                                s.g.m.s = s;
                            }
                        }
                    }, s.p[0].w === 999 ? 500 : 100);
                }
            }
            if (s.d) {
                if (s.g && s.g.m && s.g.m.s === s) {
                    s.g.m.s = null;
                    s.g = null;
                }
                setTimeout(() => {
                    this.w.delete(`s-${s.id}`);
                }, 500);
            }
        });
        this.sl = this.sl.filter(s => !s.d);
        this.m.forEach(m => {
            if (m.m && m.m.s && m.m.s.d) {
                m.m.s = null;
            }
        });
    }

    anim(offset) {
        this.sl.forEach((s, i) => {
            if (!s.d) {
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
                if (m.t !== "plane") {
                    this.w.move({ n: `${j - 1}-${i - 1}`, b: "#000000", mix: 0.5 });
                }
            }
        }
        if (m.t !== "plane") {
            this.w.move({ n: `${y + Math.floor(depth / 2)}-${x - (Math.floor(width / 2) + 1)}`, b: "#000000", mix: 0.5 });
            this.w.move({ n: `${y - Math.floor(depth / 2)}-${x}`, b: "#000000", mix: 0.5 });
            this.w.move({ n: `${y - 1}-${x}`, b: "#000000", mix: 0.5 });
        }
        resources.c -= m.c;
        this.graph = new Graph(this.map.map(col => col.map(c => !c.o ? 999 : (c.o.n === "Path" ? 1 : 25))));
    }

    doClicks(selectedItem, selectedDemon, x, z, inMapArea, isDragging, startX, startZ, mX, mY, silent) {
        this.w.delete("pl");
        if (!inMapArea) {
            return;
        }
        if (isDragging && selectedItem && selectedItem.t === "plane") {
            for (let j = Math.min(z, startZ); j <= Math.max(z, startZ); j++) {
                for (let i = Math.min(x, startX); i <= Math.max(x, startX); i++) {
                    this.doClicks(selectedItem, selectedDemon, i, j, inMapArea, false, 0, 0, 0, 0, true);
                }
            }
            Note.new("b", 4, 0.1, 0.3).play(0.5);
            setTimeout(() => {
                Note.new("e", 3, 0.1, 0.3).play(0.5);
                setTimeout(() => {
                    Note.new("c#", 2, 0.1, 0.3).play(0.5);
                }, 70);
            }, 70);
            return;
        }

        if (selectedItem && !this.isAreaOccupied(x, z, selectedItem.w, selectedItem.d) && selectedItem.c <= resources.c) {
            if (!silent) {
                Note.new("b", 4, 0.1, 0.3).play(0.5);
                setTimeout(() => {
                    Note.new("e", 3, 0.1, 0.3).play(0.5);
                    setTimeout(() => {
                        Note.new("c#", 2, 0.1, 0.3).play(0.5);
                    }, 70);
                }, 70);
            }
            const m = selectedItem.clone(this.mi);
            this.m.push({ m, x, z });
            this.addToArea(x, z, selectedItem.w, selectedItem.d, m);
            this.mi++;
            let opts = {
                n: `b-${m.id}`,
                x,
                y: selectedItem.h / 2,
                d: selectedItem.d, w: selectedItem.w, h: selectedItem.h,
                z
            };
            selectedItem.co[0] === '#' ? opts["b"] = selectedItem.co : opts["t"] = selectedItem.co;
            if (selectedItem.t === "cube") {
                this.w["cube"](opts);
            }
            if (selectedItem.t === "plane") {
                opts["y"] = 0;
                opts["h"] = 0.1;
                opts["b"] = "#00000000";
                opts["mix"] = int(10, 15) / 40;
                opts["ry"] = pick(0, 90, 180, 270);
                this.w["cube"](opts);
            }
            return { rsm: true };
        }

        if (selectedDemon && this.map[z][x].o && this.map[z][x].o !== true && this.map[z][x].o.t !== "plane" && selectedDemon.mc <= resources.m) {
            if (!this.map[z][x].o.do) {
                this.map[z][x].o.do = selectedDemon.clone(this.dli);
                this.dli++;
                resources.dl = resources.dl.map(d => d === selectedDemon ? new Demon() : d);
                return { rsd: true };
            }
        }

        if (!selectedItem && !selectedDemon) {
            if (this.map[z][x].o !== true && this.map[z][x].o) {
                return {
                    removeOthers: true,
                    popup: (ctx, ui, r) => {
                        ctx.fillStyle = '#331111dd';
                        ctx.strokeStyle = '#774444';
                        ctx.fillRect(mX, mY - r(110), r(200), r(100));
                        ctx.strokeRect(mX, mY - r(110), r(200), r(100));

                        ctx.fillStyle = this.map[z][x].o.nd && !this.map[z][x].o.do ? '#ff0000' : '#00ff00';
                        ctx.font = `${r(16)}px luminari, fantasy`;
                        ctx.fillText("⬤", mX + r(10), mY - r(85));
                        ctx.fillStyle = '#ffffff';
                        ctx.font = `${r(14)}px luminari, fantasy`;
                        ctx.fillText(this.map[z][x].o.n, mX + r(30), mY - r(85));
                        if (this.map[z][x].o.do) {
                            ctx.drawImage(this.map[z][x].o.do.f ? fimg : mimg, mX + r(10), mY - r(75), r(55), r(55));
                        } else {
                            ctx.fillStyle = '#000000';
                            ctx.fillRect(mX + r(10), mY - r(75), r(55), r(55));
                        }
                        ctx.strokeRect(mX + r(10), mY - r(75), r(55), r(55));

                        if (this.map[z][x].o.s && !this.map[z][x].o.s.d) {
                            ctx.drawImage(simg, mX + r(75), mY - r(75), 35, 55);
                            ctx.fillStyle = '#ffffff';
                            ctx.fillText("Mis", mX + r(110), mY - r(75));
                            ctx.fillStyle = '#ffffff60';
                            ctx.fillRect(mX + r(110), mY - r(70), r(12), r(50));
                            ctx.fillStyle = '#8800ff';
                            ctx.fillRect(mX + r(110), mY - r(70 - (50 - (this.map[z][x].o.s.m * 5))), r(12), r(this.map[z][x].o.s.m * 5)); //(sin * meterHeight) / maxSin
                            ctx.strokeRect(mX + r(110), mY - r(70), r(12), r(50));
                        }
                    }
                };
            }
            const s = this.sl.find(s => s.x === x && s.z === z);
            if (s) {
                return {
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
                        ctx.fillRect(mX + 10, mY - r(80 - (60 - (s.s * 6))), r(12), r(s.s * 6)); //(sin * meterHeight) / maxSin
                        ctx.strokeRect(mX + 10, mY - r(80), r(12), r(60));

                        ctx.fillStyle = '#ffffff';
                        ctx.fillText("Mis", mX + 32, mY - r(90));
                        ctx.fillStyle = '#ffffff60';
                        ctx.fillRect(mX + 32, mY - r(80), r(12), r(60));
                        ctx.fillStyle = '#8800ff';
                        ctx.fillRect(mX + 32, mY - r(80 - (60 - (s.m * 6))), r(12), r(s.m * 6)); //(sin * meterHeight) / maxSin
                        ctx.strokeRect(mX + 32, mY - r(80), r(12), r(60));

                        ctx.font = `${r(12)}px luminari, fantasy`;
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(s.desch, mX + 54, mY - r(70));
                        ctx.fillText(s.descs, mX + 54, mY - r(55));

                        ctx.fillText(`Coins: ${s.c}`, mX + 54, mY - r(23));

                        ctx.fillStyle = ui.cmi([mX + r(200 - 60), mY - r(40), r(20), r(20)], ui.x, ui.y) ? '#ff2222' : '#771111';
                        ctx.fillRect(mX + r(200 - 60), mY - r(40), r(20), r(20));
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText("✖", mX + r(200 - 55), mY - r(25));
                        ctx.strokeRect(mX + r(200 - 60), mY - r(40), r(20), r(20));

                        ctx.fillStyle = ui.cmi([mX + r(200 - 30), mY - r(40), r(20), r(20)], ui.x, ui.y) ? '#22ff22' : '#117711';
                        ctx.fillRect(mX + r(200 - 30), mY - r(40), r(20), r(20));
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText("✔", mX + r(200 - 25), mY - r(25));
                        ctx.strokeRect(mX + r(200 - 30), mY - r(40), r(20), r(20));

                        if (this.is.includes(s) && !s.a) {
                            const decbtn = {
                                t: "soul-btn", // type
                                bt: `s-${s.id}`, //belongs to
                                pos: [mX + r(200 - 60), mY - r(40), r(20), r(20)],
                                onClick: (x, y) => {
                                    Note.new("f#", 3, 0.1, 0.3).play(0.5);
                                    setTimeout(() => {
                                        Note.new("c#", 3, 0.1, 0.3).play(0.2);
                                    }, 50);
                                    setTimeout(() => {
                                        this.is = this.is.filter(i => i !== s);
                                        this.sl = this.sl.filter(i => i !== s);
                                        this.w.delete(`s-${s.id}`, 100);
                                        resources.sd++;
                                    }, 1000);
                                    s.isDead = true;
                                    return { pp: true };
                                }
                            };
                            const accbtn = {
                                t: "soul-btn", // type
                                bt: `s-${s.id}`,
                                pos: [mX + r(200 - 30), mY - r(40), r(20), r(20)],
                                onClick: (x, y) => {
                                    Note.new("f#", 3, 0.1, 0.3).play(0.5);
                                    setTimeout(() => {
                                        Note.new("b", 3, 0.1, 0.3).play(0.2);
                                    }, 50);
                                    this.is = this.is.filter(i => i.id !== s.id);
                                    s.z = 3;
                                    this.w.move({ n: `s-${s.id}`, z: 3, a: 250 });
                                    s.a = true;
                                    resources.sa++;
                                    resources.c += s.c;
                                    return { pp: true };
                                }
                            };
                            if (ui.wi.filter(i => i.t === "soul-btn").length === 0) {
                                ui.wi.push(decbtn);
                                ui.wi.push(accbtn);
                            } else if (ui.wi.filter(i => i.t === "soul-btn" && i.bt !== `s-${s.id}`).length > 0) {
                                ui.wi = ui.wi.filter(i => i.t !== "soul-btn");
                            }
                        }
                    }
                };
            }
            return { removeOthers: true };
        }
        return;
    }

    doRightClicks() {
        this.w.delete("pl");
    }

    doHovers(selectedItem, selectedDemon, x, z, inMapArea, isDragging, startX, startZ) {
        if (inMapArea) {
            if (selectedItem && selectedItem.t === "cube") {
                this.w["cube"]({
                    n: "pl",
                    x,
                    y: selectedItem.h / 2,
                    z,
                    d: selectedItem.d,
                    w: selectedItem.w,
                    h: selectedItem.h,
                    b: this.isAreaOccupied(x, z, selectedItem.w, selectedItem.d) || resources.c < selectedItem.c ? "#ff000060" : "#aaaa0050"
                });
            }
            if (selectedItem && selectedItem.t === "plane") {
                this.w["cube"]({
                    n: "pl",
                    x: isDragging ? ((x < startX ? startX : x) - Math.abs(x - startX) / 2) : x,
                    y: 0,
                    z: isDragging ? ((z < startZ ? startZ : z) - Math.abs(z - startZ) / 2) : z,
                    w: isDragging ? Math.floor(x < startX ? startX - x : x - startX) + selectedItem.w : selectedItem.w,
                    d: isDragging ? Math.floor(z < startZ ? startZ - z : z - startZ) + selectedItem.w : selectedItem.w,
                    h: 0.1,
                    b: this.isAreaOccupied(x, z, selectedItem.w, selectedItem.d) && !isDragging ||
                        (isDragging ?
                            resources.c < selectedItem.c * ((Math.floor(x < startX ? startX - x : x - startX) + selectedItem.w) * (Math.floor(z < startZ ? startZ - z : z - startZ) + selectedItem.w)) :
                            resources.c < selectedItem.c) ?
                        "#ff000060" :
                        "#aaaa0050"
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
                    b: selectedDemon ? "#000000ff" : "#ffffffaa"
                });
            }
        }
        if (selectedDemon && this.map[z][x] && this.map[z][x].o && this.map[z][x].o !== true && this.map[z][x].o.t !== "plane") {
            if (!this.mcc.includes(this.map[z][x].o.id)) {
                this.mcc.push(this.map[z][x].o);
            }
            if (this.map[z][x].o.do) {
                this.w.move({ n: `b-${this.map[z][x].o.id}`, b: "ff000060", mix: 1 });
            } else {
                this.w.move({ n: `b-${this.map[z][x].o.id}`, b: "00ff0060", mix: 1 });
            }
        } else {
            this.mcc.forEach(m => this.w.move({ n: `b-${m.id}`, b: m.co, mix: 1 }));
            this.mcc = [];
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
                        n: `${j}-${i}`,
                        g: "map",
                        x: i * scale,
                        y: 0,
                        z: j * scale,
                        size: scale,
                        t: this.map[j][i].t,
                        b: this.map[j][i].b,
                        mix: int(2, 6) / 10,
                        rx: -90,
                        ry: this.map[j][i].r
                    });
                    if (this.map[j][i].t === bimg && !j) {
                        this.w.cube({
                            g: "map",
                            x: i * scale,
                            y: ((this.h / 2) + 5) * scale,
                            z: j * scale,
                            h: (this.h - 10) * scale,
                            w: scale,
                            d: scale,
                            t: himg,
                            b: pick("#661111", "#441111", "#330000"),
                            mix: int(2, 6) / 10,
                            ry: this.map[j][i].r
                        });
                    }
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
                        mix: int(2, 6) / 10,
                        ry: this.map[j][i].r
                    });
                }
            }
        }
    };
}

export default Map;
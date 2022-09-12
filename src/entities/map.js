import { astar, Graph } from '../utils/astar';
import { Note } from '../utils/audio-utils';
import { int, pick } from '../utils/random-utils';
import Demon from './demon';
import resources from './resources';
import Soul from './soul';
import { createImage, dimg } from '../utils/image-util';

const bhimg = createImage(100, 100, [0]);
const whimg = createImage(50, 16, [0]);
const fhimg = createImage(14, 14, [0, 1, 2]);
const simg = createImage(8, 16, [
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 1, 1, 0, 0, 0,
    0, 0, 1, 1, 1, 1, 0, 0,
    0, 0, 1, 1, 2, 1, 0, 0,
    0, 0, 1, 1, 1, 1, 1, 0,
    0, 0, 1, 1, 1, 1, 1, 0,
    0, 0, 1, 1, 1, 1, 1, 0,
    0, 0, 1, 1, 1, 1, 1, 0,
    0, 1, 1, 1, 1, 1, 0, 0,
    0, 1, 1, 1, 1, 1, 0, 0,
    0, 1, 1, 1, 1, 1, 0, 0,
    0, 1, 1, 1, 1, 1, 0, 0,
    0, 0, 1, 1, 1, 1, 0, 0,
    0, 0, 0, 0, 1, 1, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0
], [[0, 0, 0, 0], [118, 215, 215, 255], [14, 65, 65, 255]]);


class Map {
    constructor(s, w) {
        this.s = s; //size
        this.m = []; //machines
        this.um = []; //updatable machines
        this.mi = 1; //machine id iterator
        this.dl = []; //demon list
        this.dli = 1; //demon id iterator
        this.sl = []; //soul list
        this.is = []; //idle souls (waiting for approval)
        this.sli = 1; //soul id iterator
        this.w = w; // w lib
        this.mcc = []; // machines with changed colour

        this.map = [...new Array(s)].map((_, j) => [...new Array(s)].map((_, i) => {
            if (j < 7 && new Array(7).fill().map((o, n) => ((this.s / 2) - 3) + n).includes(i)) {
                return { o: true };
            }
            return { o: null };
        }));

        this.graph = new Graph(this.map.map(col => col.map(c => !c.o ? 999 : (c.o.n === "Path" ? 1 : 25))));
    }

    /**
     * Rotate souls
     */
    rs(ry) {
        this.sl.forEach(s => this.w.move({ n: `s-${s.id}`, ry }));
    }

    /**
     * Pay Demons
     */
    pd() {
        this.um.forEach(machine => resources.m -= machine.m.do ? machine.m.do.mc : 0);
    }

    /**
     * Find free soul spot
     */
    fss(preChoice) {
        const spots = [
            [(this.s / 2) + 1, 2],
            [(this.s / 2) - 1, 2],
            [(this.s / 2), 1]
        ].filter(([x, z]) => !this.is.find(s => s.x === x && s.z === z));
        return preChoice === null ? pick(...spots) : spots[preChoice];
    }

    /**
     * Spawn soul
     */
    ss(isTutorial, spotChoice) {
        if (this.is.length < 3) {
            const [x, z] = this.fss(isTutorial ? spotChoice : null);
            const s = new Soul(this.sli, x, z);
            if (isTutorial) {
                s._s = 9;
                s.h = 4;
                s.c = 2;
                s.cod = 0;
            }
            this.sl.push(s);
            this.is.push(s);
            this.sli++;

            this.w.plane({ n: `s-${s.id}`, x: s.x, y: 1, z: s.z, h: 2, w: 1, ry: -45, t: simg });
        }
    }

    /**
     * Update machines
     */
    uma() {
        this.um.forEach(i => {
            const result = i.m.ups();
            if (result && result.extracted) {
                resources.m = result.extracted;
                resources.se++;
            }
        });
        this.sl = this.sl.filter(s => !s.d);
        this.is = this.is.filter(s => !s.d);
        this.um.forEach(m => {
            if (m.m && m.m.s && m.m.s.d) {
                m.m.s = null;
            }
        });
    }

    /**
     * Update Souls
     */
    ups() {
        this.sl.forEach((s) => {
            if (s.a && !s.d) {
                s.fg(this.um);
                if (s.g && s.g.m.s && s.g.m.s !== s) {
                    s.g = null;
                    s.im = false;
                    s.p = astar.s(this.graph, this.graph.g[s.z][s.x], this.graph.g[int(1, this.s - 2), int(1, this.s - 2)]);
                }
                if (s.g && !s.im && s.p.length === 0) {
                    s.p = astar.s(this.graph, this.graph.g[s.z][s.x], this.graph.g[s.g.z][s.g.x]);
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
    }

    anim(offset) {
        this.sl.forEach((s, i) => {
            if (!s.d) {
                this.w.move({ n: `s-${s.id}`, y: 1 + offset, a: 250 }, (i % 5) * 100);
            }
        });
    }

    /**
     * Is area occupied
     */
    iao(x, y, width, depth) {
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

    /**
     * Add to area
     */
    ata(x, z, width, depth, m) {
        for (let j = z - Math.floor(depth / 2); j <= z + Math.floor(depth / 2); j++) {
            for (let i = x - Math.floor(width / 2); i <= x + Math.floor(width / 2); i++) {
                this.map[j][i].o = m;
            }
        }
        if (m.t !== "plane") {
            this.w.sh({
                n: `sh-b${x}${z}`,
                x: x - ((Math.sqrt(Math.pow(width, 2) + Math.pow(depth, 2)) / 6) + m.h / 16),
                y: 0.1,
                z: z - ((Math.sqrt(Math.pow(width, 2) + Math.pow(depth, 2)) / 6) + m.h / 16),
                w: Math.sqrt(Math.pow(width, 2) + Math.pow(depth, 2)),
                h: m.h / 8 + Math.sqrt(Math.pow(width, 2) + Math.pow(depth, 2)) / 2,
                b: '#00000099',
                ry: 45,
                rx: -90
            });
        }
        resources.c -= m.c;
        this.graph = new Graph(this.map.map(col => col.map(c => !c.o ? 999 : (c.o.n === "Path" ? 1 : 25))));
    }

    /**
     * Do clicks
     */
    dc(selectedItem, selectedDemon, isDeleteMode, x, z, inMapArea, isDragging, startX, startZ, mX, mY, silent) {
        this.w.delete("pl");
        if (!inMapArea) {
            return;
        }

        if (isDragging && (isDeleteMode || selectedItem && selectedItem.t === "plane")) {
            for (let j = Math.min(z, startZ); j <= Math.max(z, startZ); j++) {
                for (let i = Math.min(x, startX); i <= Math.max(x, startX); i++) {
                    this.dc(selectedItem, selectedDemon, isDeleteMode, i, j, inMapArea, false, 0, 0, 0, 0, true);
                }
            }
            Note.new("b", 4, 0.1).play(0.5);
            setTimeout(() => {
                Note.new("e", 3, 0.1).play(0.5);
                setTimeout(() => {
                    Note.new("c#", 2, 0.1).play(0.5);
                }, 70);
            }, 70);
            return { rs: true };  //remove selections
        }

        if (isDeleteMode) {
            if(this.map[z][x].o){
                this.rmm(this.map[z][x].o.id);
            }
            return { rs: true };  //remove selections
        }

        if (selectedItem && !this.iao(x, z, selectedItem.w, selectedItem.d) && selectedItem.c <= resources.c) {
            if (!silent) {
                Note.new("b", 4, 0.1).play(0.5);
                setTimeout(() => {
                    Note.new("e", 3, 0.1).play(0.5);
                    setTimeout(() => {
                        Note.new("c#", 2, 0.1).play(0.5);
                    }, 70);
                }, 70);
            }
            const m = selectedItem.clone(this.mi);
            this.m.push({ m, x, z });
            if (m.n !== "Path") {
                this.um.push({ m, x, z });
            }
            this.ata(x, z, selectedItem.w, selectedItem.d, m);
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
                opts["g"] = "map";
                opts["y"] = 0;
                opts["h"] = 0.1;
                opts["b"] = "#000";
                opts["mix"] = int(10, 15) / 40;
                opts["ry"] = pick(0, 90, 180, 270);
                this.w["cube"](opts);
            }
            return { rs: true }; //remove selections
        }

        if (selectedDemon && this.map[z][x].o && this.map[z][x].o !== true && this.map[z][x].o.t !== "plane" && selectedDemon.mc <= resources.m) {
            if (!this.map[z][x].o.do) {
                this.map[z][x].o.do = selectedDemon.clone(this.dli);
                this.dli++;
                resources.dl = resources.dl.map(d => d === selectedDemon ? new Demon() : d);
                return { rs: true };  //remove selections
            }
        }

        // Machine popup
        if (!selectedItem && !selectedDemon) {
            const machine = this.map[z][x].o;
            if (machine !== true && machine && machine.n !== "Path") {
                return {
                    r: (resize) => [mX, mY - resize(110), resize(200), resize(100)],
                    popup: (ctx, r, ui) => {
                        ctx.fillStyle = '#311d';
                        ctx.strokeStyle = '#744';
                        ctx.fillRect(mX, mY - r(110), r(200), r(100));
                        ctx.strokeRect(mX, mY - r(110), r(200), r(100));

                        ctx.fillStyle = machine.nd && !machine.do ? '#f00' : '#0f0';
                        ctx.font = `${r(16)}px luminari, fantasy`;
                        ctx.fillText("⬤", mX + r(10), mY - r(85));
                        ctx.fillStyle = '#fff';
                        ctx.font = `${r(14)}px luminari, fantasy`;
                        ctx.fillText(machine.n, mX + r(30), mY - r(85));
                        if (machine.do) {
                            ctx.filter = `hue-rotate(${machine.do.hr}deg)`;
                            ctx.drawImage(dimg, mX + r(10), mY - r(75), r(55), r(55));
                            ctx.filter = "none";
                        } else {
                            ctx.fillStyle = '#000';
                            ctx.fillRect(mX + r(10), mY - r(75), r(55), r(55));
                        }
                        ctx.strokeRect(mX + r(10), mY - r(75), r(55), r(55));

                        if (machine.s && !machine.s.d) {
                            ctx.drawImage(simg, mX + r(75), mY - r(75), r(35), r(55));
                            ctx.fillStyle = '#fff';
                            ctx.fillText("🌀", mX + r(110), mY - r(70));
                            ctx.fillStyle = '#fff6';
                            ctx.fillRect(mX + r(113), mY - r(65), r(12), r(45));
                            ctx.fillStyle = '#25f';
                            ctx.fillRect(mX + r(113), mY - r(65 - (45 - ((machine.s.m * 45) / machine.s.md))), r(12), r((machine.s.m * 45) / machine.s.md)); //(sin * meterHeight) / maxSin
                            ctx.strokeRect(mX + r(113), mY - r(65), r(12), r(45));
                        }

                        // Sell building button
                        ctx.fillStyle = ui.cmi([mX + r(200 - 30), mY - r(40), r(20), r(20)], ui.x, ui.y) ? '#2f2' : '#171';
                        ctx.fillRect(mX + r(200 - 30), mY - r(40), r(20), r(20));
                        ctx.fillStyle = '#fff';
                        ctx.fillText("$", mX + r(200 - 25), mY - r(25));
                        ctx.strokeRect(mX + r(200 - 30), mY - r(40), r(20), r(20));
                        const sellbtn = {
                            t: "m-sell-btn", // type
                            bt: `b-${machine.id}`, //belongs to
                            pos: [mX + r(200 - 30), mY - r(40), r(20), r(20)],
                            onClick: (x, y) => {
                                Note.new("f#", 3, 0.1).play(0.5);
                                setTimeout(() => {
                                    Note.new("c#", 3, 0.1).play(0.2);
                                }, 50);
                                setTimeout(() => {
                                    this.rmm(machine.id);
                                }, 25);
                                return { pp: true };
                            }
                        };
                        if (ui.wi.filter(i => i.t === "m-sell-btn").length === 0) {
                            ui.wi.push(sellbtn);
                        } else if (ui.wi.filter(i => i.t === "m-sell-btn" && i.bt !== `b-${machine.id}`).length > 0) {
                            ui.wi = ui.wi.filter(i => i.t !== "m-sell-btn");
                        }
                    }
                };
            }

            // Soul popup
            const s = this.sl.find(s => s.x === x && s.z === z);
            if (s) {
                return {
                    r: (resize) => [mX, mY - resize(110), resize(200), resize(100)],
                    popup: (ctx, r, ui) => {
                        ctx.fillStyle = '#311d';
                        ctx.strokeStyle = '#744';
                        ctx.fillRect(mX, mY - r(110), r(200), r(100));
                        ctx.strokeRect(mX, mY - r(110), r(200), r(100));

                        ctx.fillStyle = '#fff';
                        ctx.font = `${r(10)}px luminari, fantasy`;
                        ctx.fillText("Sin", mX + r(10), mY - r(90));
                        ctx.fillStyle = '#fff6';
                        ctx.fillRect(mX + r(10), mY - r(80), r(12), r(60));
                        ctx.fillStyle = '#f00';
                        ctx.fillRect(mX + r(10), mY - r(80 - (60 - ((s.s * 60) / s.md))), r(12), r((s.s * 60) / s.md)); //(sin * meterHeight) / maxSin
                        ctx.strokeRect(mX + r(10), mY - r(80), r(12), r(60));

                        ctx.font = `${r(14)}px luminari, fantasy`;
                        ctx.fillStyle = '#fff';
                        s.desc.split("\n").forEach((t, i) => ctx.fillText(t, mX + r(35), mY - (r(90 - (15 * i)))));

                        if (s.rm) {
                            ctx.fillText(`Needs: ${resources.ml[s.rm].n}`, mX + r(35), mY - r(50));
                        }

                        ctx.fillText(`${s.c}🪙`, mX + r(35), mY - r(23));

                        ctx.fillStyle = ui.cmi([mX + r(200 - 60), mY - r(40), r(20), r(20)], ui.x, ui.y) ? '#f22' : '#711';
                        ctx.fillRect(mX + r(200 - 60), mY - r(40), r(20), r(20));
                        ctx.fillStyle = '#fff';
                        ctx.fillText("✖", mX + r(200 - 55), mY - r(25));
                        ctx.strokeRect(mX + r(200 - 60), mY - r(40), r(20), r(20));

                        ctx.fillStyle = ui.cmi([mX + r(200 - 30), mY - r(40), r(20), r(20)], ui.x, ui.y) ? '#2f2' : '#171';
                        ctx.fillRect(mX + r(200 - 30), mY - r(40), r(20), r(20));
                        ctx.fillStyle = '#fff';
                        ctx.fillText("✔", mX + r(200 - 25), mY - r(25));
                        ctx.strokeRect(mX + r(200 - 30), mY - r(40), r(20), r(20));

                        if (this.is.includes(s) && !s.a) {
                            const decbtn = {
                                t: "soul-btn", // type
                                bt: `s-${s.id}`, //belongs to
                                pos: [mX + r(200 - 60), mY - r(40), r(20), r(20)],
                                onClick: (x, y) => {
                                    Note.new("f#", 3, 0.1).play(0.5);
                                    setTimeout(() => {
                                        Note.new("c#", 3, 0.1).play(0.2);
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
                                    Note.new("f#", 3, 0.1).play(0.5);
                                    setTimeout(() => {
                                        Note.new("b", 3, 0.1).play(0.2);
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

    /**
     * Do right clicks
     */
    drc() {
        this.w.delete("pl");
    }

    /**
     * Do hovers
     */
    dh(selectedItem, selectedDemon, isDeleteMode, x, z, inMapArea, isDragging, startX, startZ) {
        if (inMapArea) {
            if (isDragging && isDeleteMode) {
                this.w["cube"]({
                    n: "pl",
                    x: ((x < startX ? startX : x) - Math.abs(x - startX) / 2),
                    y: 0,
                    z: ((z < startZ ? startZ : z) - Math.abs(z - startZ) / 2),
                    w: Math.floor(x < startX ? startX - x : x - startX) + 1,
                    d: Math.floor(z < startZ ? startZ - z : z - startZ) + 1,
                    h: 0.1,
                    b: "#99110088"
                });
                return;
            }
            if (selectedItem && selectedItem.t === "cube") {
                this.w["cube"]({
                    n: "pl",
                    x,
                    y: selectedItem.h / 2,
                    z,
                    d: selectedItem.d,
                    w: selectedItem.w,
                    h: selectedItem.h,
                    b: this.iao(x, z, selectedItem.w, selectedItem.d) || resources.c < selectedItem.c ? "#ff000088" : "#00aa0088"
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
                    b: this.iao(x, z, selectedItem.w, selectedItem.d) && !isDragging ||
                        (isDragging ?
                            resources.c < selectedItem.c * ((Math.floor(x < startX ? startX - x : x - startX) + selectedItem.w) * (Math.floor(z < startZ ? startZ - z : z - startZ) + selectedItem.w)) :
                            resources.c < selectedItem.c) ?
                        "#ff000088" :
                        "#00aa0088"
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
                    b: selectedDemon ? "#00aaaaaa" : "#ffffffaa"
                });
            }
        }
        if (selectedDemon && this.map[z][x] && this.map[z][x].o && this.map[z][x].o !== true && this.map[z][x].o.t !== "plane") {
            if (!this.mcc.includes(this.map[z][x].o.id)) {
                this.mcc.push(this.map[z][x].o);
            }
            if (this.map[z][x].o.do) {
                this.w.move({ n: `b-${this.map[z][x].o.id}`, b: "#ff000044", mix: 0.8 });
            } else {
                this.w.move({ n: `b-${this.map[z][x].o.id}`, b: "#00ff0044", mix: 0.8 });
            }
        } else {
            this.mcc.forEach(m => this.w.move({ n: `b-${m.id}`, mix: 0 }));
            this.mcc = [];
        }
    }

    /**
     * Remove machine
     */
    rmm(id) {
        const machinePosition = this.m.find(m => m.m.id === id);
        if(!machinePosition || !machinePosition.m){
            return;
        }
        if (machinePosition.m.do) {
            machinePosition.m.do.m = null;
            machinePosition.m.do = null;
        }
        if (machinePosition.m.s) {
            machinePosition.m.s.g = null;
        }
        for (let j = machinePosition.z - Math.floor(machinePosition.m.d / 2); j <= machinePosition.z + Math.floor(machinePosition.m.d / 2); j++) {
            for (let i = machinePosition.x - Math.floor(machinePosition.m.w / 2); i <= machinePosition.x + Math.floor(machinePosition.m.w / 2); i++) {
                this.map[j][i].o = null;
            }
        }
        resources.c += Math.floor(machinePosition.m.c / 2);
        this.w.delete(`sh-b${machinePosition.x}${machinePosition.z}`, 1);
        this.w.delete(`b-${id}`, 1);
        this.m = this.m.filter(m => m.m.id !== id);
        this.um = this.um.filter(m => m.m.id !== id);
    }

    /**
     * Draw map
     */
    dm() {
        //top right wall
        this.w.cube({
            g: "map",
            x: this.map.length - 1,
            y: 1,
            z: (this.map.length - 1) / 2,
            w: this.map.length,
            h: 2,
            d: 1,
            t: whimg,
            ry: -90
        });
        //top-left wall
        this.w.cube({
            g: "map",
            x: (this.map.length - 1) / 2,
            y: 1,
            z: 0,
            w: this.map.length,
            h: 2,
            d: 1,
            t: whimg,
            ry: 0
        });
        //bottom left wall
        this.w.cube({
            g: "map",
            x: 0,
            y: 1,
            z: (this.map.length - 1) / 2,
            w: this.map.length,
            h: 2,
            d: 1,
            t: whimg,
            ry: -90
        });
        //bottom-right wall
        this.w.cube({
            g: "map",
            x: (this.map.length - 1) / 2,
            y: 1,
            z: this.map.length - 1,
            w: this.map.length,
            h: 2,
            d: 1,
            t: whimg,
            ry: 0
        });

        //floor
        this.w.plane({
            g: "map",
            x: (this.map.length - 1) / 2,
            y: 0,
            z: (this.map.length - 1) / 2,
            size: this.map.length,
            t: bhimg,
            rx: -90
        });

        //entrance floor
        this.w.cube({
            g: "map",
            x: this.map.length / 2,
            y: 0,
            z: 3,
            w: 7,
            h: 0.05,
            d: 7,
            t: fhimg,
            ry: 0
        });
    };
}

export default Map;
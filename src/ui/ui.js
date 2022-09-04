import resources from '../entities/resources';
import { Note } from '../utils/audio-utils';




class Ui {
    constructor() {
        this.is = []; // items
        this.wi = []; // world item
        this.si = null; // selected item
        this.sd = null; //selected demon
        this.x = 0;
        this.y = 0;
        this.ma = false; // cursor is in map area
        this.s = 1100; // canvas size
        this.wpu = []; // world pop ups
        this.cwp = [0, 0, 0, 0]; // current world popup
        this.c = 0; // cycle
    }

    r = (size) => {
        return (size * this.s) / 1100;
    };

    /**
     * Coordinates Match Item
     * @param {*} rectangle 
     * @param {*} x 
     * @param {*} y 
     * @returns 
     */
    cmi(rectangle, x, y) {
        return rectangle[0] <= x && (rectangle[0] + rectangle[2]) >= x &&
            rectangle[1] <= y && (rectangle[1] + rectangle[3]) >= y;
    };

    doHovers(x, y, h) {
        this.x = x;
        this.y = y;
        this.ma = y < h - this.r(250);
        this.is.forEach(i => {
            const wasHovering = i.item.isHovering;
            i.item.isHovering = this.cmi(i.pos, x, y);
            if (i.item.isHovering) {
                i.onHover(x, y);
            }
            if (wasHovering && !i.item.isHovering) {
                i.onMouseOut();
            }
        });
    }

    doClicks() {
        this.is.forEach(i => this.cmi(i.pos, this.x, this.y) ? i.onClick(this.x, this.y) : null);
        return this.wi.map(i => this.cmi(i.pos, this.x, this.y) ? i.onClick(this.x, this.y) : null)
            .filter(r => r && !r.pp).length > 0; //pp = prevent propagation
    }

    doRightClicks() {
        this.si = null;
        this.sd = null;
    }

    /**
     * Draw World PopUps
     * @param {*} ctx 
     */
    dwpu(ctx) {
        this.wpu.forEach(wp => {
            if (!wp.hasPoppedUp) {
                setTimeout(() => {
                    Note.new("c#", 4, 0.1).play(0.5);
                    setTimeout(() => {
                        Note.new("f#", 4, 0.1).play(0.5);
                    }, 50);
                }, 0);
            }
            wp.hasPoppedUp = true;
            wp(ctx, this.r, this);
        });
    }

    /**
     * Draw Interface
     * @param {*} ctx 
     */
    di(ctx) {
        ctx.fillStyle = '#211';
        ctx.strokeStyle = '#977';
        ctx.fillRect(0, ctx.canvas.height - this.r(250), ctx.canvas.width, this.r(250));
        ctx.strokeRect(0, ctx.canvas.height - this.r(250), ctx.canvas.width, this.r(250));

        ctx.fillStyle = '#fee';
        ctx.font = `${this.r(16)}px luminari, fantasy`;
        ctx.fillText(`Balance`, this.r(10), ctx.canvas.height - this.r(80));
        ctx.moveTo(this.r(10), ctx.canvas.height - this.r(76));
        ctx.lineTo(this.r(105), ctx.canvas.height - this.r(76));
        ctx.stroke();

        ctx.fillText(`Coins`, this.r(10), ctx.canvas.height - this.r(56));
        ctx.fillText(resources.c, this.r(10), ctx.canvas.height - this.r(38));

        ctx.fillText(`Misery`, this.r(60), ctx.canvas.height - this.r(56));
        ctx.fillText(resources.m, this.r(60), ctx.canvas.height - this.r(38));


        ctx.fillText(`Souls`, this.r(135), ctx.canvas.height - this.r(80));
        ctx.moveTo(this.r(135), ctx.canvas.height - this.r(76));
        ctx.lineTo(this.r(418), ctx.canvas.height - this.r(76));
        ctx.stroke();

        ctx.fillText(`Accepted`, this.r(135), ctx.canvas.height - this.r(56));
        ctx.fillText(resources.sa, this.r(135), ctx.canvas.height - this.r(38));

        ctx.fillText(`Declined`, this.r(208), ctx.canvas.height - this.r(56));
        ctx.fillText(resources.sd, this.r(208), ctx.canvas.height - this.r(38));

        ctx.fillText(`Extracted`, this.r(279), ctx.canvas.height - this.r(56));
        ctx.fillText(resources.se, this.r(279), ctx.canvas.height - this.r(38));

        ctx.fillText(`Destroyed`, this.r(350), ctx.canvas.height - this.r(56));
        ctx.fillText(`${resources.ds} / ${resources.md}`, this.r(350), ctx.canvas.height - this.r(38));

        ctx.fillText(`Cycle`, this.r(10), ctx.canvas.height - this.r(10));
        ctx.fillRect(this.r(55), ctx.canvas.height - this.r(20), this.c / 100, this.r(10));
        ctx.strokeRect(this.r(55), ctx.canvas.height - this.r(20), 100, this.r(10));

        ctx.fillText(`Level`, this.r(453), ctx.canvas.height - this.r(80));
        ctx.font = `${this.r(40)}px luminari, fantasy`;
        ctx.moveTo(this.r(453), ctx.canvas.height - this.r(76));
        ctx.lineTo(this.r(488), ctx.canvas.height - this.r(76));
        ctx.stroke();
        ctx.fillText(resources.l, this.r(453), ctx.canvas.height - this.r(39));

        resources.ml.forEach((m, i) => {
            ctx.fillStyle = m.rl > resources.l ? '#211' : '#311';
            ctx.strokeStyle = m.rl > resources.l ? '#544' : '#744';
            ctx.fillRect(this.r(15 + (i * 115)), ctx.canvas.height - this.r(235), this.r(100), this.r(100));
            ctx.strokeRect(this.r(15 + (i * 115)), ctx.canvas.height - this.r(235), this.r(100), this.r(100));

            ctx.fillStyle = m.rl > resources.l ? '#877' : '#fdd';
            ctx.font = `${this.r(16)}px luminari, fantasy`;
            let n = [m.n];
            const txt = ctx.measureText(m.n);
            if (txt.width > this.r(76)) { // 100 - 24 = 96
                n = m.n.split(" ");
            }
            n.forEach((n, j) => ctx.fillText(n, this.r(27 + (i * 115)), ctx.canvas.height - this.r(210) + this.r(j * 25)));

            if (!this.is.map(i => i.item).includes(m)) {
                this.is.push({
                    item: m,
                    pos: [this.r(15 + (i * 115)), ctx.canvas.height - this.r(235), this.r(100), this.r(100)],
                    onHover: (x, y) => {
                        m.isHovering = true;
                        if (!m.playedSound) {
                            Note.new("c#", 2, 0.05).play();
                        }
                        m.playedSound = true;
                    },
                    onClick: (x, y) => {
                        if (m.rl <= resources.l) {
                            this.si = m;
                            Note.new("f#", 4, 0.05).play(0.5);
                        }
                    },
                    onMouseOut: () => {
                        m.playedSound = false;
                    }
                });
            }
        });

        resources.dl.forEach((d, i) => {
            ctx.imageSmoothingEnabled = false;
            ctx.strokeStyle = d.mc > resources.m ? '#544' : this.sd === d ? '#ff0' : '#744';
            ctx.filter = `hue-rotate(${d.hr}deg)`;
            ctx.drawImage(dimg, ctx.canvas.width - this.r(235) + this.r(((i % 2) * 120)), ctx.canvas.height - this.r(235) + this.r((Math.floor(i / 2) * 120)), this.r(100), this.r(100));
            ctx.filter = "none";
            if (d.mc > resources.m) {
                ctx.fillStyle = '#3338';
                ctx.fillRect(ctx.canvas.width - this.r(235) + this.r(((i % 2) * 120)), ctx.canvas.height - this.r(235) + this.r((Math.floor(i / 2) * 120)), this.r(100), this.r(100));
            }
            ctx.strokeRect(ctx.canvas.width - this.r(235) + this.r(((i % 2) * 120)), ctx.canvas.height - this.r(235) + this.r((Math.floor(i / 2) * 120)), this.r(100), this.r(100));
            if (!this.is.map(i => i.item).includes(d)) {
                this.is.push({
                    item: d,
                    pos: [ctx.canvas.width - this.r(235) + this.r(((i % 2) * 120)), ctx.canvas.height - this.r(235) + this.r((Math.floor(i / 2) * 120)), this.r(100), this.r(100)],
                    onHover: (x, y) => {
                        d.isHovering = true;
                        if (!d.playedSound) {
                            Note.new("c#", 2, 0.05).play();
                        }
                        d.playedSound = true;
                    },
                    onClick: (x, y) => {
                        this.sd = d;
                        Note.new("f#", 4, 0.05).play(0.5);
                    },
                    onMouseOut: () => {
                        d.playedSound = false;
                    }
                });
            }
        });


        resources.ml.forEach((m, i) => {
            if (m.isHovering) {
                if (m.rl <= resources.l) {
                    ctx.fillStyle = '#faa2';
                    ctx.fillRect(this.r(15 + (i * 115)), ctx.canvas.height - this.r(235), this.r(100), this.r(100));
                }
                ctx.fillStyle = m.rl > resources.l ? '#211' : '#311';
                ctx.strokeStyle = m.rl > resources.l ? '#544' : '#744';
                ctx.fillRect(this.x, this.y - this.r(100), this.r(200), this.r(100));
                ctx.strokeRect(this.x, this.y - this.r(100), this.r(200), this.r(100));

                ctx.fillStyle = m.rl > resources.l ? '#877' : '#fdd';
                ctx.font = `${this.r(16)}px luminari, fantasy`;
                ctx.fillText(m.n, this.x + this.r(10), this.y - this.r(78));
                ctx.font = `${this.r(14)}px luminari, fantasy`;
                ctx.fillText(`Level: ${m.rl}`, this.x + this.r(190) - ctx.measureText(`Level: ${m.rl}`).width, this.y - this.r(78));
                ctx.fillStyle = m.c > resources.c ? '#f00' : (m.rl > resources.l ? '#877' : '#fdd');
                ctx.fillText(`Cost: ${m.c} coins`, this.x + this.r(10), this.y - this.r(50));
                ctx.fillStyle = m.rl > resources.l ? '#877' : '#fdd';
                if (m.mt) {
                    ctx.fillText(`Misery: +${m.mt}`, this.x + this.r(10), this.y - this.r(32));
                }
                if (m.nd) {
                    ctx.font = `${this.r(10)}px luminari, fantasy`;
                    ctx.fillText("Requires Demon to operate", this.x + this.r(10), this.y - this.r(12));
                }
            }
        });

        resources.dl.forEach((d, i) => {
            if (d.isHovering) {
                if (d.mc <= resources.m) {
                    ctx.fillStyle = '#faa4';
                    ctx.fillRect(ctx.canvas.width - this.r(235) + this.r(((i % 2) * 120)), ctx.canvas.height - this.r(235) + this.r((Math.floor(i / 2) * 120)), this.r(100), this.r(100));
                }
                ctx.fillStyle = d.mc > resources.m ? '#211' : '#311';
                ctx.strokeStyle = d.mc > resources.m ? '#544' : '#744';
                ctx.fillRect(this.x - this.r(200), this.y - this.r(100), this.r(200), this.r(100));
                ctx.strokeRect(this.x - this.r(200), this.y - this.r(100), this.r(200), this.r(100));

                ctx.fillStyle = d.mc > resources.m ? '#877' : '#fdd';
                ctx.font = `${this.r(16)}px luminari, fantasy`;
                ctx.fillText(d.n, this.x - this.r(190), this.y - this.r(75));
                ctx.font = `${this.r(14)}px luminari, fantasy`;
                ctx.fillText(`Misery Inflicted: ${Math.floor(d.mb * 100)}%`, this.x - this.r(190), this.y - this.r(50));
                ctx.fillText(`Expertise: ${Math.floor(d.e * 100)}%`, this.x - this.r(190), this.y - this.r(30));
                ctx.fillText(`Misery Cost: ${d.mc}/cycle`, this.x - this.r(190), this.y - this.r(10));
            }
        });
    }

    draw(ctx) {
        this.di(ctx);
        this.dwpu(ctx);
    }
}

const ui = new Ui();

export default ui;
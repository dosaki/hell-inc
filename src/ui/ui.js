import resources from '../entities/resources';




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
    }

    r = (size) => {
        return this.s < 1100 ? (size * this.s) / 1100 : size;
    };

    /**
     * Coordinates Match Item
     * @param {*} pos 
     * @param {*} x 
     * @param {*} y 
     * @returns 
     */
    cmi(pos, x, y) {
        return pos[0] <= x && (pos[0] + pos[2]) >= x &&
            pos[1] <= y && (pos[1] + pos[3]) >= y;
    };

    doHovers(x, y, h) {
        this.x = x;
        this.y = y;
        this.ma = y < h - this.r(250);
        this.is.forEach(i => this.cmi(i.pos, x, y) ? i.onHover(x, y) : (i.item.isHovering = false));
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
        this.wpu.forEach(wp => wp(ctx, this, this.r));
    }

    /**
     * Draw Interface
     * @param {*} ctx 
     */
    di(ctx) {
        ctx.fillStyle = '#221111';
        ctx.strokeStyle = '#997777';
        ctx.fillRect(0, ctx.canvas.height - this.r(250), ctx.canvas.width, this.r(250));
        ctx.strokeRect(0, ctx.canvas.height - this.r(250), ctx.canvas.width, this.r(250));

        ctx.fillStyle = '#ffeeee';
        ctx.font = `${this.r(16)}px luminari, fantasy`;
        ctx.fillText(`Balance`, this.r(10), ctx.canvas.height - this.r(70));
        ctx.moveTo(this.r(10), ctx.canvas.height - this.r(66));
        ctx.lineTo(this.r(105), ctx.canvas.height - this.r(66));
        ctx.stroke();

        ctx.fillText(`Coins`, this.r(10), ctx.canvas.height - this.r(46));
        ctx.fillText(resources.c, this.r(10), ctx.canvas.height - this.r(28));

        ctx.fillText(`Misery`, this.r(60), ctx.canvas.height - this.r(46));
        ctx.fillText(resources.m, this.r(60), ctx.canvas.height - this.r(28));


        ctx.fillText(`Souls`, this.r(135), ctx.canvas.height - this.r(70));
        ctx.moveTo(this.r(135), ctx.canvas.height - this.r(66));
        ctx.lineTo(this.r(342), ctx.canvas.height - this.r(66));
        ctx.stroke();

        ctx.fillText(`Accepted`, this.r(135), ctx.canvas.height - this.r(46));
        ctx.fillText(resources.sa, this.r(135), ctx.canvas.height - this.r(28));

        ctx.fillText(`Declined`, this.r(208), ctx.canvas.height - this.r(46));
        ctx.fillText(resources.sd, this.r(208), ctx.canvas.height - this.r(28));

        ctx.fillText(`Extracted`, this.r(279), ctx.canvas.height - this.r(46));
        ctx.fillText(resources.sd, this.r(279), ctx.canvas.height - this.r(28));


        ctx.fillText(`Level`, this.r(362), ctx.canvas.height - this.r(70));
        ctx.font = `${this.r(40)}px luminari, fantasy`;
        ctx.moveTo(this.r(362), ctx.canvas.height - this.r(66));
        ctx.lineTo(this.r(402), ctx.canvas.height - this.r(66));
        ctx.stroke();

        ctx.fillText(resources.l, this.r(362), ctx.canvas.height - this.r(29));

        resources.ml.forEach((m, i) => {
            ctx.fillStyle = m.rl > resources.l ? '#221919' : '#331111';
            ctx.strokeStyle = m.rl > resources.l ? '#554545' : '#774444';
            ctx.fillRect(this.r(15 + (i * 115)), ctx.canvas.height - this.r(235), this.r(100), this.r(100));
            ctx.strokeRect(this.r(15 + (i * 115)), ctx.canvas.height - this.r(235), this.r(100), this.r(100));

            ctx.fillStyle = m.rl > resources.l ? '#887777' : '#ffdddd';
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
                    },
                    onClick: (x, y) => {
                        if (m.rl <= resources.l) {
                            this.si = m;
                        }
                    }
                });
            }
        });

        resources.dl.forEach((d, i) => {
            ctx.imageSmoothingEnabled = false;
            ctx.strokeStyle = d.mc > resources.m ? '#554545' : this.sd === d ? '#ffff00' : '#774444';
            ctx.drawImage(d.f ? fimg : mimg, ctx.canvas.width - this.r(235) + this.r(((i % 2) * 120)), ctx.canvas.height - this.r(235) + this.r((Math.floor(i / 2) * 120)), this.r(100), this.r(100));
            if (d.mc > resources.m) {
                ctx.fillStyle = '#33333380';
                ctx.fillRect(ctx.canvas.width - this.r(235) + this.r(((i % 2) * 120)), ctx.canvas.height - this.r(235) + this.r((Math.floor(i / 2) * 120)), this.r(100), this.r(100));
            }
            ctx.strokeRect(ctx.canvas.width - this.r(235) + this.r(((i % 2) * 120)), ctx.canvas.height - this.r(235) + this.r((Math.floor(i / 2) * 120)), this.r(100), this.r(100));
            if (!this.is.map(i => i.item).includes(d)) {
                this.is.push({
                    item: d,
                    pos: [ctx.canvas.width - this.r(235) + this.r(((i % 2) * 120)), ctx.canvas.height - this.r(235) + this.r((Math.floor(i / 2) * 120)), this.r(100), this.r(100)],
                    onHover: (x, y) => {
                        d.isHovering = true;
                    },
                    onClick: (x, y) => {
                        this.sd = d;
                    }
                });
            }
        });


        resources.ml.forEach((m, i) => {
            if (m.isHovering) {
                if (m.rl <= resources.l) {
                    ctx.fillStyle = '#ffaaaa20';
                    ctx.fillRect(this.r(15 + (i * 115)), ctx.canvas.height - this.r(235), this.r(100), this.r(100));
                }
                ctx.fillStyle = m.rl > resources.l ? '#221919' : '#331111';
                ctx.strokeStyle = m.rl > resources.l ? '#554545' : '#774444';
                ctx.fillRect(this.x, this.y - this.r(100), this.r(200), this.r(100));
                ctx.strokeRect(this.x, this.y - this.r(100), this.r(200), this.r(100));

                ctx.fillStyle = m.rl > resources.l ? '#887777' : '#ffdddd';
                ctx.font = `${this.r(16)}px luminari, fantasy`;
                ctx.fillText(m.n, this.x + this.r(10), this.y - this.r(78));
                ctx.font = `${this.r(14)}px luminari, fantasy`;
                ctx.fillText(`Level: ${m.rl}`, this.x + this.r(190) - ctx.measureText(`Level: ${m.rl}`).width, this.y - this.r(78));
                ctx.fillStyle = m.c >= resources.c ? '#FF0000' : (m.rl > resources.l ? '#887777' : '#ffdddd');
                ctx.fillText(`Cost: ${m.c} coins`, this.x + this.r(10), this.y - this.r(50));
                ctx.fillStyle = m.rl > resources.l ? '#887777' : '#ffdddd';
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
                    ctx.fillStyle = '#ffaaaa40';
                    ctx.fillRect(ctx.canvas.width - this.r(235) + this.r(((i % 2) * 120)), ctx.canvas.height - this.r(235) + this.r((Math.floor(i / 2) * 120)), this.r(100), this.r(100));
                }
                ctx.fillStyle = d.mc > resources.m ? '#221919' : '#331111';
                ctx.strokeStyle = d.mc > resources.m ? '#554545' : '#774444';
                ctx.fillRect(this.x - this.r(200), this.y - this.r(100), this.r(200), this.r(100));
                ctx.strokeRect(this.x - this.r(200), this.y - this.r(100), this.r(200), this.r(100));

                ctx.fillStyle = d.mc > resources.m ? '#887777' : '#ffdddd';
                ctx.font = `${this.r(16)}px luminari, fantasy`;
                ctx.fillText(d.n, this.x - this.r(190), this.y - this.r(75));
                ctx.font = `${this.r(14)}px luminari, fantasy`;
                ctx.fillText(`Misery Inflicted: ${Math.floor(d.mb * 100)}%`, this.x - this.r(190), this.y - this.r(50));
                ctx.fillText(`Misery Cost: ${d.mc}/cycle`, this.x - this.r(190), this.y - this.r(30));
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
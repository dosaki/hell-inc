import resources from '../entities/resources';
import { isMuted, toggleSound, Note } from '../utils/audio-utils';
import { dimg } from '../utils/image-util';

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
        this.dm = false; // delete mode
        this.$ = false; // monetisation enabled?
        this.$btn = {};
        this.mbtn = {};
        this.ebtn = {};
        this.lbtn = {};
        this.rbtn = {};
        this.dmbtn = {};
        this.clbtn = {};
        this.mlbtn = {};
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

    /**
     * Do hovers
     */
    dh(x, y, h) {
        this.x = x;
        this.y = y;
        this.ma = y < h - this.r(250);
        this.is.forEach(i => {
            const wasHovering = i.item.ih;
            i.item.ih = this.cmi(i.pos, x, y);
            if (i.item.ih) { //ih = is hovering
                i.onHover(x, y);
            }
            if (wasHovering && !i.item.ih) {
                i.onMouseOut();
            }
        });
    }

    /**
     * Do clicks
     */
    dc() {
        this.is.forEach(i => this.cmi(i.pos, this.x, this.y) ? i.onClick(this.x, this.y) : null);
        return this.wi.map(i => this.cmi(i.pos, this.x, this.y) ? i.onClick(this.x, this.y) : null)
            .filter(r => r && !r.pp).length > 0; //pp = prevent propagation
    }

    /**
     * Do right clicks
     */
    drc() {
        this.si = null;
        this.sd = null;
        this.dm = null;
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
     * Make button
     */
    mkbtn(ctx, element, text, dimensions, onClick, iconAdjust = [0, 0], fill = '#311', stroke = '#744', isDisabled = false, hueRotation = 0) {
        if (typeof fill === 'string') {
            ctx.fillStyle = fill;
            ctx.fillRect(...dimensions);
        } else {
            ctx.filter = `hue-rotate(${hueRotation}deg)`;
            ctx.drawImage(fill, ...dimensions);
            ctx.filter = "none";
        }

        if (isDisabled) {
            ctx.fillStyle = '#3338';
            ctx.fillRect(...dimensions);
        }

        ctx.strokeStyle = stroke;
        ctx.strokeRect(...dimensions);
        ctx.fillStyle = '#fee';

        text && text.split("\n").forEach((n, j) => ctx.fillText(n, dimensions[0] + this.r(2) + iconAdjust[0], dimensions[1] + this.r(18) + iconAdjust[1] + this.r(j * 25)));
        if (!this.is.map(i => i.item).includes(element)) {
            this.is.push({
                item: element,
                pos: [...dimensions],
                onHover: () => {
                    element.ih = true;
                    if (!element.ps) {
                        Note.new("c#", 2, 0.05).play();
                    }
                    element.ps = true;
                },
                onClick: () => {
                    onClick();
                    Note.new("f#", 4, 0.05).play(0.5);
                },
                onMouseOut: () => {
                    element.ps = false;
                }
            });
        }
        if (element.ih && !isDisabled) {
            ctx.fillStyle = '#faa2';
            ctx.fillRect(...dimensions);
        }
    }

    /**
     * Draw Interface
     * @param {*} ctx 
     */
    di(ctx) {
        const canvasSize = ctx.canvas.width;
        ctx.imageSmoothingEnabled = false;

        ctx.fillStyle = '#211';
        ctx.strokeStyle = '#977';
        ctx.fillRect(0, canvasSize - this.r(250), canvasSize, this.r(250));
        ctx.strokeRect(0, canvasSize - this.r(250), canvasSize, this.r(250));

        ctx.font = `${this.r(16)}px luminari, fantasy`;
        this.mkbtn(ctx, this.mbtn, isMuted() ? "🔇" : "🔊",
            [canvasSize - this.r(35), this.r(10), this.r(25), this.r(25)],
            () => toggleSound());
        this.mkbtn(ctx, this.ebtn, "🔙",
            [this.r(10), this.r(10), this.r(25), this.r(25)],
            () => location.reload());

        ctx.font = `${this.r(50)}px luminari, fantasy`;
        this.mkbtn(ctx, this.lbtn, "↩",
            [this.r(10), canvasSize - this.r(310), this.r(50), this.r(50)],
            () => {

                window.cc = (window.cc + 1) % 4;
                window.cams[window.cc]();
            },
            [this.r(2), this.r(25)]);
        this.mkbtn(ctx, this.rbtn, "↪",
            [canvasSize - this.r(60), canvasSize - this.r(310), this.r(50), this.r(50)],
            () => {
                window.cc = (window.cc - 1) < 0 ? 3 : (window.cc - 1);
                window.cams[window.cc]();
            },
            [this.r(2), this.r(25)]);

        // Balance
        ctx.fillStyle = '#fee';
        ctx.font = `${this.r(16)}px luminari, fantasy`;
        ctx.fillText(`Balance`, this.r(10), canvasSize - this.r(80));
        ctx.moveTo(this.r(10), canvasSize - this.r(76));
        ctx.lineTo(this.r(105), canvasSize - this.r(76));
        ctx.stroke();

        ctx.fillText(`🪙`, this.r(10), canvasSize - this.r(56));
        ctx.fillText(resources.c, this.r(10), canvasSize - this.r(38));
        ctx.fillText(`🌀`, this.r(60), canvasSize - this.r(56));
        ctx.fillText(resources.m, this.r(60), canvasSize - this.r(38));

        // Coin loan button
        ctx.font = `${this.r(10)}px luminari, fantasy`;
        this.mkbtn(ctx, this.clbtn, "+50",
            [this.r(32), canvasSize - this.r(70), this.r(25), this.r(16)],
            () => {
                if(resources.clv.length < 4){
                    resources.clv.push(80);
                    resources.c += 50;
                }
            },
            [0, -8],
            '#311',
            '#744');
        
        // Misery loan button
        this.mkbtn(ctx, this.mlbtn, "+100",
            [this.r(82), canvasSize - this.r(70), this.r(25), this.r(16)],
            () => {
                if(this.$ && resources.mlv.length < 4){
                    resources.mlv.push(150);
                    resources.m += 100;
                }
            },
            [0, -8],
            this.$ ? '#311' : '#211',
            this.$ ? '#744' : '#544',
            !this.$);


        ctx.font = `${this.r(16)}px luminari, fantasy`;
        // Soul scoring
        ctx.fillText(`Souls`, this.r(135), canvasSize - this.r(80));
        ctx.moveTo(this.r(135), canvasSize - this.r(76));
        ctx.lineTo(this.r(418), canvasSize - this.r(76));
        ctx.stroke();

        ctx.fillText(`Accepted`, this.r(135), canvasSize - this.r(56));
        ctx.fillText(resources.sa, this.r(135), canvasSize - this.r(38));

        ctx.fillText(`Declined`, this.r(208), canvasSize - this.r(56));
        ctx.fillText(resources.sd, this.r(208), canvasSize - this.r(38));

        ctx.fillText(`Extracted`, this.r(279), canvasSize - this.r(56));
        ctx.fillText(resources.se, this.r(279), canvasSize - this.r(38));

        ctx.fillText(`Destroyed`, this.r(350), canvasSize - this.r(56));
        ctx.fillText(`${resources.ds} / ${resources.md}`, this.r(350), canvasSize - this.r(38));

        ctx.fillText(`Cycle`, this.r(10), canvasSize - this.r(10));
        ctx.fillRect(this.r(55), canvasSize - this.r(20), this.c / 100, this.r(10));
        ctx.strokeRect(this.r(55), canvasSize - this.r(20), 100, this.r(10));

        ctx.fillText(`Level`, this.r(453), canvasSize - this.r(80));
        ctx.font = `${this.r(40)}px luminari, fantasy`;
        ctx.moveTo(this.r(453), canvasSize - this.r(76));
        ctx.lineTo(this.r(488), canvasSize - this.r(76));
        ctx.stroke();
        ctx.fillText(resources.l, this.r(453), canvasSize - this.r(39));

        // Machine buttons
        resources.ml.forEach((m, i) => {
            ctx.font = `${this.r(16)}px luminari, fantasy`;
            let n = [m.n];
            const txt = ctx.measureText(m.n);
            if (txt.width > this.r(76)) {
                n = m.n.split(" ");
            }
            this.mkbtn(ctx, m, n.join("\n"),
                [this.r(15 + (i * 115)), canvasSize - this.r(235), this.r(100), this.r(100)],
                () => {
                    if (m.rl <= resources.l) {
                        this.si = m;
                    }
                },
                [10, 10],
                '#311',
                '#744',
                m.rl > resources.l);
        });

        // Mass sell button
        this.mkbtn(ctx, this.dmbtn, "Sell",
            [this.r(615), canvasSize - this.r(70), this.r(50), this.r(50)],
            () => {
                ui.dm = true;
            },
            [10, 10],
            '#311',
            this.dm ? '#ff0' : '#744');
        

        // Demon buttons
        resources.dl.forEach((d, i) => {
            this.mkbtn(ctx, d, 0,
                [canvasSize - this.r(235) + this.r(((i % 2) * 120)), canvasSize - this.r(235) + this.r((Math.floor(i / 2) * 120)), this.r(100), this.r(100)],
                () => {
                    this.sd = d;
                },
                [0, 0],
                dimg,
                this.sd === d ? '#ff0' : '#744',
                d.mc > resources.m,
                d.hr);
        });

        // Demon refresh button
        this.mkbtn(ctx, this.$btn, "↻",
            [canvasSize - this.r(142.5), canvasSize - this.r(140.5), this.r(35), this.r(35)],
            () => {
                if (this.$ && resources.c >= 5) {
                    this.is = this.is.filter(i => !resources.dl.includes(i.item));
                    Note.new("f#", 4, 0.05).play(0.5);
                    resources.c = resources.c - 5;
                    resources.nd();
                }
            },
            [this.r(8), this.r(5)],
            this.$ ? '#311' : '#211',
            this.$ ? '#744' : '#544',
            !this.$);

        // Machine hovers
        resources.ml.forEach((m, i) => {
            if (m.ih) {
                if (m.rl <= resources.l) {
                    ctx.fillStyle = '#faa2';
                    ctx.fillRect(this.r(15 + (i * 115)), canvasSize - this.r(235), this.r(100), this.r(100));
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
                ctx.fillText(`-${m.c} 🪙`, this.x + this.r(10), this.y - this.r(50));
                ctx.fillStyle = m.rl > resources.l ? '#877' : '#fdd';
                if (m.mt) {
                    ctx.fillText(`🌀: +${m.mt}`, this.x + this.r(10), this.y - this.r(32));
                }
                if (m.nd) {
                    ctx.font = `${this.r(10)}px luminari, fantasy`;
                    ctx.fillText("Requires operator", this.x + this.r(10), this.y - this.r(12));
                }
            }
        });

        // Demon hovers
        resources.dl.forEach((d) => {
            if (d.ih) {
                ctx.fillStyle = d.mc > resources.m ? '#211' : '#311';
                ctx.strokeStyle = d.mc > resources.m ? '#544' : '#744';
                ctx.fillRect(this.x - this.r(200), this.y - this.r(100), this.r(200), this.r(100));
                ctx.strokeRect(this.x - this.r(200), this.y - this.r(100), this.r(200), this.r(100));

                ctx.fillStyle = d.mc > resources.m ? '#877' : '#fdd';
                ctx.font = `${this.r(16)}px luminari, fantasy`;
                ctx.fillText(d.n, this.x - this.r(190), this.y - this.r(75));
                ctx.font = `${this.r(14)}px luminari, fantasy`;
                ctx.fillText(`${Math.floor(d.mb * 100)}% 🌀`, this.x - this.r(190), this.y - this.r(50));
                ctx.fillText(new Array(Math.round(d.e * 3.33)).fill().map(i => "⭐").join(""), this.x - this.r(190), this.y - this.r(30));
                ctx.fillText(`-${d.mc}🌀/cycle`, this.x - this.r(190), this.y - this.r(10));
            }
        });

        // Demon refresh button hover
        if (this.$btn.ih) {
            if (this.$) {
                ctx.fillStyle = '#faa2';
                ctx.fillRect(canvasSize - this.r(142.5), canvasSize - this.r(140.5), this.r(35), this.r(35));
            }
            ctx.fillStyle = this.$ ? '#311' : '#211';
            ctx.strokeStyle = this.$ ? '#744' : '#544';
            ctx.fillRect(this.x - this.r(200), this.y - this.r(100), this.r(200), this.r(100));
            ctx.strokeRect(this.x - this.r(200), this.y - this.r(100), this.r(200), this.r(100));

            ctx.fillStyle = this.$ ? '#fdd' : '#877';
            ctx.font = `${this.r(16)}px luminari, fantasy`;
            ctx.fillText("Refresh Demons", this.x - this.r(190), this.y - this.r(75));
            ctx.font = `${this.r(14)}px luminari, fantasy`;
            if (!this.$) {
                ctx.fillStyle = "#f22";
                ctx.fillText("Monetization disabled", this.x - this.r(190), this.y - this.r(50));
            }
            ctx.fillStyle = resources.c < 5 ? '#f22' : (this.$ ? '#fdd' : '#877');
            ctx.fillText("-5🪙", this.x - this.r(190), this.y - this.r(10));
        }
    }

    /**
     * Draw
     */
    dr(ctx) {
        this.di(ctx);
        this.dwpu(ctx);
    }
}

const ui = new Ui();

export default ui;
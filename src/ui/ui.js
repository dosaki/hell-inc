import resources from '../entities/resources';


class Ui {
    constructor() {
        this.items = [];
        this.selectedItem = null;
        this.x = 0;
        this.y = 0;
        this.inMapArea = false;
        this.size = 1100;
    }

    r(size) {
        return this.size < 1100 ? (size * this.size) / 1100 : size;
    }

    coordinatesMatchItem(item, x, y) {
        return item.pos[0] <= x && (item.pos[0] + item.pos[2]) >= x &&
            item.pos[1] <= y && (item.pos[1] + item.pos[3]) >= y;
    }

    doHovers(x, y, h) {
        this.x = x;
        this.y = y;
        this.inMapArea = y < h - this.r(250);
        this.items.forEach(i => this.coordinatesMatchItem(i, x, y) ? i.onHover(x, y) : (i.item.isHovering = false));
    }

    doClicks() {
        this.items.forEach(i => this.coordinatesMatchItem(i, this.x, this.y) ? i.onClick(this.x, this.y) : null);
    }

    doRightClicks() {
        this.selectedItem = null;
    }

    drawTooltip(x, y) {

    }

    drawBot(ctx) {
        ctx.fillStyle = '#221111';
        ctx.strokeStyle = '#997777';
        ctx.fillRect(0, ctx.canvas.height - this.r(250), ctx.canvas.width, this.r(250));
        ctx.strokeRect(0, ctx.canvas.height - this.r(250), ctx.canvas.width, this.r(250));

        resources.machines.forEach((m, i) => {
            ctx.fillStyle = m.requiredLevel > resources.currentLevel ? '#221919' : '#331111';
            ctx.strokeStyle = m.requiredLevel > resources.currentLevel ? '#554545' : '#774444';
            ctx.fillRect(this.r(15 + (i * 115)), ctx.canvas.height - this.r(235), this.r(100), this.r(100));
            ctx.strokeRect(this.r(15 + (i * 115)), ctx.canvas.height - this.r(235), this.r(100), this.r(100));

            ctx.fillStyle = m.requiredLevel > resources.currentLevel ? '#887777' : '#ffdddd';
            ctx.font = `${this.r(16)}px luminari, fantasy`;
            let name = [m.name];
            const txt = ctx.measureText(m.name);
            if (txt.width > this.r(76)) { // 100 - 24 = 96
                name = m.name.split(" ");
            }
            name.forEach((n, j) => ctx.fillText(n, this.r(27 + (i * 115)), ctx.canvas.height - this.r(210) + this.r(j * 25)));

            if (!this.items.map(i => i.item).includes(m)) {
                this.items.push({
                    item: m,
                    pos: [this.r(15 + (i * 115)), ctx.canvas.height - this.r(235), this.r(100), this.r(100)],
                    onHover: (x, y) => {
                        m.isHovering = true;
                    },
                    onClick: (x, y) => {
                        if (m.requiredLevel <= resources.currentLevel) {
                            this.selectedItem = m;
                        }
                    }
                });
            }
        });

        resources.demonsToHire.forEach((d, i) => {
            ctx.fillStyle = d.miseryCost > resources.misery ? '#221919' : '#331111';
            ctx.strokeStyle = d.miseryCost > resources.misery ? '#554545' : '#774444';
            ctx.fillRect(ctx.canvas.width - this.r(235) + this.r(((i % 2) * 120)), ctx.canvas.height - this.r(235) + this.r((Math.floor(i / 2) * 120)), this.r(100), this.r(100));
            ctx.strokeRect(ctx.canvas.width - this.r(235) + this.r(((i % 2) * 120)), ctx.canvas.height - this.r(235) + this.r((Math.floor(i / 2) * 120)), this.r(100), this.r(100));
            if (!this.items.map(i => i.item).includes(d)) {
                this.items.push({
                    item: d,
                    pos: [ctx.canvas.width - this.r(235) + this.r(((i % 2) * 120)), ctx.canvas.height - this.r(235) + this.r((Math.floor(i / 2) * 120)), this.r(100), this.r(100)],
                    onHover: (x, y) => {
                        d.isHovering = true;
                    },
                    onClick: (x, y) => {
                        this.selectedItem = m;
                    }
                });
            }
        });


        resources.machines.forEach((m, i) => {
            if (m.isHovering) {
                if (m.requiredLevel <= resources.currentLevel) {
                    ctx.fillStyle = '#FFaaaa40';
                    ctx.fillRect(this.r(15 + (i * 115)), ctx.canvas.height - this.r(235), this.r(100), this.r(100));
                }
                ctx.fillStyle = m.requiredLevel > resources.currentLevel ? '#221919' : '#331111';
                ctx.strokeStyle = m.requiredLevel > resources.currentLevel ? '#554545' : '#774444';
                ctx.fillRect(this.x, this.y - this.r(100), this.r(200), this.r(100));
                ctx.strokeRect(this.x, this.y - this.r(100), this.r(200), this.r(100));
            }
        });

        resources.demonsToHire.forEach((d, i) => {
            if (d.isHovering) {
                ctx.fillStyle = d.miseryCost > resources.misery ? '#221919' : '#331111';
                ctx.strokeStyle = d.miseryCost > resources.misery ? '#554545' : '#774444';
                ctx.fillRect(this.x - this.r(200), this.y - this.r(100), this.r(200), this.r(100));
                ctx.strokeRect(this.x - this.r(200), this.y - this.r(100), this.r(200), this.r(100));
            }
        });
    }

    draw(ctx) {
        this.drawBot(ctx);
    }
}

const ui = new Ui();

export default ui;
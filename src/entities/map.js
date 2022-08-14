import { int, pick } from '../utils/random-utils';

class Map {
    constructor(mapSize, tileSize, height) {
        this.tileSize = tileSize;
        this.mapSize = mapSize;
        this.height = height;

        this.mapHeight = (tileSize * 0.6 * mapSize) + height;
        this.map = [...new Array(mapSize)].map((_, j) => [...new Array(mapSize)].map((_, i) => {
            if (!i) {
                return { layer: "back", height };
            }
            if (j === mapSize - 1) {
                return { layer: "back", height };
            }
            if (j === 0 && [(this.mapSize / 2) + 1, this.mapSize / 2, (this.mapSize / 2) - 1].includes(i)) {
                return { layer: "ground", height: 0 };
            }
            if (i === mapSize - 1) {
                return { layer: "front", height: 15 };
            }
            if (!j) {
                return { layer: "front", height: 15 };
            }
            return { layer: "ground", height: int(0, 50) ? 0 : Math.round(pick(height / 2, height / 3)) };
        }));
    }


    makeTile = (ctx, x, y, h) => {
        
        if (h > 0) {
            ctx.fillStyle = "#773333";
            ctx.beginPath();
            ctx.moveTo(x, y - h);
            ctx.lineTo(x, y + this.tileSize / 2);
            ctx.lineTo(x + this.tileSize, y);
            ctx.lineTo(x + this.tileSize, y - h);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
            
            ctx.fillStyle = "#662222";
            ctx.beginPath();
            ctx.moveTo(x - this.tileSize, y);
            ctx.lineTo(x - this.tileSize, y - h);
            ctx.lineTo(x, y - h);
            ctx.lineTo(x, y + this.tileSize / 2);
            ctx.closePath();
            ctx.stroke();
            ctx.fill();
        }

        ctx.fillStyle = "#884444";
        ctx.beginPath();
        ctx.moveTo(x - this.tileSize, y - h);
        ctx.lineTo(x, y - (this.tileSize / 2 + h));
        ctx.lineTo(x + this.tileSize, y - h);
        ctx.lineTo(x, y + (this.tileSize / 2 - h));
        ctx.closePath();
        ctx.stroke();
        ctx.fill();
    };

    drawMapLayer = (ctx, layer) => {
        for (let j = this.map.length - 1; j >= 0; j--) {
            for (let i = 0; i < this.map[j].length; i++) {
                if (this.map[j][i].layer === layer) {
                    this.makeTile(ctx,
                        this.tileSize + i * this.tileSize + j * this.tileSize,
                        this.mapHeight + i * this.tileSize / 2 - j * this.tileSize / 2,
                        this.map[j][i].height);
                }
            }
        }
    };

    drawMap = (ctx) => {
        this.drawMapLayer(ctx, "back");
        this.drawMapLayer(ctx, "ground");
        this.drawMapLayer(ctx, "front");
    };
}

export default Map;
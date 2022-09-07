import { perlin } from './perlin';
import { int } from './random-utils';

let imgs = 0;

export const createImage = (width, height, colourArray, coloursOrMax = 150) => {
    const rimgData = new ImageData(width, height);
    if (Array.isArray(coloursOrMax)) {
        rimgData.data.set(colourArray.map(i => coloursOrMax[i]).flat());
    } else {
        const n = perlin(width, height);
        rimgData.data.set(n.map(i => {
            const colour = [int(10 * i, 50 * i), int(10 * i, 50 * i), int(10 * i, 50 * i), 255];
            colourArray.forEach(index => colour[index] = Math.max(60, Math.floor(i * coloursOrMax)));
            return colour;
        }).flat());
    }
    const rimgCanvas = document.createElement('canvas');
    rimgCanvas.width = width;
    rimgCanvas.height = height;
    const rimgCtx = ct.getContext('2d');
    rimgCtx.imageSmoothingEnabled = false;
    rimgCanvas.getContext('2d').putImageData(rimgData, 0, 0);
    const rimg = new Image();
    rimg.id = `genimg${imgs}`;
    imgs++;
    rimg.src = rimgCanvas.toDataURL();
    rimgCanvas.remove();
    return rimg;
};

export const dimg = createImage(16, 16, [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0,
    0, 0, 0, 2, 2, 0, 0, 0, 0, 0, 0, 0, 2, 2, 0, 0,

    0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 2, 0, 0,
    0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 0, 4, 4, 3, 0, 0,
    0, 0, 0, 4, 5, 0, 0, 0, 0, 0, 5, 4, 4, 0, 0, 0,
    0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0,

    0, 0, 0, 5, 6, 6, 5, 5, 6, 6, 5, 0, 0, 0, 0, 0,
    0, 0, 0, 5, 7, 6, 5, 5, 7, 6, 5, 0, 0, 0, 0, 0,
    0, 0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0,

    0, 0, 0, 0, 0, 5, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 5, 5, 5, 3, 5, 5, 5, 0, 0, 0, 0, 0, 0,
    0, 0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0, 0,
    0, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 0, 0, 0
], [
    [0, 0, 0, 255],
    [159, 78, 76, 255],
    [104, 51, 47, 255],
    [82, 54, 50, 255],
    [38, 38, 35, 255],
    [24, 25, 24, 255],
    [141, 26, 24, 255],
    [255, 0, 0, 255]
]);
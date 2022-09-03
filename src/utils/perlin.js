import { int } from './random-utils';

export const createPerlinImage = (size, colourIndexes, max = 150, imageSmoothingEnabled = false) => {
    const rimgData = new ImageData(size, size);
    const n = perlin(size, 2);
    rimgData.data.set(n.map(i => {
        const colour = [int(10 * i, 50 * i), int(10 * i, 50 * i), int(10 * i, 50 * i), 255];
        colourIndexes.forEach(index => colour[index] = Math.max(60, Math.floor(i * max)));
        return colour;
    }).flat());
    const rimgCanvas = document.createElement('canvas');
    rimgCanvas.width = size;
    rimgCanvas.height = size;
    const rimgCtx = ct.getContext('2d');
    rimgCtx.imageSmoothingEnabled = imageSmoothingEnabled;
    rimgCanvas.getContext('2d').putImageData(rimgData, 0, 0);
    const rimg = new Image();
    rimg.id = `${size}${colourIndexes.join('')}${imageSmoothingEnabled}`;
    rimg.src = rimgCanvas.toDataURL();
    rimgCanvas.remove();
    return rimg;
};

function perlin(size, octaveCount = 4, amplitude = 0.1, persistence = 0.2) {
    var smoothNoiseList = [...new Array(octaveCount)].map((a, i) => generateSmoothNoise(size, i));
    var perlinNoise = new Array(size * size);
    var totalAmplitude = 0;
    // blend noise together
    for (let i = octaveCount - 1; i >= 0; --i) {
        amplitude *= persistence;
        totalAmplitude += amplitude;

        for (var j = 0; j < perlinNoise.length; ++j) {
            perlinNoise[j] = perlinNoise[j] || 0;
            perlinNoise[j] += smoothNoiseList[i][j] * amplitude;
        }
    }
    // normalization
    for (let i = 0; i < perlinNoise.length; ++i) {
        perlinNoise[i] /= totalAmplitude;
    }

    return perlinNoise;
}


function generateSmoothNoise(size, octave) {
    var whiteNoise = [...new Array(size * size)].map(_ => Math.random());
    var noise = new Array(size * size);
    var samplePeriod = Math.pow(2, octave);
    var sampleFrequency = 1 / samplePeriod;
    var noiseIndex = 0;
    for (var y = 0; y < size; ++y) {
        var sampleY0 = Math.floor(y / samplePeriod) * samplePeriod;
        var sampleY1 = (sampleY0 + samplePeriod) % size;
        var vertBlend = (y - sampleY0) * sampleFrequency;
        for (var x = 0; x < size; ++x) {
            var sampleX0 = Math.floor(x / samplePeriod) * samplePeriod;
            var sampleX1 = (sampleX0 + samplePeriod) % size;
            var horizBlend = (x - sampleX0) * sampleFrequency;

            // blend top two corners
            var top = interpolate(whiteNoise[sampleY0 * size + sampleX0], whiteNoise[sampleY1 * size + sampleX0], vertBlend);
            // blend bottom two corners
            var bottom = interpolate(whiteNoise[sampleY0 * size + sampleX1], whiteNoise[sampleY1 * size + sampleX1], vertBlend);
            // final blend
            noise[noiseIndex] = interpolate(top, bottom, horizBlend);
            noiseIndex += 1;
        }
    }
    return noise;
}

function interpolate(x0, x1, alpha) {
    return x0 * (1 - alpha) + alpha * x1;
}
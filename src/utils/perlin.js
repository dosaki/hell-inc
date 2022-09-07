export function perlin(width, height, amplitude = 0.1) {
    var smoothNoiseList = [...new Array(2)].map((a, i) => generateSmoothNoise(width, height, i));
    var perlinNoise = new Array(width * height);
    var totalAmplitude = 0;
    // blend noise together
    for (let i = 1; i >= 0; --i) {
        amplitude *= 0.2;
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


function generateSmoothNoise(width, height, octave) {
    var whiteNoise = [...new Array(width * height)].map(_ => Math.random());
    var noise = new Array(width * height);
    var samplePeriod = Math.pow(2, octave);
    var sampleFrequency = 1 / samplePeriod;
    var noiseIndex = 0;
    for (var y = 0; y < height; ++y) {
        var sampleY0 = Math.floor(y / samplePeriod) * samplePeriod;
        var sampleY1 = (sampleY0 + samplePeriod) % height;
        var vertBlend = (y - sampleY0) * sampleFrequency;
        for (var x = 0; x < width; ++x) {
            var sampleX0 = Math.floor(x / samplePeriod) * samplePeriod;
            var sampleX1 = (sampleX0 + samplePeriod) % width;
            var horizBlend = (x - sampleX0) * sampleFrequency;

            // blend top two corners
            var top = interpolate(whiteNoise[sampleY0 * width + sampleX0], whiteNoise[sampleY1 * height + sampleX0], vertBlend);
            // blend bottom two corners
            var bottom = interpolate(whiteNoise[sampleY0 * width + sampleX1], whiteNoise[sampleY1 * height + sampleX1], vertBlend);
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
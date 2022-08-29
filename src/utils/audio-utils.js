let context = null;
const AudioContext = window.AudioContext || window.webkitAudioContext;

const isFirefox = typeof InstallTrigger !== 'undefined'; // This is because firefox has a bug with exponentialRampToValueAtTime

const play = (frequency, duration, trail, initialVolume, type) => {
    if (!context) {
        context = new AudioContext();
    }
    const _trail = trail || 0.1;
    const _duration = isFirefox ? _trail * 1000 : (duration || _trail * 1000);
    const _frequency = frequency || 440.0;

    const volume = context.createGain();
    const oscillator = context.createOscillator();
    oscillator.connect(volume);
    volume.connect(context.destination);
    volume.gain.value = initialVolume || 0.3;

    if (isFirefox) {
        volume.gain.setValueCurveAtTime([volume.gain.value, volume.gain.value / 2, volume.gain.value / 4, volume.gain.value / 8, 0.00001, 0], context.currentTime, _trail);
    } else {
        volume.gain.exponentialRampToValueAtTime(0.00001, context.currentTime + _trail);
    }
    oscillator.type = type || "sine";
    oscillator.frequency.value = _frequency;
    oscillator.start();
    if (_duration) {
        setTimeout(() => {
            oscillator.stop();
        }, _duration);
    }
};

const noteFrequencies = {
    'c#': 17.32,
    // 'd#': 19.45,
    'e': 20.60,
    'f#': 23.12,
    // 'g#': 25.96,
    // 'a#': 29.14,
    'b': 30.87,
};

export class Note {
    constructor(frequency, trail, duration) {
        this.f = frequency;
        this.t = trail;
        this.d = duration;
    }

    play(volume, type) {
        play(this.f, this.d, this.t, volume, type);
    }

    static new = (note, octave, trail, duration) => {
        return new Note(noteFrequencies[note] * Math.pow(2, octave), trail, duration);
    };
}
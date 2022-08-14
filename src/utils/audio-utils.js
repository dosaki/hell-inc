import { int, pick } from './random-utils';

let context = null;
const AudioContext = window.AudioContext || window.webkitAudioContext;

const isFirefox = typeof InstallTrigger !== 'undefined'; // This is because firefox has a bug with exponentialRampToValueAtTime

export const play = (type, frequency, duration, trail, initialVolume) => {
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
    volume.gain.value = initialVolume || 1;

    if(isFirefox){
        volume.gain.setValueCurveAtTime([volume.gain.value, volume.gain.value/2, volume.gain.value/4, volume.gain.value/8, 0.00001, 0], context.currentTime, _trail);
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

const genderFrequencyMultiplier = {
    "male": 0.85,
    "female": 2.2
};

const sentenceTypes = {
    "exclamation": { start: [], ending: [125, 150, 175, 1, 1], rate: 0.9 },
    "calm": { start: [], ending: [1, 1], rate: 1.2 },
};

export const speak = (length, gender, wave, type, destination) => {
    const sentenceProperties = sentenceTypes[type.toLowerCase()] || senteceTypes["normal"];
    const sequence = [...sentenceProperties.start.map(f => f * int(0.8, 1.3)), ...new Array(Math.max(length - sentenceProperties.ending.length, 0)).fill(0).map(_ => int(80, 200)), ...sentenceProperties.ending.map(f => f * int(0.8, 1))];
    sequence.forEach((freq, i) => {
        setTimeout(() => {
            if (destination) {
                play(wave || "sawtooth", freq * genderFrequencyMultiplier[gender || "female"], 100 * sentenceProperties.rate, 0.1 * sentenceProperties.rate, destination, 0.05);
            }
            play(wave || "sawtooth", freq * genderFrequencyMultiplier[gender || "female"], 100 * sentenceProperties.rate, 0.1 * sentenceProperties.rate, 0.05);
        }, 100 * sentenceProperties.rate * i);
    });
};

const noteFrequencies = {
    'C#': 17.32,
    'D#': 19.45,
    'E': 20.60,
    'F#': 23.12,
    'G#': 25.96,
    'A#': 29.14,
    'B': 30.87,
};

export class Note {
    constructor(frequency, trail, duration, octave, name) {
        this.frequency = frequency;
        this.trail = trail;
        this.duration = duration;
        this.octave = octave;
        this.name = name;
    }

    play(type, volume) {
        play(type, this.frequency, this.duration, this.trail, volume);
    }

    static create = (note, octave, trail, duration) => {
        return new Note(noteFrequencies[note] * Math.pow(2, octave), trail, duration, octave, note);
    };
}

export class Track {
    constructor(notes, type, tempo, volume, waitBeforeLoop) {
        this.type = type;
        this.tempo = tempo || 1;
        this.volume = volume;
        this.noteIndex = 0;
        this.loop = waitBeforeLoop !== null && waitBeforeLoop !== undefined;
        this.waitBeforeLoop = waitBeforeLoop || 0;
        this.notes = [...notes, ...new Array(this.waitBeforeLoop).fill(null)];
        this.lastTime = 0;
    }

    playNextNote(time, msPerBeat) {
        if ((time - this.lastTime) >= (msPerBeat * this.tempo)) {
            if (this.notes[this.noteIndex]) {
                this.notes[this.noteIndex].play(this.type, this.volume);
            }
            this.noteIndex++;
            if (this.loop && this.noteIndex >= this.notes.length) {
                this.noteIndex = 0;
            }
            this.lastTime = time;
        }
    }
}

export class DynamicTrack {
    constructor(notePool, type, tempo, volume) {
        this.type = type;
        this.tempo = tempo || 1;
        this.volume = volume;
        this.notePool = notePool;
        this.lastTime = 0;
        this.toneLength = 0;
        this.noteIndex = 0;
        this.lastNote = null;
    }

    playNextNote(time, msPerBeat) {
        if ((time - this.lastTime) >= (msPerBeat * this.tempo)) {
            let nextIndex = this.noteIndex + 1;
            if (nextIndex >= this.notePool.length) {
                nextIndex = 0;
            }
            const noteToPlay = pick(...this.notePool[this.noteIndex]);
            const length = pick(0.5, 1, 2);
            if (noteToPlay && !(!this.lastNote && this.noteIndex % 2)) {
                Note.create(noteToPlay[0], noteToPlay[1], length, Math.max(1, length) * 1000)
                    .play(this.type, this.volume);
            }
            this.lastNote = noteToPlay;
            this.noteIndex = nextIndex;
            this.lastTime = time;
        }
    }
}

export class Music {
    constructor(tracks, bpm) {
        this.bpm = bpm;
        this.tracks = tracks;
    }

    get msPerBeat() {
        return 60000 / this.bpm;
    }

    play(time) {
        this.tracks.forEach(t => {
            t.playNextNote(time, this.msPerBeat);
        });
    }
}

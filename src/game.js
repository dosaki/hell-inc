import Map from './entities/map';
import ui from './ui/ui';
import { int } from './utils/random-utils';
import { isMuted, Note } from './utils/audio-utils';
import resources from './entities/resources';
import { music } from './audio/music';

if (document.monetization) {
    document.monetization.addEventListener('monetizationstart', () => {
        ui.$ = true;
    });
}

const W = window.W;
const windowSize = Math.min(window.innerWidth, window.innerHeight);

let zoom = 45;


W.add("cube", {
    vertices: [
        .5, .5, .5, -.5, .5, .5, -.5, -.5, .5, // front
        .5, .5, .5, -.5, -.5, .5, .5, -.5, .5,
        .5, .5, -.5, .5, .5, .5, .5, -.5, .5, // right
        .5, .5, -.5, .5, -.5, .5, .5, -.5, -.5,
        .5, .5, -.5, -.5, .5, -.5, -.5, .5, .5, // up
        .5, .5, -.5, -.5, .5, .5, .5, .5, .5,
        -.5, .5, .5, -.5, .5, -.5, -.5, -.5, -.5, // left
        -.5, .5, .5, -.5, -.5, -.5, -.5, -.5, .5,
        -.5, .5, -.5, .5, .5, -.5, .5, -.5, -.5, // back
        -.5, .5, -.5, .5, -.5, -.5, -.5, -.5, -.5,
        .5, -.5, .5, -.5, -.5, .5, -.5, -.5, -.5, // down
        .5, -.5, .5, -.5, -.5, -.5, .5, -.5, -.5
    ],
    uv: [
        1, 1, 0, 1, 0, 0, // front
        1, 1, 0, 0, 1, 0,
        1, 1, 0, 1, 0, 0, // right
        1, 1, 0, 0, 1, 0,
        1, 1, 0, 1, 0, 0, // up
        1, 1, 0, 0, 1, 0,
        1, 1, 0, 1, 0, 0, // left
        1, 1, 0, 0, 1, 0,
        1, 1, 0, 1, 0, 0, // back
        1, 1, 0, 0, 1, 0,
        1, 1, 0, 1, 0, 0, // down
        1, 1, 0, 0, 1, 0
    ]
});
W.add("plane", {
    vertices: [
        .5, .5, 0, -.5, .5, 0, -.5, -.5, 0,
        .5, .5, 0, -.5, -.5, 0, .5, -.5, 0
    ],

    uv: [
        1, 1, 0, 1, 0, 0,
        1, 1, 0, 0, 1, 0
    ],
});

W.add("sh", {
    vertices: [
        .25, .5, 0,
        -.5, -.5, 0,
        .5, -.5, 0,

        .25, .5, 0,
        -.5, .5, 0,
        -.5, -.5, 0,

        0, 1, 0,
        -.5, .5, 0,
        .25, .5, 0
    ],

    uv: [
        1, 1,
        0, 0,
        1, 0,

        1, 1,
        0, 1,
        0, 0,

        0, 1.5,
        0, 1,
        1, 1
    ],
});


const screenToWorld = (x, y) => {
    const offset = [
        [-0.75, 1],
        [0, 0],
        [1, 1],
        [0, 2]
    ];
    return W.v.inverse()
        .multiply(W.projection)
        .transformPoint(new DOMPoint(
            (zoom * 2 * x - zoom) + offset[window.cc][0],
            1,
            zoom * 4 * y - (((zoom * 3) - 45 * (-1 + zoom / 45))) + offset[window.cc][1]
        ));

};

[...document.querySelectorAll('button')].forEach(btn => btn.addEventListener("mouseenter", () => {
    Note.new("c#", 2, 0.05).play();
}));
[...document.querySelectorAll('button')].forEach(btn => btn.addEventListener("click", () => {
    Note.new("f#", 4, 0.05).play(0.5);
}));

cg.width = windowSize;
cg.height = windowSize;
ui.s = windowSize;
W.reset(cg);
W.light({ x: 0.2, y: -1, z: -0.6 });
W.ambient(0.1);
W.clearColor("#000");

ct.width = windowSize;
ct.height = windowSize;
const tutorialCtx = ct.getContext('2d');

menu.style = `width:${windowSize}px;height:${windowSize}px`;

const map = new Map(50, W);
let cameraX = 0;
let cameraZ = 0;
window.cams = [
    () => {
        W.camera({ x: 0 + cameraX, y: 32, z: 0 + cameraZ, rx: -45, ry: -135 });
        map.rs(-135);
    },
    () => {
        W.camera({ x: 0 + cameraX, y: 32, z: 50 + cameraZ, rx: -45, ry: -45 });
        map.rs(-45);
    },
    () => {
        W.camera({ x: 50 + cameraX, y: 32, z: 50 + cameraZ, rx: -45, ry: 45 });
        map.rs(45);
    },
    () => {
        W.camera({ x: 50 + cameraX, y: 32, z: 0 + cameraZ, rx: -45, ry: 135 });
        map.rs(135);
    },
];
window.cc = 1;

let mX = null;
let mY = null;
let wX = null;
let wY = null;
let swX = null;
let swY = null;
let eventType = null;
let isDragging = false;
cui.width = windowSize;
cui.height = windowSize;

let isTutorial = 0;
let tutorialSteps = [
    { m: "Welcome to Hell Inc. upper management!", pgc: true },
    { m: "You've been hand-plucked from the demonic masses to manage this hell pit", pgc: true },
    { m: "Let me show you around...", pgc: true },
    { m: "This is the soul waiting area", clear: [321, 349, 60, 50], al: [351, 399], pgc: true },
    { m: "Click the space below a soul", clear: [333, 376, 20, 25], al: [344, 396], cc: true, rwp: true },
    { m: "Sinful souls give you more 🌀 but they can lie about their sins", clear: [3, 3, -176, -2], at: [0, 0], cpu: true, pgc: true },
    { m: "This gives you more info about this soul", clear: [30, 0, -38, -30], at: [0, 0], cpu: true, pgc: true },
    { m: "Weak souls may perish during torture, so you want sturdy ones", clear: [30, 0, -38, -30], at: [0, 0], cpu: true, pgc: true },
    { m: "Souls perish if waiting for too long", pgc: true },
    { m: "Don't let souls perish without extracting 🌀!", pgc: true },
    { m: "Click ✔ to accept this soul", clear: [165, 65, -170, -70], at: [0, 0], cpu: true, cc: true },
    { m: "The soul gave you some coins (🪙). You now have 22 🪙!", clear: [3, 1000, 110, 70], al: [58, 1000], pgc: true },
    { m: "It has nowhere to go, so it's waiting until there is an available machine", clear: [321, 349, 60, 50], at: [351, 399], pgc: true },
    { m: "Click the Despair Room", clear: [236, 856, 115, 115], al: [293, 856], cc: true },
    { m: "Then click your pit", clear: [422, 311, 70, 70], at: [457, 381], cc: true },
    { m: "The soul will slowly travel to the machine", pgc: true },
    { m: "Paths let them travel faster", clear: [10, 856, 115, 115], al: [67, 856], pgc: true },
    { m: "You can click and drag to fill an area with paths", pgc: true },
    { m: "Click your Dispair Room", clear: [422, 311, 70, 70], at: [457, 381], cc: true, rwp: true },
    { m: "This shows if the machine is working and who operates it", clear: [0, 0, 0, 0], at: [0, 0], cpu: true, pgc: true },
    { m: "You can sell this machine for 50% of the cost", clear: [165, 65, -160, -70], at: [0, 0], cpu: true, pgc: true },
    { m: "You can mass-sell machines (and paths) too", clear: [610, 1025, 60, 60], ab: [635, 1025], pgc: true },
    { m: "When the soul's 🌀 is full, the soul will look for an Extractor", clear: [105, 0, -160, 0], at: [0, 0], cpu: true, pgc: true },
    { m: "Click the Misery Extractor", clear: [120, 856, 115, 115], al: [177, 856], cc: true },
    { m: "Then click your pit", clear: [522, 411, 70, 70], at: [557, 481], cc: true },
    { m: "This is your available hiring pool", clear: [854, 856, 236, 236], ar: [972, 856], pgc: true },
    { m: "Each demon can induce a certain 🌀%, a certain 🌀 per cycle", clear: [854, 856, 236, 236], ar: [972, 856], pgc: true },
    { m: "Their rating (⭐) tells you how good they are at torturing without destroying a soul", clear: [854, 856, 236, 236], ar: [972, 856], pgc: true },
    { m: "Demons cost some 🌀 every cycle", clear: [5, 1074, 160, 20], al: [82, 1074], pgc: true },
    { m: "Now employ a demon by clicking a portrait", clear: [854, 856, 236, 236], ar: [972, 856], cc: true },
    { m: "Then click your Misery Extractor", clear: [522, 411, 70, 70], at: [557, 481], cc: true },
    { m: "If coins are tight, ask for a loan", clear: [30, 1030, 30, 20], al: [45, 1030], pgc: true },
    { m: "You'll pay a little bit back every cycle", pgc: true },
    { m: "Oh, you can use the mousewheel to zoom and WASD to pan", pgc: true },
    { m: "Your progress is being monitored", clear: [125, 1000, 300, 70], al: [208, 1000], pgc: true },
    { m: "That concludes your training. Have a miserable time!", pgc: true }
].map(t => {
    const _t = { ...t };
    ["clear", "al", "at", "ar", "ab"].forEach(prop => {
        if (prop in _t) {
            _t[prop] = _t[prop].map(v => ui.r(v));
        }
    });
    return _t;
});

const uiCtx = cui.getContext('2d');
window.addEventListener('keydown', (e) => {
    const keySet = [
        ["KeyA", "KeyD", "KeyS", "KeyW"],
        ["KeyW", "KeyS", "KeyA", "KeyD"],
        ["KeyD", "KeyA", "KeyW", "KeyS"],
        ["KeyS", "KeyW", "KeyD", "KeyA"]
    ];
    if (!isTutorial) {
        if (e.code === keySet[window.cc][0]) {
            cameraX = cameraX + 1;
            cameraZ = cameraZ - 1;
        }
        if (e.code === keySet[window.cc][1]) {
            cameraX = cameraX - 1;
            cameraZ = cameraZ + 1;
        }
        if (e.code === keySet[window.cc][2]) {
            cameraX = cameraX - 1;
            cameraZ = cameraZ - 1;
        }
        if (e.code === keySet[window.cc][3]) {
            cameraX = cameraX + 1;
            cameraZ = cameraZ + 1;
        }
        window.cams[window.cc]();
    }
});
ct.addEventListener('mousewheel', (e) => {
    if (!isTutorial) {
        if (e.deltaY > 0) {
            zoom = Math.min(85, zoom + 10);
        } else {
            zoom = Math.max(5, zoom - 10);
        }
        W.projection = new DOMMatrix([
            1 / zoom, 0, 0, 0,
            0, 1 / zoom, 0, 0,
            0, 0, -2 / 998, 0,
            0, 0, -1000 / (998), 1
        ]);
    }
});
ct.addEventListener("mousemove", (e) => {
    isDragging = eventType === "mousedown" || (isDragging && eventType === "hover");
    eventType = "hover";
    const rect = e.target.getBoundingClientRect();
    mX = e.clientX - rect.left;
    mY = e.clientY - rect.top;
    if (!W.v) return;
    const { x, z } = screenToWorld(mX / rect.width, mY / rect.height);
    wX = Math.min(48, Math.max(1, Math.floor(x)));
    wY = Math.min(48, Math.max(1, Math.ceil(z)));

    const shouldDoHovers = !isTutorial ||
        (isTutorial && tutorialSteps[0] && !tutorialSteps[0].cc) ||
        (isTutorial && tutorialSteps[0] && tutorialSteps[0].clear && tutorialSteps[0].cc && ui.cmi(tutorialSteps[0].cpu === true ? tutorialSteps[0].clear.map((value, i) => value + ui.cwp[i]) : tutorialSteps[0].clear, mX, mY));

    if (mX && mY && shouldDoHovers) {
        if (!ui.dh(mX, mY, uiCtx.canvas.height)) {
            map.dh(ui.si, ui.sd, ui.dm, wX, wY, ui.ma, isDragging, swX, swY);
        }
    }
});
ct.addEventListener("click", (e) => {
    eventType = "click";

    const shouldDoClicks = !isTutorial ||
        (isTutorial && tutorialSteps[0] && !tutorialSteps[0].cc) ||
        (isTutorial && tutorialSteps[0] && tutorialSteps[0].clear && tutorialSteps[0].cc && ui.cmi(tutorialSteps[0].cpu === true ? tutorialSteps[0].clear.map((value, i) => value + ui.cwp[i]) : tutorialSteps[0].clear, mX, mY));

    const passGameClick = isTutorial && tutorialSteps[0] && tutorialSteps[0].pgc;
    if (mX && mY && shouldDoClicks) {
        setTimeout(() => {
            if (isTutorial && tutorialSteps[0] && (!tutorialSteps[0].rwp || tutorialSteps[0].rwp && ui.wpu.length > 0)) {
                tutorialSteps = tutorialSteps.slice(1);
            }
        }, 2);
        if (!passGameClick && !ui.dc(mX, mY)) {
            const r = map.dc(ui.si, ui.sd, ui.dm, wX, wY, ui.ma, isDragging, swX, swY, mX, mY);
            ui.wpu = [];
            ui.cwp = [0, 0, 0, 0];
            if (r && r.popup) {
                ui.wpu.push(r.popup);
                ui.cwp = r.r(ui.r);
            }
            if(r && r.rs){
                ui.sd = null;
                ui.si = null;
                ui.dm = false;
            }
        }
        eventType === null;
    }
});
ct.addEventListener("mousedown", (e) => {
    swX = wX;
    swY = wY;
    eventType = "mousedown";
});
ct.addEventListener("mouseout", () => {
    eventType = null;
    mX = null;
    mY = null;
});
ct.oncontextmenu = (e) => {
    e.preventDefault(); e.stopPropagation();
    eventType = "rightClick";
    ui.wpu = [];

    if (mX && mY) {
        ui.drc(mX, mY);
        map.drc();
        Note.new("b", 3, 0.1).play(0.5);
        setTimeout(() => {
            Note.new("b", 3, 0.1).play(0.2);
        }, 50);
    }
};

window.speed = 1;

setTimeout(() => {
    map.dm(1);
    W.projection = new DOMMatrix([
        1 / zoom, 0, 0, 0,
        0, 1 / zoom, 0, 0,
        0, 0, -2 / 998, 0,
        0, 0, -1000 / (998), 1
    ]);
    window.cams[window.cc]();
}, 1);

let goUp = true;
setInterval(() => {
    map.anim(goUp ? 0.3 : -0.3);
    goUp = !goUp;
}, 250);

let lastDate = new Date().getTime();
let machinesLastUpdated = new Date().getTime();
let spawnSoulAt = new Date().getTime() + int(3500, 15000);
let gameLost = false;
let wasGameLost = false;
let gameLostReason = "";
const main = function (t) {
    if (!isTutorial && !isMuted()) {
        music.play(t);
    }
    gameLostReason = resources.m <= -100 ? "too much 🌀 debt" : (resources.ds > resources.md ? "destroyed too many souls" : (resources.sd > resources.md ? "declined too many souls" : (resources.c < -20 ? "lost too many coins" : "")));
    gameLost = !!gameLostReason;
    const now = new Date().getTime();
    tutorialCtx.clearRect(0, 0, cui.width, cui.height);
    map.ups();

    if (isTutorial) {
        tutorialCtx.fillStyle = gameLost ? "#0003" : "#000c";
        tutorialCtx.fillRect(0, 0, cui.width, cui.height);
        if (tutorialSteps[0]) {
            let rect = [0, 0, 0, 0];
            if (tutorialSteps[0].clear) {
                if (tutorialSteps[0].cpu === true) {
                    rect = tutorialSteps[0].clear.map((value, i) => value + ui.cwp[i]);
                } else {
                    rect = tutorialSteps[0].clear;
                }
                tutorialCtx.clearRect(...rect);
            }
            tutorialCtx.fillStyle = "#fff";
            tutorialCtx.font = `${ui.r(24, 13)}px luminari, fantasy`;
            const messageWidth = tutorialCtx.measureText(tutorialSteps[0].m).width;
            tutorialCtx.fillText(tutorialSteps[0].m,
                windowSize / 2 - messageWidth / 2,
                windowSize / 2 + ui.r(25) / 2);
            tutorialCtx.strokeStyle = "#fff";
            if (tutorialSteps[0].al) {
                tutorialCtx.beginPath();
                tutorialCtx.moveTo((windowSize / 2 - messageWidth / 2) - ui.r(10), (windowSize / 2));
                tutorialCtx.lineTo(tutorialSteps[0].cpu === true ? rect[0] + (rect[2] / 2) + tutorialSteps[0].al[0] : tutorialSteps[0].al[0], (windowSize / 2));
                tutorialCtx.lineTo(
                    tutorialSteps[0].cpu === true ? rect[0] + (rect[2] / 2) + tutorialSteps[0].al[0] : tutorialSteps[0].al[0],
                    tutorialSteps[0].cpu === true ? rect[1] + (rect[3] / 2) + tutorialSteps[0].al[1] : tutorialSteps[0].al[1]);
                tutorialCtx.stroke();
            }
            if (tutorialSteps[0].ar) {
                tutorialCtx.beginPath();
                tutorialCtx.moveTo((windowSize / 2 + messageWidth / 2) + ui.r(10), (windowSize / 2));
                tutorialCtx.lineTo(tutorialSteps[0].cpu === true ? rect[0] + (rect[2] / 2) + tutorialSteps[0].ar[0] : tutorialSteps[0].ar[0], (windowSize / 2));
                tutorialCtx.lineTo(tutorialSteps[0].ar[0], (windowSize / 2));
                tutorialCtx.lineTo(
                    tutorialSteps[0].cpu === true ? rect[0] + (rect[2] / 2) + tutorialSteps[0].ar[0] : tutorialSteps[0].ar[0],
                    tutorialSteps[0].cpu === true ? rect[1] + (rect[3] / 2) + tutorialSteps[0].ar[1] : tutorialSteps[0].ar[1]);
                tutorialCtx.stroke();
            }
            if (tutorialSteps[0].at) {
                tutorialCtx.beginPath();
                tutorialCtx.moveTo(tutorialSteps[0].cpu === true ? rect[0] + (rect[2] / 2) + tutorialSteps[0].at[0] : tutorialSteps[0].at[0], (windowSize / 2) - ui.r(25));
                tutorialCtx.lineTo(
                    tutorialSteps[0].cpu === true ? rect[0] + (rect[2] / 2) + tutorialSteps[0].at[0] : tutorialSteps[0].at[0],
                    tutorialSteps[0].cpu === true ? rect[1] + rect[3] + tutorialSteps[0].at[1] : tutorialSteps[0].at[1]);
                tutorialCtx.stroke();
            }
            if (tutorialSteps[0].ab) {
                tutorialCtx.beginPath();
                tutorialCtx.moveTo(tutorialSteps[0].cpu === true ? rect[0] + (rect[2] / 2) + tutorialSteps[0].ab[0] : tutorialSteps[0].ab[0], (windowSize / 2) + ui.r(25));
                tutorialCtx.lineTo(
                    tutorialSteps[0].cpu === true ? rect[0] + (rect[2] / 2) + tutorialSteps[0].ab[0] : tutorialSteps[0].ab[0],
                    tutorialSteps[0].cpu === true ? rect[1] + rect[3] + tutorialSteps[0].ab[1] : tutorialSteps[0].ab[1]);
                tutorialCtx.stroke();
            }
        } else {
            isTutorial = false;
        }
    }

    // Pay demons and loans
    if (!gameLost && ui.c >= 10000) {
        ui.c = 0;
        map.pd();
        resources.pl();
    }

    if (!gameLost && now - machinesLastUpdated >= 1000) {
        map.uma();
        map.sl.forEach(s => s.u(isTutorial));
        machinesLastUpdated = now;
    }
    if (!gameLost && now >= spawnSoulAt) {
        map.ss();
        spawnSoulAt = now + int(3500, 15000);
    }
    if (!gameLost) {
        ui.c = Math.min(ui.c + (now - lastDate) || 0, 10000);
    }

    uiCtx.clearRect(0, 0, cui.width, cui.height);
    ui.dr(uiCtx);
    lastDate = now;

    if (gameLost && gameLost !== wasGameLost) {
        isTutorial = true;
        tutorialSteps = [];
        tutorialSteps.push({ m: `You have ${gameLostReason}!`, pgc: true });
        setTimeout(() => {
            Note.new("c#", 4, 0.5).play(0.5);
            setTimeout(() => {
                Note.new("b#", 3, 1).play(0.5);
                setTimeout(() => {
                    Note.new("f#", 3, 1).play(0.5);
                    setTimeout(() => {
                        Note.new("c#", 3, 1).play(0.5);
                    }, 100);
                }, 350);
            }, 250);
        }, 0);
    }
    if (gameLost && tutorialSteps.length > 0) {
        tutorialSteps.push({ m: "You're fired!", pgc: true });
    }
    wasGameLost = gameLost;
    window.requestAnimationFrame(main);
};

const play = (tutorialMode) => {
    isTutorial = tutorialMode;
    cui.removeAttribute("n");
    cg.removeAttribute("n");
    ct.removeAttribute("n");
    menu.setAttribute("n", "");
    map.ss(isTutorial, 1);
    main();
};


tt.addEventListener("click", (e) => {
    play(1);
});
pp.addEventListener("click", (e) => {
    play();
});
import Map from './entities/map';
import ui from './ui/ui';
import { int } from './utils/random-utils';
import { Note } from './utils/audio-utils';
import resources from './entities/resources';
const W = window.W;
const windowSize = Math.min(1100, Math.min(window.innerWidth, window.innerHeight));

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
W.cube = settings => W.setState(settings, 'cube');
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

const ortho = (value, near, far) => {
    return new DOMMatrix([
        2 / (value * 2), 0, 0, 0,
        0, 2 / (value * 2), 0, 0,
        0, 0, -2 / (far - near), 0,
        0, 0, -(far + near) / (far - near), 1
    ]);
};

const screenToWorld = (x, y) => W.v.inverse().multiply(W.projection).transformPoint(new DOMPoint(90 * x - 45, 1, 180 * y - 134));

[...document.querySelectorAll('button')].forEach(btn => btn.addEventListener("mouseenter", () => {
    Note.new("c#", 2, 0.05, 0.1).play();
}));
[...document.querySelectorAll('button')].forEach(btn => btn.addEventListener("click", () => {
    Note.new("f#", 4, 0.05, 0.1).play(0.5);
}));

cg.width = windowSize;
cg.height = windowSize;
ui.s = windowSize;
W.reset(cg);
W.light({ x: 0.2, y: -1, z: -0.6 });
W.ambient(0.1);
W.clearColor("#000000");

ct.width = windowSize;
ct.height = windowSize;
const tutorialCtx = ct.getContext('2d');

const menu = document.querySelector('[m]');
menu.style = `width:${windowSize}px;height:${windowSize}px`;

const map = new Map(50, 20, W);
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
    { m: "We'll be monitoring your misery extraction progress", clear: [ui.r(125), ui.r(1000), ui.r(300), ui.r(70)], al: [ui.r(208), ui.r(1000)], pgc: true },
    { m: "This is the soul waiting area", clear: [ui.r(321), ui.r(349), ui.r(60), ui.r(50)], al: [ui.r(351), ui.r(399)], pgc: true },
    { m: "Click this soul", clear: [ui.r(333), ui.r(376), ui.r(20), ui.r(25)], al: [ui.r(344), ui.r(396)], cc: true, rwp: true },
    { m: "Sinful souls give you more misery but they can lie about their sins", clear: [ui.r(3), ui.r(3), ui.r(-176), ui.r(-2)], at: [0, 0], cpu: true, pgc: true },
    { m: "This gives you more info about this soul", clear: [ui.r(45), ui.r(5), ui.r(-48), ui.r(-30)], at: [0, 0], cpu: true, pgc: true },
    { m: "Weak souls may perish during torture, so you want sturdy ones", clear: [ui.r(45), ui.r(5), ui.r(-48), ui.r(-30)], at: [0, 0], cpu: true, pgc: true },
    { m: "Souls perish if waiting for too long", pgc: true },
    { m: "Don't let souls perish without extracting misery!", pgc: true },
    { m: "Click ✔ to accept this soul", clear: [ui.r(165), ui.r(65), ui.r(-170), ui.r(-70)], at: [0, 0], cpu: true, cc: true },
    { m: "The soul gave you some coins. You now have 22 coins!", clear: [ui.r(3), ui.r(1000), ui.r(110), ui.r(70)], al: [ui.r(58), ui.r(1000)], pgc: true },
    { m: "It's got nowhere to go, so it's waiting", clear: [ui.r(321), ui.r(349), ui.r(60), ui.r(50)], al: [ui.r(351), ui.r(399)], pgc: true },
    { m: "Click the Dispair Room", clear: [ui.r(236), ui.r(856), ui.r(115), ui.r(115)], al: [ui.r(293), ui.r(856)], cc: true },
    { m: "Then click your pit", clear: [ui.r(422), ui.r(311), ui.r(70), ui.r(70)], at: [ui.r(457), ui.r(381)], cc: true },
    { m: "The soul will slowly travel to the machine", pgc: true },
    { m: "Paths let them travel faster", clear: [ui.r(10), ui.r(856), ui.r(115), ui.r(115)], al: [ui.r(67), ui.r(856)], pgc: true },
    { m: "Click your Dispair Room", clear: [ui.r(422), ui.r(311), ui.r(70), ui.r(70)], at: [ui.r(457), ui.r(381)], cc: true, rwp: true },
    { m: "This shows if the machine is working and who operates it", clear: [ui.r(0), ui.r(0), ui.r(0), ui.r(0)], at: [ui.r(0), ui.r(0)], cpu: true, pgc: true },
    { m: "When the soul's misery is full you can extract it", pgc: true },
    { m: "Build a Misery Extractor", clear: [ui.r(120), ui.r(856), ui.r(115), ui.r(115)], al: [ui.r(177), ui.r(856)], cc: true },
    { m: "Then click your pit", clear: [ui.r(522), ui.r(411), ui.r(70), ui.r(70)], at: [ui.r(557), ui.r(481)], cc: true },
    { m: "Now employ a demon for it", clear: [ui.r(854), ui.r(856), ui.r(236), ui.r(236)], ar: [ui.r(972), ui.r(856)], cc: true },
    { m: "Then click your Misery Extractor", clear: [ui.r(522), ui.r(411), ui.r(70), ui.r(70)], at: [ui.r(557), ui.r(481)], cc: true },
    { m: "That concludes your training. Have a miserable time!", pgc: true }
];
const uiCtx = cui.getContext('2d');
ct.addEventListener("mousemove", (e) => {
    isDragging = eventType === "mousedown" || (isDragging && eventType === "hover");
    eventType = "hover";
    const rect = e.target.getBoundingClientRect();
    mX = e.clientX - rect.left;
    mY = e.clientY - rect.top;
    if (!W.v) return;
    const { x, z } = screenToWorld(mX / rect.width, mY / rect.height);
    wX = Math.min(48, Math.max(1, Math.round(x)));
    wY = Math.min(48, Math.max(1, Math.round(z)));

    // console.log(mX, mY);

    const shouldDoHovers = !isTutorial ||
        (isTutorial && tutorialSteps[0] && !tutorialSteps[0].cc) ||
        (isTutorial && tutorialSteps[0] && tutorialSteps[0].clear && tutorialSteps[0].cc && ui.cmi(tutorialSteps[0].cpu === true ? tutorialSteps[0].clear.map((value, i) => value + ui.cwp[i]) : tutorialSteps[0].clear, mX, mY));

    if (mX && mY && shouldDoHovers) {
        if (!ui.doHovers(mX, mY, uiCtx.canvas.height)) {
            map.doHovers(ui.si, ui.sd, wX, wY, ui.ma, isDragging, swX, swY);
        }
    }
});
ct.addEventListener("click", (e) => {
    eventType = "click";

    const shouldDoClicks = !isTutorial ||
        (isTutorial && tutorialSteps[0] && !tutorialSteps[0].cc) ||
        (isTutorial && tutorialSteps[0] && tutorialSteps[0].clear && tutorialSteps[0].cc && ui.cmi(tutorialSteps[0].cpu === true ? tutorialSteps[0].clear.map((value, i) => value + ui.cwp[i]) : tutorialSteps[0].clear, mX, mY));

    const pgc = isTutorial && tutorialSteps[0] && tutorialSteps[0].pgc;
    if (mX && mY && shouldDoClicks) {
        setTimeout(() => {
            if (isTutorial && tutorialSteps[0] && (!tutorialSteps[0].rwp || tutorialSteps[0].rwp && ui.wpu.length > 0)) {
                tutorialSteps = tutorialSteps.slice(1);
            }
        }, 2);
        if (!pgc && !ui.doClicks(mX, mY)) {
            const r = map.doClicks(ui.si, ui.sd, wX, wY, ui.ma, isDragging, swX, swY, mX, mY);
            ui.wpu = [];
            ui.cwp = [0, 0, 0, 0];
            if (r && r.popup) {
                ui.wpu.push(r.popup);
                ui.cwp = r.r(ui.r);
            }
            r && r.rsd ? ui.sd = null : "";
            r && r.rsm ? ui.si = null : "";
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
        ui.doRightClicks(mX, mY);
        map.doRightClicks();
        Note.new("b", 3, 0.1, 0.3).play(0.5);
        setTimeout(() => {
            Note.new("b", 3, 0.1, 0.3).play(0.2);
        }, 50);
    }
};

window.speed = 1;

setTimeout(() => {
    map.drawMap(1);
    W.projection = ortho(45, 1, 999);
    W.camera({ x: 0, y: 32, z: 50, rx: -45, ry: -45 });
}, 1);

let goUp = true;
setInterval(() => {
    map.anim(goUp ? 0.3 : -0.3);
    goUp = !goUp;
}, 250);

let lastDate = new Date().getTime();
let machinesLastUpdated = new Date().getTime();
let gameLost = false;
let wasGameLost = false;
let gameLostReason = "";
const main = function () {
    gameLostReason = resources.m <= -100 ? "much misery debt" : (resources.ds > resources.md ? "many destroyed souls" : (resources.sd > resources.md ? "many declined souls" : ""));
    gameLost = !!gameLostReason;
    const now = new Date().getTime();
    tutorialCtx.clearRect(0, 0, cui.width, cui.height);
    if (!gameLost && int(0, 500) >= 495) {
        map.spawnSoul();
    }
    map.ups();

    if (isTutorial) {
        tutorialCtx.fillStyle = gameLost ? "#00000033" : "#000000cc";
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
            tutorialCtx.fillStyle = "#ffffff";
            tutorialCtx.font = `${ui.r(24)}px luminari, fantasy`;
            const measurement = tutorialCtx.measureText(tutorialSteps[0].m);
            tutorialCtx.fillText(tutorialSteps[0].m,
                windowSize / 2 - measurement.width / 2,
                windowSize / 2);
            if (tutorialSteps[0].al) {
                tutorialCtx.beginPath();
                tutorialCtx.moveTo((windowSize / 2 - measurement.width / 2) - ui.r(10), (windowSize / 2) - ui.r(24) / 2);
                tutorialCtx.lineTo(tutorialSteps[0].cpu === true ? rect[0] + (rect[2] / 2) + tutorialSteps[0].al[0] : tutorialSteps[0].al[0], (windowSize / 2) - ui.r(24) / 2);
                tutorialCtx.lineTo(
                    tutorialSteps[0].cpu === true ? rect[0] + (rect[2] / 2) + tutorialSteps[0].al[0] : tutorialSteps[0].al[0],
                    tutorialSteps[0].cpu === true ? rect[1] + (rect[3] / 2) + tutorialSteps[0].al[1] : tutorialSteps[0].al[1]);
                tutorialCtx.strokeStyle = "#ffffff";
                tutorialCtx.stroke();
            }
            if (tutorialSteps[0].at) {
                tutorialCtx.beginPath();
                tutorialCtx.moveTo(tutorialSteps[0].cpu === true ? rect[0] + (rect[2] / 2) + tutorialSteps[0].at[0] : tutorialSteps[0].at[0], (windowSize / 2) - ui.r(24));
                tutorialCtx.lineTo(
                    tutorialSteps[0].cpu === true ? rect[0] + (rect[2] / 2) + tutorialSteps[0].at[0] : tutorialSteps[0].at[0],
                    tutorialSteps[0].cpu === true ? rect[1] + rect[3] + tutorialSteps[0].at[1] : tutorialSteps[0].at[1]);
                tutorialCtx.strokeStyle = "#ffffff";
                tutorialCtx.stroke();
            }
            if (tutorialSteps[0].ar) {
                tutorialCtx.beginPath();
                tutorialCtx.moveTo((windowSize / 2 + measurement.width / 2) + ui.r(10), (windowSize / 2) - ui.r(24) / 2);
                tutorialCtx.lineTo(tutorialSteps[0].cpu === true ? rect[0] + (rect[2] / 2) + tutorialSteps[0].ar[0] : tutorialSteps[0].ar[0], (windowSize / 2) - ui.r(24) / 2);
                tutorialCtx.lineTo(tutorialSteps[0].ar[0], (windowSize / 2) - ui.r(24) / 2);
                tutorialCtx.lineTo(
                    tutorialSteps[0].cpu === true ? rect[0] + (rect[2] / 2) + tutorialSteps[0].ar[0] : tutorialSteps[0].ar[0],
                    tutorialSteps[0].cpu === true ? rect[1] + (rect[3] / 2) + tutorialSteps[0].ar[1] : tutorialSteps[0].ar[1]);
                tutorialCtx.strokeStyle = "#ffffff";
                tutorialCtx.stroke();
            }
        } else {
            isTutorial = false;
        }
    }

    if (!gameLost && ui.c >= 10000) {
        ui.c = 0;
        map.pd();
    }

    if (!gameLost && now - machinesLastUpdated >= 1000) {
        map.updateMachines();
        map.sl.forEach(s => s.u());
        machinesLastUpdated = now;
    }
    if (!gameLost) {
        ui.c = Math.min(ui.c + (now - lastDate) || 0, 10000);
    }

    uiCtx.clearRect(0, 0, cui.width, cui.height);
    ui.draw(uiCtx);
    lastDate = now;

    if (gameLost && gameLost !== wasGameLost) {
        isTutorial = true;
        tutorialSteps = [];
        tutorialSteps.push({ m: `You've got too ${gameLostReason}!`, pgc: true });
    }
    if (gameLost && tutorialSteps.length > 0) {
        tutorialSteps.push({ m: "You're fired!", pgc: true });
    }
    wasGameLost = gameLost;
    window.requestAnimationFrame(main);
};

window.play = (tutorialMode) => {
    isTutorial = tutorialMode;
    cui.removeAttribute("n");
    cg.removeAttribute("n");
    ct.removeAttribute("n");
    menu.setAttribute("n", "");
    map.spawnSoul(isTutorial, 1);
    main();
};

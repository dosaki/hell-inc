import Map from './entities/map';
import ui from './ui/ui';
import { int } from './utils/random-utils';
import { Note } from './utils/audio-utils';
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

const gameCanvas = document.querySelector('[g]');
gameCanvas.oncontextmenu = (e) => { e.preventDefault(); e.stopPropagation(); };
gameCanvas.width = windowSize;
gameCanvas.height = windowSize;
ui.s = windowSize;
W.reset(gameCanvas);
W.light({ x: 0.2, y: -1, z: -0.6 });
W.ambient(0.1);
W.clearColor("#000000");

const tutorialCanvas = document.querySelector('[t]');
tutorialCanvas.width = windowSize;
tutorialCanvas.height = windowSize;
const tutorialCtx = tutorialCanvas.getContext('2d');

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
const uiCanvas = document.querySelector('[ui]');
uiCanvas.width = windowSize;
uiCanvas.height = windowSize;

let isTutorial = 0;
let tutorialSteps = [
    { m: "Welcome to Hell Inc. upper management!", preventGameClicks: true },
    { m: "You've been hand-plucked from the demonic masses to manage this hell pit", preventGameClicks: true },
    { m: "Your mission is to torture souls and extract their misery", preventGameClicks: true },
    { m: "We'll be monitoring your progress", clear: [ui.r(5), ui.r(1010), ui.r(495), ui.r(65)], arrowLeft: [ui.r(208), ui.r(1010)], preventGameClicks: true },
    { m: "Don't lets souls be destroyed without extracting misery!", preventGameClicks: true },
    { m: "This is where souls wait for entry", clear: [ui.r(321), ui.r(349), ui.r(60), ui.r(50)], arrowLeft: [ui.r(351), ui.r(399)], preventGameClicks: true },
    { m: "These are your torture machines", clear: [ui.r(10), ui.r(856), ui.r(805), ui.r(115)], arrowLeft: [ui.r(351), ui.r(856)], preventGameClicks: true },
    { m: "This is where you can hire employees", clear: [ui.r(854), ui.r(856), ui.r(236), ui.r(236)], arrowRight: [ui.r(972), ui.r(856)], preventGameClicks: true },
    { m: "Click this soul", clear: [ui.r(333), ui.r(376), ui.r(20), ui.r(25)], arrowLeft: [ui.r(344), ui.r(396)], clickClear: true },
    { m: "Sinful souls are more resilient to torture, but they're not the most honest, so there's a chance they're lying", clear: [ui.r(347), ui.r(280), ui.r(20), ui.r(90)], arrowTop: [ui.r(357), ui.r(370)], preventGameClicks: true },
    { m: "This gives you more info about this soul", clear: [ui.r(392), ui.r(265), ui.r(155), ui.r(70)], arrowTop: [ui.r(469), ui.r(335)], preventGameClicks: true },
    { m: "Weak souls may perish during torture, so you want the sturdy ones", clear: [ui.r(392), ui.r(265), ui.r(155), ui.r(70)], arrowTop: [ui.r(469), ui.r(335)], preventGameClicks: true },
    { m: "Click the ✔ to accept this soul", clear: [ui.r(512), ui.r(340), ui.r(25), ui.r(25)], arrowTop: [ui.r(520), ui.r(365)], clickClear: true },
    { m: "It's got nowhere to go, so it's waiting", clear: [ui.r(321), ui.r(349), ui.r(60), ui.r(50)], arrowLeft: [ui.r(351), ui.r(399)], preventGameClicks: true },
    { m: "Click the Dispair Room", clear: [ui.r(236), ui.r(856), ui.r(115), ui.r(115)], arrowLeft: [ui.r(293), ui.r(856)], clickClear: true },
    { m: "and then click your hell pit", clear: [ui.r(422), ui.r(311), ui.r(150), ui.r(150)], arrowTop: [ui.r(497), ui.r(461)], clickClear: true },
    { m: "The soul will slowly travel to the machine", preventGameClicks: true },
    { m: "If you build paths, they'll travel faster", clear: [ui.r(10), ui.r(856), ui.r(115), ui.r(115)], arrowLeft: [ui.r(67), ui.r(856)], preventGameClicks: true },
    { m: "Click the Dispair Room to see more info", clear: [ui.r(422), ui.r(260), ui.r(270), ui.r(200)], arrowTop: [ui.r(557), ui.r(460)], clickClear: true },
    { m: "This will show the demon operating the machine and the soul's misery meter", clear: [ui.r(422), ui.r(311), ui.r(150), ui.r(150)], arrowTop: [ui.r(497), ui.r(461)], preventGameClicks: true },
    { m: "Don't forget to build a Misery Extractor and to employ a demon for it!", clear: [ui.r(422), ui.r(311), ui.r(150), ui.r(150)], arrowTop: [ui.r(497), ui.r(461)], preventGameClicks: true },
    { m: "That concludes your training. Have a miserable time!", preventGameClicks: true },
];
const uiCtx = uiCanvas.getContext('2d');
tutorialCanvas.addEventListener("mousemove", (e) => {
    isDragging = eventType === "mousedown" || (isDragging && eventType === "hover");
    eventType = "hover";
    const rect = e.target.getBoundingClientRect();
    mX = e.clientX - rect.left;
    mY = e.clientY - rect.top;
    if (!W.v) return;
    const { x, z } = screenToWorld(mX / rect.width, mY / rect.height);
    wX = Math.min(48, Math.max(1, Math.round(x)));
    wY = Math.min(48, Math.max(1, Math.round(z)));

    console.log(mX, mY);

    const shouldDoHovers = !isTutorial ||
        (isTutorial && tutorialSteps[0] && !tutorialSteps[0].clickClear) ||
        (isTutorial && tutorialSteps[0] && tutorialSteps[0].clear && tutorialSteps[0].clickClear && ui.cmi(tutorialSteps[0].clear, mX, mY));

    if (mX && mY && shouldDoHovers) {
        if (!ui.doHovers(mX, mY, uiCtx.canvas.height)) {
            map.doHovers(ui.si, ui.sd, wX, wY, ui.ma, isDragging, swX, swY);
        }
    }
});
tutorialCanvas.addEventListener("click", (e) => {
    eventType = "click";

    const shouldDoClicks = !isTutorial ||
        (isTutorial && tutorialSteps[0] && !tutorialSteps[0].clickClear) ||
        (isTutorial && tutorialSteps[0] && tutorialSteps[0].clear && tutorialSteps[0].clickClear && ui.cmi(tutorialSteps[0].clear, mX, mY));

    const preventGameClicks = isTutorial && tutorialSteps[0] && tutorialSteps[0].preventGameClicks;
    if (mX && mY && shouldDoClicks) {
        if (isTutorial && tutorialSteps[0]) {
            tutorialSteps = tutorialSteps.slice(1);
        }
        if (!preventGameClicks && !ui.doClicks(mX, mY)) {
            const r = map.doClicks(ui.si, ui.sd, wX, wY, ui.ma, isDragging, swX, swY, mX, mY);
            r && r.removeOthers ? ui.wpu = [] : "";
            r && r.popup ? ui.wpu.push(r.popup) : "";
            r && r.rsd ? ui.sd = null : "";
            r && r.rsm ? ui.si = null : "";
        }
        eventType === null;
    }
});
tutorialCanvas.addEventListener("mousedown", (e) => {
    swX = wX;
    swY = wY;
    eventType = "mousedown";
});
tutorialCanvas.addEventListener("mouseout", () => {
    eventType = null;
    mX = null;
    mY = null;
});
uiCanvas.oncontextmenu = (e) => {
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

let lastUpdate = 0;
const main = function (t) {
    tutorialCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
    if (int(0, 500) >= 495) {
        map.spawnSoul();
    }
    map.ups();
    if (t - lastUpdate >= 1000) {
        map.updateMachines();
        lastUpdate = t;
    }

    if (isTutorial) {
        tutorialCtx.fillStyle = "#000000cc";
        tutorialCtx.fillRect(0, 0, uiCanvas.width, uiCanvas.height);
        if (tutorialSteps[0]) {
            if (tutorialSteps[0].clear) {
                tutorialCtx.clearRect(...tutorialSteps[0].clear);
            }
            tutorialCtx.fillStyle = "#ffffff";
            tutorialCtx.font = `${ui.r(24)}px luminari, fantasy`;
            const measurement = tutorialCtx.measureText(tutorialSteps[0].m);
            tutorialCtx.fillText(tutorialSteps[0].m,
                windowSize / 2 - measurement.width / 2,
                windowSize / 2);
            if (tutorialSteps[0].arrowLeft) {
                tutorialCtx.beginPath();
                tutorialCtx.moveTo((windowSize / 2 - measurement.width / 2) - ui.r(10), (windowSize / 2) - ui.r(24) / 2);
                tutorialCtx.lineTo(tutorialSteps[0].arrowLeft[0], (windowSize / 2) - ui.r(24) / 2);
                tutorialCtx.lineTo(...tutorialSteps[0].arrowLeft);
                tutorialCtx.strokeStyle = "#ffffff";
                tutorialCtx.stroke();
            }
            if (tutorialSteps[0].arrowTop) {
                tutorialCtx.beginPath();
                tutorialCtx.moveTo(tutorialSteps[0].arrowTop[0], (windowSize / 2) - ui.r(24));
                tutorialCtx.lineTo(...tutorialSteps[0].arrowTop);
                tutorialCtx.strokeStyle = "#ffffff";
                tutorialCtx.stroke();
            }
            if (tutorialSteps[0].arrowRight) {
                tutorialCtx.beginPath();
                tutorialCtx.moveTo((windowSize / 2 + measurement.width / 2) + ui.r(10), (windowSize / 2) - ui.r(24) / 2);
                tutorialCtx.lineTo(tutorialSteps[0].arrowRight[0], (windowSize / 2) - ui.r(24) / 2);
                tutorialCtx.lineTo(...tutorialSteps[0].arrowRight);
                tutorialCtx.strokeStyle = "#ffffff";
                tutorialCtx.stroke();
            }
        } else {
            tutorialCanvas.setAttribute("n", "");
            isTutorial = false;
        }
    }

    uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
    ui.draw(uiCtx);
    window.requestAnimationFrame(main);
};

window.play = (tutorialMode) => {
    isTutorial = tutorialMode;
    uiCanvas.removeAttribute("n");
    gameCanvas.removeAttribute("n");
    tutorialCanvas.removeAttribute("n");
    menu.setAttribute("n", "");
    map.spawnSoul(isTutorial, 1);
    main();
};

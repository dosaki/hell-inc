import Map from './entities/map';
import ui from './ui/ui';
import { int } from './utils/random-utils';
const W = window.W;
const gameCanvas = document.querySelector('[g]');

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

gameCanvas.oncontextmenu = (e) => { e.preventDefault(); e.stopPropagation(); };
gameCanvas.width = Math.min(window.innerWidth, window.innerHeight);
gameCanvas.height = gameCanvas.width;
ui.s = gameCanvas.width;
W.reset(gameCanvas);
W.light({ x: -0.2, y: -1, z: 0.6 });
W.ambient(0.1);
W.clearColor("#000000");

const ortho = (value, near, far) => {
    return new DOMMatrix([
        2 / (value * 2), 0, 0, 0,
        0, 2 / (value * 2), 0, 0,
        0, 0, -2 / (far - near), 0,
        0, 0, -(far + near) / (far - near), 1
    ]);
};
const screenToWorld = (x, y) => W.v.inverse().multiply(W.projection).transformPoint(new DOMPoint(90 * x - 45, 1, 180 * y - 134));

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
window.uiCanvas = uiCanvas;
uiCanvas.width = Math.min(window.innerWidth, window.innerHeight);
uiCanvas.height = uiCanvas.width;
const uiCtx = uiCanvas.getContext('2d');
uiCanvas.addEventListener("mousemove", (e) => {
    isDragging = eventType === "mousedown" || (isDragging && eventType === "hover");
    eventType = "hover";
    const rect = e.target.getBoundingClientRect();
    mX = e.clientX - rect.left;
    mY = e.clientY - rect.top;
    if (!W.v) return;
    const { x, z } = screenToWorld(mX / rect.width, mY / rect.height);
    wX = Math.min(48, Math.max(1, Math.round(x)));
    wY = Math.min(48, Math.max(1, Math.round(z)));

    if (mX && mY) {
        if (!ui.doHovers(mX, mY, uiCtx.canvas.height)) {
            map.doHovers(ui.si, ui.sd, wX, wY, ui.ma, isDragging, swX, swY);
        }
    }
});
uiCanvas.addEventListener("click", (e) => {
    eventType = "click";

    if (mX && mY) {
        if (!ui.doClicks(mX, mY)) {
            const r = map.doClicks(ui.si, ui.sd, wX, wY, ui.ma, isDragging, swX, swY, mX, mY);
            r && r.removeOthers ? ui.wpu = [] : "";
            r && r.popup ? ui.wpu.push(r.popup) : "";
            r && r.removeSelectedDemon ? ui.sd = null : "";
        }
        eventType === null;
    }
});
uiCanvas.addEventListener("mousedown", (e) => {
    swX = wX;
    swY = wY;
    eventType = "mousedown";
});
uiCanvas.addEventListener("mouseout", () => {
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
    }
};

window.speed = 1;
// let lastDraw = 0;
// const fps = new Array(10).fill(30);
// let fpsIndex = 0;

// window.showFPS = false;
// window.godMode = () => {
//     canLose = !canLose;
//     console.log(`Godmode: ${!canLose}`);
// };
setTimeout(() => {
    map.drawMap(1);
    W.projection = ortho(45, 1, 999);
    W.camera({ x: 50, y: 32, z: 0, rx: -45, ry: 135 });
    map.spawnSoul();
}, 1);

let goUp = true;
setInterval(() => {
    map.anim(goUp ? 0.3 : -0.3);
    goUp = !goUp;
}, 250);

let lastUpdate = 0;
const main = function (t) {
    if (int(0, 500) >= 495) {
        map.spawnSoul();
    }
    map.ups();
    if (t - lastUpdate >= 1000) {
        map.updateMachines();
        lastUpdate = t;
    }

    uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
    ui.draw(uiCtx);
    window.requestAnimationFrame(main);
};

main();

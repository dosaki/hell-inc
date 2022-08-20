import Map from './entities/map';
import ui from './ui/ui';
const SIZE = 50;
const SCALE = 1;
const W = window.W;
const gameCanvas = document.querySelector('[game]');
gameCanvas.oncontextmenu = (e) => { e.preventDefault(); e.stopPropagation(); };
gameCanvas.width = Math.min(window.innerWidth, window.innerHeight);
gameCanvas.height = gameCanvas.width;
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
const screenToWorld = (x, y) => W.v.inverse().multiply(W.projection).transformPoint(new DOMPoint(x, 1, y));

const map = new Map(SIZE, 20, [hell1, hell2, hell3, hell4], W);
let mX = null;
let mY = null;
let wX = null;
let wY = null;
let eventType = null;
const uiCanvas = document.querySelector('[ui]');
window.uiCanvas = uiCanvas;
uiCanvas.width = Math.min(window.innerWidth, window.innerHeight);
uiCanvas.height = uiCanvas.width;
const uiCtx = uiCanvas.getContext('2d');
uiCanvas.addEventListener("mousemove", (e) => {
    eventType = "hover";
    const rect = e.target.getBoundingClientRect();
    mX = e.clientX - rect.left;
    mY = e.clientY - rect.top;
    if(!W.v) return
    const { x, z } = screenToWorld((90 * mX / rect.width) - 45, (180 * mY / rect.height) - 134);
    wX = Math.min(48, Math.max(1, Math.round(x)));
    wY = Math.min(48, Math.max(1, Math.round(z)));
});
uiCanvas.addEventListener("click", (e) => {
    eventType = "click";
});
uiCanvas.addEventListener("mouseout", () => {
    eventType = null;
    mX = null;
    mY = null;
});
uiCanvas.oncontextmenu = (e) => {
    e.preventDefault(); e.stopPropagation();
    eventType = "rightClick";
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
    map.drawMap(SCALE);
    W.projection = ortho(45, 1, 999);
    W.camera({ x: 50, y: 32, z: 0, rx: -45, ry: 135 });
}, 1);

window.main = function (t) {
    uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
    ui.draw(uiCtx);
    if (mX && mY && eventType === "hover") {
        ui.doHovers(mX, mY, uiCtx.canvas.height);
        map.doHovers(ui.selectedItem, wX, wY);
    }
    if (mX && mY && eventType === "click") {
        ui.doClicks(mX, mY);
        map.doClicks(ui.selectedItem, wX, wY, ui.inMapArea);
    }
    if (mX && mY && eventType === "rightClick") {
        ui.doRightClicks(mX, mY);
        map.doRightClicks();
    }
    window.requestAnimationFrame(main);
};

window.start = () => {
    window.main();
};

window.start();

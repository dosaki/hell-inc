import Map from './entities/map';
const W = window.W;
const gameCanvas = document.querySelector('[game]');
gameCanvas.width = window.innerWidth;
gameCanvas.height = window.innerHeight;
W.reset(gameCanvas);
W.camera({ x: 6, y: -6, z: 6.5, rx: 45, rz: 45 });
W.light({ x: -0.5, y: -0.5, z: -1 });
W.ambient(0.1);
W.clearColor("#000000");
gameCanvas.oncontextmenu = (e) => { e.preventDefault(); e.stopPropagation(); };

const uiCanvas = document.querySelector('[ui]');
window.uiCanvas = uiCanvas;
uiCanvas.width = window.innerWidth;
uiCanvas.height = window.innerHeight;
const uiCtx = uiCanvas.getContext('2d');
uiCanvas.oncontextmenu = (e) => { e.preventDefault(); e.stopPropagation(); };

window.speed = 1;
// let lastDraw = 0;
// const fps = new Array(10).fill(30);
// let fpsIndex = 0;

// window.showFPS = false;
// window.godMode = () => {
//     canLose = !canLose;
//     console.log(`Godmode: ${!canLose}`);
// };

const map = new Map(50, 20, 6);

window.main = function (t) {
    uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
    map.drawMap(W);
    window.requestAnimationFrame(main);
};

window.start = () => {
    window.main();
};

window.start();

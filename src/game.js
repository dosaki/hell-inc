import Map from './entities/map';

const gameCanvas = document.querySelector('[game]');
window.gameCanvas = gameCanvas;
gameCanvas.width = window.innerWidth;
gameCanvas.height = window.innerHeight;
const gameCtx = gameCanvas.getContext('webgl');
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

const map = new Map(50, 20, 80);

window.main = function (t) {
    gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
    uiCtx.clearRect(0, 0, uiCanvas.width, uiCanvas.height);
    // map.drawMap(gameCtx);
    window.requestAnimationFrame(main);
};

window.start = () => {
    window.main();
};

window.start();

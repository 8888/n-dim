import { Game } from './game.js';

const game = new Game();

window.onload = () => {
  let mainLoopUpdateLast = performance.now();
  (function mainLoop(nowTime) {
    game.update(nowTime - mainLoopUpdateLast);
    game.display(nowTime);
    mainLoopUpdateLast = nowTime;
    requestAnimationFrame(mainLoop);
  })(performance.now());
};

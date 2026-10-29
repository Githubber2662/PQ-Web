import { Game } from "./game/Game";

const app = document.getElementById("app");
if (!app) throw new Error("App root not found");

const game = new Game(app);
await game.start();

// @ts-check

import { exec } from "child_process";

/**
 *
 * @param {string} appId
 * @returns
 */
function switchToProgramWorkspace(appId) {
  return new Promise((res, rej) => {
    // app_id is usually the lowercase name of the program (e.g., 'firefox', 'alacritty')
    exec(`wlrctl window focus ${appId}`, (error, stdout, stderr) => {
      if (error) rej(error);
      res(true);
    });
  });
}

export class ViewManager {
  static GAME_APP_NAME = "HackDukeMiniGame";
  static IDLE_APP_NAME = "title:gardens.jpg";

  static async showGame() {
    return switchToProgramWorkspace(this.GAME_APP_NAME).catch((err) =>
      console.error("Failed to switch windows to game: " + err),
    );
  }

  static async showIdle() {
    return switchToProgramWorkspace(this.IDLE_APP_NAME).catch((err) =>
      console.error("Failed to switch windows to game: " + err),
    );
  }
}

import { exec } from "child_process";

function switchToProgramWorkspace(appId) {
  return new Promise((res, rej) => {
    // app_id is usually the lowercase name of the program (e.g., 'firefox', 'alacritty')
    exec(`wlrctl window focus ${appId}`, (error, stdout, stderr) => {
      if (error) rej(error);
      res();
    });
  });
}

// // Example usage
// switchToProgramWorkspace("firefox");

export class ViewManager {
  static async showGame() {
    try {
    } catch (err) {
      console.warn("Failed to switch to game window!");
      console.warn(err);
    }
  }

  // static async show
}

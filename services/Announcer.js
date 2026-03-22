import { exec, spawn } from "child_process";
import { ElevenLabs } from "./ElevenLabs.js";

const AnnouncerStates = {
  Idle: "idle",
  Generating: "generating",
  TTSPlaying: "ttsplaying",
  SirenPlaying: "siren-playing",
  GamePlaying: "game-playing",
};

const DoomscrollStates = {
  Doomscroll: "doomscroll-detected",
  NoDoomscroll: "doomscroll-not-detected",
};

export class Announcer {
  #doomscrollStarted = new Date();
  #totalDoomscrollMS = 0;
  #totalDoomscrolls = 0;

  /**
   * @type {Date | null}
   */
  #lastDoomscroll = null;

  /**
   * @type {keyof AnnouncerStates}
   */
  #announcerState = AnnouncerStates.Idle;

  /**
   * @type {keyof DoomscrollStates}
   */
  #doomscrollState = DoomscrollStates.NoDoomscroll;

  /**
   * @type {import("child_process").ChildProcessWithoutNullStreams | null}
   */
  #audioProcess = null;

  /**
   * @type {number | null}
   */
  #nextInterval = null;

  /**
   * public - user is doomscrolling
   */
  async userIsDoomscrolling() {
    // if state change, start the timer
    if (this.#doomscrollState === DoomscrollStates.NoDoomscroll) {
      this.#doomscrollState = DoomscrollStates.Doomscroll;
      this.#doomscrollStarted = new Date();
      this.#totalDoomscrolls++;

      // if currently idle, move over to generate
      if (this.#announcerState === AnnouncerStates.Idle) {
        this.#announcerState = AnnouncerStates.Generating;
        this.#startGenerating();
      }
    }
  }

  async userIsNotDoomscrolling() {
    if (this.#doomscrollState === DoomscrollStates.Doomscroll) {
      this.#doomscrollState = DoomscrollStates.NoDoomscroll;
      this.#lastDoomscroll = Date.now();
      this.#totalDoomscrollMS += Date.now() - this.#doomscrollStarted.getTime();
      this.#stopPlaying();
    }
  }

  async userGaming() {
    this.#stopPlaying();
    this.#announcerState = AnnouncerStates.GamePlaying;
    this.#nextInterval && clearInterval(this.#nextInterval);
  }

  async userNotGaming() {
    this.#stopPlaying();
    this.#announcerState = AnnouncerStates.Idle;

    // TODO: if player is still playing, play the siren.
  }

  /**
   * stop playing audio
   */
  async #stopPlaying() {
    if (this.#audioProcess) {
      this.#audioProcess.kill();
      this.#audioProcess = null;
    }
  }

  async #startGenerating() {
    const dt = Date.now() - this.#doomscrollStarted;

    const res = await ElevenLabs.generateAudioFullPipeline({
      doomscrollStarted: this.#doomscrollStarted,
      lastDoomscrollSession: this.#lastDoomscroll,
      secondsWasted: (dt + this.#totalDoomscrollMS) / 1000,
      totalDoomscrolls: this.#totalDoomscrolls,
    });

    if (this.#doomscrollState == DoomscrollStates.Doomscroll) {
      this.#announcerState = AnnouncerStates.TTSPlaying;
      this.#startAudio(res);
    }
  }

  /**
   *
   * @param {string} path
   */
  async #startAudio(path) {
    if (this.#audioProcess) this.#stopPlaying();

    switch (process.platform) {
      case "darwin":
        this.#audioProcess = spawn("afplay", [path]);
        break;

      case "win32":
        this.#audioProcess = spawn("start", [path]);
        break;

      case "linux":
        this.#audioProcess = spawn("ffplay", [path]);
        break;
    }

    this.#audioProcess.stdout.pipe(process.stdout);
    this.#audioProcess.stderr.pipe(process.stderr);
    this.#audioProcess.on("exit", (code) => {
      if (code != 0) {
        console.log("Play failed! Exit: " + code);
      }

      this.#announcerState = AnnouncerStates.Idle;
      if (!this.#nextInterval)
        this.#nextInterval = setTimeout(
          async () => {
            if (
              this.#announcerState === AnnouncerStates.Idle &&
              this.#doomscrollState === DoomscrollStates.Doomscroll
            ) {
              this.#announcerState = AnnouncerStates.Generating;
              this.#nextInterval = null;
              this.#startGenerating();
            }
          },
          random(30 * 1000, 2 * 60 * 1000),
        );
    });
  }
}

/**
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function random(min, max) {
  return Math.random() * (max - min) + min;
}

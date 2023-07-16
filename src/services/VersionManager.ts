import axios from "axios";
import { exec } from "child_process";
import { version, github } from "../../package.json";

const getVersionManagerType = () => {
  switch (process.platform) {
    case "win32":
      return "win32.version.manager";
    case "linux":
      return "linux.version.manager";
    case "darwin":
      return "mac.version.manager";
    default:
      return "version.manager";
  }
};

const getUpdateScript = () => {
  const versionManagerType = getVersionManagerType();
  return `./bin/Managers/Versions/${versionManagerType} ${version}`;
};

export default class VersionManager {
  private sleepTime: number;

  constructor(sleepTime: number) {
    this.sleepTime = sleepTime;
  }

  private checkCorrectTime() {
    return this.sleepTime >= 60000;
  }

  private async clock() {
    setInterval(() => {
      this.checkVersion(true);
    }, this.sleepTime);
  }

  async checkVersion(interval?: boolean) {
    if (!this.checkCorrectTime()) throw new Error("The sleep time must be greater than 1 minute");
    console.log(`[${interval ? "Interval" : "Manual"}] Checking for updates...`);

    try {
      const { data } = await axios.get(`http://api.github.com/repos/${github}/releases/latest`);

      if (data.tag_name !== version) {
        const updateScript = getUpdateScript();

        exec(updateScript, (err, stdout, stderr) => {
          if (err) {
            console.error(err);
            return;
          }
        });

        setTimeout(() => {
          process.exit(0);
        }, 1000);
      } else {
        console.log(`[${interval ? "Interval" : "Manual"}] No updates found!`);
      }
    } catch (error) {
      console.error(`[${interval ? "Interval" : "Manual"}] Failed to check for updates: ${(error as Error).message}`);
    }

    if (interval) this.clock();
  }
}

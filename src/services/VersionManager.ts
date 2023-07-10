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

export default class VersionManager {
  constructor() {}

  async checkVersion() {
    try {
      const { data } = await axios.get(`http://api.github.com/repos/${github}/releases/latest`);

      if (data.tag_name !== version) {
        const updateScript = `start ./bin/Managers/Versions/${getVersionManagerType()} ${data.tag_name}`;

        exec(updateScript, (err, stdout, stderr) => {
          if (err) {
            console.error(err);
            return;
          }
        });

        setTimeout(() => {
          process.exit(0);
        }, 1000);
      }
    } catch (error) {
      console.error("Error checking version:", error);
    }
  }
}

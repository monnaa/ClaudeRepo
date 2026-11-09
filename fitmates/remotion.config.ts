/**
 * Note: When using the Node.JS APIs, the config file
 * doesn't apply. Instead, pass options directly to the APIs.
 *
 * All configuration options: https://remotion.dev/docs/config
 */

import { Config } from "@remotion/cli/config";
import { existsSync } from "node:fs";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setDefaultPremountInSeconds(2);

// Cloud sessions block Remotion's Chromium download; use the preinstalled one when present.
const PREINSTALLED_CHROME = "/opt/pw-browsers/chromium-1243/chrome-linux64/chrome";
if (existsSync(PREINSTALLED_CHROME)) {
  Config.setBrowserExecutable(PREINSTALLED_CHROME);
}

// Remotion CLI/Studio config. The render worker uses @remotion/renderer
// programmatically, but this keeps `npx remotion studio` and `npx remotion
// render` aligned with the same settings.
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setPublicDir("public"); // staticFile() resolves portraits + audio here
Config.setConcurrency(2);

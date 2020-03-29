import { remote } from "electron";

const appVersion = remote.app.getVersion();
export default appVersion;

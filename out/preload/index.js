"use strict";
const electron = require("electron");
const electronAPI = {
  ipcRenderer: {
    send(channel, ...args) {
      electron.ipcRenderer.send(channel, ...args);
    },
    sendTo(webContentsId, channel, ...args) {
      const electronVer = process.versions.electron;
      const electronMajorVer = electronVer ? parseInt(electronVer.split(".")[0]) : 0;
      if (electronMajorVer >= 28) {
        throw new Error('"sendTo" method has been removed since Electron 28.');
      } else {
        electron.ipcRenderer.sendTo(webContentsId, channel, ...args);
      }
    },
    sendSync(channel, ...args) {
      return electron.ipcRenderer.sendSync(channel, ...args);
    },
    sendToHost(channel, ...args) {
      electron.ipcRenderer.sendToHost(channel, ...args);
    },
    postMessage(channel, message, transfer) {
      electron.ipcRenderer.postMessage(channel, message, transfer);
    },
    invoke(channel, ...args) {
      return electron.ipcRenderer.invoke(channel, ...args);
    },
    on(channel, listener) {
      electron.ipcRenderer.on(channel, listener);
      return () => {
        electron.ipcRenderer.removeListener(channel, listener);
      };
    },
    once(channel, listener) {
      electron.ipcRenderer.once(channel, listener);
      return () => {
        electron.ipcRenderer.removeListener(channel, listener);
      };
    },
    removeListener(channel, listener) {
      electron.ipcRenderer.removeListener(channel, listener);
      return this;
    },
    removeAllListeners(channel) {
      electron.ipcRenderer.removeAllListeners(channel);
    }
  },
  webFrame: {
    insertCSS(css) {
      return electron.webFrame.insertCSS(css);
    },
    setZoomFactor(factor) {
      if (typeof factor === "number" && factor > 0) {
        electron.webFrame.setZoomFactor(factor);
      }
    },
    setZoomLevel(level) {
      if (typeof level === "number") {
        electron.webFrame.setZoomLevel(level);
      }
    }
  },
  webUtils: {
    getPathForFile(file) {
      return electron.webUtils.getPathForFile(file);
    }
  },
  process: {
    get platform() {
      return process.platform;
    },
    get versions() {
      return process.versions;
    },
    get env() {
      return { ...process.env };
    }
  }
};
function exposeElectronAPI() {
  if (process.contextIsolated) {
    try {
      electron.contextBridge.exposeInMainWorld("electron", electronAPI);
    } catch (error) {
      console.error(error);
    }
  } else {
    window.electron = electronAPI;
  }
}
const api = {
  executeCode: (language, code, inputArr) => electron.ipcRenderer.invoke("run-code", { language, code, inputArr }),
  sendOtpOld: (email) => electron.ipcRenderer.invoke("send-otp", email),
  executeTestCases: (payload) => electron.ipcRenderer.invoke("execute-test-cases", payload),
  // Auth APIs
  authSignup: (data) => electron.ipcRenderer.invoke("auth:signup", data),
  authVerifyOtp: (data) => electron.ipcRenderer.invoke("auth:verify-otp", data),
  authLogin: (data) => electron.ipcRenderer.invoke("auth:login", data),
  authSyncProgress: (data) => electron.ipcRenderer.invoke("auth:sync-progress", data)
};
if (process.contextIsolated) {
  try {
    exposeElectronAPI();
    electron.contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  window.electron = exposeElectronAPI();
  window.api = api;
}

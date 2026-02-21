import { contextBridge, ipcRenderer } from 'electron'
import { exposeElectronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
    executeCode: (language, code, inputArr) => ipcRenderer.invoke('run-code', { language, code, inputArr }),
    sendOtpOld: (email) => ipcRenderer.invoke('send-otp', email),
    executeTestCases: (payload) => ipcRenderer.invoke('execute-test-cases', payload),

    // Auth APIs
    authSignup: (data) => ipcRenderer.invoke('auth:signup', data),
    authVerifyOtp: (data) => ipcRenderer.invoke('auth:verify-otp', data),
    authLogin: (data) => ipcRenderer.invoke('auth:login', data),
    authSyncProgress: (data) => ipcRenderer.invoke('auth:sync-progress', data)
}

if (process.contextIsolated) {
    try {
        exposeElectronAPI()
        contextBridge.exposeInMainWorld('api', api)
    } catch (error) {
        console.error(error)
    }
} else {
    window.electron = exposeElectronAPI()
    window.api = api
}

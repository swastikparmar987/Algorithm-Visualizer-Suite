import 'dotenv/config'
import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs/promises'
import { exec } from 'child_process'
import util from 'util'
import nodemailer from 'nodemailer'
import log from 'electron-log'
import { autoUpdater } from 'electron-updater'
import icon from '../../resources/icon.png?asset'
import { setupAuth } from './auth.js'

// Configure auto-updater logging
log.transports.file.level = "info"
autoUpdater.logger = log

console.log("[INIT] SMTP Environment Check:", (process.env.SMTP_USER && process.env.SMTP_PASS) ? "LOADED" : "MISSING");

const execAsync = util.promisify(exec)

// Increase GPU memory limits to fix Chromium "tile memory limits exceeded" warnings
// especially for heavy React Three Fiber / Canvas operations
app.commandLine.appendSwitch('enable-gpu-rasterization')
app.commandLine.appendSwitch('enable-zero-copy')
app.commandLine.appendSwitch('ignore-gpu-blocklist')
app.commandLine.appendSwitch('force-gpu-mem-available-mb', '4096')

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1400,
        height: 850,
        show: false,
        autoHideMenuBar: true,
        ...(process.platform === 'linux' ? { icon } : {}),
        webPreferences: {
            preload: join(__dirname, '../preload/index.js'),
            sandbox: false
        }
    })

    mainWindow.on('ready-to-show', () => {
        mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
}

// Initialize Auth Service
setupAuth(ipcMain);

app.whenReady().then(async () => {
    electronApp.setAppUserModelId('com.electron.algo-visualizer')

    // Pre-load logo base64 for email dispatch
    let logoBase64 = '';
    try {
        const logoPath = join(app.getAppPath(), 'src/renderer/src/assets/logo-b64.txt');
        logoBase64 = await fs.readFile(logoPath, 'utf-8');
    } catch (e) {
        console.warn("[AUTH] Failed to pre-load base64 logo:", e.message);
    }

    app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
    })

    createWindow()

    // Setup Auto Updater
    if (app.isPackaged) {
        log.info('App is packaged, checking for updates...');
        autoUpdater.checkForUpdatesAndNotify()
    } else {
        log.info('App is running in development mode. Auto-updater disabled.');
    }

    autoUpdater.on('update-available', (info) => {
        log.info('Update available:', info.version);
    });

    autoUpdater.on('update-not-available', (info) => {
        log.info('Update not available.', info);
    });

    autoUpdater.on('error', (err) => {
        log.error('Error in auto-updater.', err);
    });

    autoUpdater.on('update-downloaded', (info) => {
        log.info('Update downloaded, prompting user...');
        const dialogOpts = {
            type: 'info',
            buttons: ['Restart and Install', 'Later'],
            title: 'Algorithm Visualizer Suite Update',
            message: process.platform === 'win32' ? info.releaseNotes || 'A new update is ready.' : info.releaseName || 'A new version is ready.',
            detail: 'A new version of the Algorithm Visualizer Suite has been downloaded. Restart the application to apply the critical network updates.'
        }

        dialog.showMessageBox(dialogOpts).then((returnValue) => {
            if (returnValue.response === 0) autoUpdater.quitAndInstall()
        })
    });

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    ipcMain.handle('run-code', async (event, { language, code, inputArr }) => {
        try {
            const tempDir = app.getPath('temp')
            const arrayStr = inputArr.join(',')

            if (language === 'python') {
                const filePath = join(tempDir, 'algo.py')
                await fs.writeFile(filePath, code)
                // We pass the array as a command line argument
                const { stdout, stderr } = await execAsync(`python3 "${filePath}" "${arrayStr}"`, { timeout: 3000 })
                if (stderr) throw new Error(stderr)
                return stdout
            } else if (language === 'cpp') {
                const codePath = join(tempDir, 'algo.cpp')
                const outPath = join(tempDir, 'algo.out')
                await fs.writeFile(codePath, code)
                // Compile and run
                await execAsync(`g++ "${codePath}" -o "${outPath}"`, { timeout: 3000 })
                const { stdout, stderr } = await execAsync(`"${outPath}" "${arrayStr}"`, { timeout: 3000 })
                if (stderr) throw new Error(stderr)
                return stdout
            }
            throw new Error(`Unsupported language: ${language}`)
        } catch (err) {
            throw new Error(err.message || 'Execution failed')
        }
    })

    // Phase 5: Practice Engine Test Runner
    ipcMain.handle('execute-test-cases', async (_, { code, testCases, functionName, inPlace = false }) => {
        const vm = require('vm');
        const results = [];

        for (let i = 0; i < testCases.length; i++) {
            const { input, expected } = testCases[i];
            const context = vm.createContext({});

            try {
                // Prepare the code execution
                const script = new vm.Script(`
                    ${code}
                    const input = ${JSON.stringify(input)};
                    const result = ${functionName}(...input);
                    const finalInput = input; // capture for inPlace checks
                    ({ result, finalInput })
                `);

                const { result, finalInput } = script.runInContext(context, { timeout: 2000 });

                const actual = inPlace ? finalInput[0] : result;
                const isCorrect = JSON.stringify(actual) === JSON.stringify(expected);

                results.push({
                    id: i,
                    status: isCorrect ? 'pass' : 'fail',
                    input: JSON.stringify(input),
                    expected: JSON.stringify(expected),
                    actual: JSON.stringify(actual)
                });
            } catch (err) {
                results.push({
                    id: i,
                    status: 'error',
                    input: JSON.stringify(input),
                    expected: JSON.stringify(expected),
                    actual: err.message
                });
            }
        }
        return { success: true, tests: results };
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

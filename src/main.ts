import { app, BrowserWindow } from 'electron';
import * as path from 'path';

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    // 開発環境では、webpack-dev-serverのURLを読み込む
    if (process.env.NODE_ENV === 'development') {
        win.loadURL('http://localhost:3000');
    } else {
        // 本番環境では、ビルドされたHTMLファイルを読み込む
        win.loadFile(path.join(__dirname, 'index.html'));
    }

    // 開発ツールを開く
    win.webContents.openDevTools();
}

// Electronの初期化が完了したらウィンドウを作成
app.whenReady().then(createWindow);

// すべてのウィンドウが閉じられたらアプリを終了
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
}); 
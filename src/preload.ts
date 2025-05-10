import { contextBridge } from 'electron';

// レンダラープロセスで使用するAPIを定義
contextBridge.exposeInMainWorld('electronAPI', {
    // 必要に応じてここにAPIを追加
}); 
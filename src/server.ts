import express from 'express';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, '..', 'dist')));

// すべてのリクエストをindex.htmlにリダイレクト
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`サーバーが起動しました: http://localhost:${port}`);
}); 
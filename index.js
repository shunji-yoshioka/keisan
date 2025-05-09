"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("readline"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class CalculationGame {
    constructor() {
        this.RANKINGS_FILE = path.join(__dirname, 'rankings.json');
        this.state = {
            score: 0,
            timeLeft: 60,
            isPlaying: false,
            difficulty: 'normal'
        };
        this.rankings = this.loadRankings();
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
    loadRankings() {
        try {
            const data = fs.readFileSync(this.RANKINGS_FILE, 'utf8');
            const rankings = JSON.parse(data);
            // 日付をDate型に変換
            Object.keys(rankings).forEach(difficulty => {
                rankings[difficulty] = rankings[difficulty].map((entry) => (Object.assign(Object.assign({}, entry), { date: new Date(entry.date) })));
            });
            return rankings;
        }
        catch (error) {
            return {
                easy: [],
                normal: [],
                hard: [],
                expert: [],
                master: []
            };
        }
    }
    saveRankings() {
        fs.writeFileSync(this.RANKINGS_FILE, JSON.stringify(this.rankings, null, 2));
    }
    getDifficultySettings(difficulty) {
        switch (difficulty) {
            case 'easy':
                return { timeLimit: 60, maxNumber: 10, operations: ['+', '-'], scoreMultiplier: 1 };
            case 'normal':
                return { timeLimit: 60, maxNumber: 20, operations: ['+', '-', '*'], scoreMultiplier: 1.5 };
            case 'hard':
                return { timeLimit: 45, maxNumber: 30, operations: ['+', '-', '*', '/'], scoreMultiplier: 2 };
            case 'expert':
                return { timeLimit: 30, maxNumber: 50, operations: ['+', '-', '*', '/'], scoreMultiplier: 2.5 };
            case 'master':
                return { timeLimit: 20, maxNumber: 100, operations: ['+', '-', '*', '/'], scoreMultiplier: 3 };
        }
    }
    generateProblem() {
        const settings = this.getDifficultySettings(this.state.difficulty);
        const operation = settings.operations[Math.floor(Math.random() * settings.operations.length)];
        let num1 = Math.floor(Math.random() * settings.maxNumber) + 1;
        let num2 = Math.floor(Math.random() * settings.maxNumber) + 1;
        if (operation === '/') {
            num1 = num1 * num2;
        }
        const question = `${num1} ${operation} ${num2}`;
        const answer = eval(question);
        return { question, answer };
    }
    selectDifficulty() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('\n難易度を選択してください：');
            console.log('1. かんたん');
            console.log('2. ふつう');
            console.log('3. すこしむずかしい');
            console.log('4. むずかしい');
            console.log('5. さいきょう');
            const choice = yield new Promise((resolve) => {
                this.rl.question('選択 (1-5): ', resolve);
            });
            const difficultyMap = {
                '1': 'easy',
                '2': 'normal',
                '3': 'hard',
                '4': 'expert',
                '5': 'master'
            };
            this.state.difficulty = difficultyMap[choice] || 'normal';
            const settings = this.getDifficultySettings(this.state.difficulty);
            this.state.timeLeft = settings.timeLimit;
        });
    }
    playRound() {
        return __awaiter(this, void 0, void 0, function* () {
            const { question, answer } = this.generateProblem();
            const settings = this.getDifficultySettings(this.state.difficulty);
            console.log(`\n難易度: ${this.getDifficultyName(this.state.difficulty)}`);
            console.log(`残り時間: ${this.state.timeLeft}秒`);
            console.log(`スコア: ${this.state.score}`);
            console.log(`問題: ${question} = ?`);
            const userAnswer = yield new Promise((resolve) => {
                this.rl.question('答えを入力してください: ', resolve);
            });
            if (parseFloat(userAnswer) === answer) {
                const points = Math.floor(10 * settings.scoreMultiplier);
                this.state.score += points;
                console.log(`正解！ +${points}点`);
            }
            else {
                const penalty = Math.floor(5 * settings.scoreMultiplier);
                this.state.score = Math.max(0, this.state.score - penalty);
                console.log(`不正解... -${penalty}点 (正解: ${answer})`);
            }
        });
    }
    getDifficultyName(difficulty) {
        const names = {
            easy: 'かんたん',
            normal: 'ふつう',
            hard: 'すこしむずかしい',
            expert: 'むずかしい',
            master: 'さいきょう'
        };
        return names[difficulty];
    }
    updateTimer() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.state.timeLeft > 0 && this.state.isPlaying) {
                yield new Promise(resolve => setTimeout(resolve, 1000));
                this.state.timeLeft--;
            }
            if (this.state.isPlaying) {
                this.endGame();
            }
        });
    }
    endGame() {
        return __awaiter(this, void 0, void 0, function* () {
            this.state.isPlaying = false;
            console.log('\nゲーム終了！');
            console.log(`最終スコア: ${this.state.score}`);
            const name = yield new Promise((resolve) => {
                this.rl.question('名前を入力してください: ', resolve);
            });
            this.rankings[this.state.difficulty].push({
                name,
                score: this.state.score,
                date: new Date()
            });
            this.saveRankings();
            this.showRankings();
            this.rl.close();
        });
    }
    showRankings() {
        console.log('\n=== ランキング ===');
        Object.entries(this.rankings).forEach(([difficulty, entries]) => {
            console.log(`\n${this.getDifficultyName(difficulty)}`);
            entries
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .forEach((entry, index) => {
                console.log(`${index + 1}. ${entry.name}: ${entry.score}点 (${entry.date.toLocaleDateString()})`);
            });
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('計算ゲームを開始します！');
            yield this.selectDifficulty();
            const settings = this.getDifficultySettings(this.state.difficulty);
            console.log(`\n難易度: ${this.getDifficultyName(this.state.difficulty)}`);
            console.log(`制限時間: ${settings.timeLimit}秒`);
            console.log(`スコア倍率: ${settings.scoreMultiplier}倍`);
            this.state.isPlaying = true;
            this.updateTimer();
            while (this.state.isPlaying) {
                yield this.playRound();
            }
        });
    }
}
// ゲームを開始
const game = new CalculationGame();
game.start();

import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

type Difficulty = 'easy' | 'normal' | 'hard' | 'expert' | 'master';

interface GameState {
    score: number;
    timeLeft: number;
    isPlaying: boolean;
    difficulty: Difficulty;
}

interface RankingEntry {
    name: string;
    score: number;
    date: Date;
}

interface Rankings {
    easy: RankingEntry[];
    normal: RankingEntry[];
    hard: RankingEntry[];
    expert: RankingEntry[];
    master: RankingEntry[];
}

class CalculationGame {
    private state: GameState;
    private rankings: Rankings;
    private rl: readline.Interface;
    private readonly RANKINGS_FILE = path.join(__dirname, 'rankings.json');

    constructor() {
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

    private loadRankings(): Rankings {
        try {
            const data = fs.readFileSync(this.RANKINGS_FILE, 'utf8');
            const rankings = JSON.parse(data);
            // 日付をDate型に変換
            Object.keys(rankings).forEach(difficulty => {
                rankings[difficulty] = rankings[difficulty].map((entry: any) => ({
                    ...entry,
                    date: new Date(entry.date)
                }));
            });
            return rankings;
        } catch (error) {
            return {
                easy: [],
                normal: [],
                hard: [],
                expert: [],
                master: []
            };
        }
    }

    private saveRankings(): void {
        fs.writeFileSync(this.RANKINGS_FILE, JSON.stringify(this.rankings, null, 2));
    }

    private getDifficultySettings(difficulty: Difficulty): {
        timeLimit: number;
        maxNumber: number;
        operations: string[];
        scoreMultiplier: number;
    } {
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

    private generateProblem(): { question: string; answer: number } {
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

    private async selectDifficulty(): Promise<void> {
        console.log('\n難易度を選択してください：');
        console.log('1. かんたん');
        console.log('2. ふつう');
        console.log('3. すこしむずかしい');
        console.log('4. むずかしい');
        console.log('5. さいきょう');

        const choice = await new Promise<string>((resolve) => {
            this.rl.question('選択 (1-5): ', resolve);
        });

        const difficultyMap: { [key: string]: Difficulty } = {
            '1': 'easy',
            '2': 'normal',
            '3': 'hard',
            '4': 'expert',
            '5': 'master'
        };

        this.state.difficulty = difficultyMap[choice] || 'normal';
        const settings = this.getDifficultySettings(this.state.difficulty);
        this.state.timeLeft = settings.timeLimit;
    }

    private async playRound(): Promise<void> {
        const { question, answer } = this.generateProblem();
        const settings = this.getDifficultySettings(this.state.difficulty);
        console.log(`\n難易度: ${this.getDifficultyName(this.state.difficulty)}`);
        console.log(`残り時間: ${this.state.timeLeft}秒`);
        console.log(`スコア: ${this.state.score}`);
        console.log(`問題: ${question} = ?`);

        const userAnswer = await new Promise<string>((resolve) => {
            this.rl.question('答えを入力してください: ', resolve);
        });

        if (parseFloat(userAnswer) === answer) {
            const points = Math.floor(10 * settings.scoreMultiplier);
            this.state.score += points;
            console.log(`正解！ +${points}点`);
        } else {
            const penalty = Math.floor(5 * settings.scoreMultiplier);
            this.state.score = Math.max(0, this.state.score - penalty);
            console.log(`不正解... -${penalty}点 (正解: ${answer})`);
        }
    }

    private getDifficultyName(difficulty: Difficulty): string {
        const names = {
            easy: 'かんたん',
            normal: 'ふつう',
            hard: 'すこしむずかしい',
            expert: 'むずかしい',
            master: 'さいきょう'
        };
        return names[difficulty];
    }

    private async updateTimer(): Promise<void> {
        while (this.state.timeLeft > 0 && this.state.isPlaying) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.state.timeLeft--;
        }
        if (this.state.isPlaying) {
            this.endGame();
        }
    }

    private async endGame(): Promise<void> {
        this.state.isPlaying = false;
        console.log('\nゲーム終了！');
        console.log(`最終スコア: ${this.state.score}`);

        const name = await new Promise<string>((resolve) => {
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
    }

    private showRankings(): void {
        console.log('\n=== ランキング ===');
        Object.entries(this.rankings).forEach(([difficulty, entries]) => {
            console.log(`\n${this.getDifficultyName(difficulty as Difficulty)}`);
            entries
                .sort((a: RankingEntry, b: RankingEntry) => b.score - a.score)
                .slice(0, 5)
                .forEach((entry: RankingEntry, index: number) => {
                    console.log(`${index + 1}. ${entry.name}: ${entry.score}点 (${entry.date.toLocaleDateString()})`);
                });
        });
    }

    public async start(): Promise<void> {
        console.log('計算ゲームを開始します！');
        await this.selectDifficulty();
        
        const settings = this.getDifficultySettings(this.state.difficulty);
        console.log(`\n難易度: ${this.getDifficultyName(this.state.difficulty)}`);
        console.log(`制限時間: ${settings.timeLimit}秒`);
        console.log(`スコア倍率: ${settings.scoreMultiplier}倍`);
        
        this.state.isPlaying = true;
        this.updateTimer();

        while (this.state.isPlaying) {
            await this.playRound();
        }
    }
}

// ゲームを開始
const game = new CalculationGame();
game.start(); 
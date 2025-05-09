import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// 音声ファイルのインポート
import correctSound from '../../public/sounds/correct.mp3';
import wrongSound from '../../public/sounds/wrong.mp3';

interface GameState {
    score: number;
    timeLeft: number;
    isPlaying: boolean;
    difficulty: 'easy' | 'normal' | 'hard' | 'expert' | 'master';
    isGameOver: boolean;
}

interface FeedbackState {
    show: boolean;
    type: 'correct' | 'wrong' | null;
    message: string;
}

const DIFFICULTY_SETTINGS = {
    easy: { timeLimit: 30, maxNumber: 10, operations: ['+', '-'], scoreMultiplier: 1 },
    normal: { timeLimit: 30, maxNumber: 20, operations: ['+', '-', '*'], scoreMultiplier: 1.5 },
    hard: { timeLimit: 30, maxNumber: 30, operations: ['+', '-', '*', '/'], scoreMultiplier: 2 },
    expert: { timeLimit: 30, maxNumber: 50, operations: ['+', '-', '*', '/'], scoreMultiplier: 2.5 },
    master: { timeLimit: 30, maxNumber: 200, operations: ['+', '-', '*', '/'], scoreMultiplier: 3 }
};

const DIFFICULTY_NAMES = {
    easy: 'かんたん',
    normal: 'ふつう',
    hard: 'すこしむずかしい',
    expert: 'むずかしい',
    master: 'さいきょう'
};

const getEvaluationMessage = (score: number): { message: string; className: string } => {
    if (score < 50) {
        return { message: 'がんばりましょう', className: 'encourage' };
    } else if (score < 200) {
        return { message: 'いいね！', className: 'good' };
    } else {
        return { message: 'よくできました!!', className: 'excellent' };
    }
};

const App: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>({
        score: 0,
        timeLeft: 60,
        isPlaying: false,
        difficulty: 'normal',
        isGameOver: false
    });
    const [currentProblem, setCurrentProblem] = useState<{ question: string; answer: number } | null>(null);
    const [userAnswer, setUserAnswer] = useState<string>('');
    const [feedback, setFeedback] = useState<FeedbackState>({
        show: false,
        type: null,
        message: ''
    });

    // 音声の参照を作成
    const correctAudio = useRef(new Audio(correctSound));
    const wrongAudio = useRef(new Audio(wrongSound));

    // 音声の初期設定
    useEffect(() => {
        correctAudio.current.volume = 0.5;
        wrongAudio.current.volume = 0.5;
    }, []);

    const generateProblem = () => {
        const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
        const operation = settings.operations[Math.floor(Math.random() * settings.operations.length)];
        let num1 = Math.floor(Math.random() * settings.maxNumber) + 1;
        let num2 = Math.floor(Math.random() * settings.maxNumber) + 1;

        // かんたんモードでは負の数が出ないようにする
        if (gameState.difficulty === 'easy' && operation === '-') {
            if (num1 < num2) {
                [num1, num2] = [num2, num1];
            }
        }

        if (operation === '/') {
            num1 = num1 * num2;
        }

        const question = `${num1} ${operation} ${num2}`;
        const answer = eval(question);
        return { question, answer };
    };

    const startGame = (difficulty: GameState['difficulty']) => {
        const settings = DIFFICULTY_SETTINGS[difficulty];
        setGameState({
            score: 0,
            timeLeft: settings.timeLimit,
            isPlaying: true,
            difficulty,
            isGameOver: false
        });
        setCurrentProblem(generateProblem());
    };

    const handleAnswerSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentProblem) return;

        const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
        if (parseFloat(userAnswer) === currentProblem.answer) {
            const points = Math.floor(10 * settings.scoreMultiplier);
            setGameState(prev => ({
                ...prev,
                score: prev.score + points
            }));
            setFeedback({
                show: true,
                type: 'correct',
                message: `+${points}点！`
            });
            // 正解音を再生
            correctAudio.current.currentTime = 0;
            correctAudio.current.play();
        } else {
            const penalty = Math.floor(5 * settings.scoreMultiplier);
            setGameState(prev => ({
                ...prev,
                score: Math.max(0, prev.score - penalty)
            }));
            setFeedback({
                show: true,
                type: 'wrong',
                message: `-${penalty}点...`
            });
            // 不正解音を再生
            wrongAudio.current.currentTime = 0;
            wrongAudio.current.play();
        }

        setUserAnswer('');
        setCurrentProblem(generateProblem());

        // アニメーションを1秒後に非表示にする
        setTimeout(() => {
            setFeedback(prev => ({ ...prev, show: false }));
        }, 1000);
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (gameState.isPlaying && gameState.timeLeft > 0) {
            timer = setInterval(() => {
                setGameState(prev => ({
                    ...prev,
                    timeLeft: prev.timeLeft - 1
                }));
            }, 1000);
        } else if (gameState.timeLeft === 0) {
            setGameState(prev => ({ ...prev, isPlaying: false, isGameOver: true }));
        }

        return () => clearInterval(timer);
    }, [gameState.isPlaying, gameState.timeLeft]);

    return (
        <div className="app">
            <h1>計算ゲーム</h1>
            
            {feedback.show && (
                <div className={`answer-feedback ${feedback.type}`}>
                    {feedback.message}
                </div>
            )}

            {!gameState.isPlaying ? (
                <div className="menu">
                    {gameState.isGameOver ? (
                        <div className="game-over">
                            <h2>ゲーム終了！</h2>
                            <p className="final-score">最終スコア: {gameState.score}点</p>
                            {(() => {
                                const evaluation = getEvaluationMessage(gameState.score);
                                return (
                                    <p className={`evaluation ${evaluation.className}`}>
                                        {evaluation.message}
                                    </p>
                                );
                            })()}
                            <button onClick={() => setGameState(prev => ({ ...prev, isGameOver: false }))} className="difficulty-button">
                                もう一度やる
                            </button>
                        </div>
                    ) : (
                        <>
                            <h2>難易度を選択してください</h2>
                            {Object.entries(DIFFICULTY_NAMES).map(([key, name]) => (
                                <button
                                    key={key}
                                    onClick={() => startGame(key as GameState['difficulty'])}
                                    className="difficulty-button"
                                >
                                    {name}
                                </button>
                            ))}
                        </>
                    )}
                </div>
            ) : (
                <div className="game">
                    <div className="game-info">
                        <p>難易度: {DIFFICULTY_NAMES[gameState.difficulty]}</p>
                        <p>残り時間: {gameState.timeLeft}秒</p>
                        <p>スコア: {gameState.score}</p>
                    </div>

                    {currentProblem && (
                        <div className="problem">
                            <h2>{currentProblem.question} = ?</h2>
                            <form onSubmit={handleAnswerSubmit}>
                                <input
                                    type="number"
                                    value={userAnswer}
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="答えを入力"
                                    autoFocus
                                />
                                <button type="submit">回答</button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default App; 
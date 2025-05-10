import React, { useState, useEffect, useRef } from 'react';
import NumberKeyboard from './NumberKeyboard';
import './App.css';
// 音声ファイルのインポート
import correctSound from '../../public/sounds/correct.mp3';
import wrongSound from '../../public/sounds/wrong.mp3';
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
const getEvaluationMessage = (score) => {
    if (score < 50) {
        return { message: 'がんばりましょう', className: 'encourage' };
    }
    else if (score < 200) {
        return { message: 'いいね！', className: 'good' };
    }
    else {
        return { message: 'よくできました!!', className: 'excellent' };
    }
};
const App = () => {
    const [gameState, setGameState] = useState({
        score: 0,
        timeLeft: 60,
        isPlaying: false,
        difficulty: 'normal',
        isGameOver: false
    });
    const [currentProblem, setCurrentProblem] = useState(null);
    const [userAnswer, setUserAnswer] = useState('');
    const [feedback, setFeedback] = useState({
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
    const startGame = (difficulty) => {
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
    const handleAnswerSubmit = (e) => {
        e === null || e === void 0 ? void 0 : e.preventDefault();
        if (!currentProblem)
            return;
        const settings = DIFFICULTY_SETTINGS[gameState.difficulty];
        if (parseFloat(userAnswer) === currentProblem.answer) {
            const points = Math.floor(10 * settings.scoreMultiplier);
            setGameState(prev => (Object.assign(Object.assign({}, prev), { score: prev.score + points })));
            setFeedback({
                show: true,
                type: 'correct',
                message: `+${points}点！`
            });
            // 正解音を再生
            correctAudio.current.currentTime = 0;
            correctAudio.current.play();
        }
        else {
            const penalty = Math.floor(5 * settings.scoreMultiplier);
            setGameState(prev => (Object.assign(Object.assign({}, prev), { score: Math.max(0, prev.score - penalty) })));
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
            setFeedback(prev => (Object.assign(Object.assign({}, prev), { show: false })));
        }, 1000);
    };
    const handleNumberClick = (num) => {
        if (userAnswer.length < 4) {
            setUserAnswer(prev => prev + num);
        }
    };
    const handleDelete = () => {
        setUserAnswer(prev => prev.slice(0, -1));
    };
    const handleSubmit = () => {
        if (userAnswer) {
            handleAnswerSubmit();
        }
    };
    useEffect(() => {
        let timer;
        if (gameState.isPlaying && gameState.timeLeft > 0) {
            timer = setInterval(() => {
                setGameState(prev => (Object.assign(Object.assign({}, prev), { timeLeft: prev.timeLeft - 1 })));
            }, 1000);
        }
        else if (gameState.timeLeft === 0) {
            setGameState(prev => (Object.assign(Object.assign({}, prev), { isPlaying: false, isGameOver: true })));
        }
        return () => clearInterval(timer);
    }, [gameState.isPlaying, gameState.timeLeft]);
    return (React.createElement("div", { className: "app" },
        React.createElement("h1", null, "\u8A08\u7B97\u30B2\u30FC\u30E0"),
        feedback.show && (React.createElement("div", { className: `answer-feedback ${feedback.type}` }, feedback.message)),
        !gameState.isPlaying ? (React.createElement("div", { className: "menu" }, gameState.isGameOver ? (React.createElement("div", { className: "game-over" },
            React.createElement("h2", null, "\u30B2\u30FC\u30E0\u7D42\u4E86\uFF01"),
            React.createElement("p", { className: "final-score" },
                "\u6700\u7D42\u30B9\u30B3\u30A2: ",
                gameState.score,
                "\u70B9"),
            (() => {
                const evaluation = getEvaluationMessage(gameState.score);
                return (React.createElement("p", { className: `evaluation ${evaluation.className}` }, evaluation.message));
            })(),
            React.createElement("button", { onClick: () => setGameState(prev => (Object.assign(Object.assign({}, prev), { isGameOver: false }))), className: "difficulty-button" }, "\u3082\u3046\u4E00\u5EA6\u3084\u308B"))) : (React.createElement(React.Fragment, null,
            React.createElement("h2", null, "\u96E3\u6613\u5EA6\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044"),
            Object.entries(DIFFICULTY_NAMES).map(([key, name]) => (React.createElement("button", { key: key, onClick: () => startGame(key), className: "difficulty-button" }, name))))))) : (React.createElement("div", { className: "game" },
            React.createElement("div", { className: "game-info" },
                React.createElement("p", null,
                    "\u96E3\u6613\u5EA6: ",
                    DIFFICULTY_NAMES[gameState.difficulty]),
                React.createElement("p", null,
                    "\u6B8B\u308A\u6642\u9593: ",
                    gameState.timeLeft,
                    "\u79D2"),
                React.createElement("p", null,
                    "\u30B9\u30B3\u30A2: ",
                    gameState.score)),
            currentProblem && (React.createElement("div", { className: "problem" },
                React.createElement("h2", null,
                    currentProblem.question,
                    " = ?"),
                React.createElement("form", { onSubmit: (e) => {
                        e.preventDefault();
                        handleAnswerSubmit(e);
                    } },
                    React.createElement("input", { type: "text", value: userAnswer, onChange: (e) => setUserAnswer(e.target.value), readOnly: true, placeholder: "\u7B54\u3048\u3092\u5165\u529B" }),
                    React.createElement("div", { className: "answer-display" }, userAnswer)),
                React.createElement(NumberKeyboard, { onNumberClick: handleNumberClick, onDelete: handleDelete, onSubmit: handleSubmit })))))));
};
export default App;

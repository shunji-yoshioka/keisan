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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
require("./App.css");
// 音声ファイルのインポート
const correct_mp3_1 = __importDefault(require("../../public/sounds/correct.mp3"));
const wrong_mp3_1 = __importDefault(require("../../public/sounds/wrong.mp3"));
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
    const [gameState, setGameState] = (0, react_1.useState)({
        score: 0,
        timeLeft: 60,
        isPlaying: false,
        difficulty: 'normal',
        isGameOver: false
    });
    const [currentProblem, setCurrentProblem] = (0, react_1.useState)(null);
    const [userAnswer, setUserAnswer] = (0, react_1.useState)('');
    const [feedback, setFeedback] = (0, react_1.useState)({
        show: false,
        type: null,
        message: ''
    });
    // 音声の参照を作成
    const correctAudio = (0, react_1.useRef)(new Audio(correct_mp3_1.default));
    const wrongAudio = (0, react_1.useRef)(new Audio(wrong_mp3_1.default));
    // 音声の初期設定
    (0, react_1.useEffect)(() => {
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
        e.preventDefault();
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
    (0, react_1.useEffect)(() => {
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
    return (react_1.default.createElement("div", { className: "app" },
        react_1.default.createElement("h1", null, "\u8A08\u7B97\u30B2\u30FC\u30E0"),
        feedback.show && (react_1.default.createElement("div", { className: `answer-feedback ${feedback.type}` }, feedback.message)),
        !gameState.isPlaying ? (react_1.default.createElement("div", { className: "menu" }, gameState.isGameOver ? (react_1.default.createElement("div", { className: "game-over" },
            react_1.default.createElement("h2", null, "\u30B2\u30FC\u30E0\u7D42\u4E86\uFF01"),
            react_1.default.createElement("p", { className: "final-score" },
                "\u6700\u7D42\u30B9\u30B3\u30A2: ",
                gameState.score,
                "\u70B9"),
            (() => {
                const evaluation = getEvaluationMessage(gameState.score);
                return (react_1.default.createElement("p", { className: `evaluation ${evaluation.className}` }, evaluation.message));
            })(),
            react_1.default.createElement("button", { onClick: () => setGameState(prev => (Object.assign(Object.assign({}, prev), { isGameOver: false }))), className: "difficulty-button" }, "\u3082\u3046\u4E00\u5EA6\u3084\u308B"))) : (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("h2", null, "\u96E3\u6613\u5EA6\u3092\u9078\u629E\u3057\u3066\u304F\u3060\u3055\u3044"),
            Object.entries(DIFFICULTY_NAMES).map(([key, name]) => (react_1.default.createElement("button", { key: key, onClick: () => startGame(key), className: "difficulty-button" }, name))))))) : (react_1.default.createElement("div", { className: "game" },
            react_1.default.createElement("div", { className: "game-info" },
                react_1.default.createElement("p", null,
                    "\u96E3\u6613\u5EA6: ",
                    DIFFICULTY_NAMES[gameState.difficulty]),
                react_1.default.createElement("p", null,
                    "\u6B8B\u308A\u6642\u9593: ",
                    gameState.timeLeft,
                    "\u79D2"),
                react_1.default.createElement("p", null,
                    "\u30B9\u30B3\u30A2: ",
                    gameState.score)),
            currentProblem && (react_1.default.createElement("div", { className: "problem" },
                react_1.default.createElement("h2", null,
                    currentProblem.question,
                    " = ?"),
                react_1.default.createElement("form", { onSubmit: handleAnswerSubmit },
                    react_1.default.createElement("input", { type: "number", value: userAnswer, onChange: (e) => setUserAnswer(e.target.value), placeholder: "\u7B54\u3048\u3092\u5165\u529B", autoFocus: true }),
                    react_1.default.createElement("button", { type: "submit" }, "\u56DE\u7B54"))))))));
};
exports.default = App;

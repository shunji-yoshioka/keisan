import React from 'react';
import './NumberKeyboard.css';

interface NumberKeyboardProps {
    onNumberClick: (num: number) => void;
    onDelete: () => void;
    onSubmit: () => void;
}

const NumberKeyboard: React.FC<NumberKeyboardProps> = ({ onNumberClick, onDelete, onSubmit }) => {
    return (
        <div className="number-keyboard">
            <div className="keyboard-row">
                {[1, 2, 3].map(num => (
                    <button
                        key={num}
                        className="keyboard-key"
                        onClick={() => onNumberClick(num)}
                    >
                        {num}
                    </button>
                ))}
            </div>
            <div className="keyboard-row">
                {[4, 5, 6].map(num => (
                    <button
                        key={num}
                        className="keyboard-key"
                        onClick={() => onNumberClick(num)}
                    >
                        {num}
                    </button>
                ))}
            </div>
            <div className="keyboard-row">
                {[7, 8, 9].map(num => (
                    <button
                        key={num}
                        className="keyboard-key"
                        onClick={() => onNumberClick(num)}
                    >
                        {num}
                    </button>
                ))}
            </div>
            <div className="keyboard-row">
                <button
                    className="keyboard-key delete-key"
                    onClick={onDelete}
                >
                    ←
                </button>
                <button
                    className="keyboard-key"
                    onClick={() => onNumberClick(0)}
                >
                    0
                </button>
                <button
                    className="keyboard-key submit-key"
                    onClick={onSubmit}
                >
                    回答
                </button>
            </div>
        </div>
    );
};

export default NumberKeyboard; 
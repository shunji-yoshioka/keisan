import React from 'react';
import './NumberKeyboard.css';
const NumberKeyboard = ({ onNumberClick, onDelete, onSubmit }) => {
    return (React.createElement("div", { className: "number-keyboard" },
        React.createElement("div", { className: "keyboard-row" }, [1, 2, 3].map(num => (React.createElement("button", { key: num, className: "keyboard-key", onClick: () => onNumberClick(num) }, num)))),
        React.createElement("div", { className: "keyboard-row" }, [4, 5, 6].map(num => (React.createElement("button", { key: num, className: "keyboard-key", onClick: () => onNumberClick(num) }, num)))),
        React.createElement("div", { className: "keyboard-row" }, [7, 8, 9].map(num => (React.createElement("button", { key: num, className: "keyboard-key", onClick: () => onNumberClick(num) }, num)))),
        React.createElement("div", { className: "keyboard-row" },
            React.createElement("button", { className: "keyboard-key delete-key", onClick: onDelete }, "\u2190"),
            React.createElement("button", { className: "keyboard-key", onClick: () => onNumberClick(0) }, "0"),
            React.createElement("button", { className: "keyboard-key submit-key", onClick: onSubmit }, "\u56DE\u7B54"))));
};
export default NumberKeyboard;

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './App.css';

const SERV = 'http://10.5.2.129:5000';

function App() {
    const [sudoku, setSudoku] = useState([]);
    const [initialCells, setInitialCells] = useState([]);
	const [selectedSize, setSelectedSize] = useState(3);
    const [message, setMessage] = useState('');
    const [selectedCell, setSelectedCell] = useState({ row: -1, col: -1 });
    const [error, setError] = useState('');

    // Функция для загрузки нового судоку
    const fetchNewSudoku = useCallback(async () => {
        try {
            const response = await axios.get(`${SERV}/generate?size=${selectedSize}`);
            setSudoku(response.data);
            // Сохраняем позиции изначально заполненных ячеек
            const initial = response.data.map(row => row.map(cell => cell !== 0));
            setInitialCells(initial);
            setMessage('');
            setSelectedCell({ row: -1, col: -1 });
            setError('');
        } catch (error) {
            console.error("Error fetching sudoku:", error);
        }
    }, [selectedSize]);
	
	// Загрузка нового судоку при старте
    useEffect(() => {
        fetchNewSudoku();
    }, [fetchNewSudoku]);

    // Обработка изменения ячейки
    const handleCellChange = (row, col, value) => {
		const num = parseInt(value, 10);
		if ((value === '') || (!isNaN(num) && (1 <= num) && (num <= selectedSize * selectedSize))) {
			const newSudoku = sudoku.map((r, i) =>
                r.map((cell, j) => (((i === row) && (j === col)) ? (value === '' ? 0 : num) : cell))
            );
            setSudoku(newSudoku);
            setError('');
		} else {
            setError(`Введите число от 1 до ${selectedSize * selectedSize}.`);
        }
    };

    // Проверка решения
    const validateSudoku = async () => {
        try {
            const response = await axios.post(`${SERV}/validate`, { board: sudoku });
            setMessage(response.data.status === 'valid' ? 'Решение верное!' : 'Решение неверное!');
            setError('');
        } catch (error) {
            console.error("Error validating sudoku:", error);
        }
    };

    // Выбор ячейки
    const handleCellClick = (row, col) => {
        if (!initialCells[row][col]) {
            setSelectedCell({ row, col });
        }
		setError('');
    };
	
	// Изменение выбранного размера игры
	const handleSizeChange = (e) => {
        const newIndex = parseInt(e.target.value);
        setSelectedSize(newIndex);
    };
	
    return (
        <div className="App">
            <h1>Судоку</h1>
            <div className="sudoku-board"
                style={{
                     gridTemplateColumns: `repeat(${selectedSize * selectedSize}, '40px')`,
                     fontSize: selectedSize === 4 ? '12px' : '16px'
                 }}
			>
				{sudoku.map((row, i) => (
                    <div key={i} className="sudoku-row">
                        {row.map((cell, j) => (
                            <div
                                key={j}
                                className={`sudoku-cell 
                                    ${selectedCell.row === i && selectedCell.col === j ? 'selected' : ''} 
                                    ${initialCells[i][j] ? 'initial' : 'user'} 
                                    ${(i + 1) % selectedSize === 0 && i !== (selectedSize * selectedSize - 1) ? 'border-bottom' : ''} 
                                    ${(j + 1) % selectedSize === 0 && j !== (selectedSize * selectedSize - 1) ? 'border-right' : ''}`}
                                onClick={() => handleCellClick(i, j)}
                            >
                                {cell !== 0 ? (
                                    initialCells[i][j] ? (
                                        <span className="cell-value">{cell}</span>
                                    ) : (
                                        <input
                                            type="text"
                                            value={cell}
                                            onChange={(e) => handleCellChange(i, j, e.target.value)}
                                            maxLength="2"
                                            className="cell-input"
                                        />
                                    )
                                ) : (
                                    <input
                                        type="text"
                                        value=""
                                        onChange={(e) => handleCellChange(i, j, e.target.value)}
                                        maxLength="2"
                                        className="cell-input"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
            <div className="controls">
                <button onClick={validateSudoku}>Проверить решение</button>
                <button onClick={fetchNewSudoku}>Новая игра</button>
				<select value={selectedSize} onChange={handleSizeChange}>
                    <option value={2}>Игра 4x4</option>
                    <option value={3}>Игра 9x9</option>
                    <option value={4}>Игра 16x16</option>
                </select>
            </div>
            {message && <p className="message">{message}</p>}
            {error && <p className="error">{error}</p>}
        </div>
    );
}

export default App;

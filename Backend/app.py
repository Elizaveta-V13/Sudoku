from flask import Flask, jsonify, request
from flask_cors import CORS
import random

app = Flask(__name__)
CORS(app)

# Размер квадратов
base = -1

# Генерация судоку
def generate_sudoku(Base):
    global base
    base = Base
    side = base * base

    def pattern(r, c): return (base * (r % base) + r // base + c) % side

    def shuffle(s): return random.sample(s, len(s))

    rBase = range(base)
    rows = [g * base + r for g in shuffle(rBase) for r in shuffle(rBase)]
    cols = [g * base + c for g in shuffle(rBase) for c in shuffle(rBase)]
    nums = shuffle(range(1, base * base + 1))

    board = [[nums[pattern(r, c)] for c in cols] for r in rows]

    squares = side * side
    empties = 3 * squares // 5
    for p in random.sample(range(squares), empties):
        board[p // side][p % side] = 0

    return board

# Проверка корректности решения
def is_valid_sudoku(board):
    side = base * base
    
    for i in range(side):
        row = [num for num in board[i] if num != 0]
        if len(row) != len(set(row)):
            return False
    
        col = [board[j][i] for j in range(side) if board[j][i] != 0]
        if len(col) != len(set(col)):
            return False
    
    for i in range(0, side, base):
        for j in range(0, side, base):
            block = [board[x][y] for x in range(i, i + base) for y in range(j, j + base) if board[x][y] != 0]
            if len(block) != len(set(block)):
                return False
    
    return True

# Эндпоинт для генерации судоку
@app.route('/generate', methods=['GET'])
def generate():
    size = int(request.args.get('size'))
    sudoku = generate_sudoku(size)
    return jsonify(sudoku)

# Эндпоинт для проверки решения
@app.route('/validate', methods=['POST'])
def validate():
    data = request.get_json()
    board = data['board']
    if is_valid_sudoku(board):
        return jsonify({"status": "valid"})
    else:
        return jsonify({"status": "invalid"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

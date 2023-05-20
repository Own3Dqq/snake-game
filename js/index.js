/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
/* eslint-disable no-new */
/* eslint-disable no-lone-blocks */
/* eslint-disable default-case */
/* eslint-disable import/extensions */
/* eslint-disable lines-between-class-members */
/* eslint-disable no-plusplus */
import Grid from './grid.js';
import { DIRECTIONS as DR } from './helpers.js';

class Snake extends Grid {
    static snakeCellCssClass = 'snake-cell';
    static snakeCssClass = 'snake';
    static snakeHeadCssClass = 'snake-head';
    static snakeBodyCssClass = 'snake-body';
    static gridContainerCssSelector = '#snake-container';

    #snake = [];
    #process = null;
    #score = 0;
    #speed = 0;
    #food = null;
    #mode = '';
    #foodSrcImage = '/img/apple.png';
    #controls = this.find('#snake-controls-form');
    #startBtn = this.find('#snake-start-game');
    #endBtn = this.find('#snake-end-game');
    #messageContainer = this.find('#snake-message');
    #scoreContainer = this.find('#snake-score');

    constructor({ boxSize, gridCount }) {
        super({
            boxSize,
            gridCount,
            gridCellCssClass: Snake.snakeCellCssClass,
            gridContainerSelector: Snake.gridContainerCssSelector,
        });

        this.direction = DR.LEFT;

        this.#init();
    }

    #init() {
        document.addEventListener('keydown', (event) => this.#updateDirection(event));

        this.#startBtn.addEventListener('click', (event) => this.#start(event));
        this.#endBtn.addEventListener('click', (event) => this.#end(event));
    }

    #start() {
        this.#snake = this.#buildSnake(Math.floor(this.gridCount / 2), Math.floor(this.gridCount / 2));

        this.#generateFood();
        this.#speed = +this.#controls.speed.value;
        this.#mode = this.#controls.mode.value;
        this.#messageContainer.innerHTML = ' ';
        this.#startBtn.style.display = 'none';
        this.#endBtn.style.display = 'block';

        this.#process = setInterval(() => {
            const { cell, row } = this.#snake[0];
            // let { cell, row } = this.#noWallMode();

            switch (this.direction) {
                case DR.LEFT:
                    {
                        this.#snake.unshift({
                            cell: cell !== 0 ? cell - 1 : cell + this.gridCount - 1,
                            row,
                        });
                    }
                    break;

                case DR.RIGHT:
                    {
                        this.#snake.unshift({
                            cell: cell !== this.gridCount - 1 ? cell + 1 : cell - this.gridCount + 1,
                            row,
                        });
                    }
                    break;

                case DR.UP:
                    {
                        this.#snake.unshift({
                            cell,
                            row: row !== 0 ? row - 1 : row + this.gridCount - 1,
                        });
                    }
                    break;

                case DR.DOWN:
                    {
                        this.#snake.unshift({
                            cell,
                            row: row !== this.gridCount - 1 ? row + 1 : row - this.gridCount + 1,
                        });
                    }
                    break;
            }

            this.#clear();
            this.#update();
        }, this.#speed);
    }

    #update() {
        const scoreValue = this.#scoreContainer.lastChild;
        scoreValue.innerHTML = this.#score;

        this.#checkOnTailCrash();
        this.#checkHasFoodEaten();

        this.#snake.pop();

        for (const [index, snakeData] of this.#snake.entries()) {
            const cellElement = this.#findByCoords(snakeData);
            if (index === 0) {
                cellElement.classList.add(Snake.snakeHeadCssClass, Snake.snakeCssClass);
            } else {
                cellElement.classList.add(Snake.snakeBodyCssClass, Snake.snakeCssClass);
            }
        }
    }

    #generateFood() {
        do {
            this.#food = {
                cell: Math.floor(Math.random() * this.gridCount),
                row: Math.floor(Math.random() * this.gridCount),
            };
        } while (
            this.#snake.find((element) => {
                return element.cell === this.#food.cell && element.row === this.#food.row;
            })
        );

        const cellFood = this.#findByCoords(this.#food);
        const image = new Image();
        image.src = this.#foodSrcImage;
        cellFood.append(image);
    }

    #checkHasFoodEaten() {
        if (this.#snake[0].row === this.#food.row && this.#snake[0].cell === this.#food.cell) {
            this.#score = ++this.#score;
            this.#snake.push(this.#food);

            const snakeContainer = document.querySelector(Snake.gridContainerCssSelector);

            for (let i = 0; i < snakeContainer.children.length; i++) {
                const element = snakeContainer.children[i];
                element.innerHTML = '';
            }

            this.#generateFood();
        }
    }

    #checkOnTailCrash() {
        const snakeHead = this.#snake[0];

        const snakeBiteItself =
            this.#snake.filter((element) => {
                return element.cell === snakeHead.cell && element.row === snakeHead.row;
            }).length - 1;

        if (snakeBiteItself >= 1) {
            this.#messageContainer.innerHTML = `Game Over!  Your result: ${this.#score}`;
            this.#end();
        }
    }

    #clear() {
        const cells = this.find(`.${Snake.snakeCssClass}`, this.gridContainer);
        cells.forEach((cell) => {
            cell.className = Snake.snakeCellCssClass;
        });
    }

    #updateDirection(event) {
        const { key } = event;

        if (key === 'ArrowLeft' && this.direction !== DR.RIGHT) this.direction = DR.LEFT;
        else if (key === 'ArrowUp' && this.direction !== DR.DOWN) this.direction = DR.UP;
        else if (key === 'ArrowRight' && this.direction !== DR.LEFT) this.direction = DR.RIGHT;
        else if (key === 'ArrowDown' && this.direction !== DR.UP) this.direction = DR.DOWN;
    }

    #resetData() {
        this.#snake = [];
        this.#process = null;
        this.#score = 0;
        this.#speed = 0;
        this.#food = null;
        this.#mode = '';
        this.direction = DR.LEFT;
        this.#scoreContainer.lastChild.innerHTML = '0';

        this.#startBtn.style.display = 'block';
        this.#endBtn.style.display = 'none';

        const snakeContainer = document.querySelector(Snake.gridContainerCssSelector);

        (function () {
            for (let i = 0; i < snakeContainer.children.length; i++) {
                const element = snakeContainer.children[i];
                element.innerHTML = '';
            }
        })();
    }

    #end() {
        clearInterval(this.#process);
        this.#resetData();
        this.#clear();
    }

    #findByCoords({ cell, row }) {
        return this.find(`[data-cell="${cell}"][data-row="${row}"]`, this.gridContainer);
    }

    #buildSnake(startCell, startRow, size = 5) {
        return new Array(size).fill(null).map((value, index) => ({
            row: startRow,
            cell: startCell + index,
        }));
    }
}

new Snake({
    boxSize: 40,
    gridCount: 12,
});

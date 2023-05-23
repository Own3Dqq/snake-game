import Grid from './grid.js';
import { DIRECTIONS as DR } from './helpers.js';

class Snake extends Grid {
	static snakeCellCssClass = 'snake-cell';
	static snakeCssClass = 'snake';
	static snakeHeadCssClass = 'snake-head';
	static snakeBodyCssClass = 'snake-body';
	static gridContainerCssSelector = '#snake-container';
	static modeSelector = '#staked-mode';
	static speedSelector = '#stacked-state';

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

	#disableControls() {
		this.#controls.speed.setAttribute('disabled', 'disabled');
		this.#controls.mode.setAttribute('disabled', 'disabled');
	}

	#enableControls() {
		this.#controls.speed.removeAttribute('disabled');
		this.#controls.mode.removeAttribute('disabled');
	}

	#start() {
		this.#disableControls();

		this.#snake = this.#buildSnake(Math.floor(this.gridCount / 2), Math.floor(this.gridCount / 2));
		this.#generateFood();

		this.#speed = +this.#controls.speed.value;
		this.#mode = this.#controls.mode.value;

		this.#messageContainer.innerHTML = ' ';
		this.#startBtn.style.display = 'none';
		this.#endBtn.style.display = 'block';

		this.#process = setInterval(() => {
			const { cell, row } = this.#snake[0];

			const isNoWallMode = this.#mode === 'no-wall';

			switch (this.direction) {
				case DR.LEFT: {
					let newCell;

					if (cell) {
						newCell = cell - 1;
					} else {
						newCell = isNoWallMode ? this.gridCount - 1 : 0;
					}
					this.#snake.unshift({ cell: newCell, row });

					break;
				}

				case DR.RIGHT: {
					let newCell;

					if (cell !== this.gridCount - 1) {
						newCell = cell + 1;
					} else {
						newCell = isNoWallMode ? 0 : false;
					}

					this.#snake.unshift({ cell: newCell, row });

					break;
				}

				case DR.UP: {
					let newRow;

					if (row) {
						newRow = row - 1;
					} else {
						newRow = isNoWallMode ? this.gridCount - 1 : 0;
					}

					this.#snake.unshift({ cell, row: newRow });

					break;
				}

				case DR.DOWN: {
					let newRow;

					if (row !== this.gridCount - 1) {
						newRow = row + 1;
					} else {
						newRow = isNoWallMode ? 0 : 0;
					}

					this.#snake.unshift({ cell, row: newRow });

					break;
				}

				default: {
					return TypeError('Wrong move key, pleace check your keyboard.');
				}
			}

			this.#clear();
			this.#update();

			return false;
		}, this.#speed);
	}

	#update() {
		const scoreValue = this.#scoreContainer.lastChild;
		scoreValue.innerHTML = this.#score;

		this.#checkOnTailCrash();

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
			this.#score += 1;
			this.#snake.push(this.#food);
			this.#food = null;

			const snakeContainer = document.querySelector(Snake.gridContainerCssSelector);

			for (let i = 0; i < snakeContainer.children.length; i += 1) {
				const element = snakeContainer.children[i];
				element.innerHTML = '';
			}

			this.#generateFood();
		}
		return;
	}

	#checkOnTailCrash() {
		const snakeHead = this.#snake[0];

		const snakeBiteItself =
			this.#snake.filter((element) => {
				return element.cell === snakeHead.cell && element.row === snakeHead.row;
			}).length - 1;

		if (snakeBiteItself) {
			this.#end();
		} else {
			this.#checkHasFoodEaten();
		}

		return;
	}

	#clear() {
		const cells = this.find(`.${Snake.snakeCssClass}`, this.gridContainer);
		cells.forEach((item) => {
			item.className = Snake.snakeCellCssClass;
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

		this.#enableControls();

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
		this.#messageContainer.innerHTML = `Game Over!  Your result: ${this.#score}`;
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

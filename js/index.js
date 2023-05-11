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
	#food = '../img/apple.png';
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
		this.#generateFood(Snake.gridContainerCssSelector);
		this.#speed = +this.#controls.speed.value;
		this.#messageContainer.innerHTML = 'Welcome to Snake !';
		this.#startBtn.style.display = 'none';
		this.#endBtn.style.display = 'block';

		this.#process = setInterval(() => {
			let { cell, row } = this.#snake[0];
			// let { cell, row } = #noWallMode();

			switch (this.direction) {
				case DR.LEFT:
					{
						this.#snake.unshift({
							cell: cell - 1,
							row,
						});
					}
					break;

				case DR.RIGHT:
					{
						this.#snake.unshift({
							cell: cell + 1,
							row,
						});
					}
					break;

				case DR.UP:
					{
						this.#snake.unshift({
							cell,
							row: row - 1,
						});
					}
					break;

				case DR.DOWN:
					{
						this.#snake.unshift({
							cell,
							row: row + 1,
						});
					}
					break;
			}

			this.#clear();
			this.#update();
		}, this.#speed);
	}

	#checkHasFoodEaten() {}

	#update() {
		// if (this.checkHasFoodEaten()) {
		// 	this.#generateFood();
		// }
		// checkHasFoodEaten();
		// if a snake has eaten apple then add +1 to score and push one more object ( {cell, row} )
		// after it ate apple you should generate new coords for the apple to append it in a cell again

		// checkOnTailCrash - if a head bump into the tail. if so need to final game
		// this.#message.innerHTML = 'Game Over', reset score and so on

		this.#snake.pop();

		for (const [index, snakeData] of this.#snake.entries()) {
			let cellElement = this.#findByCoords(snakeData);
			if (index === 0) {
				cellElement.classList.add(Snake.snakeHeadCssClass, Snake.snakeCssClass);
			} else {
				cellElement.classList.add(Snake.snakeBodyCssClass, Snake.snakeCssClass);
			}
		}
	}

	#clear() {
		let cells = this.find(`.${Snake.snakeCssClass}`, this.gridContainer);

		cells.forEach((cell) => {
			cell.className = Snake.snakeCellCssClass;
		});
	}

	#updateDirection(event) {
		let key = event.key;

		if (key === 'ArrowLeft' && this.direction != DR.RIGHT) this.direction = DR.LEFT;
		else if (key === 'ArrowUp' && this.direction != DR.DOWN) this.direction = DR.UP;
		else if (key === 'ArrowRight' && this.direction != DR.LEFT) this.direction = DR.RIGHT;
		else if (key === 'ArrowDown' && this.direction != DR.UP) this.direction = DR.DOWN;
	}

	#generateFood() {
		const container = document.querySelector(Snake.gridContainerCssSelector);
		const food = new Image(this.boxSize, this.boxSize);
		food.src = './img/apple.png';

		function randomCell() {
			const randCell = Math.floor(Math.random() * container.children.length);
			if (
				container.children[randCell].classList.contains('snake-head') ||
				container.children[randCell].classList.contains('snake-head')
			) {
				randomCell();
			} else {
				container.children[randCell].append(food);
			}
		}

		randomCell();
	}

	#resetData() {
		this.#score = 0;
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

	// Supplement the method with additional implementation like reseting all data (like score, buttons state, ...)

	#end() {
		clearInterval(this.#process);

		this.#clear();
		this.#resetData();
	}

	#findByCoords({ cell, row }) {
		return this.find(`[data-cell="${cell}"][data-row="${row}"]`, this.gridContainer);
	}

	#buildSnake(startCell, startRow, size = 5) {
		return new Array(size).fill(null).map((value, index) => ({ row: startRow, cell: startCell + index }));
	}
}

new Snake({
	boxSize: 44,
	gridCount: 12,
});

console.log();

export class GameOfLife {
	constructor(canvas, w=48, h=48) {
		this.canvas = canvas;
		this.context = this.canvas.getContext("2d");

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;

		this.matrix = [];
		this.matrixTemp = [];
		this.matrixWidth = w;
		this.matrixHeight = h;

		for (let h = 0; h < this.matrixHeight; h++) {
			const row = [];
			const rowTemp = [];
			for (let w = 0; w < this.matrixWidth; w++) {
				row.push(0);
				rowTemp.push(0);
			}
			this.matrix.push(row);
			this.matrixTemp.push(row);
		}

		this.zoom = 1;
		this.size = 80;

		this.border = true;
		this.borderWidth = 2;
		this.borderColor = '#bbb';
		this.cellColor = '#ccc';
		this.bgColor = '#000';

		this.canvas.style.background = this.bgColor;

		this.offsetX = 0;
		this.offsetY = 0;

		this.key = {
			shift: false
		};

		this.positionOutput = null;

		this.init();
	}

	init() {
		document.addEventListener('keydown', (e) => { this.onKey(e, false); });
		document.addEventListener('keyup', (e) => { this.onKey(e, true); });

		this.canvas.addEventListener('click', (e) => { this.onClick(e); });
		this.canvas.addEventListener('wheel', (e) => { this.onZoom(e); });

		document.addEventListener('mousemove', (e) => {
			if (!this.positionOutput) {
				return;
			}

			const cellX = Math.floor((e.clientX + this.offsetX) / (this.size * this.zoom));
			const cellY = Math.floor((e.clientY + this.offsetY) / (this.size * this.zoom));

			if (cellX >= 0 && cellX < this.matrixWidth && cellY >= 0 && cellY < this.matrixHeight) {
				this.positionOutput.innerText = `X:${cellX}\nY:${cellY}`;
			}
		});
	}

	onKey(e, up) {
		const k = e.key.toLowerCase();

		if (k in this.key) {
			this.key[k] = !up;
		}
	}

	calcCellCoords(clientX, clientY) {
		const k = this.size * this.zoom;
		const x = Math.floor((clientX + this.offsetX) / k);
		const y = Math.floor((clientY + this.offsetY) / k);
		return {x, y};
	}

	setCell(x, y, value=undefined) {
		if (value !== undefined) {
			this.matrix[y][x] = value;
		} else {
			this.matrix[y][x] = this.matrix[y][x] ? 0 : 1;
		}
	}

	onClick(e) {
		e.preventDefault();

		if (this.key.shift) {
			return;
		};

		const cell = this.calcCellCoords(e.clientX, e.clientY);

		if (cell.x >= 0 && cell.x < this.matrixWidth && cell.y >= 0 && cell.y < this.matrixHeight) {
			this.setCell(cell.x, cell.y);
			this.update();
		}
	}

	onZoom(e) {
		e.preventDefault();

		this.zoom += e.deltaY * -0.001;
		this.zoom = Math.min(Math.max(0.25, this.zoom), 4);

		this.borderWidth = this.borderWidth * this.zoom;
		this.borderWidth =  Math.min(Math.max(0.5, this.borderWidth), 2);

		this.update();
	}

	clearViewport() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}

	drawBorder() {
		// const yQuantity = (this.canvas.height + this.offsetY) / (this.size * this.zoom);
		// const xQuantity = (this.canvas.width + this.offsetX) / (this.size * this.zoom);

		const yQuantity = this.matrixHeight;
		const xQuantity = this.matrixWidth;

		const deltaSize = this.size * this.zoom;

		this.context.lineWidth = this.borderWidth.toString();
		this.context.strokeStyle = this.borderColor;

		for (let row = 0; row < yQuantity; row++) {
			const y = row * deltaSize - this.offsetY;
			for (var col = 0; col < xQuantity; col++) {
				this.context.beginPath();
				const x = col * deltaSize - this.offsetX;
				this.context.rect(x, y, deltaSize, deltaSize);
				this.context.stroke();
			}
		}
	}

	drawCell(x, y, value=true, color=this.cellColor) {
		const deltaSize = this.size * this.zoom;

		const frameX = x * deltaSize - this.offsetX;
		const frameY = y * deltaSize - this.offsetY;

		this.context.fillStyle = value ? color : this.bgColor;
		this.context.fillRect(frameX, frameY, deltaSize, deltaSize);
	}

	update() { // Optimize
		this.clearViewport();
		
		if (this.border) {
			this.drawBorder();
		}

		for (const y in this.matrix) {
			for (const x in this.matrix[y]) {
				if (this.matrix[y][x]) this.drawCell(x, y, this.matrix[y][x]);
			}
		}
	}

	countNeighbors(row, col) {
		let count = 0;

		for (let i = -1; i <= 1; i++) {
			for (let j = -1; j <= 1; j++) {
				const neighborRow = row + i;
				const neighborCol = col + j;

				if ((i !== 0 || j !== 0) && neighborRow >= 0 && neighborRow < this.matrixHeight && neighborCol >= 0 && neighborCol < this.matrixWidth) {
					count += this.matrix[neighborRow][neighborCol];
				}
			}
		}

		return count;
	}

	nextStep() {
		const m = this.matrix;

		this.matrixTemp = m.map(row => row.slice());

		for (let y = 0; y < m.length; y++) {
			for (let x = 0; x < m[y].length; x++) {
				const neighbors = this.countNeighbors(y, x);

				if (m[y][x] == 1 && (neighbors < 2 || neighbors > 3)) {
					this.matrixTemp[y][x] = 0;
				} else if (m[y][x] == 0 && neighbors == 3) {
					this.matrixTemp[y][x] = 1;
				}
			}
		}

		this.matrix = this.matrixTemp.slice();

		this.update();
	}

	clear() {
		this.matrix = this.matrix.map(row => row.map(col => 0));
		this.update();
	}
}



export class Interface {
	constructor(gameOfLife) {
		this.gameOfLife = gameOfLife;
	}

	#update() {
		this.gameOfLife.update();
	}

	addCol(quantity=1) {
		if (quantity < 1) {
			throw new Error(`[quantity] >= 1`);
		}

		for (const row of this.gameOfLife.matrix) {
			for (var i = 0; i < quantity; i++) {
				row.push(false);
			}
		}

		this.gameOfLife.matrixTemp = this.gameOfLife.matrix.slice();
		this.gameOfLife.matrixWidth += quantity;

		this.#update();
	}

	removeCol(quantity=1) {
		if (quantity < 1) {
			throw new Error(`[quantity] >= 1`);
		}

		if (this.gameOfLife.matrixWidth - quantity < 0) {
			return;
		}

		for (const row of this.gameOfLife.matrix) {
			for (var i = 0; i < quantity; i++) {
				row.pop();
			}
		}

		this.gameOfLife.matrixTemp = this.gameOfLife.matrix.slice();
		this.gameOfLife.matrixWidth -= quantity;

		this.#update();
	}

	addRow(quantity=1) {
		if (quantity < 1) {
			throw new Error(`[quantity] >= 1`);
		}

		const row = [];
		for (var col = 0; col < this.gameOfLife.matrixWidth; col++) {
			row.push(false);
		}

		this.gameOfLife.matrix.push(row);
		this.gameOfLife.matrixTemp = this.gameOfLife.matrix.slice();
		this.gameOfLife.matrixHeight += quantity;

		this.#update();
	}

	removeRow(quantity=1) {
		if (quantity < 1) {
			throw new Error(`[quantity] >= 1`);
		}

		if (this.gameOfLife.matrixHeight - quantity < 0) {
			return;
		}

		for (var i = 0; i < quantity; i++) {
			this.gameOfLife.matrix.pop();
		}

		this.gameOfLife.matrixTemp = this.gameOfLife.matrix.slice();
		this.gameOfLife.matrixHeight -= quantity;

		this.#update();
	}

	loadMask(mask) {
		let lastPos = [NaN, NaN];

		this.gameOfLife.canvas.onmousemove = (e) => {
			const pos = this.gameOfLife.calcCellCoords(e.clientX, e.clientY);

			if (pos.x !== lastPos[0] || pos.y !== lastPos[1]) {
				this.#update();

				for (const row in mask) {
					for (const col in mask[row]) {
						if (mask[row][col]) {
							this.gameOfLife.drawCell(pos.x + parseInt(col), pos.y + parseInt(row), true, '#d00');
						}
					}
				}

				lastPos[0] = pos.x;
				lastPos[1] = pos.y;
			}
		}

		this.gameOfLife.canvas.onclick = (e) => {
			const pos = this.gameOfLife.calcCellCoords(e.clientX, e.clientY);

			for (const row in mask) {
				for (const col in mask[row]) {
					this.gameOfLife.matrix[pos.y + parseInt(row)][pos.x + parseInt(col)] = mask[row][col] ? true : false;
				}
			}

			this.gameOfLife.canvas.onmousemove = null;
			this.gameOfLife.canvas.onclick = null;
			this.#update();
		}
	}
}
import {
	GameOfLife,
	Interface
} from './Components.js';

const viewport = document.getElementById('viewport');

const gameOfLife = new GameOfLife(viewport, 64, 64);
gameOfLife.drawBorder();


document.getElementById('next').addEventListener('click', () => {
	gameOfLife.nextStep();
})

let delay = 1;
const timeDelay = document.getElementById('time-delay');
timeDelay.value = delay;

timeDelay.addEventListener('change', (e) => {
	delay = parseFloat(timeDelay.value);
	console.log(delay);
});

let interval = null;
let play = false;
const playPause = document.getElementById('play');
console.log(playPause);

playPause.addEventListener('click', () => {
	play = !play;

	playPause.classList.toggle('active', play);

	if (play) {
		interval = setInterval(function() {
			gameOfLife.nextStep();
		}, delay * 100);
	} else {
		clearInterval(interval);
	}
})

const drawBorder = document.getElementById('drawBorder');
drawBorder.checked = true;
drawBorder.addEventListener('change', () => {
	gameOfLife.border = drawBorder.checked;
	gameOfLife.update();
})

document.getElementById('clear').addEventListener('click', () => { gameOfLife.clear() });

gameOfLife.positionOutput = document.getElementById('position');


const iface = new Interface(gameOfLife);

document.getElementById('addCol').addEventListener('click', () => { iface.addCol(); });
document.getElementById('removeCol').addEventListener('click', () => { iface.removeCol(); });
document.getElementById('addRow').addEventListener('click', () => { iface.addRow(); });
document.getElementById('removeRow').addEventListener('click', () => { iface.removeRow(); });
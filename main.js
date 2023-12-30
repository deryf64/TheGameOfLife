import {
	GameOfLife,
	Interface
} from './Components.js';
import { library } from './lib.js';

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

const mask = document.getElementById('mask');
document.getElementById('loadMask').addEventListener('click', () => {
	const data = JSON.parse(mask.value);

	if (!Array.isArray(data)) {
		throw new TypeError('mask must be an array');
	}

	if (data.find((e) => { console.log(e); return !Array.isArray(e); }) !== undefined) {
		throw new Error('mask example: \n[\n\t[0,1,0],\n\t[0,0,1],\n\t[1,1,1]\n]');
	}

	iface.loadMask(data);
})

// Load library

const libraryBlock = document.getElementById('library');
const libraryList = document.getElementById('lib-list');
console.log(library);
for (const el in library) {
	console.log(el);
	libraryList.innerHTML += `
		<li>
			<button class="lib-mask" data-mask="${JSON.stringify(library[el])}">${el}</button>
		</li>
	`;
}

for (const el of document.querySelectorAll('button.lib-mask')) {
	el.onclick = (e)=>{
		iface.loadMask(JSON.parse(e.target.getAttribute('data-mask')));
	}
}
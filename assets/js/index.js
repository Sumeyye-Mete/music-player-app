const playlist = await fetch("/assets/data/playlist.json")
	.then((response) => response.json())
	.then((data) => {
		return data;
	});

let isRepeat = false;
let isShuffle = false;
let currentFile = null;
let nextId = null;
let prevId = null;
let isPaused = true;

//parent
const cardContainer = document.getElementById("card-container");

//file elements
const audio = document.getElementById("current-audio");
const poster = document.getElementById("song-poster");
const songInfo = document.getElementById("song-info");
const licenceText = document.getElementsByClassName("licence")[0];

//time elements
const timeInput = document.getElementById("time-range");
const currentTimeInfo = document.getElementById("current-time-info");
const totalTimeInfo = document.getElementById("total-time-info");

//buttons
const licenceButton = document.getElementById("licence-btn");
const playButton = document.getElementById("play-btn");
const shuffleButton = document.getElementById("shuffle-btn");
const backwardButton = document.getElementById("backward-btn");
const forwardButton = document.getElementById("forward-btn");
const repeatButton = document.getElementById("repeat-btn");

document.querySelectorAll("a").forEach((item) => {
	item.setAttribute("target", "_blank");
});

playButton.addEventListener("click", () => {
	if (audio.paused) {
		audio.play();
		playButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
	} else {
		audio.pause();
		playButton.innerHTML = `<i class="fa-solid fa-play"></i>`;
	}
});

forwardButton.addEventListener("click",  () => {
	calculateNextId();
	changeTrack(nextId);
});

backwardButton.addEventListener("click", () => {
	calculatePrevId();
	changeTrack(prevId);
});

shuffleButton.addEventListener("click", () => {
	if (isShuffle) {
		isShuffle = false;
		shuffleButton.classList.remove("green-text");
	} else {
		isShuffle = true;
		shuffleButton.classList.add("green-text");
	}
});

repeatButton.addEventListener("click", () => {
	if (isRepeat) {
		isRepeat = false;
		repeatButton.classList.remove("green-text");
	} else {
		isRepeat = true;
		repeatButton.classList.add("green-text");
	}
});

licenceButton.addEventListener("click", () => {
	licenceText.classList.toggle("d-none");
});

timeInput.addEventListener("change", () => {
	const dur = audio.duration;
	audio.currentTime = (dur * timeInput.value) / 1000;
});

audio.addEventListener("timeupdate", () => {
	if (isNaN(audio.duration)) {
		timeInput.value = 0;
	} else {
		timeInput.value = (audio.currentTime / audio.duration) * 1000;
	}
	currentTimeInfo.innerText = convertSecondsToMinutes(audio.currentTime);
	if (!audio.ended) {
		isPaused = audio.paused;
	}
});

audio.oncanplay = () => {
	totalTimeInfo.innerText = convertSecondsToMinutes(audio.duration);
};
audio.onended = () => {
	forwardButton.click();
	if (nextId === 0 && !isRepeat) {
		playButton.click();
	}
};

const convertSecondsToMinutes = (num) => {
	const minutes = Math.floor(num / 60);
	const seconds = Math.floor(num % 60);
	if (seconds < 10) {
		return `${minutes}:0${seconds}`;
	}
	return `${minutes}:${seconds}`;
};

const changeTrack =  (id) => {
	currentFile = playlist[id];
	audio.setAttribute("src", `./assets/musics/${currentFile.music}`);
	poster.setAttribute("src", `./assets/images/${currentFile.image}`);
	songInfo.innerHTML = `<h1>${currentFile.title}</h1><h3>${currentFile.artist}</h3>`;
	licenceText.innerHTML = currentFile.desc;
	if (isPaused) {
		 audio.pause();
	} else {
		 audio.play();
	}
};

const calculateNextId = () => {
	if (isShuffle) {
		while (true) {
			nextId = Math.floor(Math.random() * playlist.length);
			if (nextId !== currentFile.id) {
				break;
			}
		}
	} else {
		if (currentFile.id === playlist.length - 1) {
			nextId = 0;
		} else {
			nextId = currentFile.id + 1;
		}
	}
};

const calculatePrevId = () => {
	if (isShuffle) {
		while (true) {
			prevId = Math.floor(Math.random() * playlist.length);
			if (prevId !== currentFile.id) {
				break;
			}
		}
	} else {
		if (currentFile.id === 0) {
			prevId = playlist.length - 1;
		} else {
			prevId = currentFile.id - 1;
		}
	}
};

changeTrack(0);

/* const renderCard = (id) => {
	playlist.forEach((item) => {
		if (id === item.id) {
			currentFile = item;
		}
	});

	return `<div class="card">
  <button class="list-btn"><i class="fa-solid fa-bars"></i></button>
  <img
    id="song-poster"
    src="./assets/images/${currentFile.image}"
    alt="song-poster"
  />
  <div class="info-section">
    <div class="song-info">
      <h1>${currentFile.title}</h1>
      <h3>${currentFile.artist}</h3>
    </div>
    <button><i class="fa-solid fa-circle-info"></i></button>
  </div>
  <div class="button-container">
    <button id="shuffle-btn" isShuffle=${isShuffle}><i class="fa-solid fa-shuffle"></i></button>
    <button id="backward-btn" record=${id - 1}
      ><i class="fa-solid fa-backward-step"></i
    ></button>
    <button id="play-btn"><i class="fa-solid fa-play"></i></button>
    <button id="forward-btn" record=${id + 1}
      ><i class="fa-solid fa-forward-step"></i
    ></button>
    <button id="repeat-btn" isRepeat=${isRepeat}
      ><i class="fa-solid fa-arrows-rotate"></i
    ></button>
  </div>
  <input id="time-range" type="range" min="0" max="100" />
  <div class="time-info">
    <span id="current-time-info">0:00</span
    ><span id="total-time-info">0:00</span>
  </div>
</div>
<audio id="current-audio" src="./assets/musics/downtown.mp3" controls>
</audio>`;
}; */

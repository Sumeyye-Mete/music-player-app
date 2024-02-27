/* Playlist DATA */
const playlist = await fetch("/assets/data/playlist.json")
	.then((response) => response.json())
	.then((data) => {
		return data;
	});

/* ------------VARIABLES--------------- */
let isRepeat = false;
let isShuffle = false;
let currentFile = null;
let nextId = null;
let prevId = null;
let isPaused = true;

/* ------------DOM--------------- */

//parents
const cardContainer = document.getElementById("card-container");
const playlistContainer = document.getElementById("playlist-container");

//file elements
const audio = document.getElementById("current-audio");
const poster = document.getElementById("song-poster");
const songInfo = document.getElementById("song-info");
const licenseText = document.getElementsByClassName("license")[0];

//time elements
const timeInput = document.getElementById("time-range");
const currentTimeInfo = document.getElementById("current-time-info");
const totalTimeInfo = document.getElementById("total-time-info");

//buttons
const licenseButton = document.getElementById("license-btn");
const playButton = document.getElementById("play-btn");
const shuffleButton = document.getElementById("shuffle-btn");
const backwardButton = document.getElementById("backward-btn");
const forwardButton = document.getElementById("forward-btn");
const repeatButton = document.getElementById("repeat-btn");
const openListButton = document.getElementById("list-btn");
const closeListButton = document.getElementById("close-btn");

/* ------------FUNCTIONS--------------- */

const convertSecondsToMinutes = (num) => {
	const minutes = Math.floor(num / 60);
	const seconds = Math.floor(num % 60);
	if (seconds < 10) {
		return `${minutes}:0${seconds}`;
	}
	return `${minutes}:${seconds}`;
};

//changes visible card and src of audio MAIN FUNCTION
const changeTrack = (id) => {
	currentFile = playlist[id];
	//audio
	audio.setAttribute("src", `./assets/musics/${currentFile.music}`);
	//image
	poster.setAttribute("src", `./assets/images/${currentFile.image}`);
	//texts
	songInfo.innerHTML = `<h2>${currentFile.title}</h2><h4>${currentFile.artist}</h4>`;
	//info section
	licenseText.innerHTML = currentFile.desc;
	licenseText.querySelectorAll("a").forEach((item) => {
		item.setAttribute("target", "_blank");
	});
	//change color of selected list item
	const listItem = document
		.getElementById("playlist")
		.querySelector(`li[data-id="${id}"]`);
	document.querySelectorAll(`li`).forEach((item) => {
		item.classList.remove("selected");
	});
	listItem.classList.add("selected");

	// isPaused => reflects previous song's play/pause state
	// if prev song was playing play, else stop.
	if (isPaused) {
		audio.pause();
	} else {
		audio.play();
	}
};

//calculates next id, it depends on shuffle button on or off
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

//calculates prev id, it depends on shuffle button on or off
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

//fills playlist ul with playlist data items
const renderPlaylist = (item) => {
	//get ul
	const ulEl = document.getElementById("playlist");
	//create li item
	const newLi = document.createElement("li");
	newLi.className = "list-item";
	newLi.setAttribute("data-id", item.id);
	newLi.innerHTML = `<img src="./assets/images/${item.image}" alt="${item.title}" /> <div> <h3>${item.title}</h3><h5>${item.artist}</h5> </div>`;
	//li item event
	newLi.addEventListener("click", () => changeTrackFromList(item));

	//add to ul
	ulEl.appendChild(newLi);
};

const changeTrackFromList = (item) => {
	isPaused = audio.paused;
	changeTrack(item.id);
	closeListButton.click();
};

/* ------------INITIAL SETTINGS--------------- */

//fills playlist ul with playlist data items
playlist.forEach((item) => {
	renderPlaylist(item);
});

//First item is on
changeTrack(0);

/* ------------EVENTS--------------- */

playButton.addEventListener("click", () => {
	if (audio.paused) {
		audio.play();
		playButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
	} else {
		audio.pause();
		playButton.innerHTML = `<i class="fa-solid fa-play"></i>`;
	}
});

forwardButton.addEventListener("click", () => {
	calculateNextId();
	isPaused = audio.paused;
	changeTrack(nextId);
});

backwardButton.addEventListener("click", () => {
	calculatePrevId();
	isPaused = audio.paused;
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

licenseButton.addEventListener("click", () => {
	licenseText.classList.toggle("d-none");
});

openListButton.addEventListener("click", () => {
	playlistContainer.classList.add("open");
	playlistContainer.classList.remove("close");
});

closeListButton.addEventListener("click", () => {
	playlistContainer.classList.remove("open");
	playlistContainer.classList.add("close");
});

//takes input from user and changes audio current time
timeInput.addEventListener("input", () => {
	audio.currentTime = (audio.duration * timeInput.value) / 1000;
});

//changes minutes and input-range value according to audio current time update.
audio.addEventListener("timeupdate", () => {
	timeInput.value = (audio.currentTime / audio.duration) * 1000 || 0;
	currentTimeInfo.innerText = convertSecondsToMinutes(audio.currentTime);
});

//when audio is ready writes total time info
audio.oncanplay = () => {
	totalTimeInfo.innerText = convertSecondsToMinutes(audio.duration);
};

//when song is ended switches to next song
audio.onended = () => {
	calculateNextId();
	// if its not on repeat or shuffle, player stops at the beginning of playlist.
	if (nextId === 0 && !isRepeat && !isShuffle) {
		isPaused = true;
		playButton.innerHTML = `<i class="fa-solid fa-play"></i>`;
	} else {
		isPaused = false;
		playButton.innerHTML = `<i class="fa-solid fa-pause"></i>`;
	}
	changeTrack(nextId);
};

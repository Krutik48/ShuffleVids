const input = document.getElementById("fileInput");
const input2 = document.getElementById("fileInput2");
const searchInput = document.getElementById("search-input");
const dropArea = document.getElementById("drop-area");
const dark = document.getElementById("dark");
const light = document.getElementById("light");
const shuffleBtn = document.getElementById("suffleBtn");
const videoPlayerContainer = document.getElementById("video-player-container");
const playlist = document.getElementById("playlist");

var currentSpeedDisplay = document.createElement("div");
currentSpeedDisplay.id = "current-speed-display";
let timerForSpeedDisplay;

var Seekbar = document.createElement("input");
Seekbar.setAttribute("type", "range");
Seekbar.setAttribute("min", "0");
Seekbar.setAttribute("max", "200");
Seekbar.setAttribute("value", "100");
Seekbar.id = "seekbar-display"
var value = document.createElement("div");
value.id = "seek-value";

var title = document.createElement("div");
title.id = "title-display";


let mode = 1; // dark;
let speed = 1;
let brightness = 100;
let contrast = 100;
let saturation = 100;
let hueRotate = 0;
let grayscale = 0;


let videoLinks = [];
let idx =0;
let items = [];
const player = new Plyr("#videoPlayer",{
    speed : { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 4] },
    storage : { enabled: false, key: 'plyr' },
    seekTime: 10,
    tooltips:{ controls: true, seek: true }
});

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});
  
['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});


function highlight() {
    dropArea.classList.add('highlight');
}

function unhighlight() {
    dropArea.classList.remove('highlight');
}
function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}


dark.addEventListener("click",()=>{
    mode = 1;
    dark.classList.add("invisible");
    light.classList.remove("invisible");
    document.getElementById("body").classList.add("body");
    document.getElementById("drop-area").style.color = "white"
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove("light-list");
        items[i].classList.add("dark-list");
    }
})

light.addEventListener("click",()=>{
    mode = 0;
    dark.classList.remove("invisible");
    light.classList.add("invisible");
    document.getElementById("body").classList.remove("body");
    document.getElementById("drop-area").style.color = "black"
    for (let i = 0; i < items.length; i++) {
        items[i].classList.remove("dark-list");
        items[i].classList.add("light-list");
    }
})

shuffleBtn.addEventListener("click",()=>{
    shuffle();
    playlist.innerHTML = "";
    let i =1;
    videoLinks.forEach(song => { 
        const li = document.createElement("li");
        li.innerHTML = `${i}) ${song[1]}`;
        playlist.appendChild(li);
        i++;
    });
    setItemEventListner();
    idx = 0;
    playRandomVideo();
})

dropArea.addEventListener("drop", (e)=>{
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles(files);
}, false);

videoPlayerContainer.addEventListener("dragover", function(event) {
    event.preventDefault();
});
videoPlayerContainer.addEventListener("drop", (e)=>{
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    if(files.length===0){
        return;
    }
    handleFiles(files,true);
    idx = videoLinks.length-1;
    playRandomVideo();
});

input.addEventListener("change",()=>{
    handleFiles(input.files);
},false);
input2.addEventListener("change",()=>{
    handleFiles(input2.files,true);
},false);

playlist.addEventListener("dragover", function(event){
    event.preventDefault();
});
playlist.addEventListener("drop", (e)=>{
    e.preventDefault();
    e.stopPropagation();
    const files = e.dataTransfer.files;
    handleFiles(files,true);
});

function handleFiles(files,wantToAddInExisting=false) {
    try {
        document.getElementById("videoPlayer").classList.remove("invisible");
        document.getElementById("box").classList.add("invisible");
        searchInput.classList.remove("invisible");
        input2.classList.remove("invisible");
        videoPlayerContainer.classList.remove("invisible");
        shuffleBtn.classList.remove("invisible");
    } catch (error) {
        console.log(error);
    }
   
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type.startsWith("video")) {
            videoLinks.push([URL.createObjectURL(file),file.name]);
        }
    }

    if(wantToAddInExisting===false){
        shuffle();
    }
    playlist.innerHTML = "";
    let i =1;
    videoLinks.forEach(song => { 
        const li = document.createElement("li");
        li.classList.add("d-flex");
        li.classList.add("flex-row");
        li.classList.add("justify-content-between");
        li.draggable = true;
        li.id = i;
        li.innerHTML = `${i}) ${song[1]}`;
        li.addEventListener('dragstart', dragStart);
        li.addEventListener('drag', drag);
        li.addEventListener('drop', drop);
        li.addEventListener('dragover', dragOver);
        li.addEventListener('dragleave', dragLeave); 
        playlist.appendChild(li);
        i++;
    });
    setItemEventListner();
    if(wantToAddInExisting===false){
        // mobile device
        if (window.matchMedia("(max-width: 768px)").matches) {
            // player into full screen
            player.fullscreen.enter();
        }
        playRandomVideo();
    }
}

function dragStart(e) {
    this.classList.add('dragging');
    e.dataTransfer.setData("text/plain", this.id);
    e.target.style.opacity = 0.5;
}

function drag(e) {
    e.preventDefault();
}

function drop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const draggableElement = document.getElementById(id);
    const dropzone = e.target;
    const dropzoneId = dropzone.id;
    const draggableElementId = draggableElement.id;
    if (dropzoneId < draggableElementId) {
        dropzone.parentNode.insertBefore(draggableElement, dropzone.nextSibling);
    } else {
        dropzone.parentNode.insertBefore(draggableElement, dropzone);
    }
    videoLinks.splice(dropzoneId-1, 0, videoLinks.splice(draggableElementId-1, 1)[0]);
    if(idx == draggableElementId-1){
        idx = dropzoneId-1;
    }
    setItemEventListner();
}

function dragOver(e) {
    e.preventDefault();
    e.target.classList.add('dragging-over');
}

function dragLeave(e) {
    e.preventDefault();
    e.target.classList.remove('dragging-over');
}

function setItemEventListner(){
    items = playlist.getElementsByTagName("li");
    items[idx].classList.add("active");
    for (let i = 0; i < items.length; i++) {
        items[i].addEventListener("click", function() {
            for (let j = 0; j < items.length; j++) {
                items[j].classList.remove("active");
            }
            this.classList.add("active");
            idx = i;
            playRandomVideo();
        });
        if(mode ==1){
            items[i].classList.remove("light-list");
            items[i].classList.add("dark-list");
        }
        else{
            items[i].classList.remove("dark-list");
            items[i].classList.add("light-list");
        }
    }
    setFilter();
}
function shuffle() {
    for (let i = videoLinks.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [videoLinks[i], videoLinks[j]] = [videoLinks[j], videoLinks[i]];
    }
}

const videoPlayer = document.getElementById("videoPlayer");

function playRandomVideo() {
    try {
        items[0].classList.remove("active");
        items[videoLinks.length-1].classList.remove("active");
        if(idx-1>=0){
            items[idx-1].classList.remove("active");
        }
        if(idx+1<videoLinks.length){
            items[idx+1].classList.remove("active");
        }
        items[idx].classList.add("active");   
    }catch (error) {
        console.error(error);
    }
    var isPipAlready = player.pip;

    player.source={
        type: "video",
        title: "Krutik",
        sources: [
            {
                src: videoLinks[idx][0],
                // type: "video/mp4"  
            },
        ]
    };
    player.play();
    let ele = document.getElementsByClassName("plyr__menu");
    ele[0].click();
    showTitle();
    setTimeout(() => {
        if(isPipAlready){
            player.pip = 1;
        }
    }, 500);
    document.title = videoLinks[idx][1];
}



player.on("ended", ()=>{
    idx++;
    if(idx==videoLinks.length){
        items[idx-1].classList.remove("active");
        idx = 0;
    }
    playRandomVideo();
});

document.addEventListener("keydown", function(event) {
    if (event.code === "KeyN" && searchInput!==document.activeElement) {
        if(idx<videoLinks.length-1){
            idx++;
        }
        else{
            idx = 0;
        } 
        playRandomVideo();
    }
});

document.addEventListener("keydown", function(event) {
    if (event.code === "KeyP" && searchInput!==document.activeElement) {
        if(idx<=0){
            idx = videoLinks.length -1;
        } 
        else idx--;
        playRandomVideo();
    }
});

let lastTap = 0;
document.addEventListener('touchend', function (event) {
    let currentTime = new Date().getTime();
    let tapLength = currentTime - lastTap;
    if (tapLength < 500 && tapLength > 0) {
        if(event.changedTouches[0].clientX > window.innerWidth/2){
            player.forward(10);
        }
        else{
            player.rewind(10);
            
        }
    }
    lastTap = currentTime;
});




function setFilter(){
    console.log("HI");
    searchInput.addEventListener("input", function() {
        console.log("HI2");
        const searchQuery = this.value.toLowerCase();  
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            console.log(item.textContent.toLowerCase());
            if (item.textContent.toLowerCase().indexOf(searchQuery) !== -1) {
                item.style.setProperty("display","inline-block", "important")
            } else {
                item.style.setProperty("display", "none", "important");
            }
        }
    });
}

document.addEventListener('keydown', (event) => {
    if(searchInput!==document.activeElement){
        if(event.shiftKey && searchInput!==document.activeElement){
            switch (event.code) {
                case 'Digit1': // Key 1
                    brightness = Math.max(brightness - 5, 0);
                    showFilterDisplay(brightness,"Brightness");
                    break;
                case 'Digit2': // Key 2  
                    brightness = Math.min(brightness + 5, 200);
                    showFilterDisplay(brightness,"Brightness");
                    break;
                case 'Digit3': // Key 3
                    contrast = Math.max(contrast - 5, 0);
                    showFilterDisplay(contrast,"Contrast");
                    break;
                case 'Digit4': // Key 4
                    contrast = Math.min(contrast + 5, 200);
                    showFilterDisplay(contrast,"Contrast");
                    break;
                case 'Digit5': // Key 5
                    saturation = Math.max(saturation - 5, 0);
                    showFilterDisplay(saturation,"Saturation");
                    break;
                case 'Digit6': // Key 6
                    saturation = Math.min(saturation + 5, 200);
                    showFilterDisplay(saturation,"Saturation");
                    break;
                case 'Digit7': // Key 7
                    hueRotate = Math.max(hueRotate - 5, 0);
                    showFilterDisplay(hueRotate,"Hue");
                    break;
                case 'Digit8': // Key 8
                    hueRotate = Math.min(hueRotate + 5, 360);
                    showFilterDisplay(hueRotate,"Hue");
                    break;
                case 'Digit9': // Key 9
                    grayscale = Math.max(grayscale - 5, 0);
                    showFilterDisplay(grayscale,"Grayscale");
                    break;
                case 'Digit0': // Key 0
                    grayscale = Math.min(grayscale + 5, 100);
                    showFilterDisplay(grayscale,"Grayscale");
                    break;
                case 'Comma': 
                    speed = Math.max((speed-0.1),0.4)
                    speed = Math.round(speed * 100) / 100;
                    player.speed = speed
                    speedDisplay();
                    break;
                case 'Period':
                    speed+=0.1
                    speed = Math.round(speed * 100) / 100;
                    player.speed=speed; 
                    speedDisplay();
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    player.rewind(5);
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    player.forward(5);
                    break;
                default:
                    break;
            }
        }
        switch(!event.shiftKey && event.code){
            case 'Space':
                player.togglePlay();
                break;
            case 'NumpadAdd':
                speed+=0.5
                speed = Math.round(speed * 100) / 100;
                player.speed=speed; 
                speedDisplay();
                break;
            case 'NumpadSubtract':
                speed = Math.max((speed-0.5),0.4)
                speed = Math.round(speed * 100) / 100;
                player.speed = speed
                speedDisplay();
                break;
            case 'BracketLeft':
                speed = Math.max((speed-0.1),0.4)
                speed = Math.round(speed * 100) / 100;
                player.speed = speed
                speedDisplay();
                break;
            case 'BracketRight':
                speed+=0.1
                speed = Math.round(speed * 100) / 100;
                player.speed=speed;
                speedDisplay();
                break;
            case 'ArrowRight':
                player.currentTime += 10;
                break;
            case 'ArrowLeft':
                player.currentTime -= 10;
                break;
            case 'KeyM':
                player.muted = !player.muted;
                break;
            case 'KeyF': // toggle fullscreen
                player.fullscreen.toggle();
                break;
            case 'KeyI': // enable picture in picture
                player.pip = 1;
                break;
            case 'KeyL':
                player.toggleControls();
                break;
            case 'KeyR': 
                player.restart();
                break;  
            case 'KeyC':
                player.toggleCaptions();
                break;
            default:
                break;
        }
    }
    
    let videoPoster = document.getElementsByClassName("plyr__video-wrapper")[0];
    videoPoster.style.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hueRotate}deg) grayscale(${grayscale}%)`;
});


if (window.matchMedia("(max-width: 768px)").matches) {
    // videoPlayerContainer.addEventListener("touchstart", function(event) {
    //    // player toggle play
    //     if(event.touches.length === 1){
    //         player.togglePlay();
    //     }
    // });
}


function speedDisplay(){
    let videoPoster = document.getElementsByClassName("plyr__video-wrapper")[0];
    let speedElement = document.getElementById("current-speed-display")
    if(!videoPoster.contains(speedElement)){
        currentSpeedDisplay.innerHTML = speed.toFixed(2) + "x";
        videoPoster.appendChild(currentSpeedDisplay);
        speedElement = currentSpeedDisplay;
    }
    else{
        speedElement.classList.remove("invisible");
        speedElement.innerHTML =  speed.toFixed(2) + "x";
    }
    // console.log(player.speed)

    Seekbar.classList.add("invisible");
    value.classList.add("invisible");
    title.classList.add("invisible");

    clearTimeout(timerForSpeedDisplay);
    timerForSpeedDisplay = setTimeout(() => {
        currentSpeedDisplay.classList.add("invisible");

    },5000);
}

function showFilterDisplay(filterValue,filterName){
    let videoPoster = document.getElementsByClassName("plyr__video-wrapper")[0];
    let seekRangeEle = document.getElementById("seekbar-display");
    let seekValueEle = document.getElementById("seek-value");
    if(!videoPoster.contains(seekRangeEle)){
        Seekbar.setAttribute("value", filterValue);
        value.innerHTML = `${filterName}: ` + filterValue;
        videoPoster.appendChild(Seekbar);
        videoPoster.appendChild(value);
        seekRangeEle = Seekbar;
        seekValueEle = value;
    }
    else{
        seekRangeEle.classList.remove("invisible");
        seekValueEle.classList.remove("invisible");
        seekRangeEle.setAttribute("value",filterValue);
        seekValueEle.innerHTML = `${filterName}: ` + filterValue;
    }
    
    if(timerForSpeedDisplay)
    currentSpeedDisplay.classList.add("invisible");
    title.classList.add("invisible");
    
    clearTimeout(timerForSpeedDisplay);
    timerForSpeedDisplay = setTimeout(() => {
        Seekbar.classList.add("invisible");
        value.classList.add("invisible");
    },5000);   
}

function showTitle(){
    let videoPoster = document.getElementsByClassName("plyr__video-wrapper")[0];
    let titleEle = document.getElementById("title-display");
    if(!videoPoster.contains(titleEle)){
        title.innerHTML = videoLinks[idx][1];
        videoPoster.appendChild(title);
        titleEle = title;
        titleEle.classList.remove("invisible");
        titleEle.classList.remove("reverseAnimation");
    }
    else{
        titleEle.classList.remove("invisible");
        titleEle.innerHTML = videoLinks[idx][1];
    }
    clearTimeout(timerForSpeedDisplay);
    timerForSpeedDisplay = setTimeout(() => {
        titleEle.classList.add("reverseAnimation");
        setTimeout(() => {
            title.classList.add("invisible");
        }, 1000);
    },4000);
}
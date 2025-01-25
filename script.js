let folder = "music";
let folderList = [] ;
let song;
let songList;
let audio = new Audio();
let isAudioPlaying = false;




//  Function to Fetch Albums
let fetchAlbum = async () => {
    let fetchFolder = await fetch(`http://127.0.0.1:5500/Resources/Songs/`);
    let responseFolder = await fetchFolder.text();
    // console.log(responseFolder);

    let div = document.createElement('ul');
    div.innerHTML = responseFolder;


    folderList = [] ;

    Array.from(div.getElementsByTagName("li")).forEach(element => {

        let href = element.firstElementChild.getAttribute('href');
        href = decodeURI(href);
        let folder = href.split(`/`)[3];

        if (folder) {
            folderList.push(folder);
        }
    });
}




//  Function to convert the Audio time to mm:ss format.
function convertToMMSS(currentTime) {
    // Calculate minutes and seconds
    const minutes = Math.floor(currentTime / 60);
    const seconds = Math.floor(currentTime % 60);

    // Format time with leading zeros if necessary (e.g., 09:05)
    const formattedMinutes = minutes.toString().padStart(2, '0');
    const formattedSeconds = seconds.toString().padStart(2, '0');

    // Return the formatted time
    return `${formattedMinutes}:${formattedSeconds}`;
}



//  Function to set the Display song details.
let setDisplayTime = () => {
    let songDuration;
    let currentSongTime;
    let current = 0 ;

    audio.addEventListener("timeupdate", () => {
        songDuration = audio.duration ;
        currentSongTime = audio.currentTime ;


        if( !songDuration || !currentSongTime){
            songDuration = 0 ;
            currentSongTime = 0;
        }

        current = (currentSongTime/songDuration) * 100 ;
        
        currentSongTime = convertToMMSS(currentSongTime) ;
        songDuration = convertToMMSS(songDuration) ;

        document.getElementById("currentTime").innerText = currentSongTime ;
        document.getElementById("songDuration").innerText = songDuration ;
        document.querySelector(".seakbar-circle").style.left = `${current}%` ;
    });

}




let playSong = async (song) => {
    let songWillPlay = new Promise((resolve, reject)=>{
        audio.src = `http://127.0.0.1:5500/Resources/Songs/${folder}/${song}.mp3`;
        resolve(audio)
    });

    songWillPlay.then((audio)=> {
        audio.play();
        isAudioPlaying = true;
        document.querySelector(".song-details").innerHTML = song;
        document.querySelector(".playButton").src = "./Resources/icons/pause.svg";
        setDisplayTime();
    }).catch((error) => console.log(error));
}





//  Method to Continue Song if Stop.
let continueSong = () => {
    if (song) {
        audio.play();
    }
    else {
        song = songList[0];
        audio.src = `http://127.0.0.1:5500/Resources/Songs/${folder}/${song}.mp3`;
        audio.play();
        document.querySelector(".song-details").innerHTML = song;
        setDisplayTime();
    }
    isAudioPlaying = true;
    document.querySelector(".playButton").src = "./Resources/icons/pause.svg";
}




//  Method to Pause Song
let pauseSong = () => {
    audio.pause();
    isAudioPlaying = false;
    document.querySelector(".playButton").src = "./Resources/icons/play.svg";
}





//  Method to fetch Song name.
let fetchSongDetails = async (folder) => {
    let response = await fetch(`http://127.0.0.1:5500/Resources/Songs/${folder}`);
    let responseText = await response.text();

    let div = document.createElement('ul');
    div.innerHTML = responseText;

    console.log("song details");

    let songs = [];
    songList = null ;

    Array.from(div.getElementsByTagName("li")).forEach(element => {

        let href = element.firstElementChild.getAttribute('href');
        href = decodeURI(href);
        let songName = href.split(`${folder}/`)[1];

        if (songName) {
            songs.push(songName.split('.')[0]);
        }
    });

    // console.log(songs);
    songList = songs;

    //  Set all Songs on Tile View.

    document.querySelector(".popular-song-list").innerHTML = '' ;
    document.querySelector(".right-heading").innerHTML = folder ;

    songList.forEach(song => {
        let viewSongList = document.querySelector(".popular-song-list");
        let visibleTile = document.createElement("div");
        visibleTile.classList.add("tile");
        visibleTile.innerHTML = `<div class="tile">
                    <img width="80" class="playlist-logo" src="./Resources/icons/music.svg" alt="playlist logo"
                        srcset="">
                    <p class="tile-song">${song}</p>
                </div>` ;
        viewSongList.appendChild(visibleTile)
    });



     //  Event Listener to play all songs.
     Array.from(document.getElementsByClassName("tile")).forEach(tile => {
        tile.addEventListener('click', (event) => {
            console.log(tile.querySelector(".tile-song").innerHTML)
            song = tile.querySelector(".tile-song").innerHTML;
            playSong(song)
        })
    })


    return songs;
}





const main = async () => {
    let songs = await fetchSongDetails(folder);
    await fetchAlbum();
    // console.log(songs);

    folderList.forEach((folder) => {
        let ul = document.getElementById('albums') ;
        let li = document.createElement('li') ;
        li.classList.add('album-item') ;
        li.innerText = folder;
        ul.appendChild(li) ;
    });


    //  Event Listener to select Album.
    Array.from(document.getElementsByClassName("album-item")).forEach((currentAlbum) => {
        currentAlbum.addEventListener("click", (event) => {
            // console.log(event.target.innerText)
            folder = event.target.innerText ;
            fetchSongDetails(folder) ;
        });
    })

}

main();











//  Event Listener when Click Hamburger to display it.
document.querySelector(".hamburger").addEventListener('click', () => {
    console.log()
    document.querySelector(".left").style.left = "0%";
});


//  Event Listener to hide Hamburger.
document.querySelector(".close").addEventListener('click', () => {
    document.querySelector(".left").style.left = "-90%";
});


// Event Listener to Pause or Play song.
document.getElementById("playButton").addEventListener('click', (event) => {
    if (isAudioPlaying) {
        pauseSong();
    }
    else {
        continueSong();
    }
});



// Event Listener to change the song Duration.
document.querySelector(".bar").addEventListener('click', (event) => {
    if(!isAudioPlaying){
        return
    }
    const div = event.target;

    let mousePosition = event.clientX - div.getBoundingClientRect().left;
    let barLength = event.target.offsetWidth ;

    let currentCircle = (mousePosition/barLength)*100 ;
    document.querySelector(".seakbar-circle").style.left = `${currentCircle}%` ;

    audio.currentTime = (currentCircle * audio.duration)/100 ;
});



//  Event Listener to Play Next song.
document.querySelector('.nextButton').addEventListener('click', (event) => {
    let indexOfCurrentSong = songList.indexOf(song) ;
    
    if(indexOfCurrentSong+1 < songList.length){
        song = songList[indexOfCurrentSong+1] ;
        playSong(song);
    }
});



//  Event Listener to Play Previous song.
document.querySelector('.previousButton').addEventListener('click', (event) => {
    let indexOfCurrentSong = songList.indexOf(song) ;
    
    if(indexOfCurrentSong-1 >= 0){
        song = songList[indexOfCurrentSong-1] ;
        playSong(song);
    }
});
let currentsong = new Audio();
let songs;
let currfolder;
function convertSecondsToMinutes(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`;
}

async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5501/${folder}/`)
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let b = div.getElementsByTagName('a')
    songs = [];
    for (let index = 0; index < b.length; index++) {
        const element = b[index];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }

    let songUL = document.querySelector('.songsList').getElementsByTagName('ul')[0]
    songUL.innerHTML = ''
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> 
                            <div>
                            <img class='invert' src="music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll('%20', ' ')}</div>
                                <div>Kriti</div>
                            </div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img src="play.svg" alt="">
                            </div></li>`;
    }

    Array.from(document.querySelector('.songsList').getElementsByTagName('li')).forEach(e => {
        e.addEventListener('click', element => {
            playMusic(e.querySelector('.info').getElementsByTagName('div')[0].textContent.trim())
        })
    });
    return songs;
}

const playMusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentsong.play()
        play.src = 'pause.svg'
    }
    document.querySelector('.songinfo').innerHTML = decodeURI(track);
    document.querySelector('.songtime').innerHTML = '00:00/00:00'

}
async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5501/songs/`)
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let anchors = div.getElementsByTagName('a')
    let cardContainer = document.querySelector('.cardContainer')
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];



        if (e.href.includes('/songs/')) {
            let folder = e.href.split('/').slice(-1)[0]
            //get metadat of folder
            let a = await fetch(`http://127.0.0.1:5501/songs/${folder}/info.json`)
            let response = await a.json();
            cardContainer.innerHTML = cardContainer.innerHTML + `  <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                fill="#000000">
                                <path
                                    d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                    stroke="#000000" stroke-width="1.5" stroke-linejoin="round" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.png" alt="">
                        <h3>${response.title}</h3>
                        <p>${response.description}</p>
                    </div>`
        }
    }
    Array.from(document.getElementsByClassName('card')).forEach((e) => {
        e.addEventListener('click', async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        })
    })
}

async function main() {

    await getSongs('songs/ncs');
    playMusic(songs[0], true)

    displayAlbums()

    play.addEventListener('click', () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = 'pause.svg'
        }
        else {
            currentsong.pause();
            play.src = 'playbutton.svg'
        }
    })
    currentsong.addEventListener('timeupdate', () => {
        document.querySelector('.songtime').innerHTML = `${convertSecondsToMinutes(currentsong.currentTime)}/${convertSecondsToMinutes(currentsong.duration)}`
        document.querySelector('.circle').style.left = (currentsong.currentTime / currentsong.duration) * 100 + '%'
    })
    document.querySelector('.seekbar').addEventListener('click', e => {
        percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector('.circle').style.left = percent + '%';
        currentsong.currentTime = (currentsong.duration * percent) / 100
    })
    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.left').style.left = '0';
    })
    document.querySelector('.cross').addEventListener('click', () => {
        document.querySelector('.left').style.left = '-110%';
    })
    previous.addEventListener('click', () => {
        let index = songs.indexOf(currentsong.src.split('/').slice(-1)[0])
        if ((index + 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    next.addEventListener('click', () => {
        let index = songs.indexOf(currentsong.src.split('/').slice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1])
        }
    })
    document.querySelector('.range').getElementsByTagName('input')[0].addEventListener('change', (e) => {
        currentsong.volume = parseInt(e.target.value) / 100
    })
    document.querySelector('.volume> img').addEventListener('click',e=>{
        if(e.target.src.endsWith('volume.svg')){
            e.target.src=e.target.src.replace('volume.svg','mute.svg');
            currentsong.volume=0;
            document.querySelector('.range').getElementsByTagName('input')[0].value=0
        }
        else{
            e.target.src=e.target.src.replace('mute.svg','volume.svg');
            currentsong.volume=0.1;
            document.querySelector('.range').getElementsByTagName('input')[0].value=10
        }
    })

}

main()
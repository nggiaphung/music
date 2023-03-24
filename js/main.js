
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const volume = $('#volume')

const app = {
    currentIndex: 0,
    isPlaying: false,

    songs: [
                {
                    name: 'LIMBO',
                    singer: 'keshi',
                    path: './assets/music/song9.mp3',
                    image: './assets/img/img9.png',
                },
                {
                    name: 'DON\'T COI',
                    singer: 'RPT Orijinn',
                    path: './assets/music/song1.mp3',
                    image: './assets/img/img1.png',
                },
                {
                    name: 'Yêu Anh Đi Mẹ Anh Bán Bánh Mì',
                    singer: 'Phúc Du',
                    path: './assets/music/song2.mp3',
                    image: './assets/img/img2.png',
                },
                {
                    name: 'Ánh Sao Và Bầu Trời',
                    singer: 'TRI Cá',
                    path: './assets/music/song3.mp3',
                    image: './assets/img/img3.png',
                },
                {
                    name: 'Cô Đơn',
                    singer: 'Hngle',
                    path: './assets/music/song4.mp3',
                    image: './assets/img/img4.png',
                },
                {
                    name: 'QUERRY',
                    singer: 'QNT',
                    path: './assets/music/song5.mp3',
                    image: './assets/img/img5.png',
                },
                {
                    name: 'Âm Thầm Bên Em',
                    singer: 'Sơn Tùng M-TP',
                    path: './assets/music/song6.mp3',
                    image: './assets/img/img6.png',
                },
                {
                    name: 'Mùa Thu Đi Qua',
                    singer: 'Rymastic',
                    path: './assets/music/song7.mp3',
                    image: './assets/img/img7.png',
                },
                {
                    name: 'ĐỘ TỘC',
                    singer: 'ĐỘ MIXI',
                    path: './assets/music/song8.mp3',
                    image: './assets/img/img8.png',
                },
    
            ],

    render: function(){
        const htmls = this.songs.map((song,index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}"  data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },

    defineProperties: function(){
        Object.defineProperty(this, 'currentSong', {
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },

    handleEvenst: function(){
        audio.volume = 0.0
        const cdWidth = cd.offsetWidth

        // Xử lý CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000, //10 seconds
            iterations: Infinity,
        })
        cdThumbAnimate.pause()

        // Xử lý phóng to/thu nhỏ CD
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth >0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        //Xử lý khi click play
        playBtn.onclick = function(){
            if(app.isPlaying){
                audio.pause()
            }else{
                audio.play()
            }
        }

        //Khi song được Play
        audio.onplay = function(){
            app.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        //Khi song bi pause
        audio.onpause = function(){
            app.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            if(audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // Khi âm lượng bài hát thay đổi
        volume.addEventListener("input", function() {
            audio.volume = volume.value;
        });


        // Xử lý khi tua song
        progress.onchange = function(e){
            const seekTime = (audio.duration /100 * e.target.value)
            audio.currentTime = seekTime
        }

        // Xử lý khi prev song 
        prevBtn.onclick = function(){
            if(app.isRandom){
                app.playRandomSong()
            }else{
                app.prevSong()
            }
            audio.play()
            app.render()
        }

        // Xử lý khi next song
        nextBtn.onclick = function(){
            if(app.isRandom){
                app.playRandomSong()
            }else{
                app.nextSong()
            }
            audio.play()
            app.render()
            app.scrollToActiveSong()
        }

        // Xử lý khi bật/tắt random song
        randomBtn.onclick = function(e){
            app.isRandom = !app.isRandom
            app.setConfig('isRandom',app.isRandom)
            randomBtn.classList.toggle('active', app.isRandom)
        }
        
        // Xử lý lặp lại 1 song
        repeatBtn.onclick =  function(e){
            app.isRepeat = !app.isRepeat
            app.setConfig('isRepeat',app.isRepeat)
            repeatBtn.classList.toggle('active', app.isRepeat)
        }

        // Xử lý next song khi audio ended
        audio.onended = function(){
            if(app.isRepeat){
                audio.play()
            }else{
                nextBtn.click()
            }
        }

        // Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            const optionNode = e.target.closest('.option') 

            if( songNode||optionNode){
                // Xử lý khi click vào song
                if(songNode){
                    app.currentIndex = Number(songNode.dataset.index)
                    app.loadCurrentSong()
                    app.render()
                    audio.play()
                }

                // Xử lý khi click vào option
                if (optionNode){

                }
            }
        }
    },

    scrollToActiveSong: function(){
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
        },200)
    },

    loadCurrentSong: function(){
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },

    prevSong: function(){
        this.currentIndex--
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },

    nextSong: function(){
        this.currentIndex++
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    },

    playRandomSong: function(){
        let newIndex
        do{
            newIndex = Math.floor(Math.random() * this.songs.length)
        }while(newIndex === this.currentIndex)
        
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    
    start: function(){

        // Định nghĩa các thuộc tính cho object
        this.defineProperties()

        // Lắng nghe/xử lý các sự kiện (DOM events)
        this.handleEvenst()

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()

        //Render playlist
        this.render()
    }
}

app.start()
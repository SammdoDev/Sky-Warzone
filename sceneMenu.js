var sceneMenu = new Phaser.Class({
    Extends: Phaser.Scene,

    initialize: function () {
        Phaser.Scene.call(this, { key: "sceneMenu" });
    },

    init: function () { 
        // Sound state variables
        this.isSoundOn = true;
        // Initialize sound variable to avoid null reference
        this.snd_touch = null;
    },

    preload: function () {
        this.load.setBaseURL('assets/');
        this.load.image('BGPlay', 'images/BGPlay.png');
        this.load.image('Title', 'images/Title.png');
        this.load.image('ButtonPlay', 'images/ButtonPlay.png');
        this.load.image('ButtonSoundOn', 'images/ButtonSoundOn.png');
        this.load.image('ButtonSoundOff', 'images/ButtonSoundOff.png');
        this.load.image('ButtonMusicOn', 'images/ButtonMusicOn.png');
        this.load.image('ButtonMusicOff', 'images/ButtonMusicOff.png');
        this.load.audio('snd_ambience', 'audio/music_menu.mp3');
        this.load.audio('snd_touchshooter', 'audio/fx_touch.mp3');
    },

    create: function () {
        // melakukan pengisian nilai untuk variabel global
        X_POSITION = {
            'LEFT': 0,
            'CENTER': game.canvas.width / 2,
            'RIGHT': game.canvas.width,
        };
    
        Y_POSITION = {
            'TOP': 0,
            'CENTER': game.canvas.height / 2,
            'BOTTOM': game.canvas.height,
        };
    
        // membuat tampilan
        // menambahkan backdrop
        this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER, 'BGPlay');
    
        // menambahkan judul game
        var titleGame = this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER - 150, 'Title');
    
        // menambahkan tombol play
        var buttonPlay = this.add.image(X_POSITION.CENTER, Y_POSITION.CENTER + 150, 'ButtonPlay');
    
        // menjadikan tombol play bisa dikenai interaksi (klik, hover mouse)
        buttonPlay.setInteractive();
        
        //menambahkan tombol Sound ke tampilan scene menu
        var buttonSound = this.add.image(X_POSITION.RIGHT - 70, Y_POSITION.BOTTOM - 70, 'ButtonSoundOn');
        buttonSound.setInteractive();
        
        // Initialize sound effects
        this.snd_touch = this.sound.add('snd_touchshooter');
        
        // Tambahkan ambient sound
        this.ambienceSound = this.sound.add('snd_ambience', {
            volume: 0.3,
            loop: true
        });
        
        // Add background music (which was missing)
        this.bgMusic = this.sound.add('snd_ambience', {
            volume: 0.2,
            loop: true
        });
        
        // Play both music and ambience
        this.bgMusic.play();
        this.ambienceSound.play();
        
        // menambahkan deteksi input klik mouse dan pergerakan pada mouse
        this.input.on('gameobjectover', function (pointer, gameObject) {
            // melakukan cek jika game objek yang sedang terkena
            // deteksi listener 'gameobjectover' adalah buttonPlay
            if (gameObject === buttonPlay) {
                buttonPlay.setTint(0x999999);
            }
            if (gameObject === buttonSound) {
                buttonSound.setTint(0x999999);
            }
        }, this);

        this.input.on('gameobjectout', function (pointer, gameObject) {
            // melakukan cek jika game objek yang sedang terkena
            // deteksi listener 'gameobjectup' adalah buttonPlay
            if (gameObject === buttonPlay) {
                buttonPlay.setTint(0xffffff);
            }
            if (gameObject === buttonSound) {
                buttonSound.setTint(0xffffff);
            }
        }, this);

        this.input.on('gameobjectup', function (pointer, gameObject) {
            if (gameObject === buttonPlay) {
                buttonPlay.setTint(0xffffff);
                //memainkan sound efek 'touch' setiap kali
                //tombol play yang di-klik, dilepas kliknya
                this.snd_touch.play();
                // FIXED: memanggil scene pilih hero terlebih dahulu, bukan langsung ke play
                this.scene.start('scenePilihHero');
            }
            if (gameObject === buttonSound) {
                buttonSound.setTint(0xffffff);
                // Toggle sound on/off
                this.toggleSound(buttonSound);
            }
        }, this);

        this.input.on('gameobjectdown', function(pointer, gameObject){
            if(gameObject === buttonSound){
                buttonSound.setTint(0x999999);
            }
        }, this);
    },
    
    toggleSound: function(buttonSound) {
        this.isSoundOn = !this.isSoundOn;
        
        if (this.isSoundOn) {
            // Sound ON
            buttonSound.setTexture('ButtonSoundOn');
            // Enable all sounds
            this.sound.mute = false;
            // Resume ambient if it was paused
            if (!this.ambienceSound.isPlaying) {
                this.ambienceSound.resume();
            }
            // Resume background music if it was paused
            if (!this.bgMusic.isPlaying) {
                this.bgMusic.resume();
            }
        } else {
            // Sound OFF
            buttonSound.setTexture('ButtonSoundOff');
            // Disable all sounds
            this.sound.mute = true;
        }
    },
    
    update: function () {
        // No need for the check since we initialize snd_touch in create()
    }
});
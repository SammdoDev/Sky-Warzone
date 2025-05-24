var scenePlay = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function () {
    Phaser.Scene.call(this, { key: "scenePlay" });
  },

  init: function () {},
  preload: function () {
    this.load.setBaseURL("assets/");

    this.load.image("BG1", "images/BG1.png");
    this.load.image("BG2", "images/BG2.png");
    this.load.image("BG3", "images/BG3.png");
    this.load.image("GroundTransisi", "images/Transisi.png");
    this.load.image("Pesawat1", "images/Pesawat1.png");
    this.load.image("Pesawat2", "images/Pesawat2.png");
    this.load.image("Peluru", "images/Peluru.png");
    this.load.image("EfekLedakan", "images/EfekLedakan.png");
    this.load.image("cloud", "images/cloud.png");
    this.load.image("Musuh1", "images/Musuh1.png");
    this.load.image("Musuh2", "images/Musuh2.png");
    this.load.image("Musuh3", "images/Musuh3.png");
    this.load.image("MusuhBos", "images/MusuhBos.png");
    this.load.audio("snd_shoot", "audio/fx_shoot.mp3");
    this.load.audio("snd_explode", "audio/fx_explode.mp3");
    this.load.audio("snd_play", "audio/music_play.mp3");
  },
  create: function () {
    // menentukan index atau tekstur/gambar
    // background secara acak dari 1 sampai 3
    this.lastBgIndex = Phaser.Math.Between(1, 3);

    // membuat penampung data ukuran gambar
    // background pada lapisan paling bawah sendiri
    this.bgBottomSize = { width: 768, height: 1664 };

    // array untuk menampung semua background lapisan bawah
    this.arrBgBottom = [];

    // fungsi dengan parameter posisi x dan posisi y untuk
    // membuat background pada lapisan paling bawah sendiri
    this.createBgBottom = function (xPos, yPos) {
      let bgBottom = this.add.image(xPos, yPos, "BG" + this.lastBgIndex);
      bgBottom.setData("kecepatan", 3);
      bgBottom.setDepth(1);
      bgBottom.flipX = Phaser.Math.Between(0, 1) === 1;
      this.arrBgBottom.push(bgBottom);

      // menambahkan background transisi di posisi paling atas background apabila
      // index/urutan tekstur background sebelumnya berbeda dengan background baru
      let newBgIndex = Phaser.Math.Between(1, 3);
      if (newBgIndex !== this.lastBgIndex) {
        let bgBottomAdditon = this.add.image(
          xPos,
          yPos - this.bgBottomSize.height / 2,
          "GroundTransisi"
        );
        bgBottomAdditon.setData("kecepatan", 3);
        bgBottomAdditon.setData("tambahan", true);
        bgBottomAdditon.setDepth(2);
        bgBottomAdditon.flipX = Phaser.Math.Between(0, 1) === 1;
        this.arrBgBottom.push(bgBottomAdditon);
      }

      // menampung index/urutan tekstur background yang baru saja dibuat
      // untuk dibandingkan pada penambahan background berikutnya
      this.lastBgIndex = newBgIndex;
    };

    // fungsi untuk menentukan posisi dari background paling bawah sendiri,
    // jadi untuk membuat background baru tinggal memanggil fungsi ini
    this.addBGBottom = function () {
      if (this.arrBgBottom.length > 0) {
        let lastBG = this.arrBgBottom[this.arrBgBottom.length - 1];
        if (lastBG.getData("tambahan")) {
          lastBG = this.arrBgBottom[this.arrBgBottom.length - 2];
        }
        this.createBgBottom(
          game.canvas.width / 2,
          lastBG.y - this.bgBottomSize.height / 2
        );
      } else {
        this.createBgBottom(
          game.canvas.width / 2,
          game.canvas.height + this.bgBottomSize.height / 2
        );
      }
    };

    // membuat 3 background pada lapisan paling bawah sendiri
    // dengan cukup memanggil fungsi 'addBGBottom' sebanyak 3 kali
    this.addBGBottom();
    this.addBGBottom();
    this.addBGBottom();

    // membuat background pada lapisan bagian atas
    // membuat penampung data ukuran gambar awan
    this.bgCloudSize = { width: 768, height: 1962 };

    // array untuk menampung semua background lapisan atas
    this.arrBgTop = [];

    // fungsi dengan parameter posisi x dan posisi y untuk membuat
    // background pada lapisan atas sendiri, yakni awan
    this.createBgTop = function (xPos, yPos) {
      var bgTop = this.add.image(xPos, yPos, "cloud");
      bgTop.setData("kecepatan", 6);
      bgTop.setDepth(5);
      bgTop.flipX = Phaser.Math.Between(0, 1) === 1;
      bgTop.setAlpha(Phaser.Math.Between(4, 7) / 10);
      this.arrBgTop.push(bgTop);
    };

    // fungsi untuk menentukan posisi dari background paling atas sendiri,
    // jadi untuk membuat background paling atas baru, tinggal panggil fungsi ini
    this.addBGTop = function () {
      if (this.arrBgTop.length > 0) {
        let lastBG = this.arrBgTop[this.arrBgTop.length - 1];
        this.createBgTop(
          game.canvas.width / 2,
          lastBG.y - this.bgCloudSize.height * Phaser.Math.Between(1, 4)
        );
      } else {
        this.createBgTop(game.canvas.width / 2, -this.bgCloudSize.height);
      }
    };

    // membuat 1 background pada lapisan paling atas
    // dengan cukup memanggil fungsi 'addBGTop' sebanyak 1 kali
    this.addBGTop();

    // membuat tampilan skor
    this.scoreLabel = this.add.text(
      X_POSITION.CENTER,
      Y_POSITION.TOP + 80,
      "0",
      {
        // menentukan jenis font yang akan ditampilkan
        fontFamily: "Verdana, Arial",
        // menentukan ukuran teks
        fontSize: "40px",
        // menentukan warna teks
        color: "#ffffff",
        // menentukan warna dari garis tepi teks
        stroke: "#5c5c5c",
        // menentukan ketebalan dari garis tepi teks
        strokeThickness: 2,
      }
    );

    // menentukan titik tumpu dari teks (0.5 berarti di tengah)
    this.scoreLabel.setOrigin(0.5);
    // mengatur posisi di lapisan ke berapa akan tampil
    this.scoreLabel.setDepth(100);

    // menambahkan pesawat hero ke dalam game
    // FIXED: Menggunakan currentHero untuk memilih pesawat yang dipilih
    this.heroShip = this.add.image(
      X_POSITION.CENTER,
      Y_POSITION.BOTTOM - 200,
      "Pesawat" + (currentHero + 1)
    );
    this.heroShip.setDepth(4);
    this.heroShip.setScale(0.35);

    // menyiapkan pendeteksi event untuk tombol arah keyboard
    this.cursorKeyListener = this.input.keyboard.createCursorKeys();

    // mengaktifkan deteksi pergerakan mouse atau touch pada layar
    this.input.on(
      "pointermove",
      function (pointer, currentlyOver) {
        // kode program ketika terdeteksi pergerakan mouse atau touch pada layar
        console.log(pointer);
        console.log("pointer.x: " + pointer.x + " pointer.y: " + pointer.y);
        // membuat variabel penampung posisi baru yang akan dituju oleh pesawat hero
        // sekaligus mengisi nilai tiap variabel dengan posisi hero terkahir
        let movementX = this.heroShip.x;
        let movementY = this.heroShip.y;
        // melakukan pengecekan pergerakan mouse pointer untuk menentukan gerak
        // pesawat hero secara vertikal supaya tetap berada di dalam area layar
        if (pointer.x > 70 && pointer.x < X_POSITION.RIGHT - 70) {
          movementX = pointer.x;
        } else {
          if (pointer.x <= 70) {
            movementX = 70;
          } else {
            movementX = X_POSITION.RIGHT - 70;
          }
        }
        // melakukan pengecekan pergerakan mouse pointer untuk menentukan gerak
        // pesawat hero secara horizontal supaya tetap berada di dalam area layar
        if (pointer.y > 70 && pointer.y < Y_POSITION.BOTTOM - 70) {
          movementY = pointer.y;
        } else {
          if (pointer.y <= 70) {
            movementY = 70;
          } else {
            movementY = Y_POSITION.BOTTOM - 70;
          }
        }

        // memindahkan posisi pesawat hero menuju posisi baru
        // yang sudah ditentukan di dalam pengecekan
        this.heroShip.x = movementX;
        this.heroShip.y = movementY;

        // menentukan jarak antara titik hero dengan titik tujuan gerak
        let a = this.heroShip.x - movementX;
        let b = this.heroShip.y - movementY;
        // menentukan durasi meluncur berdasarkan jarak yang sudah didapat
        let durationToMove = Math.sqrt(a * a + b * b) * 0.8;
        // animasi meluncur ke titik koordinat posisi pointer
        this.tweens.add({
          targets: this.heroShip,
          x: movementX,
          y: movementY,
          duration: durationToMove,
        });
      },
      this
    );

    // menambahkan beberapa titik posisi untuk membuat pola kiri A
    let pointA = [];
    pointA.push(new Phaser.Math.Vector2(-200, 100));
    pointA.push(new Phaser.Math.Vector2(250, 200));
    pointA.push(new Phaser.Math.Vector2(200, (Y_POSITION.BOTTOM + 200) / 2));
    pointA.push(new Phaser.Math.Vector2(200, Y_POSITION.BOTTOM + 200));

    // menambahkan beberapa titik posisi untuk membuat pola kanan A
    let pointB = [];
    pointB.push(new Phaser.Math.Vector2(900, 100));
    pointB.push(new Phaser.Math.Vector2(550, 200));
    pointB.push(new Phaser.Math.Vector2(500, (Y_POSITION.BOTTOM + 200) / 2));
    pointB.push(new Phaser.Math.Vector2(500, Y_POSITION.BOTTOM + 200));

    // menambahkan beberapa titik posisi untuk membuat pola kanan B
    let pointC = [];
    pointC.push(new Phaser.Math.Vector2(900, 100));
    pointC.push(new Phaser.Math.Vector2(550, 200));
    pointC.push(new Phaser.Math.Vector2(400, (Y_POSITION.BOTTOM + 200) / 2));
    pointC.push(new Phaser.Math.Vector2(0, Y_POSITION.BOTTOM + 200));

    // menambahkan beberapa titik posisi untuk membuat pola kiri B
    let pointD = [];
    pointD.push(new Phaser.Math.Vector2(-200, 100));
    pointD.push(new Phaser.Math.Vector2(550, 200));
    pointD.push(new Phaser.Math.Vector2(650, (Y_POSITION.BOTTOM + 200) / 2));
    pointD.push(new Phaser.Math.Vector2(0, Y_POSITION.BOTTOM + 200));

    // menampung pola-pola yang sudah ditambahkan
    // ke dalam sebuah array bernama 'points'
    var points = [];
    points.push(pointA);
    points.push(pointB);
    points.push(pointC);
    points.push(pointD);

    // menambahkan sebuah variabel array dengan nama 'arrEnemy' untuk
    // yang nantinya akan digunakan untuk menampung musuh-musuh
    // yang sudah ditambahkan ke dalam game
    this.arrEnemies = [];

    // membuat sebuah class dengan nama Enemy yang nantinya akan
    // digunakan berulang-ulang untuk membuat objek musuh.
    var Enemy = new Phaser.Class({
      Extends: Phaser.GameObjects.Image,

      initialize:
        // fungsi utama di dalam class 'Enemy' yang digunakan untuk
        // membuat dan menambahkan sprite musuh ke dalam game.
        // terdapat parameter 'scene' dan 'idxPath' yang digunakan
        // untuk menentukan parent dan urutan pola pergerakan dari musuh
        function Enemy(scene, idxPath) {
          // menambahkan objek baru dengan class 'Enemy' ke dalam game
          Phaser.GameObjects.Image.call(this, scene);
          // mengatur tampilan/tekstur dari objek musuh
          // secara acak berdasarkan aset yang sudah
          // disiapkan (3 gambar musuh, yakni Musuh1, Musuh2 dan Musuh3)
          this.setTexture("Musuh" + Phaser.Math.Between(1, 3));
          // mengatur urutan tampilan objek musuh berada di lapisan ke berapa
          this.setDepth(4);
          // mengatur ukuran dari musuh yang ditampilkan di game
          this.setScale(0.35);
          this.curve = new Phaser.Curves.Spline(points[idxPath]);

          // membuat musuh bergerak sesuai dengan pola atau path
          // 'sesuai idxPath' yang disertakan dalam parameter
          // selama 3 detik
          let lastEnemyCreated = this;
          this.path = { t: 0, vec: new Phaser.Math.Vector2() };
          scene.tweens.add({
            targets: this.path,
            t: 1,
            duration: 3000,
            onComplete: function () {
              if (lastEnemyCreated) {
                lastEnemyCreated.setActive(false);
              }
            },
          });
        },

      // membuat fungsi biasa di dalam class 'Enemy' dengan nama 'move'
      // yang nantinya digunakan untuk menggerakkan musuh
      move: function () {
        this.curve.getPoint(this.path.t, this.path.vec);
        this.x = this.path.vec.x;
        this.y = this.path.vec.y;
      },
    });

    // menambahkan fungsi yang akan terpanggil setiap 1/4 detik sekali (250 mili detik)
    this.time.addEvent({
      delay: 250,
      callback: function () {
        // setiap kode program yang ada di dalam sini
        // akan terpanggil setiap 1/4 detik
        // melakukan pengecekan jika jumlah musuh yang tampil masih di bawah 3
        if (this.arrEnemies.length < 3) {
          // menambahkan musuh sekaligus menampung musuh baru ke dalam array 'arrMusuh'
          // berdasarkan class template dengan nama 'Enemy' yang sudah dibuat sebelumnya
          let enemy = new Enemy(
            this,
            Phaser.Math.Between(0, points.length - 1)
          );
          this.arrEnemies.push(enemy);
          this.children.add(enemy);
        }
      },
      callbackScope: this,
      loop: true,
    });

    // membuat sebuah class dengan nama Bullet yang nantinya
    // akan digunakan berulang-ulang untuk membuat objek peluru
    var Bullet = new Phaser.Class({
      Extends: Phaser.GameObjects.Image,

      initialize:
        // fungsi utama untuk membuat objek peluru ketika class dipanggil
        function Bullet(scene, x, y) {
          Phaser.GameObjects.Image.call(this, scene, 0, 0, "Peluru");
          this.setDepth(3);
          this.setPosition(x, y);
          this.setScale(0.5);
          // menentukan kecepatan pergerakan dari peluru yang ditampung
          // di dalam class, yakni 20000 piksel tiap detik
          this.speed = Phaser.Math.GetSpeed(20000, 1);
        },
      // fungsi tambahan dengan nama 'move' yang nantinya
      // akan digunakan untuk menggerakkan peluru
      move: function () {
        // memindahkan posisi 'y' peluru untuk
        // membuat peluru dapat bergerak naik
        this.y -= this.speed;
        // melakukan pengecekan batas untuk
        // bergerak paling atas untuk peluru
        if (this.y < -50) {
          // mengganti status dari objek peluru menjadi
          // tidak aktif (hanya menandai saja)
          this.setActive(false);
        }
      },
    });

    // menambahkan sebuah variabel array dengan nama 'arrMusuh' untuk
    // yang nantinya akan digunakan untuk menampung musuh-musuh yang
    // sudah ditambahkan ke dalam game
    this.arrBullets = [];

    // menambahkan fungsi yang akan terpanggil setiap 1/4 detik sekali (250 mili detik)
    this.time.addEvent({
      delay: 250,
      callback: function () {
        // setiap kode program yang ada di dalam sini
        // akan terpanggil setiap 1/4 detik

        // menambahkan peluru sekaligus menampung peluru yang ditambahkan ke dalam array
        // 'arrBullets' class template dengan nama 'Bullet' yang sudah dibuat sebelumnya
        let bullet = new Bullet(this, this.heroShip.x, this.heroShip.y - 30);
        this.arrBullets.push(bullet);
        this.children.add(bullet);

        //memainkan sound efek tembakan setiap 1/4 detik sekali
        //berbarengan dengan munculnya peluru dari pesawat hero
        this.snd_shoot.play();

        // melakukan pengecekan jika jumlah musuh yang tampil masih di bawah 3
      },
      callbackScope: this,
      loop: true,
    });

    // membuat variabel penampung skor
    // menambahkan nilai 0 sebagai nilai awal pengisi variabel skor
    this.scoreValue = 0;

    // membuat tampilan skor

    // membuat objek partikel berdasarkan aset gambar yang sudah ada
    // kemudian menampungnya di dalam variabel 'partikelExplode'
    let partikelExplode = this.add.particles("EfekLedakan");
    // membuat partikel menjadi berada di urutan
    // lapisan yang berada di atasnya pesawat hero maupun musuh
    partikelExplode.setDepth(4);
    //sound efek

    //menambahkan variabel sound efek menembak
    this.snd_shoot = this.sound.add("snd_shoot");
    //menambahkan variabel sound efek meledak
    this.snd_explode = this.sound.add("snd_explode");

    // Tambahkan background music
    this.bgMusic = this.sound.add("snd_play", {
      volume: 0.5,
      loop: true,
    });
    this.bgMusic.play();
  },
  update: function () {
    // mengakses array BG Bottom untuk digerakkan dan dihapus jika sudah tidak terlihat
    for (let i = 0; i < this.arrBgBottom.length; i++) {
      this.arrBgBottom[i].y += this.arrBgBottom[i].getData("kecepatan");
      if (
        this.arrBgBottom[i].y >
        game.canvas.height + this.bgBottomSize.height / 2
      ) {
        this.addBGBottom();
        this.arrBgBottom[i].destroy();
        this.arrBgBottom.splice(i, 1);
        break;
      }
    }
    // mengakses array BG Top untuk digerakkan dan dihapus jika sudah tidak terlihat
    for (let i = 0; i < this.arrBgTop.length; i++) {
      this.arrBgTop[i].y += this.arrBgTop[i].getData("kecepatan");
      if (
        this.arrBgTop[i].y >
        game.canvas.height + this.bgCloudSize.height / 2
      ) {
        this.arrBgTop[i].destroy();
        this.arrBgTop.splice(i, 1);
        this.addBGTop();
        break;
      }
    }
    // melakukan pengecekan tombol arah pada keyboard yang sedang ditekan

    // melakukan pengecekan apabila tombol keyboard arah 'KIRI' sedang ditekan
    // dan apabila nilai pada posisi 'x' pesawat hero lebih dari 70
    if (this.cursorKeyListener.left.isDown && this.heroShip.x > 70) {
      // menggerakkan pesawat ke kiri sejauh 7 piksel
      this.heroShip.x -= 7;
    }

    // melakukan pengecekan apabila tombol keyboard arah 'KANAN' sedang ditekan
    // dan apabila nilai pada posisi 'x' pesawat hero kurang dari lebar layar dikurangi 70
    if (
      this.cursorKeyListener.right.isDown &&
      this.heroShip.x < X_POSITION.RIGHT - 70
    ) {
      // menggerakkan pesawat ke kanan sejauh 7 piksel
      this.heroShip.x += 7;
    }

    // melakukan pengecekan apabila tombol keyboard arah 'ATAS' sedang ditekan
    // dan apabila nilai pada posisi 'y' pesawat hero lebih dari 70
    if (this.cursorKeyListener.up.isDown && this.heroShip.y > 70) {
      // menggerakkan pesawat naik sejauh 7 piksel
      this.heroShip.y -= 7;
    }

    // melakukan pengecekan apabila tombol keyboard arah 'BAWAH' sedang ditekan
    // dan apabila nilai pada posisi 'y' pesawat hero kurang dari tinggi layar dikurangi 70
    if (
      this.cursorKeyListener.down.isDown &&
      this.heroShip.y < Y_POSITION.BOTTOM - 70
    ) {
      // menggerakkan pesawat turun sejauh 7 piksel
      this.heroShip.y += 7;
    }

    // membuat musuh selalu bergerak dengan
    // mengakses fungsi 'move' lalu memanggilnya
    for (let i = 0; i < this.arrEnemies.length; i++) {
      this.arrEnemies[i].move();
    }

    // manajemen memori supaya semakin lama tidak semakin berat
    // menghapus jika musuh sudah tidak active lagi
    for (let i = 0; i < this.arrEnemies.length; i++) {
      if (!this.arrEnemies[i].active) {
        this.arrEnemies[i].destroy();
        this.arrEnemies.splice(i, 1);
        break;
      }
    }

    // membuat peluru selalu bergerak
    for (let i = 0; i < this.arrBullets.length; i++) {
      this.arrBullets[i].move();
    }

    // manajemen memori supaya semakin lama, game tidak semakin berat
    // dengan cara menghapus peluru dari scene jika sudah tidak active lagi
    for (let i = 0; i < this.arrBullets.length; i++) {
      // melakukan cek apabila kondisi peluru
      // sedang aktif atau tidak
      if (!this.arrBullets[i].active) {
        // menghapus objek peluru dari memori dan scene
        this.arrBullets[i].destroy();
        // menghapus tampungan peluru yang dihapus
        this.arrBullets.splice(i, 1);
        break;
      }
    }

    // mendeteksi ketika peluru hero terkena musuh
    // mengakses array penampung pesawat musuh dengan perulangan for
    for (let i = 0; i < this.arrEnemies.length; i++) {
      // mengakses array penampung peluru pesawat hero dengan perulangan for
      for (let j = 0; j < this.arrBullets.length; j++) {
        // melakukan cek apakah terdapat peluru di area badan pesawat musuh
        if (
          this.arrEnemies[i]
            .getBounds()
            .contains(this.arrBullets[j].x, this.arrBullets[j].y)
        ) {
          // mengubah status dari musuh menjadi tidak aktif
          this.arrEnemies[i].setActive(false);
          // mengubah status dari peluru menjadi tidak aktif
          this.arrBullets[j].setActive(false);
          // menghentikan perulangan untuk mengakses array penampung peluru
          // menambahkan nilai ke dalam variabel penampung skor sebanyak 1
          this.scoreValue++;
          // menampilkan jumlah skor yang sudah ditampung dengan
          // menggunakan objek teks bernama scoreLabel
          this.scoreLabel.setText(this.scoreValue);
          //memainkan sound efek ledakan setiap kali
          //terdeteksi peluru bertabrakan dengan pesawat musuh
          this.snd_explode.play();
          break;
        }
      }
    }

    // Deteksi tabrakan antara hero dan musuh
    for (let i = 0; i < this.arrEnemies.length; i++) {
      let enemy = this.arrEnemies[i];
      if (enemy.active) {
        // Deteksi tabrakan dengan hero
        if (
          Phaser.Geom.Intersects.RectangleToRectangle(
            this.heroShip.getBounds(),
            enemy.getBounds()
          )
        ) {
          this.heroShip.setActive(false);
          this.heroShip.setVisible(false);

          // Stop background music when game over
          if (this.bgMusic) {
            this.bgMusic.stop();
          }

          // Kirim score ke scene gameOver dengan benar
          this.scene.start("sceneGameOver", { score: this.scoreValue });
          break;
        }
      }
    }
  },
});
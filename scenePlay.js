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
    // ========== BACKGROUND BOTTOM CONFIGURATION ==========
    this.bgBottomConfig = {
      width: 768,
      height: 1664,
      speed: 3,
      overlap: 50, // Overlap untuk seamless transition
    };

    this.arrBgBottom = [];
    this.lastBgIndex = Phaser.Math.Between(1, 3);

    // ========== BACKGROUND BOTTOM FUNCTIONS ==========
    this.createBgBottom = function (xPos, yPos, forceIndex = null) {
      let bgIndex = forceIndex || Phaser.Math.Between(1, 3);
      let bgBottom = this.add.image(xPos, yPos, "BG" + bgIndex);

      bgBottom.setData("kecepatan", this.bgBottomConfig.speed);
      bgBottom.setData("bgIndex", bgIndex);
      bgBottom.setData("isTransition", false);
      bgBottom.setDepth(1);
      bgBottom.flipX = Phaser.Math.Between(0, 1) === 1;

      this.arrBgBottom.push(bgBottom);

      // Tambahkan transisi jika index berbeda dari sebelumnya
      if (this.arrBgBottom.length > 1 && bgIndex !== this.lastBgIndex) {
        let transition = this.add.image(
          xPos,
          yPos - this.bgBottomConfig.height / 2 + this.bgBottomConfig.overlap,
          "GroundTransisi"
        );
        transition.setData("kecepatan", this.bgBottomConfig.speed);
        transition.setData("isTransition", true);
        transition.setData("bgIndex", bgIndex);
        transition.setDepth(2);
        transition.flipX = Phaser.Math.Between(0, 1) === 1;
        this.arrBgBottom.push(transition);
      }

      this.lastBgIndex = bgIndex;
      return bgBottom;
    };

    this.addBGBottom = function () {
      let newY;

      if (this.arrBgBottom.length === 0) {
        // Background pertama - mulai dari bawah layar
        newY = game.canvas.height + this.bgBottomConfig.height / 2;
      } else {
        // Cari background terakhir yang bukan transisi
        let lastMainBg = null;
        for (let i = this.arrBgBottom.length - 1; i >= 0; i--) {
          if (!this.arrBgBottom[i].getData("isTransition")) {
            lastMainBg = this.arrBgBottom[i];
            break;
          }
        }

        if (lastMainBg) {
          // Posisikan background baru dengan overlap
          newY = lastMainBg.y - this.bgBottomConfig.height + this.bgBottomConfig.overlap;
        } else {
          // Fallback jika tidak ada background utama
          newY = -this.bgBottomConfig.height / 2;
        }
      }

      this.createBgBottom(game.canvas.width / 2, newY);
    };

    // ========== CLOUD BACKGROUND CONFIGURATION ==========
    this.bgCloudConfig = {
      width: 768,
      height: 1962,
      speed: 6,
      minSpacing: 400,
      maxSpacing: 1000,
    };

    this.arrBgTop = [];

    // ========== CLOUD BACKGROUND FUNCTIONS ==========
    this.createBgTop = function (xPos, yPos) {
      let bgTop = this.add.image(xPos, yPos, "cloud");
      bgTop.setData("kecepatan", this.bgCloudConfig.speed);
      bgTop.setDepth(5);
      bgTop.flipX = Phaser.Math.Between(0, 1) === 1;
      bgTop.setAlpha(Phaser.Math.Between(2, 4) / 10);
      this.arrBgTop.push(bgTop);
      return bgTop;
    };

    this.addBGTop = function () {
      let newY;

      if (this.arrBgTop.length === 0) {
        // Cloud pertama
        newY = -this.bgCloudConfig.height / 2;
      } else {
        // Cari cloud terakhir
        let lastCloud = this.arrBgTop[this.arrBgTop.length - 1];
        let spacing = Phaser.Math.Between(
          this.bgCloudConfig.minSpacing,
          this.bgCloudConfig.maxSpacing
        );
        newY = lastCloud.y - spacing;
      }

      this.createBgTop(game.canvas.width / 2, newY);
    };

    // ========== INITIALIZATION ==========
    // Buat background bottom awal (cukup untuk memenuhi layar + buffer)
    for (let i = 0; i < 4; i++) {
      this.addBGBottom();
    }

    // Buat cloud awal
    for (let i = 0; i < 3; i++) {
      this.addBGTop();
    }

    // ========== SCORE DISPLAY ==========
    this.scoreLabel = this.add.text(
      X_POSITION.CENTER,
      Y_POSITION.TOP + 80,
      "0",
      {
        fontFamily: "Verdana, Arial",
        fontSize: "40px",
        color: "#ffffff",
        stroke: "#5c5c5c",
        strokeThickness: 2,
      }
    );
    this.scoreLabel.setOrigin(0.5);
    this.scoreLabel.setDepth(100);

    // ========== HERO SHIP ==========
    this.heroShip = this.add.image(
      X_POSITION.CENTER,
      Y_POSITION.BOTTOM - 200,
      "Pesawat" + (currentHero + 1)
    );
    this.heroShip.setDepth(4);
    this.heroShip.setScale(0.35);

    // ========== INPUT CONTROLS ==========
    this.cursorKeyListener = this.input.keyboard.createCursorKeys();

    // Mouse/Touch Input
    this.input.on(
      "pointermove",
      function (pointer, currentlyOver) {
        let movementX = this.heroShip.x;
        let movementY = this.heroShip.y;

        // Horizontal movement with boundaries
        if (pointer.x > 70 && pointer.x < X_POSITION.RIGHT - 70) {
          movementX = pointer.x;
        } else {
          if (pointer.x <= 70) {
            movementX = 70;
          } else {
            movementX = X_POSITION.RIGHT - 70;
          }
        }

        // Vertical movement with boundaries
        if (pointer.y > 70 && pointer.y < Y_POSITION.BOTTOM - 70) {
          movementY = pointer.y;
        } else {
          if (pointer.y <= 70) {
            movementY = 70;
          } else {
            movementY = Y_POSITION.BOTTOM - 70;
          }
        }

        // Calculate smooth movement
        let a = this.heroShip.x - movementX;
        let b = this.heroShip.y - movementY;
        let durationToMove = Math.sqrt(a * a + b * b) * 0.8;

        this.tweens.add({
          targets: this.heroShip,
          x: movementX,
          y: movementY,
          duration: durationToMove,
        });
      },
      this
    );

    // ========== ENEMY MOVEMENT PATTERNS ==========
    let pointA = [];
    pointA.push(new Phaser.Math.Vector2(-200, 100));
    pointA.push(new Phaser.Math.Vector2(250, 200));
    pointA.push(new Phaser.Math.Vector2(200, (Y_POSITION.BOTTOM + 200) / 2));
    pointA.push(new Phaser.Math.Vector2(200, Y_POSITION.BOTTOM + 200));

    let pointB = [];
    pointB.push(new Phaser.Math.Vector2(900, 100));
    pointB.push(new Phaser.Math.Vector2(550, 200));
    pointB.push(new Phaser.Math.Vector2(500, (Y_POSITION.BOTTOM + 200) / 2));
    pointB.push(new Phaser.Math.Vector2(500, Y_POSITION.BOTTOM + 200));

    let pointC = [];
    pointC.push(new Phaser.Math.Vector2(900, 100));
    pointC.push(new Phaser.Math.Vector2(550, 200));
    pointC.push(new Phaser.Math.Vector2(400, (Y_POSITION.BOTTOM + 200) / 2));
    pointC.push(new Phaser.Math.Vector2(0, Y_POSITION.BOTTOM + 200));

    let pointD = [];
    pointD.push(new Phaser.Math.Vector2(-200, 100));
    pointD.push(new Phaser.Math.Vector2(550, 200));
    pointD.push(new Phaser.Math.Vector2(650, (Y_POSITION.BOTTOM + 200) / 2));
    pointD.push(new Phaser.Math.Vector2(0, Y_POSITION.BOTTOM + 200));

    var points = [];
    points.push(pointA);
    points.push(pointB);
    points.push(pointC);
    points.push(pointD);

    // ========== ENEMY CLASS ==========
    this.arrEnemies = [];

    var Enemy = new Phaser.Class({
      Extends: Phaser.GameObjects.Image,

      initialize: function Enemy(scene, idxPath) {
        Phaser.GameObjects.Image.call(this, scene);
        this.setTexture("Musuh" + Phaser.Math.Between(1, 3));
        this.setDepth(4);
        this.setScale(0.35);
        this.curve = new Phaser.Curves.Spline(points[idxPath]);

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

      move: function () {
        this.curve.getPoint(this.path.t, this.path.vec);
        this.x = this.path.vec.x;
        this.y = this.path.vec.y;
      },
    });

    // Enemy spawning
    this.time.addEvent({
      delay: 250,
      callback: function () {
        if (this.arrEnemies.length < 3) {
          let enemy = new Enemy(this, Phaser.Math.Between(0, points.length - 1));
          this.arrEnemies.push(enemy);
          this.children.add(enemy);
        }
      },
      callbackScope: this,
      loop: true,
    });

    // ========== BULLET CLASS ==========
    this.arrBullets = [];

    var Bullet = new Phaser.Class({
      Extends: Phaser.GameObjects.Image,

      initialize: function Bullet(scene, x, y) {
        Phaser.GameObjects.Image.call(this, scene, 0, 0, "Peluru");
        this.setDepth(3);
        this.setPosition(x, y);
        this.setScale(0.5);
        this.speed = Phaser.Math.GetSpeed(20000, 1);
      },

      move: function () {
        this.y -= this.speed;
        if (this.y < -50) {
          this.setActive(false);
        }
      },
    });

    // Bullet spawning
    this.time.addEvent({
      delay: 250,
      callback: function () {
        let bullet = new Bullet(this, this.heroShip.x, this.heroShip.y - 30);
        this.arrBullets.push(bullet);
        this.children.add(bullet);
        this.snd_shoot.play();
      },
      callbackScope: this,
      loop: true,
    });

    // ========== SCORE SYSTEM ==========
    this.scoreValue = 0;

    // ========== PARTICLE EFFECTS ==========
    let partikelExplode = this.add.particles("EfekLedakan");
    partikelExplode.setDepth(4);

    // ========== AUDIO ==========
    this.snd_shoot = this.sound.add("snd_shoot");
    this.snd_explode = this.sound.add("snd_explode");

    this.bgMusic = this.sound.add("snd_play", {
      volume: 0.5,
      loop: true,
    });
    this.bgMusic.play();
  },

  update: function () {
    // ========== BACKGROUND BOTTOM MANAGEMENT ==========
    for (let i = this.arrBgBottom.length - 1; i >= 0; i--) {
      let bg = this.arrBgBottom[i];
      bg.y += bg.getData("kecepatan");

      // Hapus background yang sudah keluar dari layar
      if (bg.y > game.canvas.height + this.bgBottomConfig.height / 2 + 100) {
        bg.destroy();
        this.arrBgBottom.splice(i, 1);
      }
    }

    // Tambah background baru jika perlu
    let topMostBg = null;
    let topMostY = game.canvas.height;

    for (let bg of this.arrBgBottom) {
      if (!bg.getData("isTransition") && bg.y < topMostY) {
        topMostY = bg.y;
        topMostBg = bg;
      }
    }

    // Tambah background baru jika background teratas sudah turun cukup jauh
    if (!topMostBg || topMostY > -this.bgBottomConfig.height / 2) {
      this.addBGBottom();
    }

    // ========== CLOUD MANAGEMENT ==========
    for (let i = this.arrBgTop.length - 1; i >= 0; i--) {
      let cloud = this.arrBgTop[i];
      cloud.y += cloud.getData("kecepatan");

      // Hapus cloud yang sudah keluar dari layar
      if (cloud.y > game.canvas.height + this.bgCloudConfig.height / 2 + 200) {
        cloud.destroy();
        this.arrBgTop.splice(i, 1);
      }
    }

    // Tambah cloud baru jika perlu
    if (this.arrBgTop.length === 0) {
      this.addBGTop();
    } else {
      let topMostCloud = this.arrBgTop[0];
      for (let cloud of this.arrBgTop) {
        if (cloud.y < topMostCloud.y) {
          topMostCloud = cloud;
        }
      }
      
      // Tambah cloud baru jika cloud teratas sudah turun cukup jauh
      if (topMostCloud.y > -this.bgCloudConfig.height / 4) {
        this.addBGTop();
      }
    }

    // ========== KEYBOARD CONTROLS ==========
    if (this.cursorKeyListener.left.isDown && this.heroShip.x > 70) {
      this.heroShip.x -= 7;
    }

    if (
      this.cursorKeyListener.right.isDown &&
      this.heroShip.x < X_POSITION.RIGHT - 70
    ) {
      this.heroShip.x += 7;
    }

    if (this.cursorKeyListener.up.isDown && this.heroShip.y > 70) {
      this.heroShip.y -= 7;
    }

    if (
      this.cursorKeyListener.down.isDown &&
      this.heroShip.y < Y_POSITION.BOTTOM - 70
    ) {
      this.heroShip.y += 7;
    }

    // ========== ENEMY MOVEMENT ==========
    for (let i = 0; i < this.arrEnemies.length; i++) {
      this.arrEnemies[i].move();
    }

    // ========== ENEMY CLEANUP ==========
    for (let i = this.arrEnemies.length - 1; i >= 0; i--) {
      if (!this.arrEnemies[i].active) {
        this.arrEnemies[i].destroy();
        this.arrEnemies.splice(i, 1);
      }
    }

    // ========== BULLET MOVEMENT ==========
    for (let i = 0; i < this.arrBullets.length; i++) {
      this.arrBullets[i].move();
    }

    // ========== BULLET CLEANUP ==========
    for (let i = this.arrBullets.length - 1; i >= 0; i--) {
      if (!this.arrBullets[i].active) {
        this.arrBullets[i].destroy();
        this.arrBullets.splice(i, 1);
      }
    }

    // ========== COLLISION DETECTION: BULLET vs ENEMY ==========
    for (let i = 0; i < this.arrEnemies.length; i++) {
      for (let j = 0; j < this.arrBullets.length; j++) {
        if (
          this.arrEnemies[i].active &&
          this.arrBullets[j].active &&
          this.arrEnemies[i]
            .getBounds()
            .contains(this.arrBullets[j].x, this.arrBullets[j].y)
        ) {
          this.arrEnemies[i].setActive(false);
          this.arrBullets[j].setActive(false);
          
          this.scoreValue++;
          this.scoreLabel.setText(this.scoreValue);
          this.snd_explode.play();
          break;
        }
      }
    }

    // ========== COLLISION DETECTION: HERO vs ENEMY ==========
    for (let i = 0; i < this.arrEnemies.length; i++) {
      let enemy = this.arrEnemies[i];
      if (enemy.active) {
        if (
          Phaser.Geom.Intersects.RectangleToRectangle(
            this.heroShip.getBounds(),
            enemy.getBounds()
          )
        ) {
          this.heroShip.setActive(false);
          this.heroShip.setVisible(false);

          if (this.bgMusic) {
            this.bgMusic.stop();
          }

          this.scene.start("sceneGameOver", { score: this.scoreValue });
          break;
        }
      }
    }
  },
});
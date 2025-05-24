var sceneGameOver = new Phaser.Class({
  Extends: Phaser.Scene,

  initialize: function () {
    Phaser.Scene.call(this, { key: "sceneGameOver" });
  },

  init: function (data) {
    // Skor yang dikirim dari scene sebelumnya
    this.score = data.score || 0;
    this.newRecord = false;
  },

  preload: function () {
    this.load.setBaseURL("assets/");
    this.load.image("BGPlay", "images/BGPlay.png");
    this.load.image("ButtonPlay", "images/ButtonPlay.png");
    this.load.audio("snd_gameover", "audio/music_gameover.mp3");
    this.load.audio("snd_touchshooter", "audio/fx_touch.mp3");
    this.load.audio("snd_newrecord", "audio/fx_newrecord.mp3"); // Optional new record sound
  },

  create: function () {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    // Background with slight fade effect
    const bg = this.add.image(centerX, centerY, "BGPlay").setDisplaySize(768, 1024);
    bg.setTint(0x666666); // Darken background for better contrast

    // Overlay for better text readability
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.4);
    overlay.fillRect(0, 0, this.scale.width, this.scale.height);

    // Check for new high score
    let bestScore = parseInt(localStorage.getItem("bestScore")) || 0;
    if (this.score > bestScore) {
      this.newRecord = true;
      bestScore = this.score;
      localStorage.setItem("bestScore", bestScore);
    }

    // Play appropriate sound
    if (this.newRecord) {
      this.sound.play("snd_newrecord");
    } else {
      this.sound.play("snd_gameover");
    }

    // Create animated elements
    this.createAnimatedTitle(centerX, centerY);
    this.createScoreDisplay(centerX, centerY, bestScore);
    this.createButtons(centerX, centerY);
    this.createParticleEffects();

    // Add subtle background animation
    this.tweens.add({
      targets: bg,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 8000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  },

  createAnimatedTitle: function (centerX, centerY) {
    // Main title with dramatic entrance
    const titleText = this.newRecord ? "NEW RECORD!" : "GAME OVER";
    const titleColor = this.newRecord ? "#00ff00" : "#ff4444";
    
    const title = this.add
      .text(centerX, centerY - 250, titleText, {
        font: "bold 56px Arial",
        fill: titleColor,
        stroke: "#ffffff",
        strokeThickness: 6,
        shadow: {
          offsetX: 4,
          offsetY: 4,
          color: "#000000",
          blur: 8,
          fill: true
        }
      })
      .setOrigin(0.5)
      .setScale(0)
      .setAlpha(0);

    // Title entrance animation
    this.tweens.add({
      targets: title,
      scale: 1,
      alpha: 1,
      duration: 800,
      ease: 'Back.easeOut',
      onComplete: () => {
        // Pulsing effect for new record
        if (this.newRecord) {
          this.tweens.add({
            targets: title,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 600,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
      }
    });

    return title;
  },

  createScoreDisplay: function (centerX, centerY, bestScore) {
    // Score container background
    const scoreBg = this.add.graphics();
    scoreBg.fillStyle(0x000000, 0.8);
    scoreBg.fillRoundedRect(centerX - 180, centerY - 140, 360, 120, 20);
    scoreBg.lineStyle(3, 0xffffff, 0.8);
    scoreBg.strokeRoundedRect(centerX - 180, centerY - 140, 360, 120, 20);
    scoreBg.setAlpha(0);

    // Current score
    const currentScore = this.add
      .text(centerX, centerY - 120, "SCORE", {
        font: "bold 24px Arial",
        fill: "#ffffff",
        align: 'center'
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const scoreValue = this.add
      .text(centerX, centerY - 80, this.score.toString(), {
        font: "bold 36px Arial",
        fill: "#ffff00",
        align: 'center'
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Best score
    const bestScoreLabel = this.add
      .text(centerX, centerY + 10, "BEST SCORE", {
        font: "bold 20px Arial",
        fill: "#cccccc",
        align: 'center'
      })
      .setOrigin(0.5)
      .setAlpha(0);

    const bestScoreValue = this.add
      .text(centerX, centerY + 50 , bestScore.toString(), {
        font: "bold 28px Arial",
        fill: this.newRecord ? "#00ff00" : "#ffffff",
        align: 'center'
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // Animate score display
    const scoreElements = [scoreBg, currentScore, scoreValue, bestScoreLabel, bestScoreValue];
    
    this.time.delayedCall(400, () => {
      scoreElements.forEach((element, index) => {
        this.tweens.add({
          targets: element,
          alpha: 1,
          y: element.y + (index === 0 ? 0 : 10),
          duration: 500,
          delay: index * 100,
          ease: 'Power2'
        });
      });

      // Animate score counting
      this.animateScoreCount(scoreValue, this.score);
      if (bestScore > 0) {
        this.animateScoreCount(bestScoreValue, bestScore);
      }
    });
  },

  animateScoreCount: function (textObject, targetScore) {
    let currentDisplayScore = 0;
    const increment = Math.max(1, Math.floor(targetScore / 50));
    
    const countTween = this.tweens.add({
      targets: { value: 0 },
      value: targetScore,
      duration: 1000,
      ease: 'Power2',
      onUpdate: (tween) => {
        const value = Math.floor(tween.getValue());
        textObject.setText(value.toString());
      }
    });
  },

  createButtons: function (centerX, centerY) {
    // Button container
    const buttonContainer = this.add.container(centerX, centerY + 200);
    buttonContainer.setAlpha(0);

    // Play Again Button
    const btnPlay = this.add
      .image(0, 0, "ButtonPlay")
      .setInteractive()
      .setScale(0.9);

    // Button hover effects
    btnPlay.on('pointerover', () => {
      this.tweens.add({
        targets: btnPlay,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: 'Power2'
      });
    });

    btnPlay.on('pointerout', () => {
      this.tweens.add({
        targets: btnPlay,
        scaleX: 0.9,
        scaleY: 0.9,
        duration: 200,
        ease: 'Power2'
      });
    });

    btnPlay.on("pointerdown", () => {
      this.sound.play("snd_touchshooter");
      
      // Button press animation
      this.tweens.add({
        targets: btnPlay,
        scaleX: 0.85,
        scaleY: 0.85,
        duration: 100,
        yoyo: true,
        onComplete: () => {
          // Fade out and transition
          this.tweens.add({
            targets: [buttonContainer, this.children.entries],
            alpha: 0,
            duration: 300,
            onComplete: () => {
              this.scene.start("sceneMenu");
            }
          });
        }
      });
    });

    // Menu Button (new addition)
    const btnMenu = this.add
      .text(0, 200, "MAIN MENU", {
        font: "bold 24px Arial",
        fill: "#ffffff",
        stroke: "#000000",
        strokeThickness: 2,
        backgroundColor: "#333333",
        padding: { x: 20, y: 10 }
      })
      .setOrigin(0.5)
      .setInteractive();

    btnMenu.on('pointerover', () => {
      btnMenu.setFill("#ffff00");
      this.tweens.add({
        targets: btnMenu,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 200,
        ease: 'Power2'
      });
    });

    btnMenu.on('pointerout', () => {
      btnMenu.setFill("#ffffff");
      this.tweens.add({
        targets: btnMenu,
        scaleX: 1,
        scaleY: 1,
        duration: 200,
        ease: 'Power2'
      });
    });

    btnMenu.on("pointerdown", () => {
      this.sound.play("snd_touchshooter");
      this.scene.start("sceneMenu");
    });

    buttonContainer.add([btnPlay, btnMenu]);

    // Animate button container entrance
    this.time.delayedCall(1200, () => {
      this.tweens.add({
        targets: buttonContainer,
        alpha: 1,
        y: buttonContainer.y - 20,
        duration: 600,
        ease: 'Back.easeOut'
      });
    });
  },

  createParticleEffects: function () {
    if (this.newRecord) {
      // Celebration particles for new record
      const emitter = this.add.particles(this.scale.width / 2, 100, 'ButtonPlay', {
        scale: { start: 0.1, end: 0 },
        speed: { min: 100, max: 200 },
        lifespan: 2000,
        quantity: 2,
        blendMode: 'ADD',
        tint: [0xffff00, 0x00ff00, 0xff6600, 0xff0066]
      });

      // Stop particles after 3 seconds
      this.time.delayedCall(3000, () => {
        emitter.stop();
      });
    }

    // Floating background particles
    for (let i = 0; i < 10; i++) {
      const particle = this.add.graphics();
      particle.fillStyle(0xffffff, 0.1);
      particle.fillCircle(0, 0, Math.random() * 3 + 1);
      particle.x = Math.random() * this.scale.width;
      particle.y = Math.random() * this.scale.height;

      this.tweens.add({
        targets: particle,
        y: particle.y - 100,
        alpha: 0,
        duration: Math.random() * 3000 + 2000,
        delay: Math.random() * 2000,
        repeat: -1,
        onRepeat: () => {
          particle.y = this.scale.height + 50;
          particle.x = Math.random() * this.scale.width;
          particle.alpha = 0.1;
        }
      });
    }
  },

  update: function () {
    // Optional: Add any continuous updates here
  }
});
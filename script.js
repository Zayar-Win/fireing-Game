window.addEventListener("load", function () {
  const canvas =
    document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = 900;
  canvas.height = 500;

  class InputHandler {
    constructor(game) {
      this.game = game;
      window.addEventListener("keydown", (e) => {
        if (
          (e.key === "ArrowUp" ||
            e.key === "ArrowDown") &&
          this.game.keys.indexOf(e.key) === -1
        ) {
          this.game.keys.push(e.key);
        } else if (e.key === " ") {
          this.game.player.shootTile();
        }
      });
      //for slice keyInput in keys arrys
      window.addEventListener("keyup", (e) => {
        if (
          this.game.keys.length > 0 &&
          this.game.keys.indexOf(e.key) > -1
        ) {
          this.game.keys.splice(
            this.game.keys.indexOf(e.key),
            1
          );
        }
      });
    }
  }

  class ProjectTiles {
    constructor(game, x, y) {
      this.game = game;
      this.x = x;
      this.y = y;
      this.speed = 3;
      this.width = 28;
      this.height = 10;
      this.image =
        document.getElementById("projectile");
      this.markForDeletion = false;
    }
    update() {
      if (this.x > this.game.width) {
        this.markForDeletion = true;
      }
      this.x += this.speed;
    }
    draw(ctx) {
      ctx.drawImage(
        this.image,
        this.x,
        this.y,
        this.width,
        this.height
      );
    }
  }

  class BaseEnemy {
    constructor(game) {
      this.game = game;
      this.x = this.game.width;
      this.speedX = Math.random() * -1.5 - 0.5;
      this.markForDeletion = false;
      this.frameY = 0;
      this.maxFrame = 30;
    }
    update() {
      this.x += this.speedX - this.game.speed;
      if (this.frameX < this.maxFrame) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }
      if (this.x + this.game.width < 0)
        this.markForDeletion = true;
    }
    draw(ctx) {
      if (this.game.debug) {
        ctx.strokeRect(
          this.x,
          this.y,
          this.width,
          this.height
        );
      }
      ctx.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
      if (this.game.debug) {
        ctx.fontSize = "20px";
        ctx.fillText(this.lives, this.x, this.y);
      }
    }
  }

  class BasicEnemy extends BaseEnemy {
    constructor(game) {
      super(game);
      this.width = 228;
      this.height = 169;
      this.lives = 5;
      this.image =
        document.getElementById("angler1");
      this.score = this.lives;
      this.y =
        Math.random() *
        (this.game.height * 0.9 - this.height);
      this.frameY = Math.floor(Math.random() * 3);
      this.type = "angler1";
    }
  }
  class Angler2 extends BaseEnemy {
    constructor(game) {
      super(game);
      this.width = 213;
      this.height = 165;
      this.lives = 8;
      this.image =
        document.getElementById("angler2");
      this.score = this.lives;
      this.y =
        Math.random() *
        (this.game.height * 0.9 - this.height);
      this.frameY = Math.floor(Math.random() * 2);
      this.frameX = 0;
      this.type = "angler2";
    }
  }
  class LuckyFish extends BaseEnemy {
    constructor(game) {
      super(game);
      this.width = 99;
      this.height = 95;
      this.lives = 10;
      this.image =
        document.getElementById("lucky");
      this.score = this.lives;
      this.y =
        Math.random() *
        (this.game.height * 0.9 - this.height);
      this.frameY = Math.floor(Math.random() * 2);
      this.type = "lucky";
    }
  }

  class Particle {
    constructor(game, x, y) {
      this.x = x;
      this.y = y;
      this.game = game;
      this.frameX = Math.floor(Math.random() * 3);
      this.frameY = Math.floor(Math.random() * 3);
      this.speedX = Math.random() * 6 - 3;
      this.speedY = Math.random() * -15;
      this.gravity = 0.5;
      this.sizeModifier = (
        Math.random() * 0.5 +
        0.5
      ).toFixed(1);
      this.spriteSize = 50;
      this.size =
        this.spriteSize * this.sizeModifier;
      this.angle = 0;
      this.va = Math.random() * 0.2 - 0.1;
      this.image =
        document.getElementById("gears");
      this.markForDeletion = false;
      this.bounced = Math.random() * 3;
      this.bottomBounceBoundary = 100;
    }

    update() {
      this.angle += this.va;
      this.speedY += this.gravity;
      this.y += this.speedY;
      this.x -= this.speedX;
      if (
        this.y > this.game.height + this.height ||
        this.x < 0 - this.size ||
        this.x > this.game.width + this.width
      ) {
        this.markForDeletion = true;
      }
      if (
        this.bounced < 2 &&
        this.y >
          this.game.height -
            this.bottomBounceBoundary
      ) {
        this.bounced++;
        this.speedY *= -0.5;
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.drawImage(
        this.image,
        this.frameX * this.spriteSize,
        this.frameY * this.spriteSize,
        this.spriteSize,
        this.spriteSize,
        this.size * -0.5,
        this.size * -0.5,
        this.size,
        this.size
      );
      ctx.restore();
    }
  }

  class Player {
    constructor(game) {
      this.game = game;
      this.x = 30;
      this.y = 100;
      this.speed = 0;
      this.maxSpeed = 1.5;
      this.width = 120;
      this.image =
        document.getElementById("player");
      this.projectTiles = [];
      this.height = 190;
      this.frameX = 0;
      this.frameY = 0;
      this.maxFrame = 30;
      this.powerUp = false;
      this.powerUpTimer = 0;
      this.powerUpInterval = 0;
    }

    update(deltaTime) {
      //   this.y += this.speed;
      if (this.powerUp) {
        this.powerUpTimer += deltaTime;
      }
      if (
        this.powerUpTimer > this.powerUpInterval
      ) {
        this.powerUp = false;
      }

      if (this.frameX < this.maxFrame) {
        this.frameX++;
      } else {
        this.frameX = 0;
      }
      if (
        this.game.keys.indexOf("ArrowUp") > -1
      ) {
        this.speed = -this.maxSpeed;
      } else if (
        this.game.keys.indexOf("ArrowDown") > -1
      ) {
        this.speed = +this.maxSpeed;
      } else {
        this.speed = 0;
      }
      this.y += this.speed;

      this.projectTiles.forEach((pj) => {
        pj.update();
      });

      this.projectTiles =
        this.projectTiles.filter(
          (pj) => !pj.markForDeletion
        );
    }

    draw(ctx) {
      if (this.game.debug) {
        ctx.strokeRect(
          this.x,
          this.y,
          this.width,
          this.height
        );
      }
      ctx.drawImage(
        this.image,
        this.frameX * this.width,
        this.frameY * this.height,
        this.width,
        this.height,
        this.x,
        this.y,
        this.width,
        this.height
      );
      this.projectTiles.forEach((pj) =>
        pj.draw(ctx)
      );
    }

    shootTile() {
      if (
        this.game.ammo > 0 &&
        !this.game.gameOver
      ) {
        this.projectTiles.push(
          new ProjectTiles(
            this.game,
            this.x + 90,
            this.y + 30
          )
        );
        this.game.ammo--;
      }
      if (this.powerUp) {
        this.shootBottom();
      }
    }
    shootBottom() {
      if (
        this.game.ammo > 0 &&
        !this.game.gameOver
      ) {
        this.projectTiles.push(
          new ProjectTiles(
            this.game,
            this.x + 90,
            this.y + 150
          )
        );
      }
    }
  }

  class Layer {
    constructor(game, image, speedModifier) {
      this.game = game;
      this.image = image;
      this.speedModifier = speedModifier;
      this.width = 1768;
      this.height = 500;
      this.x = 0;
      this.y = 0;
    }
    update() {
      if (this.x <= -this.width) {
        this.x = 0;
      } else {
        this.x -=
          this.game.speed * this.speedModifier;
      }
    }
    draw(ctx) {
      ctx.drawImage(this.image, this.x, this.y);
      ctx.drawImage(
        this.image,
        this.x + this.width,
        this.y
      );
    }
  }

  class Background {
    constructor(game) {
      this.game = game;
      this.image1 =
        document.getElementById("layer1");
      this.image2 =
        document.getElementById("layer2");
      this.image3 =
        document.getElementById("layer3");
      this.image4 =
        document.getElementById("layer4");
      this.layer1 = new Layer(
        this.game,
        this.image1,
        1
      );
      this.layer2 = new Layer(
        this.game,
        this.image2,
        1
      );
      this.layer3 = new Layer(
        this.game,
        this.image3,
        1
      );
      this.layer4 = new Layer(
        this.game,
        this.image4,
        1
      );
      this.layers = [
        this.layer1,
        this.layer2,
        this.layer3,
        this.layer4,
      ];
    }

    update() {
      this.layers.forEach((layer) =>
        layer.update()
      );
    }

    draw(ctx) {
      this.layers.forEach((layer) =>
        layer.draw(ctx)
      );
    }
  }

  class UI {
    constructor(game) {
      this.game = game;
      this.fontSize = 20;
      this.fontFamily = "Helvatica";
      this.color = "whilte";
    }
    draw(ctx) {
      ctx.fillStyle = this.color;
      ctx.font =
        this.fontSize + "px " + this.fontFamily;
      ctx.fillText(
        "Score:" + this.game.score,
        25,
        20
      );
      for (let i = 0; i < this.game.ammo; i++) {
        ctx.fillRect(20 + 5 * i, 30, 3, 10);
      }
      if (this.game.gameOver) {
        ctx.textAlign = "center";
        let message1;
        let message2;
        if (
          this.game.score <=
          this.game.winningScore
        ) {
          message1 = "You Lose";
          message2 = "Try Again Next Time";
        } else {
          message1 = "You Win";
          message2 = "Well Done.";
        }
        ctx.font = "40px " + this.fontFamily;
        ctx.fillText(
          message1,
          this.game.width * 0.5,
          this.game.height * 0.5 - 40
        );
        ctx.font = "25px " + this.fontFamily;
        ctx.fillText(
          message2,
          this.game.width * 0.5,
          this.game.height * 0.5
        );
      }
    }
  }

  class Game {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.player = new Player(this);
      this.keys = [];
      this.ammo = 20;
      this.maxAmmo = 30;
      this.reloadTimer = 0;
      this.reloadInterval = 500;
      this.inputHandler = new InputHandler(this);
      this.ui = new UI(this);
      this.enimes = [];
      this.enemyTimer = 0;
      this.background = new Background(this);
      this.enemyInterval = 2000;
      this.gameOver = false;
      this.score = 0;
      this.winningScore = 30;
      this.speed = 1;
      this.partilces = [];
      this.debug = false;
    }

    addEnemy() {
      const randomized = Math.random();
      if (randomized < 0.4) {
        this.enimes.push(new BasicEnemy(this));
      } else if (randomized < 0.6) {
        this.enimes.push(new Angler2(this));
      } else {
        this.enimes.push(new LuckyFish(this));
      }
      // this.enimes.push(new Angler2(this));
    }

    update(deltaTime) {
      this.background.update();

      if (this.score >= this.winningScore)
        this.gameOver = true;
      if (
        this.reloadTimer >= this.reloadInterval
      ) {
        if (this.ammo <= this.maxAmmo) {
          this.ammo++;
        }
        this.reloadTimer = 0;
      } else {
        if (deltaTime) {
          this.reloadTimer += deltaTime;
        }
      }

      if (
        this.enemyTimer > this.enemyInterval &&
        !this.gameOver
      ) {
        this.addEnemy();
        this.enemyTimer = 0;
      } else {
        if (deltaTime) {
          this.enemyTimer += deltaTime;
        }
      }

      this.player.update(deltaTime);

      this.partilces.forEach((partilce) =>
        partilce.update()
      );
      this.partilces = this.partilces.filter(
        (particle) => !particle.markForDeletion
      );

      this.enimes.forEach((enemy) => {
        if (!this.gameOver) {
          enemy.update();
        }
        if (
          !this.gameOver &&
          this.checkCollision(this.player, enemy)
        ) {
          if (enemy.type === "lucky") {
            this.player.powerUpInterval += 3000;
            this.player.powerUp = true;
          } else if (enemy.type === "angler1") {
            this.score -= 2;
          } else if (enemy.type === "angler2") {
            this.score -= 3;
          }
          enemy.markForDeletion = true;
          if (this.score < 0) {
            this.gameOver = true;
          }
        }

        this.player.projectTiles.forEach(
          (bullet) => {
            if (
              this.checkCollision(bullet, enemy)
            ) {
              enemy.lives--;
              bullet.markForDeletion = true;
              this.partilces.push(
                new Particle(
                  this,
                  enemy.x + enemy.width * 0.5,
                  enemy.y + enemy.height * 0.5
                )
              );
              if (
                enemy.lives <= 0 &&
                !this.gameOver
              ) {
                enemy.markForDeletion = true;
                this.score += enemy.score;
              }
              if (
                this.score >= this.winningScore &&
                !this.gameOver
              ) {
                this.gameOver = true;
              }
            }
          }
        );
      });
      this.enimes = this.enimes.filter(
        (enemy) => !enemy.markForDeletion
      );
    }

    draw(ctx) {
      this.background.draw(ctx);
      this.ui.draw(ctx);
      this.player.draw(ctx);
      this.partilces.forEach((particle) =>
        particle.draw(ctx)
      );
      this.enimes.forEach((enemy) => {
        enemy.draw(ctx);
      });
    }

    checkCollision(rect1, rect2) {
      return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
      );
    }
  }

  const game = new Game(
    canvas.width,
    canvas.height
  );
  let lastTime = 0;
  function gameLoop(updateTime) {
    const deltaTime = updateTime - lastTime;
    lastTime = updateTime;
    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );
    game.update(deltaTime);
    game.draw(ctx);
    requestAnimationFrame(gameLoop);
  }

  gameLoop();
});

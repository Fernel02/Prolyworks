const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext("2d");
const pacmanFrames = document.getElementById("animation");
const ghostFrames = document.getElementById("ghosts");
let level = 1; // Start at level 1

let createRect = (x, y, width, height, color) => {
    canvasContext.fillStyle = color;
    canvasContext.fillRect(x, y, width, height);
};

const DIRECTION_RIGHT = 4;
const DIRECTION_UP = 3;
const DIRECTION_LEFT = 2;
const DIRECTION_BOTTOM = 1;
let lives = 3;
let ghostCount = 4;
let ghostImageLocations = [
    { x: 0, y: 0 },
    { x: 176, y: 0 },
    { x: 0, y: 121 },
    { x: 176, y: 121 },
];

// Game variables
let fps = 30;
let pacman;
let oneBlockSize = 20;
let score = 0;
let ghosts = [];
let wallSpaceWidth = oneBlockSize / 1.6;
let wallOffset = (oneBlockSize - wallSpaceWidth) / 2;
let wallInnerColor ="rgba(0, 0, 0, 0.97)";

// we now create the map of the walls,
// if 1 wall, if 0 not wall
// 21 columns // 23 rows
let map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 0, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2, 2, 2, 2, 1, 0, 0, 0, 1, 2, 2, 2, 2, 2, 2, 2, 2],
    [1, 1, 1, 1, 1, 2, 1, 2, 1, 0, 0, 0, 1, 2, 1, 2, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 1, 2, 1, 2, 2, 2, 2, 2, 2, 2, 1, 2, 1, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 1, 1, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1, 2, 1, 1, 1, 2, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1],
    [1, 1, 2, 2, 1, 2, 1, 2, 1, 1, 1, 1, 1, 2, 1, 2, 1, 2, 2, 1, 1],
    [1, 2, 2, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 1, 2, 2, 2, 2, 2, 1],
    [1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1, 2, 1, 1, 1, 1, 1, 1, 1, 2, 1],
    [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

let randomTargetsForGhosts = [
    { x: 1 * oneBlockSize, y: 1 * oneBlockSize },
    { x: 1 * oneBlockSize, y: (map.length - 2) * oneBlockSize },
    { x: (map[0].length - 2) * oneBlockSize, y: oneBlockSize },
    {
        x: (map[0].length - 2) * oneBlockSize,
        y: (map.length - 2) * oneBlockSize,
    },
];

// for (let i = 0; i < map.length; i++) {
//     for (let j = 0; j < map[0].length; j++) {
//         map[i][j] = 2;
//     }
// }

let createNewPacman = () => {
    pacman = new Pacman(
        oneBlockSize,
        oneBlockSize,
        oneBlockSize,
        oneBlockSize,
        oneBlockSize / 5
    );
};

let gameLoop = () => {
    draw();
    update();
};

let gameInterval = setInterval(gameLoop, 1000 / fps);

let restartPacmanAndGhosts = () => {
    ghosts = [];
    createNewPacman();
    createGhosts();
};

let onGhostCollision = () => {
    lives--;
    restartPacmanAndGhosts();
    if (lives == 0) {
        gameOver();
    }
};

let resetMap = () => {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] === 3) {
                map[i][j] = 2; // Reset pellets
            }
        }
    }
};

let restartLevel = () => {
    ghosts = [];
    createNewPacman();
    createGhosts();
    resetMap(); // Reset the map for the new level
};

let checkLevelProgress = () => {
    let allPelletsEaten = true;
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] === 2) { // Check if any pellets are left
                allPelletsEaten = false;
                break;
            }
        }
    }

    if (allPelletsEaten) {
        if (level === 1) {
            level++;
            restartLevel();
            lives = 3; // Reset lives for the new level
        } else {
            drawWinner(); // Player wins after level 2
            clearInterval(gameInterval);
        }
    }
};

let update = () => {
    pacman.moveProcess();
    pacman.eat();
    updateGhosts();
    if (pacman.checkGhostCollision(ghosts)) {
        onGhostCollision();
    }
    checkLevelProgress(); // Check if all pellets are eaten
};

let drawFoods = () => {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] == 2) {
                 canvasContext.beginPath();
                 canvasContext.arc(
                     j * oneBlockSize + oneBlockSize / 2,
                     i * oneBlockSize + oneBlockSize / 2,
                     oneBlockSize / 6,
                     0,
                     2 * Math.PI
                );
               canvasContext.fillStyle = "#FF0000"; // red like a bauble or ornament
               canvasContext.fill();
            }
        }
    }
};

let drawLevel = () => {
    canvasContext.font = "20px 'Mountains of Christmas'";
    canvasContext.fillStyle = "#FFD700"; // gold
    
    canvasContext.fillText("Level: " + level, 100, oneBlockSize * (map.length + 1));  
};

let drawWinner = () => {
    canvasContext.font = "40px Mountains of Christmas";
    canvasContext.fillStyle = "#FFD700";
    canvasContext.fillText("You Win!", 115, 250);

    startCelebrationAnimation(); // Start the celebration 
    

};

let gameOver = () => {
    drawGameOver();
    drawRestartGame();
    clearInterval(gameInterval);
};

let drawGameOver = () => {
    canvasContext.font = "40px Mountains of Christmas";
    canvasContext.fillStyle = "white";
    canvasContext.fillText("Game Over!", 115, 250);

};

let drawRestartGame = () => {
    canvasContext.font = "20px Mountains of Christmas";
    canvasContext.fillStyle = "white";
    canvasContext.fillText("Press F5 to restart", 140, 290);
};


let drawRemainingLives = () => {
    canvasContext.font = "20px 'Mountains of Christmas'";
    canvasContext.fillStyle = "#FFD700"; // gold
    
    canvasContext.fillText(
        "Lives: ",
         220,
         oneBlockSize * (map.length + 1));

    for (let i = 0; i < lives; i++) {
        canvasContext.drawImage(
            pacmanFrames,
            2 * oneBlockSize,
            0,
            oneBlockSize,
            oneBlockSize,
            350 + i * oneBlockSize,
            oneBlockSize * map.length + 2,
            oneBlockSize,
            oneBlockSize
        );
    }
};

let drawScore = () => {
    canvasContext.font = "20px 'Mountains of Christmas'";
    canvasContext.fillStyle = "#FFD700"; // gold
    
    canvasContext.fillText(
        "Score: " + score,
        0,
        oneBlockSize * (map.length + 1)
    );
};

let draw = () => {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    createRect(0, 0, canvas.width, canvas.height, "rgba(255, 255, 255, 0)");
    drawSnow(); // Draw snowflakes
    drawWalls();
    drawFoods();
    drawGhosts();
    pacman.draw();
    drawScore();
    drawRemainingLives();
    drawLevel();
};

let drawWalls = () => {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] == 1) {
                createRect(
                    j * oneBlockSize,
                    i * oneBlockSize,
                    oneBlockSize,
                    oneBlockSize,
                    "#342DCA"
                );
                if (j > 0 && map[i][j - 1] == 1) {
                    createRect(
                        j * oneBlockSize,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth + wallOffset,
                        wallSpaceWidth,
                        wallInnerColor
                    );
                }

                if (j < map[0].length - 1 && map[i][j + 1] == 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth + wallOffset,
                        wallSpaceWidth,
                        wallInnerColor
                    );
                }

                if (i < map.length - 1 && map[i + 1][j] == 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth,
                        wallSpaceWidth + wallOffset,
                        wallInnerColor
                    );
                }

                if (i > 0 && map[i - 1][j] == 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize,
                        wallSpaceWidth,
                        wallSpaceWidth + wallOffset,
                        wallInnerColor
                    );
                }
            }
        }
    }
};

let snowflakes = [];
for (let i = 0; i < 100; i++) {
    snowflakes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 3 + 2,
        d: Math.random() * 1 + 0.5
    });
};

function drawSnow() {
    canvasContext.fillStyle = "white";
    canvasContext.beginPath();
    for (let i = 0; i < snowflakes.length; i++) {
        let f = snowflakes[i];
        canvasContext.moveTo(f.x, f.y);
        canvasContext.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
    }
    canvasContext.fill();
    updateSnow();
};

function updateSnow() {
    for (let i = 0; i < snowflakes.length; i++) {
        let f = snowflakes[i];
        f.y += f.d;
        if (f.y > canvas.height) {
            f.y = 0;
            f.x = Math.random() * canvas.width;
        }
    }
};




let createGhosts = () => {
    ghosts = []; // Clear any existing ghosts
    let ghostCount = level === 1 ? 4 : 9; // 4 ghosts for level 1, 9 ghosts for level 2
    for (let i = 0; i < ghostCount; i++) {
        let newGhost = new Ghost(
            9 * oneBlockSize + (i % 2 == 0 ? 0 : 1) * oneBlockSize,
            10 * oneBlockSize + (i % 2 == 0 ? 0 : 1) * oneBlockSize,
            oneBlockSize,
            oneBlockSize,
            pacman.speed / 2,
            ghostImageLocations[i % 4].x,
            ghostImageLocations[i % 4].y,
            124,
            116,
            6 + i
        );
        ghosts.push(newGhost);
    }
};

// Function to start the celebration animation (confetti effect)
function startCelebrationAnimation() {
    const confettiParticles = [];
    const numParticles = 200; // Number of confetti pieces. Adjust as needed.
    const duration = 5000; // Duration of animation in milliseconds (e.g., 5 seconds)
    const startTime = Date.now();

    // Function to generate a random confetti color
    function getRandomConfettiColor() {
        const colors = ["#FF0000", "#00FF00", "#FFD700", "#FF00FF", "#00FFFF", "#FFA500"];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Create particles: each particle is an object with properties for position, velocity, radius, and opacity.
    for (let i = 0; i < numParticles; i++) {
        confettiParticles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            r: Math.random() * 4 + 2, // radius between 2 and 6 pixels
            color: getRandomConfettiColor(),
            velocityX: (Math.random() - 0.5) * 8, // random horizontal speed
            velocityY: Math.random() * -8 - 2,     // random upward speed
            opacity: 1,
            gravity: 0.2 // Acceleration downwards
        });
    }

    // Animation loop function
    function updateConfetti() {
        // Clear the canvas for the next frame
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);

        drawWinner(); // Draw winner screen

        // Update and draw each confetti particle
        for (let i = 0; i < confettiParticles.length; i++) {
            let p = confettiParticles[i];
            // Update particle position
            p.x += p.velocityX;
            p.y += p.velocityY;
            p.velocityY += p.gravity;
            p.opacity -= 0.005; // Fade out slowly

            // Draw particle if still visible
            if (p.opacity > 0) {
                canvasContext.beginPath();
                canvasContext.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                canvasContext.fillStyle = p.color;
                // Apply opacity to the confetti piece
                canvasContext.globalAlpha = p.opacity;
                canvasContext.fill();
            }
        }
        // Reset globalAlpha
        canvasContext.globalAlpha = 1;
      
        // Check duration: Stop the animation after the duration has elapsed
        if (Date.now() - startTime < duration) {
            requestAnimationFrame(updateConfetti);
        } else {
            // Clear the canvas and stop the animation
            canvasContext.clearRect(0, 0, canvas.width, canvas.height);
            drawWinner(); // Draw winner screen without confetti if needed.
        }
    }

    // Start the animation loop
    updateConfetti();
};


createNewPacman();
createGhosts();
gameLoop();

window.addEventListener("keydown", (event) => {
    let k = event.keyCode;
    setTimeout(() => {
        if (k == 37 || k == 65) {
            // left arrow or a
            pacman.nextDirection = DIRECTION_LEFT;
        } else if (k == 38 || k == 87) {
            // up arrow or w
            pacman.nextDirection = DIRECTION_UP;
        } else if (k == 39 || k == 68) {
            // right arrow or d
            pacman.nextDirection = DIRECTION_RIGHT;
        } else if (k == 40 || k == 83) {
            // bottom arrow or s
            pacman.nextDirection = DIRECTION_BOTTOM;
        }
    }, 1);
});
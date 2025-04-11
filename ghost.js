class Ghost {
    constructor(x, y, width, height, speed, imageX, imageY, imageWidth, imageHeight, range) {
        this.x = x;
        this.y = y;
        this.startX = x;       // Save initial x
        this.startY = y;       // Save initial y
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = DIRECTION_RIGHT;
        this.imageX = imageX;
        this.imageY = imageY;
        this.imageHeight = imageHeight;
        this.imageWidth = imageWidth;
        this.range = range;
        this.randomTargetIndex = parseInt(Math.random() * 4);
        this.target = randomTargetsForGhosts[this.randomTargetIndex];
        this.isScared = false; // Add a flag for "scared" state
        setInterval(() => {
            this.changeRandomDirection();
        }, 1000);
    }

    isInRange() {
        let xDistance = Math.abs(pacman.getMapX() - this.getMapX());
        let yDistance = Math.abs(pacman.getMapY() - this.getMapY());
        if (
            Math.sqrt(xDistance * xDistance + yDistance * yDistance) <=
            this.range
        ) {
            return true;
        }
        return false;
    }

    changeRandomDirection() {
        let addition = 1;
        this.randomTargetIndex += addition;
        this.randomTargetIndex = this.randomTargetIndex % 4;
    }
    
    // In ghost.js, inside the Ghost class:

 snapToGrid() {
    let currentCellX = this.getMapX();
    let currentCellY = this.getMapY();
    let cellCenterX = (currentCellX + 0.5) * oneBlockSize - this.width / 2;
    let cellCenterY = (currentCellY + 0.5) * oneBlockSize - this.height / 2;
    let tolerance = 3; // pixels

    if (Math.abs(this.x - cellCenterX) < tolerance && Math.abs(this.y - cellCenterY) < tolerance) {
        this.x = cellCenterX;
        this.y = cellCenterY;
    }
 }

 respawn() {
    this.x = this.startX;
    this.y = this.startY;
    this.isScared = false;  // Reset to normal state
}

 isAtCellCenter(tolerance) {
    let centerX = (this.getMapX() + 0.5) * oneBlockSize - this.width / 2;
    let centerY = (this.getMapY() + 0.5) * oneBlockSize - this.height / 2;
    return (Math.abs(this.x - centerX) < tolerance && Math.abs(this.y - centerY) < tolerance);
}
 moveSmoothlyTo(targetX, targetY) {
    // Calculate the difference between current position and target cell center
    let dx = targetX - this.x;
    let dy = targetY - this.y;
    // Use a lerp factor (between 0 and 1) for smoothing:
    let lerpFactor = 0.2;  
    this.x += dx * lerpFactor;
    this.y += dy * lerpFactor;
 }

 moveProcess() {
    this.snapToGrid();
    if (this.isScared) {
        let awayX = this.x - pacman.x;
        let awayY = this.y - pacman.y;
        // Set a temporary target for pathfinding (scale appropriately)
        this.target = {
            x: this.x + awayX,
            y: this.y + awayY
        };
    }

    else{
    // Determine the target for pathfinding
    if (this.isInRange()) {
        this.target = pacman;
    } else {
        this.target = randomTargetsForGhosts[this.randomTargetIndex];
    }

    if (this.isAtCellCenter(3)) {
        this.direction = this.calculateNewDirection(
            map,
            parseInt(this.target.x / oneBlockSize),
            parseInt(this.target.y / oneBlockSize)
        );
        // Determine the center of the next cell based on the new direction:
        let nextCellX = this.getMapX();
        let nextCellY = this.getMapY();
        switch (this.direction) {
            case DIRECTION_RIGHT:
                nextCellX++;
                break;
            case DIRECTION_LEFT:
                nextCellX--;
                break;
            case DIRECTION_UP:
                nextCellY--;
                break;
            case DIRECTION_BOTTOM:
                nextCellY++;
                break;
        }
        let targetCenterX = (nextCellX + 0.5) * oneBlockSize - this.width / 2;
        let targetCenterY = (nextCellY + 0.5) * oneBlockSize - this.height / 2;
        // Smoothly move toward that target center
        this.moveSmoothlyTo(targetCenterX, targetCenterY);
    } else {
        // Continue moving in the current direction if not at center
        this.moveForwards();
    }
}

    if (this.checkCollisions()) {
        this.moveBackwards();
        return;
    }
 }


    

    moveBackwards() {
        switch (this.direction) {
            case 4: // Right
                this.x -= this.speed;
                break;
            case 3: // Up
                this.y += this.speed;
                break;
            case 2: // Left
                this.x += this.speed;
                break;
            case 1: // Bottom
                this.y -= this.speed;
                break;
        }
    }

    moveForwards() {
        switch (this.direction) {
            case 4: // Right
                this.x += this.speed;
                break;
            case 3: // Up
                this.y -= this.speed;
                break;
            case 2: // Left
                this.x -= this.speed;
                break;
            case 1: // Bottom
                this.y += this.speed;
                break;
        }
    }

    checkCollisions() {
        let isCollided = false;
        if (
            map[parseInt(this.y / oneBlockSize)][
                parseInt(this.x / oneBlockSize)
            ] == 1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][
                parseInt(this.x / oneBlockSize)
            ] == 1 ||
            map[parseInt(this.y / oneBlockSize)][
                parseInt(this.x / oneBlockSize + 0.9999)
            ] == 1 ||
            map[parseInt(this.y / oneBlockSize + 0.9999)][
                parseInt(this.x / oneBlockSize + 0.9999)
            ] == 1
        ) {
            isCollided = true;
        }
        return isCollided;
    }

    changeDirectionIfPossible() {
        let tempDirection = this.direction;
        this.direction = this.calculateNewDirection(
            map,
            parseInt(this.target.x / oneBlockSize),
            parseInt(this.target.y / oneBlockSize)
        );
        if (typeof this.direction == "undefined") {
            this.direction = tempDirection;
            return;
        }
        if (
        this.getMapY() !== this.getMapYRightSide() &&
        (this.direction === DIRECTION_LEFT || this.direction === DIRECTION_RIGHT)
    ) {
        this.direction = tempDirection;
    }

    if (
        this.getMapX() !== this.getMapXRightSide() &&
        this.direction === DIRECTION_UP
    ) {
        this.direction = tempDirection;
    }
}

    calculateNewDirection(map, destX, destY) {
        let mp = [];
        for (let i = 0; i < map.length; i++) {
            mp[i] = map[i].slice();
        }

        let queue = [
            {
                x: this.getMapX(),
                y: this.getMapY(),
                rightX: this.getMapXRightSide(),
                rightY: this.getMapYRightSide(),
                moves: [],
            },
        ];
        while (queue.length > 0) {
            let poped = queue.shift();
            if (poped.x == destX && poped.y == destY) {
                return poped.moves[0];
            } else {
                mp[poped.y][poped.x] = 1;
                let neighborList = this.addNeighbors(poped, mp);
                for (let i = 0; i < neighborList.length; i++) {
                    queue.push(neighborList[i]);
                }
            }
        }

        return 1; // direction
    }

    addNeighbors(poped, mp) {
        let queue = [];
        let numOfRows = mp.length;
        let numOfColumns = mp[0].length;

        if (
            poped.x - 1 >= 0 &&
            poped.x - 1 < numOfRows &&
            mp[poped.y][poped.x - 1] != 1
        ) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_LEFT);
            queue.push({ x: poped.x - 1, y: poped.y, moves: tempMoves });
        }
        if (
            poped.x + 1 >= 0 &&
            poped.x + 1 < numOfRows &&
            mp[poped.y][poped.x + 1] != 1
        ) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_RIGHT);
            queue.push({ x: poped.x + 1, y: poped.y, moves: tempMoves });
        }
        if (
            poped.y - 1 >= 0 &&
            poped.y - 1 < numOfColumns &&
            mp[poped.y - 1][poped.x] != 1
        ) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_UP);
            queue.push({ x: poped.x, y: poped.y - 1, moves: tempMoves });
        }
        if (
            poped.y + 1 >= 0 &&
            poped.y + 1 < numOfColumns &&
            mp[poped.y + 1][poped.x] != 1
        ) {
            let tempMoves = poped.moves.slice();
            tempMoves.push(DIRECTION_BOTTOM);
            queue.push({ x: poped.x, y: poped.y + 1, moves: tempMoves });
        }
        return queue;
    }

    getMapX() {
        let mapX = parseInt(this.x / oneBlockSize);
        return mapX;
    }

    getMapY() {
        let mapY = parseInt(this.y / oneBlockSize);
        return mapY;
    }

    getMapXRightSide() {
        let mapX = parseInt((this.x * 0.99 + oneBlockSize) / oneBlockSize);
        return mapX;
    }

    getMapYRightSide() {
        let mapY = parseInt((this.y * 0.99 + oneBlockSize) / oneBlockSize);
        return mapY;
    }

    changeAnimation() {
        this.currentFrame =
            this.currentFrame == this.frameCount ? 1 : this.currentFrame + 1;
    }

    draw() {
        canvasContext.save();
        // Apply a blue tint if scared using a CSS filter, or choose an alternative sprite frame
        if (this.isScared) {
            canvasContext.filter = "hue-rotate(180deg) brightness(1.5)";
        } else {
            canvasContext.filter = "none";
        }
        canvasContext.drawImage(
            ghostFrames, // This still refers to your sprite image
            this.imageX,
            this.imageY,
            this.imageWidth,
            this.imageHeight,
            this.x,
            this.y,
            this.width,
            this.height
        );
        canvasContext.restore();
        canvasContext.beginPath();
        canvasContext.stroke();
    }
    

}

let updateGhosts = () => {
    for (let i = 0; i < ghosts.length; i++) {
        ghosts[i].moveProcess();
    }
};

let drawGhosts = () => {
    for (let i = 0; i < ghosts.length; i++) {
        ghosts[i].draw();
    }
};
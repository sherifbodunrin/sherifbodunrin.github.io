let myGamePiece;
let myObstacles = [];
let myScore;
let characterImage = new Image();
let poleImage = new Image();
let explosionImage = new Image();
let isPaused = false;
let interval;
let gameOver = false;
let myMusic;

explosionImage.src = 'https://www.onlygfx.com/wp-content/uploads/2018/02/starburst-explosion-2-3.png';
characterImage.src = 'https://clipart-library.com/images/8T68RMeac.png'; 
poleImage.src = 'https://res.cloudinary.com/mirukusheku/image/upload/v1495140035/Red_laser-ConvertImage_votu8o.png'; 

function startGame() {
    myGamePiece = new gameObject(30, 30, characterImage, 10, 120, "image");
    myScore = new gameObject("30px", "Consolas", "white", 280, 40, "text");
    myScore.text = "";
    myObstacles = [];
    gameOver = false;
    document.getElementById("endScreen").style.display = "none"; // Hide end screen
    myGameArea.start();

    myMusic = new sound('alienbgm.mp3'); // Adjust path as necessary
 
    window.addEventListener("keydown", controlGamePiece);
}

    function sound(src, type) {
            this.type = type;
            this.sound = document.createElement("audio");
            this.sound.src = src;
            this.sound.setAttribute("preload", "auto");
            this.sound.setAttribute("controls", "none");
            if (this.type == "bgm") {
                this.sound.setAttribute("loop", "true");
            }
            this.sound.style.display = "none";
            document.body.appendChild(this.sound);
            this.play = function () {
                this.sound.play();
            }
            this.stop = function () {
                this.sound.pause();
            }
        }

var myGameArea = {
    canvas: document.getElementById("gameCanvas"),
    start: function() {
        this.frameNo = 0;
        clearInterval(interval);
        interval = setInterval(updateGameArea, 20);
    },
    clear: function() {
        var ctx = this.canvas.getContext("2d");
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

function gameObject(width, height, image, x, y, type) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y;
    this.image = image;
    this.gravity = 0.1;
    this.gravitySpeed = 0;
    this.text = "";

    this.update = function() {
        var ctx = myGameArea.canvas.getContext("2d");
        if (this.type === "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = "white";
            ctx.fillText(this.text, this.x, this.y);
        } else {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    };

    this.newPos = function() {
        this.gravitySpeed += this.gravity;
        this.y += this.gravitySpeed;
        this.hitBottom();
    };

    this.hitBottom = function() {
        var rockbottom = myGameArea.canvas.height - this.height;
        if (this.y > rockbottom) {
            this.y = rockbottom;
            this.gravitySpeed = 0;
        }
    };

    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + this.width;
        var mytop = this.y;
        var mybottom = this.y + this.height;
        var otherleft = otherobj.x;
        var otherright = otherobj.x + otherobj.width;
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + otherobj.height;

        return !(mybottom < othertop || mytop > otherbottom || myright < otherleft || myleft > otherright);
    };
}

function updateGameArea() {
    if (gameOver) {
        myGameArea.clear();
        var ctx = myGameArea.canvas.getContext("2d");
        ctx.drawImage(explosionImage, myGamePiece.x - 15, myGamePiece.y - 15, 60, 60);
        return;
    }

    if (isPaused) return;

    myGameArea.clear();
    myGameArea.frameNo += 1;

    if (myGameArea.frameNo === 1 || everyinterval(150)) {
        var x = myGameArea.canvas.width;
        var minHeight = 20;
        var maxHeight = 200;
        var height = Math.floor(Math.random() * (maxHeight - minHeight + 1) + minHeight);
        var minGap = 50;
        var maxGap = 100;
        var gap = Math.floor(Math.random() * (maxGap - minGap + 1) + minGap);
        myObstacles.push(new gameObject(10, height, poleImage, x, 0, "image"));
        myObstacles.push(new gameObject(10, myGameArea.canvas.height - height - gap, poleImage, x, height + gap, "image"));
    }

    for (var i = 0; i < myObstacles.length; i += 1) {
        myObstacles[i].x += -1;
        myObstacles[i].update();
    }

    for (var i = 0; i < myObstacles.length; i += 1) {
        if (myGamePiece.crashWith(myObstacles[i])) {
            gameOver = true;
            document.getElementById("endScreen").style.display = "block";
            clearInterval(interval);
            return;
        }
    }

    myScore.text = "SCORE: " + myGameArea.frameNo;
    myScore.update();
    myGamePiece.newPos();
    myGamePiece.update();
}

function everyinterval(n) {
    return (myGameArea.frameNo % n === 0);
}

function controlGamePiece(e) {
    if (isPaused) {
        if (e.key === " ") {
            togglePause();
            e.preventDefault();
        }
        return;
    }

    if (e.key === "ArrowUp") {
        myGamePiece.gravitySpeed = -2; // Jump strength
    }
    if (e.key === " ") {
        togglePause();
        e.preventDefault();
    }
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById("pauseButton").innerText = isPaused ? "Continue" : "Pause";
    if (isPaused) {
        myMusic.pause();
    } else {
        myMusic.play().catch(err => {
            console.error("Error playing music: ", err);
        });
    }
}

function submitScore() {
    if (gameOver) {
        const playerName = document.getElementById("playerName").value;
        if (playerName) {
            let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
            leaderboard.push({ name: playerName, score: myGameArea.frameNo });
            leaderboard.sort((a, b) => b.score - a.score); // Sort by score
            localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
            displayLeaderboard();
            resetGame();
        } else {
            alert("Please enter your name!");
        }
    }
}

function displayLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
    leaderboard.sort((a, b) => b.score - a.score);
    let topScores = leaderboard.slice(0, 5); // Get top 5 scores
    let leaderboardHtml = topScores.map(entry => `<p>${entry.name}: ${entry.score}</p>`).join("");
    document.getElementById("leaderboard").innerHTML = leaderboardHtml || "<p>No scores yet.</p>";
}

function resetGame() {
    myObstacles = [];
    myGameArea.frameNo = 0;
    myScore.text = "";
    gameOver = false;
    myMusic.currentTime = 0; // Reset music
    document.getElementById("playerName").value = ""; // Clear name input
}

window.onload = function() {
    displayLeaderboard();
};

const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
const score = document.querySelector(".score--value");
const finalScore = document.querySelector(".final-score > span");
const menu = document.querySelector(".menu-screen");
const buttonPlay = document.querySelector(".btn-play");
const audio = new Audio("../projetos/assets/audio.mp3");
const audioGamerOver = new Audio("../projetos/assets/game-over.mp3");
const audioClique = new Audio("../projetos/assets/clique.mp3");
const size = 30;
// const initialPosition = { x: canvas.width / 2 - size / 2, y: canvas.height / 2 - size / 2 };
const roundedCanvasWidth = Math.floor(canvas.width / size) * size;
const roundedCanvasHeight = Math.floor(canvas.height / size) * size;
const initialPosition = { 
    x: (roundedCanvasWidth / 2 - size / 2) % size === 0 ? roundedCanvasWidth / 2 - size / 2 : (roundedCanvasWidth / 2) - (roundedCanvasWidth % size) / 2,
    y: (roundedCanvasHeight / 2 - size / 2) % size === 0 ? roundedCanvasHeight / 2 - size / 2 : (roundedCanvasHeight / 2) - (roundedCanvasHeight % size) / 2
  };

let snake = [initialPosition]
let audioPlayed = false; // Variável de controle
let wallCollision = false; // Defina a variável wallCollision como global
let selfCollision  = false; // Defina a variável selfCollision  como global

/* document.body.style.overflow = "hidden";

function atualizarEscala() {
  const alturaJanela = window.innerHeight;
  let scale = 1.0; 

  if (alturaJanela > 1920) {
    scale = 1.5;
  } else if (alturaJanela > 1600) {
    scale = 1.4;
  } else if (alturaJanela > 1366) {
    scale = 1.3;
  } else if (alturaJanela > 1000) {
    scale = 1.1;
  } else if (alturaJanela > 900) {
    scale = 1.2;
  } else if (alturaJanela > 800) {
    scale = 1.0;
  } else if (alturaJanela > 700) {
    scale = 0.9;
  } else if (alturaJanela > 600) {
    scale = 0.8;
  } else if (alturaJanela > 550) {
    scale = 0.7;
  } else if (alturaJanela < 500) {
    scale = 0.5;
  }

  document.body.style.transform = `scale(${scale})`;
}

window.addEventListener("resize", atualizarEscala);

atualizarEscala(); */

const incrementScore = () => {
  score.innerText = + score.innerText + 10
}

const randomNumber = (min, max) => {
  return Math.round(Math.random() * (max - min) + min)
}

const randomPositionWidth = () => {
  const number = randomNumber(0, canvas.width - size)
  return Math.round(number / 30) * 30
}

const randomPositionHeight = () => {
    const number = randomNumber(0, canvas.height - size)
    return Math.round(number / 30) * 30
}

const randomColor = () => {
  const red = randomNumber(0, 255)
  const green = randomNumber(0, 255)
  const blue = randomNumber(0, 255)

  return `rgb(${red}, ${green}, ${blue})`
}

const food = {
  x: randomPositionWidth(),
  y: randomPositionHeight(),
  color: randomColor()
}

let direction, loopId

const drawFood = () => {
  const { x, y, color } = food

  ctx.shadowColor = color
  ctx.shadowBlur = 6
  ctx.fillStyle = color
  ctx.fillRect(x, y, size, size)
  ctx.shadowBlur = 0
}

const drawSnake = () => {
  ctx.fillStyle = "#ddd"

  snake.forEach((position, index) => {
    if (index == snake.length - 1) {
      ctx.fillStyle = "white"
    }
    ctx.fillRect(position.x, position.y, size, size)
  })
}

const moveSnake = () => {
  if (!direction) return

  const head = snake[snake.length - 1]

  if (direction == "right") {
    snake.push({ x: head.x + size, y: head.y })
  }

  if (direction == "left") {
    snake.push({ x: head.x - size, y: head.y })
  }

  if (direction == "down") {
    snake.push({ x: head.x, y: head.y + size })
  }

  if (direction == "up") {
    snake.push({ x: head.x, y: head.y - size })
  }

  snake.shift()
}

const drawGrid = () => {
  ctx.lineWidth = 1
  ctx.strokeStyle = "#f1f1f10a"

  for (let i = 30; i < canvas.width; i += 30) {
    ctx.beginPath()
    ctx.lineTo(i, 0)
    ctx.lineTo(i, canvas.width)
    ctx.stroke()

    ctx.beginPath()
    ctx.lineTo(0, i)
    ctx.lineTo(canvas.height, i)
    ctx.stroke()
  }
}

const checkEat = () => {
  const head = snake[snake.length - 1]

  if (head.x == food.x && head.y == food.y) {
    incrementScore()
    snake.push(head)
    audio.play()

    let x = randomPositionWidth()
    let y = randomPositionHeight()

    while (snake.find((position) => position.x == x && position.y == y)) {
      x = randomPositionWidth()
      y = randomPositionHeight()
    }

    food.x = x
    food.y = y
    food.color = randomColor()
  }
}

const checkCollision = () => {
  const head = snake[snake.length - 1]
  const canvasLimitWidth = canvas.width - size
  const canvasLimitHeight = canvas.height - size
  const nextIndex = snake.length - 2

  wallCollision =
    head.x < 0 || head.x > canvasLimitWidth || head.y < 0 || head.y > canvasLimitHeight

  selfCollision = snake.find((position, index) => {
    return index < nextIndex && position.x == head.x && position.y == head.y
  })

  if (wallCollision || selfCollision) {
    gameOver()
    if (!audioPlayed) { // Verifique se o áudio ainda não foi reproduzido
      audioGamerOver.play();
      audioPlayed = true; // Defina a variável para true para indicar que o áudio foi reproduzido
    }
  }
}

const gameOver = () => {
  direction = undefined

  menu.style.display = "flex"
  finalScore.innerText = score.innerText
  canvas.style.filter = "blur(4px)"
}

const gameLoop = () => {
  clearInterval(loopId)

  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawGrid()
  drawFood()
  moveSnake()
  drawSnake()
  checkEat()
  checkCollision()

  loopId = setTimeout(() => {
    gameLoop()
  }, 180)
}

gameLoop()

document.addEventListener("keydown", ({ key }) => {
  if (key == "ArrowRight" && direction !== "left") {
    if (!(wallCollision || selfCollision)) {
      direction = "right"
      audioClique.play()
    }
  }

  if (key == "ArrowLeft" && direction !== "right") {
    if (!(wallCollision || selfCollision)) {
      direction = "left"
      audioClique.play()
    }
  }

  if (key == "ArrowDown" && direction !== "up") {
    if (!(wallCollision || selfCollision)) {
      direction = "down"
      audioClique.play()
    }
  }

  if (key == "ArrowUp" && direction !== "down") {
    if (!(wallCollision || selfCollision)) {
      direction = "up"
      audioClique.play()
    }
  }

  if (key == "Enter" || key == "Return") {
    if (wallCollision || selfCollision) {
      buttonPlay.click() // Simula o clique no botão "Play"
    }
  }
})

buttonPlay.addEventListener("click", () => {
  score.innerText = "00"
  menu.style.display = "none"
  canvas.style.filter = "none"
  audioPlayed = false

  snake = [initialPosition]

})

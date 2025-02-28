import React, { useEffect, useRef, useState } from "react";
import './RacingGame.css';  // Import the CSS file

const RacingGame = () => {
  const canvasRef = useRef(null);
  const [carX, setCarX] = useState(150);
  const [obstacles, setObstacles] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [paused, setPaused] = useState(false);  // Track pause state
  const [level, setLevel] = useState(1);  // Track level of the game

  const carWidth = 50;
  const carHeight = 80;
  const roadWidth = 300;
  const canvasWidth = 400;
  const canvasHeight = 600;
  let gameLoop;

  const carImage = new Image();
  carImage.src = process.env.PUBLIC_URL + "/car.png";  // Ensure the image is in /public folder
  const obstacleImage = new Image();
  obstacleImage.src = process.env.PUBLIC_URL + "/obstacle.png";

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    carImage.onload = () =>
      obstacleImage.onload = () => {
        const moveCar = (e) => {
          if (!gameOver && !paused) {  // Don't allow movement when paused
            if (e.key === "ArrowLeft" && carX > 50) setCarX(carX - 20);
            if (e.key === "ArrowRight" && carX < roadWidth - carWidth + 50)
              setCarX(carX + 20);
          }
        };

        window.addEventListener("keydown", moveCar);

        const checkCollision = () => {
          for (let obstacle of obstacles) {
            if (
              carX < obstacle.x + 50 &&
              carX + carWidth > obstacle.x &&
              canvasHeight - carHeight - 20 < obstacle.y + 80 &&
              canvasHeight - 20 > obstacle.y
            ) {
              setGameOver(true);
              cancelAnimationFrame(gameLoop);  // Stop the game when collision happens
              return;
            }
          }
        };

        const updateScore = () => {
          obstacles.forEach((obstacle) => {
            if (obstacle.y >= canvasHeight) {
              setScore((prevScore) => prevScore + 1);  // Increase score only when passing an obstacle
            }
          });
        };

        const drawGame = () => {
          if (gameOver || paused) return;  // Pause game and prevent further actions when paused or game over

          ctx.clearRect(0, 0, canvasWidth, canvasHeight);  // Clear canvas for new frame

          // Draw road
          ctx.fillStyle = "gray";
          ctx.fillRect(50, 0, roadWidth, canvasHeight);

          // Draw car
          ctx.drawImage(carImage, carX, canvasHeight - carHeight - 20, carWidth, carHeight);

          // Draw obstacles and move them down
          obstacles.forEach((obstacle) => {
            ctx.drawImage(obstacleImage, obstacle.x, obstacle.y, 50, 80);
            obstacle.y += 2 + level * 0.3;  // Slower speed at first and increase with level
          });

          // Filter out obstacles that have gone off-screen
          setObstacles(obstacles.filter((obstacle) => obstacle.y < canvasHeight));

          updateScore();  // Update score when obstacles pass

          if (score % 5 === 0 && score > 0) {
            setLevel((prevLevel) => prevLevel + 1);  // Increase level after 5 points
          }

          checkCollision();  // Check for collision with obstacles
          gameLoop = requestAnimationFrame(drawGame);  // Keep the game loop running
        };

        gameLoop = requestAnimationFrame(drawGame);

        return () => {
          window.removeEventListener("keydown", moveCar);
          cancelAnimationFrame(gameLoop);
        };
      };
  }, [carX, obstacles, gameOver, score, paused, level]);

  useEffect(() => {
    if (!gameOver && !paused) {  // Prevent obstacle spawning when paused or game over
      const spawnInterval = Math.max(2000 - level * 300, 1000);  // Slow spawn rate at first, then increase
      const interval = setInterval(() => {
        setObstacles((prev) => [
          ...prev,
          { x: 50 + Math.random() * (roadWidth - 50), y: -80 },  // Random spawn point
        ]);
      }, spawnInterval);

      return () => clearInterval(interval);
    }
  }, [gameOver, level, paused]);

  const restartGame = () => {
    setCarX(150);
    setObstacles([]);
    setGameOver(false);
    setScore(0);
    setLevel(1);  // Reset level when restarting
    setPaused(false);  // Ensure game is not paused when restarting
  };

  const togglePause = () => {
    setPaused(!paused);  // Toggle pause state
  };

  return (
    <div className="game-container">
      <canvas ref={canvasRef} width={canvasWidth} height={canvasHeight} />
      <div className="score-level">
        <h2>Score: {score}</h2>
        <h2>Level: {level}</h2>
      </div>
      {gameOver && (
        <div className="game-over">
          <h2>Game Over</h2>
          <button onClick={restartGame}>Restart</button>
        </div>
      )}
      <div className="controls">
        <button onClick={togglePause}>
          {paused ? "Resume" : "Pause"}
        </button>
      </div>
    </div>
  );
};

export default RacingGame;

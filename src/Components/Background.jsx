import React, { useState, useEffect, useRef } from 'react';

export default function Background() {
  const [foodPosition, setFoodPosition] = useState({ x: 0, y: 0 });
  const [snakeSegments, setSnakeSegments] = useState([{ x: 0, y: 0 }]);
  const [direction, setDirection] = useState(null);
  const [foodEaten, setFoodEaten] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0); 
  const useref = useRef(null);
  const [paused, setPaused] = useState(false);

  const checkCollision = () => {
    const snakeHead = snakeSegments[0];
    const buffer=10
  
    const containerWidth = window.innerWidth - 65;
    const containerHeight = window.innerHeight - 190;
  
    
    if (
      snakeHead.x < -buffer ||
      snakeHead.x >= containerWidth+buffer ||
      snakeHead.y < -buffer ||
      snakeHead.y >= containerHeight+buffer
    ) {
      setGameOver(true);
      setGameStarted(false);
      return;
    }
  
    for (let i = 1; i < snakeSegments.length; i++) {
      if (snakeHead.x === snakeSegments[i].x && snakeHead.y === snakeSegments[i].y) {
        setGameOver(true);
        return;
      }
    }
  
    if (
      snakeHead.x < foodPosition.x + 20 &&
      snakeHead.x + 20 > foodPosition.x &&
      snakeHead.y < foodPosition.y + 20 &&
      snakeHead.y + 20 > foodPosition.y
    ) {
      setScore(score + 1);
      let newX, newY;
      do {
        newX = Math.floor(Math.random() * (window.innerWidth - 100));
        newY = Math.floor(Math.random() * (window.innerHeight - 100));
      } while (
        newX < snakeHead.x + 20 &&
        newX + 20 > snakeHead.x &&
        newY < snakeHead.y + 20 &&
        newY + 20 > snakeHead.y
      );
      setFoodPosition({ x: newX, y: newY });
      setFoodEaten(true);
    }
  };
  
  useEffect(() => {
    const handleKey = (event) => {
      const { keyCode } = event;

      if (!gameStarted) {
        if ([37, 38, 39, 40].includes(keyCode)) {
          setGameStarted(true);
        }
        return;
      }

      if (keyCode === 37 && direction !== 'RIGHT') {
        setDirection('LEFT');
      } else if (keyCode === 38 && direction !== 'DOWN') {
        setDirection('UP');
      } else if (keyCode === 39 && direction !== 'LEFT') {
        setDirection('RIGHT');
      } else if (keyCode === 40 && direction !== 'UP') {
        setDirection('DOWN');
      }
      else if (keyCode === 80) { 
        setPaused(!paused);
      }
    };

    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('keydown', handleKey);
    };
  }, [direction, gameStarted, paused]);


  useEffect(() => {
    const moveSnake = () => {
      if (!gameStarted || !direction || gameOver || paused) return;

      const newSegments = [...snakeSegments];
      let newHead = { ...newSegments[0] };

      if (direction === 'RIGHT') {
        newHead.x += 20;
      } else if (direction === 'LEFT') {
        newHead.x -= 20;
      } else if (direction === 'UP') {
        newHead.y -= 20;
      } else if (direction === 'DOWN') {
        newHead.y += 20;
      }

      newSegments.unshift(newHead);
      if (!foodEaten) {
        newSegments.pop();
      } else {
        setFoodEaten(false);
      }

      setSnakeSegments(newSegments);
    };

    const interval = setInterval(() => {
      moveSnake();
      checkCollision();
    }, 200);

    return () => clearInterval(interval);
  }, [direction, snakeSegments, foodEaten, gameStarted, gameOver, paused]);

  useEffect(() => {
    const randomPosition = () => {
      const randomX = Math.floor(Math.random() * (window.innerWidth - 100));
      const randomY = Math.floor(Math.random() * (window.innerHeight - 100));
      setFoodPosition({ x: randomX, y: randomY });
    };
    randomPosition();

    const handleResize = () => {
      randomPosition();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (gameOver) {
      setSnakeSegments([{ x: 0, y: 0 }]);
      setDirection(null);
      setFoodEaten(false);
      setGameStarted(false);
      setGameOver(false);
      setScore(0);
    }
  }, [gameOver]);

  const handleStartGame = () => {
    setGameStarted(true);
  };

  const handleRestartGame = () => {
    setSnakeSegments([{ x: 0, y: 0 }]);
    setDirection(null);
    setFoodEaten(false);
    setGameStarted(false);
    setGameOver(false);
    setScore(0); 
  };
  const handleMove = (newDirection) => {
    if (!gameStarted || gameOver || paused) return;
    setDirection(newDirection);
  };

  return (
    <div className='md:flex md:justify-center  absolute w-full h-screen bg-[#184089]'>
      <div className='flex justify-center relative top-8 items-center w-[calc(100%-65px)] bg-[#4b93af] h-[calc(100%-190px)]
      rounded-2xl relative  md:mx-0 md:my-0' ref={useref}>
        <img
          className='food size-4 absolute'
          src='apple.png'
          alt=''
          style={{ top: `${foodPosition.y}px`, left: `${foodPosition.x}px` }}
        />
        {snakeSegments.map((segment, index) => (
          <div
            key={index}
            className='snake md:block size-5 bg-black rounded-2xl absolute'
            style={{
              top: `${segment.y}px`,
              left: `${segment.x}px`,
              transform: `rotate(${getSnakeRotation(index)})`
            }}
          ></div>
        ))}
        {(!gameStarted || gameOver) && (
          <div className="overlay" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            {gameOver ? (
              <div className="game-over text-center">
                <p>Game Over!</p>
                <button className="restart-button" onClick={handleRestartGame}>
                  Restart Game
                </button>
              </div>
            ) : (
              <button 
                className="start-button rounded-xl bg-white  py-4 px-4 "  
                onClick={handleStartGame}>
                Start Game
              </button>
            )}
          </div>
        )}
      </div>
      <div className='score-card absolute bottom-4 left-4 text-white'>
          Score: {score}
        </div>
        <button className="pause-button absolute bottom-4 right-4 text-black rounded-xl bg-white px-1 py-1"
         onClick={() => setPaused(!paused)}>
          {paused ? 'Resume' : 'Pause'}
        </button>
        <div className="button-container absolute bottom-3 left-90   center">
          <button className="move-button ml-8 rounded-xl bg-white  py-2 px-2" onClick={() => handleMove('UP')}>
            <span>&#x2B06;</span></button>
          <div>
            <button className="move-button rounded-xl bg-white  py-1.5 px-1.5 " onClick={() => handleMove('LEFT')}>
            <span>&#x2B05;</span></button>
            <button className="move-button ml-8 rounded-xl bg-white  py-1.5 px-1.5" onClick={() => handleMove('RIGHT')}>
            <span>&#x27A1;</span></button>
          </div>
          <button className="move-button  ml-8 rounded-xl bg-white  py-2 px-2" onClick={() => handleMove('DOWN')}>
          <span>&#x2b07;</span></button>
        </div>
    </div>
  );
}

function getSnakeRotation(index) {
  if (index === 0) {
    return '0deg';
  } else {
    return '0deg';
  }
}

import React, { useState, useEffect } from 'react';
// import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card.tsx';
// import { Button } from './components/ui/button.tsx';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';
import './App.css';

const COMBINATIONS = {
  ones: { label: 'Одиниці', scoreFn: (dice) => dice.filter(d => d === 1).reduce((a, b) => a + b, 0) },
  twos: { label: 'Двійки', scoreFn: (dice) => dice.filter(d => d === 2).reduce((a, b) => a + b, 0) },
  threes: { label: 'Трійки', scoreFn: (dice) => dice.filter(d => d === 3).reduce((a, b) => a + b, 0) },
  fours: { label: 'Четвірки', scoreFn: (dice) => dice.filter(d => d === 4).reduce((a, b) => a + b, 0) },
  fives: { label: 'П\'ятірки', scoreFn: (dice) => dice.filter(d => d === 5).reduce((a, b) => a + b, 0) },
  sixes: { label: 'Шістки', scoreFn: (dice) => dice.filter(d => d === 6).reduce((a, b) => a + b, 0) },
  threeOfKind: { label: 'Три одного типу', scoreFn: (dice) => hasNOfKind(dice, 3) ? sumDice(dice) : 0 },
  fourOfKind: { label: 'Каре', scoreFn: (dice) => hasNOfKind(dice, 4) ? sumDice(dice) : 0 },
  fullHouse: { label: 'Фул-хаус', scoreFn: (dice) => isFullHouse(dice) ? 25 : 0 },
  smallStraight: { label: 'Малий стріт', scoreFn: (dice) => isSmallStraight(dice) ? 30 : 0 },
  largeStraight: { label: 'Великий стріт', scoreFn: (dice) => isLargeStraight(dice) ? 40 : 0 },
  yahtzee: { label: 'Яцзи', scoreFn: (dice) => hasNOfKind(dice, 5) ? 50 : 0 },
  chance: { label: 'Шанс', scoreFn: (dice) => sumDice(dice) }
};

const DiceIcon = ({ value, selected, onClick }) => {
  const DiceComponent = {
    1: Dice1,
    2: Dice2,
    3: Dice3,
    4: Dice4,
    5: Dice5,
    6: Dice6
  }[value];

  return (
    <div
      className={`dice ${selected ? 'dice-selected' : ''}`}
      onClick={onClick}
    >
      <DiceComponent size={48} />
    </div>
  );
};

const hasNOfKind = (dice, n) => {
  const counts = new Array(7).fill(0);
  dice.forEach(d => counts[d]++);
  return counts.some(count => count >= n);
};

const sumDice = (dice) => dice.reduce((a, b) => a + b, 0);

const isFullHouse = (dice) => {
  const counts = new Array(7).fill(0);
  dice.forEach(d => counts[d]++);
  return counts.includes(3) && counts.includes(2);
};

const isSmallStraight = (dice) => {
  const sorted = [...new Set(dice)].sort((a, b) => a - b);
  return sorted.join(',').includes('1,2,3,4') || 
         sorted.join(',').includes('2,3,4,5') || 
         sorted.join(',').includes('3,4,5,6');
};

const isLargeStraight = (dice) => {
  const sorted = [...new Set(dice)].sort((a, b) => a - b);
  return sorted.join(',').includes('1,2,3,4,5') || 
         sorted.join(',').includes('2,3,4,5,6');
};

const calculateBestMove = (dice, rolls, difficulty, scores) => {
  if (difficulty === 'easy') {
    return dice.map(() => Math.random() > 0.5);
  }

  if (difficulty === 'medium') {
    const counts = new Array(7).fill(0);
    dice.forEach(d => counts[d]++);
    const maxCount = Math.max(...counts);
    return dice.map(d => counts[d] === maxCount);
  }

  const counts = new Array(7).fill(0);
  dice.forEach(d => counts[d]++);
  
  if (Math.max(...counts) >= 3) {
    const targetValue = counts.indexOf(Math.max(...counts));
    return dice.map(d => d === targetValue);
  }
  
  const uniqueDice = [...new Set(dice)].sort();
  if (uniqueDice.length >= 4) {
    return dice.map(d => uniqueDice.includes(d));
  }

  return dice.map(() => false);
};

const YahtzeeGame = () => {
  const [dice, setDice] = useState([1, 1, 1, 1, 1]);
  const [selectedDice, setSelectedDice] = useState([false, false, false, false, false]);
  const [rolls, setRolls] = useState(3);
  const [scores, setScores] = useState({});
  const [computerScores, setComputerScores] = useState({});
  const [isRolling, setIsRolling] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState('human');
  const [difficulty, setDifficulty] = useState('easy');
  const [gameOver, setGameOver] = useState(false);
  const [isComputerThinking, setIsComputerThinking] = useState(false);

  useEffect(() => {
    const allCombinations = Object.keys(COMBINATIONS).length;
    if (
      Object.keys(scores).length === allCombinations &&
      Object.keys(computerScores).length === allCombinations
    ) {
      setGameOver(true);
    }
  }, [scores, computerScores]);

  useEffect(() => {
    if (currentPlayer === 'computer' && !isRolling && !isComputerThinking) {
      setIsComputerThinking(true);
      setTimeout(() => {
        computerTurn();
        setIsComputerThinking(false);
      }, 1500);
    }
  }, [currentPlayer, isRolling, isComputerThinking]);

  const toggleDice = (index) => {
    if (rolls < 3 && currentPlayer === 'human') {
      const newSelected = [...selectedDice];
      newSelected[index] = !newSelected[index];
      setSelectedDice(newSelected);
    }
  };

  const computerTurn = async () => {
    if (rolls === 3) {
      await rollDice();
      return;
    }
  
    if (rolls > 0) {
      const bestMove = calculateBestMove(dice, rolls, difficulty, computerScores);
      setSelectedDice(bestMove);
      await rollDice();
      return;
    }
  
    if (rolls === 0) {
      const availableCombinations = Object.keys(COMBINATIONS)
        .filter(key => !(key in computerScores));
  
      if (availableCombinations.length > 0) {
        let bestScore = -1;
        let bestCombination = availableCombinations[0];
  
        availableCombinations.forEach(combination => {
          const score = COMBINATIONS[combination].scoreFn(dice);
          if (score > bestScore) {
            bestScore = score;
            bestCombination = combination;
          }
        });
  
        setTimeout(() => {
          scoreRound(bestCombination, 'computer');
          // Сбрасываем состояние выделенных кубиков
          setSelectedDice([false, false, false, false, false]);
        }, 1000);
      }
    }
  };
  

  const rollDice = () => {
    if (rolls > 0 && !isRolling) {
      setIsRolling(true);
  
      const animationInterval = setInterval(() => {
        setDice(dice.map(() => Math.floor(Math.random() * 6) + 1));
      }, 50);
  
      return new Promise(resolve => {
        setTimeout(() => {
          clearInterval(animationInterval);
          const newDice = dice.map((value, index) => 
            selectedDice[index] ? value : Math.floor(Math.random() * 6) + 1
          );
          setDice(newDice);
          setRolls(rolls - 1);
          setIsRolling(false);
          resolve();
        }, 500);
      });
    }
    return Promise.resolve();
  };

  const scoreRound = (combination, player = 'human') => {
    if (!isRolling) {
      const targetScores = player === 'human' ? scores : computerScores;
      const setTargetScores = player === 'human' ? setScores : setComputerScores;
  
      if (!(combination in targetScores)) {
        const newScores = { ...targetScores };
        newScores[combination] = COMBINATIONS[combination].scoreFn(dice);
        setTargetScores(newScores);
  
        // Сбрасываем кубики и выделение
        setDice([1, 1, 1, 1, 1]);
        setSelectedDice([false, false, false, false, false]);
        setRolls(3);
  
        const allCombinations = Object.keys(COMBINATIONS).length;
        const isLastMove =
          (player === 'human' && Object.keys(scores).length === allCombinations - 1) ||
          (player === 'computer' && Object.keys(computerScores).length === allCombinations - 1);
  
        if (isLastMove) {
          setTimeout(() => {
            setGameOver(true);
          }, 500);
        } else {
          setCurrentPlayer(player === 'human' ? 'computer' : 'human');
        }
      }
    }
  };
  

  const calculateTotal = (playerScores) => {
    let total = Object.values(playerScores).reduce((a, b) => a + b, 0);
    const upperTotal = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes']
      .map(key => playerScores[key] || 0)
      .reduce((a, b) => a + b, 0);
    
    if (upperTotal >= 63) {
      total += 35;
    }
    
    return total;
  };

  const getWinner = () => {
    const humanTotal = calculateTotal(scores);
    const computerTotal = calculateTotal(computerScores);
    
    if (humanTotal > computerTotal) return 'Гравець переміг!';
    if (computerTotal > humanTotal) return 'Комп\'ютер переміг!';
    return 'Нічия!';
  };

  const resetGame = () => {
    setDice([1, 1, 1, 1, 1]);
    setSelectedDice([false, false, false, false, false]);
    setRolls(3);
    setScores({});
    setComputerScores({});
    setCurrentPlayer('human');
    setGameOver(false);
  };

  return (
    <div className="yahtzee-container">
      <div className="yahtzee-card">
        <header className="yahtzee-header">
          <h1 className="yahtzee-title">Яцзи (Yahtzee)</h1>
        </header>
        <div className="yahtzee-content">
          {gameOver ? (
            <div className="game-over">
              <h2 className="winner-message">{getWinner()}</h2>
              <div className="final-score">
                <p>Гравець: {calculateTotal(scores)}</p>
                <p>Комп'ютер: {calculateTotal(computerScores)}</p>
              </div>
              <button className="btn-primary" onClick={resetGame}>
                Нова гра
              </button>
            </div>
          ) : (
            <>
              <div className="game-info">
                <span>Хід: {currentPlayer === 'human' ? 'Гравець' : 'Комп\'ютер'}</span>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="difficulty-select"
                >
                  <option value="easy">Легкий</option>
                  <option value="medium">Середній</option>
                  <option value="hard">Складний</option>
                </select>
              </div>
              <div className="dice-container">
                {dice.map((value, index) => (
                  <DiceIcon
                    key={index}
                    value={value}
                    selected={selectedDice[index]}
                    onClick={() => toggleDice(index)}
                  />
                ))}
              </div>
              <button
                className="btn-primary"
                onClick={() => rollDice()}
                disabled={rolls === 0 || isRolling || currentPlayer === 'computer'}
              >
                Кинути кості ({rolls} спроб залишилось)
              </button>
              <div className="scores-grid">
                <div className="scores-section">
                  <h3>Гравець</h3>
                  {Object.entries(COMBINATIONS).map(([key, { label }]) => (
                    <button
                      key={key}
                      className={`score-button ${key in scores ? 'score-button-disabled' : ''}`}
                      onClick={() => scoreRound(key)}
                      disabled={key in scores || rolls === 3 || isRolling || currentPlayer !== 'human'}
                    >
                      <span>{label}</span>
                      <span>{scores[key] || '-'}</span>
                    </button>
                  ))}
                  <div className="total-score">Рахунок: {calculateTotal(scores)}</div>
                </div>
                <div className="scores-section">
                  <h3>Комп'ютер</h3>
                  {Object.entries(COMBINATIONS).map(([key, { label }]) => (
                    <button
                      key={key}
                      className="score-button score-button-disabled"
                      disabled
                    >
                      <span>{label}</span>
                      <span>{computerScores[key] || '-'}</span>
                    </button>
                  ))}
                  <div className="total-score">Рахунок: {calculateTotal(computerScores)}</div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default YahtzeeGame;
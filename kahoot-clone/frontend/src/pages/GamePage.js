import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import socket from '../socket';
import './GamePage.css';

const GamePage = () => {
  const { gameCode } = useParams();
  const [gameState, setGameState] = useState('waiting'); // waiting, question, reveal, scores, game_over
  const [question, setQuestion] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [answerSubmitted, setAnswerSubmitted] = useState(null); // Guarda o ID da opção submetida
  const [correctOptionId, setCorrectOptionId] = useState(null);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    socket.on('next_question', (currentQuestion) => {
      setQuestion(currentQuestion);
      setTimeLeft(currentQuestion.timeLimit);
      setAnswerSubmitted(null);
      setCorrectOptionId(null);
      setGameState('question');
    });

    socket.on('question_end', ({ correctOptionId }) => {
      setCorrectOptionId(correctOptionId);
      setGameState('reveal');
    });

    socket.on('update_scores', (newScores) => {
      setScores(newScores);
      setGameState('scores');
    });

    socket.on('game_over', (finalScores) => {
      setScores(finalScores);
      setGameState('game_over');
    });

    return () => {
      socket.off('next_question');
      socket.off('question_end');
      socket.off('update_scores');
      socket.off('game_over');
    };
  }, []);

  useEffect(() => {
    if (timeLeft === 0 && gameState === 'question') {
      // O temporizador no servidor é a fonte da verdade, mas isto melhora a UI
      setGameState('reveal');
    }
    if (timeLeft === null || timeLeft === 0) return;
    const intervalId = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(intervalId);
  }, [timeLeft, gameState]);

  const handleAnswerSubmit = (optionId) => {
    if (!answerSubmitted) {
      setAnswerSubmitted(optionId);
      socket.emit('submit_answer', { gameCode, optionId, timeLeft });
    }
  };

  const renderContent = () => {
    switch (gameState) {
      case 'question':
      case 'reveal':
        if (!question) return null;
        return (
          <>
            <div className="game-header">
              <span>Tempo: {timeLeft}</span>
              <span>Pergunta {question.order}</span>
            </div>
            <div className="question-text"><h2>{question.text}</h2></div>
            <div className="options-grid">
              {question.options.map((option, index) => {
                let buttonClass = `option-button option-${index}`;
                if (gameState === 'reveal') {
                  if (option.id === correctOptionId) {
                    buttonClass += ' correct';
                  } else if (option.id === answerSubmitted) {
                    buttonClass += ' incorrect';
                  } else {
                    buttonClass += ' faded';
                  }
                }
                return (
                  <button key={option.id} className={buttonClass} onClick={() => handleAnswerSubmit(option.id)} disabled={answerSubmitted}>
                    {option.text}
                  </button>
                );
              })}
            </div>
            {answerSubmitted && gameState === 'question' && <div className="feedback-message">Resposta enviada!</div>}
          </>
        );
      case 'scores':
        return (
          <div className="scores-container">
            <h1>Placar</h1>
            <ol>
              {scores.map((player, index) => (
                <li key={index}><span>{player.nickname}</span> <span>{player.score}</span></li>
              ))}
            </ol>
          </div>
        );
      case 'game_over':
        return (
          <div className="scores-container">
            <h1>Fim de Jogo!</h1>
            <h2>Placar Final</h2>
            <ol>
              {scores.map((player, index) => (
                <li key={index} className={`podium-${index}`}>
                  <span>{index + 1}. {player.nickname}</span> <span>{player.score}</span>
                </li>
              ))}
            </ol>
          </div>
        );
      default:
        return <h1>A aguardar o início do jogo...</h1>;
    }
  };

  return <div className="game-container">{renderContent()}</div>;
};

export default GamePage;
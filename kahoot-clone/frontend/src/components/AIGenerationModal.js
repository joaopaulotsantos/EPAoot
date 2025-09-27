import React, { useState } from 'react';
import './AIGenerationModal.css'; // Criaremos este ficheiro para os estilos

const AIGenerationModal = ({ show, onClose, onQuestionsGenerated }) => {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic) {
      setError('Por favor, insira um tema.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, numQuestions }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Não foi possível gerar as perguntas.');
      }

      onQuestionsGenerated(data.questions); // Envia as perguntas geradas para o componente pai
      onClose(); // Fecha o modal

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Gerar Perguntas com IA</h2>
        <p>Insira um tema e o número de perguntas que deseja gerar. A nossa IA fará o resto!</p>

        {error && <p className="modal-error">{error}</p>}

        <div className="modal-form-group">
          <label htmlFor="topic">Tema:</label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ex: História de Portugal"
          />
        </div>

        <div className="modal-form-group">
          <label htmlFor="numQuestions">Número de Perguntas:</label>
          <input
            type="number"
            id="numQuestions"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            min="1"
            max="10"
          />
        </div>

        <div className="modal-actions">
          <button onClick={onClose} disabled={isLoading} className="button-secondary">
            Cancelar
          </button>
          <button onClick={handleGenerate} disabled={isLoading} className="button-primary">
            {isLoading ? 'A gerar...' : 'Gerar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIGenerationModal;
import React, { useState } from 'react';

const AddQuestionForm = ({ gameId, onQuestionAdded }) => {
  const [text, setText] = useState('');
  const [timeLimit, setTimeLimit] = useState(20);
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(null);
  const [error, setError] = useState('');

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index].text = value;
    setOptions(newOptions);
  };

  const handleAddOption = () => {
    if (options.length < 4) { // Limite de 4 opções como no Kahoot
      setOptions([...options, { text: '', isCorrect: false }]);
    }
  };

  const handleRemoveOption = (index) => {
    if (options.length > 2) { // Mínimo de 2 opções
      const newOptions = options.filter((_, i) => i !== index);
      // Se a opção removida era a correta, resetamos a seleção
      if (index === correctOptionIndex) {
        setCorrectOptionIndex(null);
      }
      setOptions(newOptions);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (correctOptionIndex === null) {
      setError('Por favor, marque uma opção como correta.');
      return;
    }

    const questionData = {
      text,
      timeLimit: Number(timeLimit),
      gameId,
      order: 1, // A lógica de ordenação será implementada mais tarde
      options: options.map((opt, index) => ({
        text: opt.text,
        isCorrect: index === correctOptionIndex,
      })),
    };

    try {
      const response = await fetch('http://localhost:3001/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) throw new Error('Falha ao criar a pergunta.');

      const newQuestion = await response.json();
      onQuestionAdded(newQuestion); // Notifica o componente pai

      // Limpar o formulário para a próxima pergunta
      setText('');
      setTimeLimit(20);
      setOptions([{ text: '', isCorrect: false }, { text: '', isCorrect: false }]);
      setCorrectOptionIndex(null);

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ borderTop: '2px solid #eee', paddingTop: '1rem' }}>
      <h4>Adicionar Nova Pergunta</h4>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div>
        <label>Texto da Pergunta:</label>
        <input type="text" value={text} onChange={(e) => setText(e.target.value)} required />
      </div>

      <div>
        <label>Tempo Limite (segundos):</label>
        <input type="number" value={timeLimit} onChange={(e) => setTimeLimit(e.target.value)} required min="5" />
      </div>

      <div>
        <label>Opções de Resposta (marque a correta):</label>
        {options.map((opt, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <input
              type="radio"
              name="correct_option"
              checked={correctOptionIndex === index}
              onChange={() => setCorrectOptionIndex(index)}
              required
            />
            <input
              type="text"
              placeholder={`Opção ${index + 1}`}
              value={opt.text}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              required
              style={{ flexGrow: 1, marginLeft: '8px' }}
            />
            {options.length > 2 && (
              <button type="button" onClick={() => handleRemoveOption(index)} style={{ marginLeft: '8px' }}>X</button>
            )}
          </div>
        ))}
        {options.length < 4 && (
          <button type="button" onClick={handleAddOption}>+ Adicionar Opção</button>
        )}
      </div>

      <button type="submit" style={{ marginTop: '1rem' }}>Guardar Pergunta</button>
    </form>
  );
};

export default AddQuestionForm;
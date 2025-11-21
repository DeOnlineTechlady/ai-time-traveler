import React, { useState } from 'react';
import { DECADES } from './constants.ts';
import { generateTimeTravelImage } from './services/geminiService.js';

function App() {
  const [selectedDecade, setSelectedDecade] = useState('');
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!file || !selectedDecade) {
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result.split(',')[1];
      try {
        const res = await generateTimeTravelImage(base64, selectedDecade);
        setResult(res);
      } catch (error) {
        console.error(error);
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    React.createElement(
      'div',
      { style: { color: 'white', padding: '20px' } },
      [
        React.createElement('h1', { key: 'title' }, 'AI Time Traveler'),
        React.createElement('input', {
          key: 'file',
          type: 'file',
          accept: 'image/*',
          onChange: (e) => setFile(e.target.files[0])
        }),
        React.createElement(
          'select',
          {
            key: 'select',
            value: selectedDecade,
            onChange: (e) => setSelectedDecade(e.target.value)
          },
          [
            React.createElement('option', { key: 'placeholder', value: '' }, 'Select decade'),
            ...DECADES.map((decade) =>
              React.createElement('option', { key: decade, value: decade }, decade)
            )
          ]
        ),
        React.createElement(
          'button',
          {
            key: 'button',
            onClick: handleGenerate,
            disabled: loading
          },
          loading ? 'Generating...' : 'Time Travel!'
        ),
        result &&
          React.createElement(
            'div',
            { key: 'result', style: { marginTop: '20px' } },
            [
              React.createElement('img', { key: 'img', src: result.url, alt: 'Result', style: { maxWidth: '100%' } }),
              React.createElement('p', { key: 'desc' }, result.description)
            ]
          )
      ]
    )
  );
}

export default App;

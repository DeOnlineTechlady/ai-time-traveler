import React, { useState } from 'react';
import { DECADES } from './constants';
import { generateTimeTravelImage, TimeTravelResult } from './services/geminiService';

const App: React.FC = () => {
  const [selectedDecade, setSelectedDecade] = useState(DECADES[0]);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<TimeTravelResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        const [meta, base64] = dataUrl.split(',');
        const match = meta.match(/data:(.*?);/);
        const mimeType = match ? match[1] : '';
        const res = await generateTimeTravelImage(base64, mimeType, selectedDecade);
        setResult(res);
        setLoading(false);
      };
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto text-center">
      <h1 className="text-3xl font-bold mb-4">AI Time Traveler</h1>
      <p className="mb-4">Upload a photo and travel through time by choosing a decade.</p>
      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
      <select
        value={selectedDecade}
        onChange={(e) => setSelectedDecade(e.target.value)}
        className="mb-4"
      >
        {DECADES.map((decade) => (
          <option key={decade} value={decade}>
            {decade}
          </option>
        ))}
      </select>
      <button
        onClick={handleGenerate}
        disabled={loading || !file}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading ? 'Generating...' : 'Time Travel!'}
      </button>
      {result && (
        <div className="mt-6">
          <img src={result.imageUrl} alt="Time Travel Result" className="mb-2 mx-auto" />
          <p>{result.description}</p>
        </div>
      )}
    </div>
  );
};

export default App;

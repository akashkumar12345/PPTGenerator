import React, { useState } from 'react';
async function fetchGeminiResponse(prompt) {
  return {
    title: "Sample Slide Title",
    bullets: ["Point 1", "Point 2", "Point 3"],
  };
}
export default function AiChatPptApp() {
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [pptx, setPptx] = useState(null);
  const [pptPreview, setPptPreview] = useState('');

  // Handle sending prompt to AI and generating PPT content
  const handleSend = async () => {
    const aiResponse = await fetchGeminiResponse(chatInput);

    // Update chat history
    setChatHistory([...chatHistory, { user: chatInput, ai: aiResponse }]);
    setChatInput('');
  };

  // Function to download generated ppt
  const downloadPpt = () => {
    if (pptx) pptx.writeFile({ fileName: "presentation.pptx" });
  };

  return (
    <div>
      <h1>AI Chat PPT Generator</h1>
      <div>
        {chatHistory.map((entry, idx) => (
          <div key={idx}>
            <b>User:</b> {entry.user}<br />
            <b>AI:</b> {entry.ai.title}<br />
          </div>
        ))}
      </div>
      <textarea
        value={chatInput}
        onChange={e => setChatInput(e.target.value)}
        placeholder="Enter your prompt"
      ></textarea>
      <button onClick={handleSend}>Send</button>
      <button onClick={downloadPpt}>Download PPT</button>
      <div>
        <h2>PPT Preview</h2>
        {/* Basic preview of base64 string */}
        {pptPreview && <textarea value={pptPreview} readOnly rows={50} cols={60}></textarea>}
      </div>
    </div>
  );
}


import React, { useState } from 'react';
import Editor from './Editor';
import Preview from './Preview';
import axios from 'axios';
import './App.css';

const App = () => {
  // State to store the email template
  const [template, setTemplate] = useState({
    title: '',
    content: '',
    footer: '',
    imageUrl: '',
  });

  // Save the template to the backend
  const saveTemplate = async () => {
    try {
      await axios.post('http://localhost:5000/api/emails/uploadEmailConfig', template);
      alert('Template saved successfully!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template.');
    }
  };

  // Download the email template
  const downloadTemplate = async () => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/emails/renderAndDownloadTemplate',
        template,
        { responseType: 'blob' }
      );

      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'email_template.html');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template.');
    }
  };

  return (
    <div className="App">
      <h1>Email Builder</h1>
      {/* Editor Component */}
      <Editor template={template} setTemplate={setTemplate} />
    </div>
  );
};

export default App;

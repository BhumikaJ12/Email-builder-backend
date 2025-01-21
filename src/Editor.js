import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Editor.css';

const Editor = ({ template, setTemplate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewVisible, setIsPreviewVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('title');
  const [styles, setStyles] = useState({
    title: { color: '#ffffff', fontSize: '24px', textAlign: 'center' },
    content: { color: '#ffffff', fontSize: '18px', textAlign: 'left' },
    footer: { color: '#ffffff', fontSize: '16px', textAlign: 'right' },
  });

  const handleStyleChange = (key, value) => {
    setStyles((prev) => ({
      ...prev,
      [activeSection]: { ...prev[activeSection], [key]: value },
    }));
  };

  // Handle arrow key movements for sections
  useEffect(() => {
    const handleKeydown = (event) => {
      if (event.key === 'ArrowUp') {
        moveSectionUp();
      } else if (event.key === 'ArrowDown') {
        moveSectionDown();
      }
    };

    // Attach keydown event listener
    document.addEventListener('keydown', handleKeydown);

    // Cleanup the event listener on unmount
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  }, [template]);

  const moveSectionUp = () => {
    const sections = ['title', 'content', 'footer'];
    const index = sections.indexOf(activeSection);
    if (index > 0) {
      const newSections = [...sections];
      [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]]; // Swap positions
      const newTemplate = {
        ...template,
        title: newSections[0] === 'title' ? template.title : template.content,
        content: newSections[1] === 'content' ? template.content : template.footer,
      };
      setTemplate(newTemplate);
    }
  };

  const moveSectionDown = () => {
    const sections = ['title', 'content', 'footer'];
    const index = sections.indexOf(activeSection);
    if (index < sections.length - 1) {
      const newSections = [...sections];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]]; // Swap positions
      const newTemplate = {
        ...template,
        title: newSections[0] === 'title' ? template.title : template.content,
        content: newSections[1] === 'content' ? template.content : template.footer,
      };
      setTemplate(newTemplate);
    }
  };

  // Fetch the email layout from the backend
  const fetchLayout = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('http://localhost:5000/api/emails/getEmailLayout');
      console.log(res.data); // Layout HTML
    } catch (error) {
      console.error('Error fetching layout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLayout();
  }, []);

  // Save the template to the backend
  const saveTemplate = async () => {
    setIsLoading(true);
    try {
      await axios.post('http://localhost:5000/api/emails/uploadEmailConfig', template);
      alert('Template saved!');
    } catch (error) {
      console.error('Error saving template:', error);
      alert('Failed to save template.');
    } finally {
      setIsLoading(false);
    }
  };

  // Download the template as HTML
  const downloadTemplate = async () => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/emails/renderAndDownloadTemplate',
        { ...template, styles },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'email_template.html');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Failed to download template.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const formData = new FormData();
    formData.append('image', e.target.files[0]);

    try {
      const res = await axios.post('http://localhost:5000/api/emails/uploadImage', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setTemplate({ ...template, imageUrl: res.data.imageUrl });
    } catch (error) {
      console.error('Image upload failed:', error);
      alert('Image upload failed.');
    }
  };

  return (
    <div className="editor-container">
      {/* Main Content */}
      <div className="editor-main">
        <input
          type="text"
          name="title"
          placeholder="Enter Title"
          value={template.title}
          onChange={(e) => setTemplate({ ...template, title: e.target.value })}
          style={styles.title}
        />
        <textarea
          name="content"
          placeholder="Enter Content"
          value={template.content}
          onChange={(e) => setTemplate({ ...template, content: e.target.value })}
          style={styles.content}
        />
        <input
          type="text"
          name="footer"
          placeholder="Enter Footer"
          value={template.footer}
          onChange={(e) => setTemplate({ ...template, footer: e.target.value })}
          style={styles.footer}
        />
        <input type="file" onChange={handleImageUpload} />
        <div className="button-container">
          <button onClick={saveTemplate} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Template'}
          </button>
          <button onClick={() => setIsPreviewVisible(true)}>Preview Template</button>
          <button onClick={downloadTemplate} disabled={isLoading}>
            {isLoading ? 'Downloading...' : 'Download Template'}
          </button>
        </div>
      </div>

        
      {/* Preview Modal */}
      {isPreviewVisible && (
        <div className="preview-modal">
          <div className="preview-card">
            <button className="close-preview" onClick={() => setIsPreviewVisible(false)}>
              Close Preview
            </button>
            <h1>{template.title}</h1>
            <p>{template.content}</p>
            <footer>{template.footer}</footer>
            {template.imageUrl && (
              <img src={`http://localhost:5000${template.imageUrl}`} alt="Uploaded" />
            )}
          </div>
        </div>
      )}
  
      {/* Control Panel */}
      <div className="control-panel">
        <h3>Edit {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Styles</h3>
        <label>
          Color:
          <input
            type="color"
            value={styles[activeSection].color}
            onChange={(e) => handleStyleChange('color', e.target.value)}
          />
        </label>
        <label>
          Font Size:
          <input
            type="number"
            value={parseInt(styles[activeSection].fontSize, 10)}
            onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
          />
        </label>
        <label>
          Alignment:
          <select
            value={styles[activeSection].textAlign}
            onChange={(e) => handleStyleChange('textAlign', e.target.value)}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
        <div className="section-selector">
          <button onClick={() => setActiveSection('title')}>Title</button>
          <button onClick={() => setActiveSection('content')}>Content</button>
          <button onClick={() => setActiveSection('footer')}>Footer</button>
        </div>
      </div>
    </div>
  );  
};

export default Editor;
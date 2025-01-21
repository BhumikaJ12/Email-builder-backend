import React from 'react';

const Preview = ({ template }) => {
  return (
    <div className="preview">
      <h2>Preview</h2>
      <div className="email-container">
        <h1>{template.title}</h1>
        <p>{template.content}</p>
        <footer>{template.footer}</footer>
        {template.imageUrl && (
          <img src={`http://localhost:5000${template.imageUrl}`} alt="Uploaded" />
        )}
      </div>
    </div>
  );
};

export default Preview;

import React from 'react';
import '../fonts.css';
import './TypographyExample.css';

export const TypographyExample: React.FC = () => {
  return (
    <div className="typography-example">
      <h2 className="example-section-title">Typography Examples</h2>
      
      <div className="example-section">
        <h3>Headings</h3>
        <div className="example-item">
          <h1>H1 Heading (56px)</h1>
          <code className="example-code">{'<h1>H1 Heading</h1>'}</code>
        </div>
        
        <div className="example-item">
          <h2>H2 Heading (42px)</h2>
          <code className="example-code">{'<h2>H2 Heading</h2>'}</code>
        </div>
        
        <div className="example-item">
          <h3>H3 Heading (32px)</h3>
          <code className="example-code">{'<h3>H3 Heading</h3>'}</code>
        </div>
        
        <div className="example-item">
          <h4>H4 Heading (24px)</h4>
          <code className="example-code">{'<h4>H4 Heading</h4>'}</code>
        </div>
      </div>
      
      <div className="example-section">
        <h3>Body Text</h3>
        <div className="example-item">
          <p className="lead-text">Lead Text (20px) - Use for introductory paragraphs or highlighted text sections.</p>
          <code className="example-code">{'<p className="lead-text">Lead Text</p>'}</code>
        </div>
        
        <div className="example-item">
          <p>Body Text (16px) - This is the standard text used for most content on the site. It should be easily readable and maintain appropriate line height.</p>
          <code className="example-code">{'<p>Body Text</p>'}</code>
        </div>
        
        <div className="example-item">
          <p className="small-text">Small Text (14px) - Used for captions, footnotes, and other secondary information.</p>
          <code className="example-code">{'<p className="small-text">Small Text</p>'}</code>
        </div>
      </div>
      
      <div className="example-section">
        <h3>Font Weights</h3>
        <div className="weight-examples">
          <div className="example-item">
            <p style={{ fontWeight: 400 }}>Regular (400)</p>
            <code className="example-code">{'style={{ fontWeight: 400 }}'}</code>
          </div>
          
          <div className="example-item">
            <p style={{ fontWeight: 500 }}>Medium (500)</p>
            <code className="example-code">{'style={{ fontWeight: 500 }}'}</code>
          </div>
          
          <div className="example-item">
            <p style={{ fontWeight: 600 }}>Semibold (600)</p>
            <code className="example-code">{'style={{ fontWeight: 600 }}'}</code>
          </div>
          
          <div className="example-item">
            <p style={{ fontWeight: 700 }}>Bold (700)</p>
            <code className="example-code">{'style={{ fontWeight: 700 }}'}</code>
          </div>
        </div>
      </div>
      
      <div className="example-section">
        <h3>CSS Variables Usage</h3>
        <div className="code-example">
          <code className="example-code">
            {`/* Font families */
font-family: var(--heading-font);
font-family: var(--body-font);

/* Font weights */
font-weight: var(--font-regular);
font-weight: var(--font-medium);
font-weight: var(--font-semibold);
font-weight: var(--font-bold);

/* Font sizes */
font-size: var(--font-size-h1);
font-size: var(--font-size-h2);
font-size: var(--font-size-h3);
font-size: var(--font-size-h4);
font-size: var(--font-size-lead);
font-size: var(--font-size-body);
font-size: var(--font-size-small);`}
          </code>
        </div>
      </div>
      
      <div className="example-section">
        <h3>Best Practices</h3>
        <ul className="best-practices-list">
          <li>Always use semantic HTML elements like <code>&lt;h1&gt;</code> to <code>&lt;h4&gt;</code> for headings.</li>
          <li>Maintain hierarchy - don't skip heading levels (e.g., from H1 to H3).</li>
          <li>Use CSS classes for styling instead of inline styles when possible.</li>
          <li>Utilize the CSS variables for consistent typography throughout the project.</li>
          <li>Respect the responsive breakpoints for mobile typography.</li>
        </ul>
      </div>
    </div>
  );
};

export default TypographyExample; 
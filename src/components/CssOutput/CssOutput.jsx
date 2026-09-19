import { useState } from 'react';
export default function CssOutput({generatedCSS}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCSS);
      
      setCopied(true);
      
      // Volver al estado original después de 2 segundos
      setTimeout(() => {
        setCopied(false);
      }, 2500);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (

    <div className="code-card">

      <div className="code-header">

        <h2 className="code-title">
          Generated CSS
        </h2>

        <button
          className={`button ${copied ? 'copied-button' : 'copy-button'}`}
          onClick={(handleCopy)}
          disabled={copied}
        >
          {copied ? (
            'Copied!'
          ) : (
            'Copy CSS'
          )}
        </button>
      </div>

       <div className="code-body">
        <pre>{generatedCSS}</pre>
      </div>  

    </div>

  )

}
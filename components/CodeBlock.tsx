
import React, { useState } from 'react';
import { ClipboardIcon, CheckIcon } from './IconComponents';

interface CodeBlockProps {
  code: string;
  language: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/70 rounded-lg overflow-hidden border border-slate-700 relative group">
      <div className="px-4 py-2 flex justify-between items-center bg-slate-800 border-b border-slate-700">
        <span className="text-xs font-semibold text-slate-400 uppercase">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors p-1 rounded"
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4 text-green-400" />
              Copiado
            </>
          ) : (
            <>
              <ClipboardIcon className="w-4 h-4" />
              Copiar
            </>
          )}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto">
        <code className={`language-${language} text-slate-300`}>
          {code}
        </code>
      </pre>
    </div>
  );
};

export default CodeBlock;

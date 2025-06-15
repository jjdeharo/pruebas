
import React from 'react';

interface CalculatorButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({ label, onClick, className = '' }) => {
  const baseStyle = "calculator-button text-xl sm:text-2xl font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  const colorStyle = className.includes('bg-') ? '' : 'bg-slate-600 hover:bg-slate-500 text-slate-50 focus:ring-slate-400';
  const sizeStyle = "py-3 sm:py-4";


  return (
    <button
      onClick={onClick}
      className={`${baseStyle} ${colorStyle} ${sizeStyle} ${className}`}
      aria-label={label === 'DEL' ? 'Delete' : label === 'AC' ? 'All Clear' : `Calculate ${label}`}
    >
      {label === '×' ? '×' : label === '÷' ? '÷' : label}
    </button>
  );
};

export default CalculatorButton;
    
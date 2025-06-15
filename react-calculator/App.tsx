
import React, { useState, useCallback } from 'react';
import CalculatorButton from './components/CalculatorButton';

const App: React.FC = () => {
  const [currentOperand, setCurrentOperand] = useState<string>("0");
  const [previousOperand, setPreviousOperand] = useState<string | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState<boolean>(true); // True if next digit should overwrite currentOperand

  const formatOperand = (operand: string | null): string => {
    if (operand === null) return "";
    if (operand === "Error") return "Error";
    const MAX_LENGTH = 16;
    if (operand.length > MAX_LENGTH) {
      try {
        const num = parseFloat(operand);
        if (Math.abs(num) > 1e15 || (Math.abs(num) < 1e-4 && num !== 0) ) {
          return num.toExponential(MAX_LENGTH - 6); // e.g., 3 for exponent, 2 for "e+", 1 for "."
        }
      } catch (e) { /* ignore */}
      return operand.substring(0, MAX_LENGTH);
    }
    return operand;
  };


  const compute = useCallback(() => {
    if (operation === null || previousOperand === null || currentOperand === "Error") {
      return;
    }

    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);

    if (isNaN(prev) || isNaN(current)) {
      setCurrentOperand("Error");
      setOperation(null);
      setPreviousOperand(null);
      setOverwrite(true);
      return;
    }

    let result: number;
    switch (operation) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '*':
        result = prev * current;
        break;
      case '/':
        if (current === 0) {
          setCurrentOperand("Error");
          setOperation(null);
          setPreviousOperand(null);
          setOverwrite(true);
          return;
        }
        result = prev / current;
        break;
      default:
        return;
    }
    
    // Handle precision issues for simple cases like 0.1 + 0.2
    const resultString = String(parseFloat(result.toPrecision(12)));

    setCurrentOperand(resultString);
    setOperation(null);
    setPreviousOperand(null);
    setOverwrite(true);
  }, [currentOperand, previousOperand, operation]);

  const addDigit = (digit: string) => {
    if (currentOperand === "Error") return;
    if (currentOperand.length >= 16 && !overwrite) return; // Limit input length

    if (overwrite) {
      setCurrentOperand(digit);
      setOverwrite(false);
    } else {
      if (currentOperand === "0" && digit === "0") return;
      if (currentOperand === "0" && digit !== "0") {
        setCurrentOperand(digit);
      } else {
        setCurrentOperand(prev => prev + digit);
      }
    }
  };

  const addDecimal = () => {
    if (currentOperand === "Error") return;
    if (overwrite) {
      setCurrentOperand("0.");
      setOverwrite(false);
    } else if (!currentOperand.includes('.')) {
      setCurrentOperand(prev => prev + '.');
    }
  };

  const chooseOperation = (op: string) => {
    if (currentOperand === "Error" && op !== 'AC' && op !== 'DEL') return; // Allow AC/DEL on error

    if (previousOperand !== null && operation !== null && !overwrite) {
      compute(); // This will update currentOperand with the result
      // The compute function already sets previousOperand to null and operation to null.
      // We need to ensure the *new* operation is set up with the *result* as previousOperand.
      // So, we update previousOperand *after* compute might have run.
      setPreviousOperand(currentOperand); // This currentOperand is the result of computation or original
    } else {
       setPreviousOperand(currentOperand);
    }
    
    setOperation(op);
    setOverwrite(true); // Ready for next number
  };


  const clearAll = () => {
    setCurrentOperand("0");
    setPreviousOperand(null);
    setOperation(null);
    setOverwrite(true);
  };

  const deleteDigit = () => {
    if (currentOperand === "Error") {
      clearAll();
      return;
    }
    if (overwrite) { // If a result is shown, DEL acts like clear entry for currentOperand
      setCurrentOperand("0");
      // overwrite remains true
      return;
    }
    if (currentOperand.length === 1) {
      setCurrentOperand("0");
      setOverwrite(true); // Next digit should replace "0"
    } else {
      setCurrentOperand(prev => prev.slice(0, -1));
    }
  };
  
  const handleEquals = () => {
    if (currentOperand === "Error") return;
    compute();
  };


  return (
    <div className="bg-slate-900 p-4 sm:p-6 rounded-xl shadow-2xl w-full max-w-xs sm:max-w-sm mx-auto">
      {/* Display */}
      <div className="bg-slate-800 text-white text-right p-4 mb-4 rounded-lg shadow-inner break-all">
        <div className="text-slate-400 text-sm h-6">
          {previousOperand && operation ? `${formatOperand(previousOperand)} ${operation}` : ''}
        </div>
        <div className="text-3xl sm:text-4xl font-bold h-12">
          {formatOperand(currentOperand)}
        </div>
      </div>

      {/* Buttons Grid */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        <CalculatorButton label="AC" onClick={clearAll} className="col-span-2 bg-sky-600 hover:bg-sky-500 text-sky-50" />
        <CalculatorButton label="DEL" onClick={deleteDigit} className="bg-sky-600 hover:bg-sky-500 text-sky-50" />
        <CalculatorButton label="÷" onClick={() => chooseOperation('/')} className="bg-orange-500 hover:bg-orange-400 text-orange-50" />

        <CalculatorButton label="7" onClick={() => addDigit('7')} />
        <CalculatorButton label="8" onClick={() => addDigit('8')} />
        <CalculatorButton label="9" onClick={() => addDigit('9')} />
        <CalculatorButton label="×" onClick={() => chooseOperation('*')} className="bg-orange-500 hover:bg-orange-400 text-orange-50" />

        <CalculatorButton label="4" onClick={() => addDigit('4')} />
        <CalculatorButton label="5" onClick={() => addDigit('5')} />
        <CalculatorButton label="6" onClick={() => addDigit('6')} />
        <CalculatorButton label="-" onClick={() => chooseOperation('-')} className="bg-orange-500 hover:bg-orange-400 text-orange-50" />

        <CalculatorButton label="1" onClick={() => addDigit('1')} />
        <CalculatorButton label="2" onClick={() => addDigit('2')} />
        <CalculatorButton label="3" onClick={() => addDigit('3')} />
        <CalculatorButton label="+" onClick={() => chooseOperation('+')} className="bg-orange-500 hover:bg-orange-400 text-orange-50" />

        <CalculatorButton label="0" onClick={() => addDigit('0')} className="col-span-2" />
        <CalculatorButton label="." onClick={addDecimal} />
        <CalculatorButton label="=" onClick={handleEquals} className="bg-green-600 hover:bg-green-500 text-green-50" />
      </div>
    </div>
  );
};

export default App;
    
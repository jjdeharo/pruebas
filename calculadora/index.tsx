document.addEventListener('DOMContentLoaded', () => {
  const displayElement = document.getElementById('display') as HTMLDivElement;
  const calculator = document.getElementById('calculator') as HTMLDivElement;

  let currentOperand = "0";
  let previousOperand: string | null = null;
  let operation: string | null = null;
  let overwrite = true; // If true, next digit replaces currentOperand

  const MAX_DISPLAY_LENGTH = 16;

  function updateDisplay() {
    displayElement.textContent = currentOperand;
    displayElement.setAttribute('title', currentOperand); // For full number visibility on hover if truncated
    
    // Adjust font size dynamically if number is too long, but try to keep it large
    const displayContainerWidth = displayElement.parentElement!.clientWidth - 48; // p-6 -> 24px padding left/right
    let fontSize = 3; // rem, equivalent to text-5xl
    displayElement.style.fontSize = `${fontSize}rem`; // reset

    // Iteratively reduce font size if content overflows
    while (displayElement.scrollWidth > displayContainerWidth && fontSize > 1) {
        fontSize -= 0.2;
        displayElement.style.fontSize = `${fontSize}rem`;
    }
  }

  function calculate(): string {
    if (previousOperand === null || operation === null) return currentOperand;

    let prev = parseFloat(previousOperand);
    let curr = parseFloat(currentOperand);

    if (isNaN(prev) || isNaN(curr)) {
        if (String(previousOperand).startsWith("Error") || String(currentOperand).startsWith("Error")) return "Error";
        prev = parseFloat(String(previousOperand).replace(/[^\d.-eE]/g, ''));
        curr = parseFloat(String(currentOperand).replace(/[^\d.-eE]/g, ''));
        if (isNaN(prev) || isNaN(curr)) return "Error";
    }
    
    let resultValue: number;
    switch (operation) {
      case '+': resultValue = prev + curr; break;
      case '-': resultValue = prev - curr; break;
      case '*': resultValue = prev * curr; break;
      case '/':
        if (curr === 0) return "Error: Div Zero";
        resultValue = prev / curr;
        break;
      default:
        return "Error: Unknown Op";
    }

    if (Math.abs(resultValue) < 1e-10 && resultValue !== 0) {
        resultValue = 0;
    }

    let resultStr = resultValue.toString();
    
    if (resultStr.includes('.') && resultStr.split('.')[1].length > 8) {
      resultStr = parseFloat(resultValue.toFixed(8)).toString();
    }
    
    if (resultStr.length > MAX_DISPLAY_LENGTH) {
      const expPrecision = Math.max(0, MAX_DISPLAY_LENGTH - (resultValue < 0 ? 8 : 7) ); // e.g. "-1.234e+10"
      const exponentialStr = resultValue.toExponential(expPrecision);
      if (exponentialStr.length <= MAX_DISPLAY_LENGTH) {
        return exponentialStr;
      } else {
        return "Error: Overflow";
      }
    }
    return resultStr;
  }

  function isErrorState(value: string | null): boolean {
    return String(value).startsWith("Error");
  }

  function handleDigitClick(digit: string) {
    if (isErrorState(currentOperand)) {
      currentOperand = digit;
      overwrite = false;
      updateDisplay();
      return;
    }

    if (!overwrite && currentOperand.length >= MAX_DISPLAY_LENGTH) return;
    
    if (overwrite) {
      currentOperand = digit;
      overwrite = false;
    } else {
      if (currentOperand === "0" && digit === "0") return;
      if (currentOperand === "0" && digit !== "0") {
          currentOperand = digit;
      } else {
          currentOperand += digit;
      }
    }
    updateDisplay();
  }

  function handleOperatorClick(newOperation: string) {
    if (isErrorState(currentOperand)) return;

    if (operation && overwrite && previousOperand !== null) { 
      operation = newOperation; // Allow changing operator if no new number entered
      return;
    }
    
    if (previousOperand !== null && operation && !overwrite) { 
      const result = calculate();
      currentOperand = result;
      if (isErrorState(result)) {
        previousOperand = null;
        operation = null;
        overwrite = true;
        updateDisplay();
        return;
      }
      previousOperand = result;
    } else { 
      previousOperand = currentOperand;
    }
    
    operation = newOperation;
    overwrite = true;
    updateDisplay(); // Show current operand before it's overwritten by next input
  }

  function handleEqualsClick() {
    if (previousOperand !== null && operation && !isErrorState(currentOperand)) {
      const result = calculate();
      currentOperand = result;
      previousOperand = null; 
      operation = null;      
      overwrite = true;
      updateDisplay();
    }
  }

  function handleClearClick() {
    currentOperand = "0";
    previousOperand = null;
    operation = null;
    overwrite = true;
    updateDisplay();
  }

  function handleDecimalClick() {
    if (isErrorState(currentOperand)) {
      currentOperand = "0.";
      overwrite = false;
      updateDisplay();
      return;
    }
    if (String(currentOperand).includes(".")) return;
    if (overwrite) {
      currentOperand = "0.";
      overwrite = false;
    } else {
      if (currentOperand.length >= MAX_DISPLAY_LENGTH - 1) return;
      currentOperand += ".";
    }
    updateDisplay();
  }

  function handleToggleSignClick() {
    if (currentOperand === "0" || isErrorState(currentOperand)) return;
    currentOperand = String(currentOperand).startsWith("-") ? String(currentOperand).substring(1) : "-" + currentOperand;
    updateDisplay();
  }

  function handlePercentClick() {
    if (isErrorState(currentOperand)) return;
    const value = parseFloat(currentOperand);
    if (isNaN(value)) return;
    
    let resultValue = value / 100;
    if (Math.abs(resultValue) < 1e-10 && resultValue !== 0) {
        resultValue = 0;
    }
    let resultStr = resultValue.toString();

    if (resultStr.includes('.') && resultStr.split('.')[1].length > 8) {
      resultStr = parseFloat(resultValue.toFixed(8)).toString();
    }

    if (resultStr.length > MAX_DISPLAY_LENGTH) {
      const expPrecision = Math.max(0, MAX_DISPLAY_LENGTH - (resultValue < 0 ? 8 : 7));
      const exponentialStr = resultValue.toExponential(expPrecision);
       if (exponentialStr.length <= MAX_DISPLAY_LENGTH) {
        resultStr = exponentialStr;
      } else {
        resultStr = "Error: Overflow";
      }
    }
    currentOperand = resultStr;
    overwrite = true; 
    updateDisplay();
  }

  calculator.addEventListener('click', (event) => {
    const target = event.target as HTMLElement; // Cast to HTMLElement
    if (!(target instanceof HTMLButtonElement) || !target.matches('button')) return; // Ensure it's a button

    const action = target.dataset.action;
    const value = target.dataset.value;

    if (!action) {
        console.log("Button has no action:", target);
        return;
    }

    switch (action) {
      case 'digit':
        if (value) handleDigitClick(value);
        break;
      case 'operator':
        if (value) handleOperatorClick(value);
        break;
      case 'decimal':
        handleDecimalClick();
        break;
      case 'clear':
        handleClearClick();
        break;
      case 'equals':
        handleEqualsClick();
        break;
      case 'toggle-sign':
        handleToggleSignClick();
        break;
      case 'percentage':
        handlePercentClick();
        break;
      default:
        console.log("Unknown action:", action);
    }
  });

  // Initialize display
  updateDisplay();
});
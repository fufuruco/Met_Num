import React, { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calculator, Delete } from 'lucide-react';

const KEYPAD_BUTTONS = [
  ['sin(', 'cos(', 'tan(', '(', ')'],
  ['ln(', 'log(', 'sqrt(', 'x', '^'],
  ['7', '8', '9', '/', 'AC'],
  ['4', '5', '6', '*', 'DEL'],
  ['1', '2', '3', '-', 'pi'],
  ['0', '.', 'e', '+', ''],
];

export default function MathInput({ value, onChange, placeholder, className, id }) {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);

  const handleInsert = (text) => {
    if (!inputRef.current) {
      onChange(value + text);
      return;
    }

    const start = inputRef.current.selectionStart;
    const end = inputRef.current.selectionEnd;
    const currentVal = value || '';
    const newVal = currentVal.slice(0, start) + text + currentVal.slice(end);
    
    onChange(newVal);
    
    // Maintain focus and move cursor
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.setSelectionRange(start + text.length, start + text.length);
      }
    }, 10);
  };

  const handleBackspace = () => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart;
    const end = inputRef.current.selectionEnd;
    const currentVal = value || '';
    
    if (start === end && start > 0) {
      const newVal = currentVal.slice(0, start - 1) + currentVal.slice(end);
      onChange(newVal);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(start - 1, start - 1);
        }
      }, 10);
    } else if (start !== end) {
      const newVal = currentVal.slice(0, start) + currentVal.slice(end);
      onChange(newVal);
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.setSelectionRange(start, start);
        }
      }, 10);
    }
  };

  const handleClear = () => {
    onChange('');
    setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 10);
  };

  const onKeyClick = (key) => {
    if (key === 'AC') {
      handleClear();
    } else if (key === 'DEL') {
      handleBackspace();
    } else if (key) {
      handleInsert(key);
    }
  };

  return (
    <div className="relative flex items-center w-full">
      <Input
        id={id}
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`math-input pr-10 font-mono ${className || ''}`}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck="false"
      />
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            type="button"
            variant="secondary"
            className="absolute right-1 h-8 text-indigo-600 bg-indigo-100 hover:bg-indigo-200 gap-1.5 px-3 rounded-md"
            title="Abrir calculadora matemática"
          >
            <Calculator className="w-4 h-4" /> <span className="text-xs font-semibold">Teclado</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="end" sideOffset={8}>
          <div className="flex flex-col gap-2">
            <div className="text-xs font-semibold text-muted-foreground mb-1">Calculadora Científica</div>
            <div className="grid grid-cols-5 gap-1.5">
              {KEYPAD_BUTTONS.map((row, rIdx) => (
                row.map((btn, cIdx) => {
                  if (!btn) return <div key={`empty-${rIdx}-${cIdx}`} />;
                  
                  const isAction = btn === 'AC' || btn === 'DEL';
                  const isNumber = /^[0-9.]$/.test(btn);
                  const isOperator = /^[+\-*/^()]$/.test(btn);
                  const isVar = btn === 'x';
                  
                  return (
                    <Button
                      key={`${rIdx}-${cIdx}`}
                      type="button"
                      variant={isAction ? 'destructive' : isNumber ? 'secondary' : isVar ? 'default' : 'outline'}
                      size="sm"
                      className={`h-9 px-0 w-11 font-mono text-sm ${isVar ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onKeyClick(btn);
                      }}
                    >
                      {btn === 'DEL' ? <Delete className="w-4 h-4" /> : btn}
                    </Button>
                  );
                })
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

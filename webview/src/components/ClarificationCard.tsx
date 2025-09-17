import React, { useState } from "react";

export default function ClarificationCard({
  question,
  answer,
  onChange
}: {
  question: string;
  answer: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const hasAnswer = answer.trim().length > 0;

  return (
    <div className={`card overflow-hidden transition-all duration-300 ${
      open ? 'ring-2' : ''
    } ${hasAnswer ? 'border-accent-500' : ''}`}>
      <div
        className="p-3 cursor-pointer transition-colors duration-150"
        onClick={() => setOpen(!open)}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
              hasAnswer
                ? 'bg-[var(--muted)] text-white'
                : 'bg-secondary-600 text-secondary-300'
            }`}>
              {hasAnswer ? '✓' : '?'}
            </div>
            <span className="font-medium text-secondary-100">{question}</span>
          </div>
          <div className="flex items-center space-x-2">
            {hasAnswer && (
              <span className="text-xs bg-[var(--muted)] text-white px-2 py-1 rounded-full">
                Answered
              </span>
            )}
            <span className={`transform transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}>
              ▼
            </span>
          </div>
        </div>
      </div>

      <div className={`overflow-hidden transition-all duration-300 ${
        open ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-3 pt-0">
          <textarea
            className="input-field w-full resize-none"
            rows={2}
            placeholder="Provide your answer here..."
            value={answer}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-muted">
              {answer.length} characters
            </span>
            {isFocused && (
              <span className="text-xs text-accent animate-pulse">
                Press Enter to save
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

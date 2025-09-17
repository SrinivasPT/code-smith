import React from "react";
import ClarificationCard from "./ClarificationCard";

interface Clarification {
  question: string;
  answer: string;
}

export default function ClarificationsPanel({
  clarifications,
  onUpdate
}: {
  clarifications: Clarification[];
  onUpdate: (index: number, answer: string) => void;
}) {
  const answeredCount = clarifications.filter(c => c.answer.trim().length > 0).length;
  const progressPercentage = (answeredCount / clarifications.length) * 100;

  return (
  <div className="space-y-3 compact">
      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center text-gray-900">
          ❓ Clarifications
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted">
            {answeredCount}/{clarifications.length}
          </span>
          <div className="w-20 h-2 bg-[var(--border)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Progress Description */}
      <div className="text-sm text-muted mb-3">
        {progressPercentage === 100
          ? "🎉 All clarifications completed!"
          : `Answer these ${clarifications.length} short questions to refine the story.`
        }
      </div>

      {/* Clarification Cards */}
      <div className="space-y-2">
        {clarifications.map((c, i) => (
          <div key={i} className="animate-slide-in" style={{ animationDelay: `${i * 100}ms` }}>
            <ClarificationCard
              question={c.question}
              answer={c.answer}
              onChange={(val) => onUpdate(i, val)}
            />
          </div>
        ))}
      </div>

      {/* Summary */}
      {answeredCount > 0 && (
        <div className="mt-4 p-3 bg-white rounded-lg border" style={{ borderColor: 'var(--border)' }}>
          <h3 className="font-semibold text-gray-900 mb-2">📋 Summary</h3>
          <ul className="space-y-1 text-sm text-gray-700">
            {clarifications
              .filter(c => c.answer.trim().length > 0)
              .map((c, i) => (
                <li key={i} className="flex items-start space-x-2">
                  <span className="text-[var(--accent)] mt-0.5">•</span>
                  <span><strong>{c.question}</strong>: {c.answer}</span>
                </li>
              ))
            }
          </ul>
        </div>
      )}
    </div>
  );
}

import React from "react";

interface JiraDetailsProps {
  title: string;
  description: string;
  acceptanceCriteria: string[];
}

export default function JiraDetails({
  title,
  description,
  acceptanceCriteria
}: JiraDetailsProps) {
  return (
    <div className="space-y-4 compact">
      {/* Title Section */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-secondary-300 uppercase tracking-wide">
          Story Title
        </label>
        <div className="p-3 bg-white rounded-md border-l-2" style={{ borderColor: 'var(--accent)' }}>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      </div>

      {/* Description Section */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-secondary-300 uppercase tracking-wide">
          Description
        </label>
        <div className="p-3 bg-white rounded-md border" style={{ borderColor: 'var(--border)' }}>
          <p className="text-gray-700 leading-relaxed text-sm">{description}</p>
        </div>
      </div>

      {/* Acceptance Criteria Section */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-secondary-300 uppercase tracking-wide">
          Acceptance Criteria
        </label>
        <div className="space-y-2">
          {acceptanceCriteria.map((ac, i) => (
            <div
              key={i}
              className="flex items-start space-x-3 p-2 bg-white rounded-md border" style={{ borderColor: 'var(--border)' }}
            >
              <div className="flex-shrink-0 w-6 h-6 bg-[var(--accent)] rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-semibold">{i + 1}</span>
              </div>
              <p className="text-gray-700 leading-relaxed text-sm">{ac}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Story Points Estimate */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-secondary-300 uppercase tracking-wide">
          Story Points
        </label>
        <div className="flex space-x-2">
          {[1, 2, 3, 5, 8, 13].map((points) => (
            <button
              key={points}
              className="px-3 py-1 bg-white border text-sm text-gray-700 rounded-md transition-colors duration-150"
              style={{ borderColor: 'var(--border)' }}
            >
              {points}
            </button>
          ))}
        </div>
      </div>

      {/* Priority */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-secondary-300 uppercase tracking-wide">
          Priority
        </label>
        <div className="flex space-x-2">
          {[
            { label: 'Highest', color: 'bg-red-600' },
            { label: 'High', color: 'bg-orange-600' },
            { label: 'Medium', color: 'bg-yellow-600' },
            { label: 'Low', color: 'bg-green-600' },
            { label: 'Lowest', color: 'bg-gray-600' }
          ].map((priority) => (
            <button
              key={priority.label}
              className={`px-3 py-1 ${priority.color} text-white rounded-md transition-colors duration-150 text-sm`}
            >
              {priority.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

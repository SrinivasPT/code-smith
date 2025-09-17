import React, { useState } from "react";
import JiraDetails from "./JiraDetails";
import ClarificationsPanel from "./ClarificationsPanel";
import ChatPopover from "./ChatPopover";

export default function RefinementPage() {
  const [clarifications, setClarifications] = useState([
    { question: "Do we need mobile login?", answer: "" },
    { question: "Which API version should be supported?", answer: "" },
    { question: "Should we log failed attempts?", answer: "" }
  ]);

  const updateAnswer = (index: number, answer: string) => {
    const updated = [...clarifications];
    updated[index].answer = answer;
    setClarifications(updated);
  };

  return (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full compact">
      {/* Left Side: Jira Details */}
      <div className="space-y-4">
        <div className="card p-4">
          <h2 className="text-2xl font-semibold mb-3 flex items-center">
            📋 Jira Story Details
          </h2>
          <JiraDetails
            title="Login fails with OAuth"
            description="Users cannot log in via OAuth v2.0"
            acceptanceCriteria={[
              "User can login with email/password",
              "OAuth login works",
              "Invalid login shows error"
            ]}
          />
        </div>
      </div>

      {/* Right Side: Clarifications + Chat */}
      <div className="space-y-4">
        <div className="card p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              🔍 Refinement Process
            </h2>
            <div className="relative">
              <ChatPopover />
            </div>
          </div>
          <ClarificationsPanel
            clarifications={clarifications}
            onUpdate={updateAnswer}
          />
        </div>
      </div>
    </div>
  );
}

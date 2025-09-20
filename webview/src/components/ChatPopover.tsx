import React, { useState, useRef, useEffect } from "react";

export default function ChatPopover() {
	const [open, setOpen] = useState(false);
	const [messages, setMessages] = useState([{ from: "ai", text: "Do we need mobile login support?", timestamp: new Date() }]);
	const [input, setInput] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const sendMessage = () => {
		if (!input.trim()) return;
		const newMessage = { from: "user", text: input, timestamp: new Date() };
		setMessages([...messages, newMessage]);
		setInput("");
		// TODO: integrate with backend
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	return (
		<div className="relative">
			<button className="btn-secondary p-2 rounded-full" onClick={() => setOpen(!open)} title="Open AI Assistant">
				💬
			</button>

			{open && (
				<div className="absolute right-0 top-12 w-80 h-[28rem] card shadow-lg rounded-xl overflow-hidden animate-slide-in z-50">
					{/* Header */}
					<div className="p-3 border-b" style={{ borderColor: "var(--border)" }}>
						<div className="flex items-center justify-between">
							<div className="flex items-center space-x-2">
								<div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">🤖</div>
								<div>
									<h3 className="font-semibold">AI Assistant</h3>
									<p className="text-xs opacity-90">Online</p>
								</div>
							</div>
							<button onClick={() => setOpen(false)} className="btn-secondary p-1 text-sm">
								✕
							</button>
						</div>
					</div>

					{/* Messages */}
					<div className="flex-1 overflow-y-auto p-3 space-y-3 bg-white">
						{messages.map((m, i) => (
							<div key={i} className={`flex ${m.from === "ai" ? "justify-start" : "justify-end"} animate-fade-in`}>
								<div
									className={`max-w-xs px-4 py-2 rounded-2xl ${
										m.from === "ai"
											? "bg-[var(--panel)] text-gray-900 rounded-bl-sm"
											: "bg-[var(--accent)] text-white rounded-br-sm"
									}`}
								>
									<p className="text-sm">{m.text}</p>
									<p className="text-xs opacity-70 mt-1">
										{m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
									</p>
								</div>
							</div>
						))}
						<div ref={messagesEndRef} />
					</div>

					{/* Input */}
					<div className="p-3 border-t" style={{ borderColor: "var(--border)" }}>
						<div className="flex space-x-2">
							<input
								className="input-field flex-1 text-sm"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyPress={handleKeyPress}
								placeholder="Ask a question..."
							/>
							<button className="btn-accent px-3 py-1 text-sm" onClick={sendMessage} disabled={!input.trim()}>
								Send
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

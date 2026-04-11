"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_ACTIONS = ["おはよう", "今日の予定", "タスク一覧", "メモ一覧"];

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initializedRef = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMessage: Message = {
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setIsLoading(true);

      try {
        const history = [...messages, userMessage]
          .slice(-10)
          .map(({ role, content }) => ({ role, content }));

        const res = await fetch("/api/secretary/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text.trim(), history }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        const assistantMessage: Message = {
          role: "assistant",
          content: data.reply ?? data.message ?? "申し訳ありません。応答を取得できませんでした。",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        console.error("Chat error:", err);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "接続エラーが発生しました。しばらくしてから再試行してください。",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading]
  );

  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      sendMessage("おはよう");
    }
  }, [sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className="flex flex-col"
      style={{
        height: "100dvh",
        backgroundColor: "#0f0f1e",
        fontFamily: "'Zen Kaku Gothic New', sans-serif",
      }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{
          backgroundColor: "#1a1a2e",
          borderBottom: "1px solid #2a2a4e",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: "#c9a84c", color: "#1a1a2e" }}
          >
            秘
          </div>
          <div>
            <h1
              className="text-base font-semibold tracking-wide"
              style={{ color: "#c9a84c" }}
            >
              チヨダ秘書
            </h1>
            <p className="text-xs" style={{ color: "#6b7280" }}>
              CHIYODA ESTATE
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: isLoading ? "#f59e0b" : "#10b981" }}
          />
          <span className="text-xs" style={{ color: "#6b7280" }}>
            {isLoading ? "考え中..." : "オンライン"}
          </span>
        </div>
      </header>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4"
        style={{ backgroundColor: "#0f0f1e" }}
      >
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold"
              style={{ backgroundColor: "#1a1a2e", color: "#c9a84c", border: "2px solid #c9a84c" }}
            >
              秘
            </div>
            <p className="text-sm" style={{ color: "#6b7280" }}>
              チヨダ秘書が起動しています...
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} items-end gap-2`}
            >
              {msg.role === "assistant" && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: "#c9a84c", color: "#1a1a2e" }}
                >
                  秘
                </div>
              )}
              <div
                className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"} max-w-[80%]`}
              >
                <div
                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words"
                  style={
                    msg.role === "user"
                      ? {
                          backgroundColor: "#c9a84c",
                          color: "#111827",
                          borderBottomRightRadius: "4px",
                        }
                      : {
                          backgroundColor: "#16213e",
                          color: "#ffffff",
                          borderBottomLeftRadius: "4px",
                        }
                  }
                >
                  {msg.content}
                </div>
                <span className="text-xs mt-1" style={{ color: "#4b5563" }}>
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              {msg.role === "user" && (
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: "#374151", color: "#9ca3af" }}
                >
                  U
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start items-end gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: "#c9a84c", color: "#1a1a2e" }}
              >
                秘
              </div>
              <div
                className="px-4 py-3 rounded-2xl"
                style={{
                  backgroundColor: "#16213e",
                  borderBottomLeftRadius: "4px",
                }}
              >
                <div className="flex gap-1 items-center h-5">
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: "#c9a84c", animationDelay: "0ms" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: "#c9a84c", animationDelay: "150ms" }}
                  />
                  <span
                    className="w-2 h-2 rounded-full animate-bounce"
                    style={{ backgroundColor: "#c9a84c", animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      <div
        className="flex-shrink-0 px-4 py-2"
        style={{ backgroundColor: "#1a1a2e", borderTop: "1px solid #2a2a4e" }}
      >
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action}
              onClick={() => sendMessage(action)}
              disabled={isLoading}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-opacity disabled:opacity-40"
              style={{
                backgroundColor: "#2a2a4e",
                color: "#c9a84c",
                border: "1px solid #3a3a6e",
                whiteSpace: "nowrap",
              }}
            >
              {action}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div
        className="flex-shrink-0 px-4 py-3 flex items-center gap-3"
        style={{
          backgroundColor: "#1a1a2e",
          borderTop: "1px solid #2a2a4e",
          paddingBottom: "max(12px, env(safe-area-inset-bottom, 12px))",
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="メッセージを入力..."
          className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none disabled:opacity-50"
          style={{
            backgroundColor: "#0f0f1e",
            color: "#ffffff",
            border: "1px solid #2a2a4e",
          }}
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={isLoading || !input.trim()}
          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-opacity disabled:opacity-40"
          style={{ backgroundColor: "#c9a84c" }}
          aria-label="送信"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#1a1a2e"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  );
}

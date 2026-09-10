
import { useState } from "react";
import { Copy, Check, Volume2, FileText } from "lucide-react";
import { cn } from "@/utils";
import type { AIMessage } from "@/types";

interface AIMessageBubbleProps {
  message: AIMessage;
}

export function AIMessageBubble({ message }: AIMessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Détecter et formater le code dans le message
  const renderContent = (content: string) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({ type: "text", content: content.slice(lastIndex, match.index) });
      }
      parts.push({ type: "code", language: match[1] || "text", content: match[2] });
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      parts.push({ type: "text", content: content.slice(lastIndex) });
    }

    if (parts.length === 0) {
      parts.push({ type: "text", content });
    }

    return parts.map((part, index) => {
      if (part.type === "code") {
        return (
          <div key={index} className="my-3 rounded-lg overflow-hidden bg-slate-900 border border-slate-700">
            <div className="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700">
              <span className="text-xs text-slate-400 font-mono">{part.language}</span>
              <button
                onClick={() => handleCopy(part.content)}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-all"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copié !" : "Copier"}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto">
              <code className="text-sm text-slate-300 font-mono">{part.content}</code>
            </pre>
          </div>
        );
      }

      return (
        <p key={index} className="text-sm whitespace-pre-wrap">
          {part.content.split(/\*\*(.*?)\*\*/g).map((segment, i) =>
            i % 2 === 1 ? (
              <span key={i} className="font-bold text-white">{segment}</span>
            ) : (
              segment
            )
          )}
        </p>
      );
    });
  };

  return (
    <div className={cn("flex gap-3", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
          <Volume2 className="w-4 h-4 text-white" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[80%] px-4 py-3 rounded-2xl",
          isUser
            ? "bg-blue-600 text-white rounded-br-md"
            : "bg-white/5 text-slate-200 rounded-bl-md"
        )}
      >
        {message.media_url && (
          <div className="mb-2">
            {message.media_url.match(/\.(mp4|webm|mov)$/i) ? (
              <video src={message.media_url} controls className="rounded-lg max-w-full" />
            ) : (
              <img src={message.media_url} alt="" className="rounded-lg max-w-full" />
            )}
          </div>
        )}
        {renderContent(message.content)}
        {!isUser && (
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
            <button
              onClick={() => handleCopy(message.content)}
              className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-all"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copié" : "Copier"}
            </button>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-400 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}

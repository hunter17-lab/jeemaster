import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Copy, Check, RefreshCw, ThumbsUp, ThumbsDown, Paperclip } from "lucide-react";
import type { TutorMessage } from "@/lib/aiTutor";

interface Props {
  msg: TutorMessage;
  isLast: boolean;
  onRegenerate?: () => void;
  onFeedback?: (v: "up" | "down") => void;
}

const AITutorMessage = ({ msg, isLast, onRegenerate, onFeedback }: Props) => {
  const [copied, setCopied] = useState(false);
  const isUser = msg.role === "user";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[92%] md:max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1.5`}>
        {!!msg.attachments?.length && (
          <div className={`flex flex-wrap gap-1.5 ${isUser ? "justify-end" : ""}`}>
            {msg.attachments.map((a, i) =>
              a.preview ? (
                <img key={i} src={a.preview} alt={a.name} className="h-16 w-16 rounded-lg object-cover border border-border/60" />
              ) : (
                <span key={i} className="flex items-center gap-1 rounded-lg bg-secondary px-2 py-1 text-xs text-muted-foreground max-w-[180px]">
                  <Paperclip size={11} /> <span className="truncate">{a.name}</span>
                </span>
              ),
            )}
          </div>
        )}

        {(msg.content || !msg.attachments?.length) && (
          <div
            className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              isUser ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-secondary text-foreground rounded-bl-sm"
            }`}
          >
            {isUser ? (
              <span className="whitespace-pre-wrap">{msg.content}</span>
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none prose-pre:bg-background/60 prose-headings:mt-3 prose-p:my-2 prose-table:text-xs">
                <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
                  {msg.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {!isUser && msg.content && (
          <div className="flex items-center gap-1 pl-1 text-muted-foreground">
            <button onClick={copy} aria-label="Copy answer" className="p-1.5 rounded-md hover:bg-secondary hover:text-foreground transition-colors">
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>
            {isLast && onRegenerate && (
              <button onClick={onRegenerate} aria-label="Regenerate answer" className="p-1.5 rounded-md hover:bg-secondary hover:text-foreground transition-colors">
                <RefreshCw size={13} />
              </button>
            )}
            <button
              onClick={() => onFeedback?.("up")}
              aria-label="Helpful"
              className={`p-1.5 rounded-md hover:bg-secondary transition-colors ${msg.feedback === "up" ? "text-primary" : "hover:text-foreground"}`}
            >
              <ThumbsUp size={13} />
            </button>
            <button
              onClick={() => onFeedback?.("down")}
              aria-label="Not helpful"
              className={`p-1.5 rounded-md hover:bg-secondary transition-colors ${msg.feedback === "down" ? "text-destructive" : "hover:text-foreground"}`}
            >
              <ThumbsDown size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AITutorMessage;

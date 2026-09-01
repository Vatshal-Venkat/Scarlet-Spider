import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({ content, className = "" }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={className}
      components={{
        h1: ({ children }) => (
          <h1 className="text-xl font-bold text-white mt-4 mb-2 leading-tight">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-lg font-bold text-zinc-100 mt-3 mb-1.5 leading-tight">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-base font-semibold text-zinc-200 mt-3 mb-1 leading-snug">{children}</h3>
        ),
        h4: ({ children }) => (
          <h4 className="text-sm font-semibold text-zinc-300 mt-2 mb-1">{children}</h4>
        ),
        p: ({ children }) => (
          <p className="text-sm text-zinc-100 leading-relaxed mb-2 last:mb-0">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className="font-bold text-white">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic text-zinc-300">{children}</em>
        ),
        code: ({ inline, children }) =>
          inline ? (
            <code className="bg-zinc-800 text-red-300 font-mono text-xs px-1.5 py-0.5 rounded">
              {children}
            </code>
          ) : (
            <code className="block bg-zinc-900 border border-zinc-700 text-green-300 font-mono text-xs p-3 rounded-lg my-2 overflow-x-auto whitespace-pre">
              {children}
            </code>
          ),
        pre: ({ children }) => (
          <pre className="bg-zinc-900 border border-zinc-700 rounded-lg my-2 overflow-x-auto">
            {children}
          </pre>
        ),
        ul: ({ children }) => (
          <ul className="list-none space-y-1 my-2 pl-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-1 my-2 pl-1 text-sm text-zinc-100">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="flex items-start gap-2 text-sm text-zinc-100 leading-relaxed">
            <span className="text-red-400 mt-1 shrink-0">•</span>
            <span>{children}</span>
          </li>
        ),
        hr: () => <hr className="border-zinc-700 my-3" />,
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-red-500/60 pl-3 my-2 text-zinc-400 italic text-sm">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-400 underline underline-offset-2 hover:text-red-300 transition-colors"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

"use client";

import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

type HTMLContentProps = {
  html: string;
  className?: string;
};

const sanitizeHTML = (html: string) =>
  DOMPurify.sanitize(html, {
    USE_PROFILES: {
      html: true,
    },
  });

export const HTMLContent = ({ html, className }: HTMLContentProps) => {
  return (
    <div
      className={cn(
        `
        prose
        prose-neutral
        dark:prose-invert

        max-w-none

        prose-headings:font-bold
        prose-headings:tracking-tight

        prose-h1:text-3xl
        prose-h1:mb-4

        prose-h2:text-2xl
        prose-h2:mb-3

        prose-h3:text-xl
        prose-h3:mb-2

        prose-p:text-sm
        sm:prose-p:text-base

        prose-p:leading-8
        prose-p:text-neutral-700
        dark:prose-p:text-neutral-300

        prose-strong:text-neutral-900
        dark:prose-strong:text-white

        prose-a:no-underline
        prose-a:font-medium

        prose-ul:my-4
        prose-ol:my-4

        prose-li:my-1

        prose-blockquote:border-l-4
        prose-blockquote:pl-4
        prose-blockquote:italic

        prose-img:rounded-xl
        prose-img:shadow-lg

        prose-code:rounded
        prose-code:bg-neutral-100
        dark:prose-code:bg-neutral-800

        prose-pre:rounded-xl
      `,
        className,
      )}
      dangerouslySetInnerHTML={{
        __html: sanitizeHTML(html),
      }}
    />
  );
};

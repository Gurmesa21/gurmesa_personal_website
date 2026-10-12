


import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import Image from 'next/image';
import 'highlight.js/styles/github-dark.css';

const sanitizeOptions = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    code: [...(defaultSchema.attributes?.code || []), 'className'],
    span: [...(defaultSchema.attributes?.span || []), 'className'],
  },
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div data-testid="markdown-content" className="prose prose-lg dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[
          [rehypeSanitize, sanitizeOptions],
          rehypeHighlight,
        ]}
        components={{
          img(props) {
            const { src, alt } = props;
            if (!src || typeof src !== 'string') return null;
            return (
              <span className="relative block w-full h-96 my-8">
                <Image
                  src={src}
                  alt={alt || ''}
                  fill
                  className="object-contain"
                />
              </span>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

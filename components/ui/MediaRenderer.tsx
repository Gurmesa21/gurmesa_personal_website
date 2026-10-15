import Image from 'next/image';

interface MediaRendererProps {
  url: string;
  mimeType: string;
  altText?: string | null;
  fill?: boolean;
  className?: string;
  width?: number;
  height?: number;
}

export function MediaRenderer({ url, mimeType, altText, fill, className, width, height }: MediaRendererProps) {
  if (mimeType.startsWith('video/')) {
    return (
      <video 
        src={url} 
        className={fill ? `absolute inset-0 w-full h-full ${className || ''}` : className} 
        controls 
        muted 
        playsInline 
        autoPlay
      />
    );
  }

  if (mimeType.startsWith('image/')) {
    if (fill) {
      return (
        <Image
          src={url}
          alt={altText || 'Media'}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={className}
        />
      );
    }
    return <Image src={url} alt={altText || 'Media'} width={width} height={height} className={className} />;
  }

  // Fallback for PDF and other unsupported types
  return (
    <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}>
      <span>Document</span>
    </div>
  );
}

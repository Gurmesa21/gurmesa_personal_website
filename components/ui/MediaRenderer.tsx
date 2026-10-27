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
  const isVideo = mimeType?.startsWith('video/') || url?.endsWith('.mp4') || url?.endsWith('.webm');
  if (isVideo) {
    const videoMime = mimeType?.startsWith('video/')
      ? mimeType
      : url?.endsWith('.webm')
      ? 'video/webm'
      : 'video/mp4';

    return (
      <video 
        className={fill ? `absolute inset-0 w-full h-full object-cover ${className || ''}` : className} 
        controls 
        muted 
        playsInline 
        autoPlay
        loop
        preload="metadata"
      >
        <source src={url} type={videoMime} />
        Your browser does not support the video tag.
      </video>
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

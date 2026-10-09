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
        className={className} 
        controls 
        muted 
        playsInline 
        autoPlay
      />
    );
  }

  if (fill) {
    return <Image src={url} alt={altText || 'Media'} fill className={className} />;
  }

  return <Image src={url} alt={altText || 'Media'} width={width} height={height} className={className} />;
}

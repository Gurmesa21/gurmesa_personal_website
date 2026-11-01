import Image from 'next/image';

interface MediaRendererProps {
  url: string;
  mimeType: string;
  altText?: string | null;
  fill?: boolean;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  controls?: boolean;
  autoPlay?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  unoptimized?: boolean;
}

export function MediaRenderer({
  url,
  mimeType,
  altText,
  fill,
  className,
  width,
  height,
  priority = false,
  controls = true,
  autoPlay = false,
  preload = 'metadata',
  unoptimized = true,
}: MediaRendererProps) {
  const isVideo = mimeType?.startsWith('video/') || url?.endsWith('.mp4') || url?.endsWith('.webm');
  if (isVideo) {
    const videoMime = mimeType?.startsWith('video/')
      ? mimeType
      : url?.endsWith('.webm')
      ? 'video/webm'
      : 'video/mp4';

    return (
      <video
        className={fill ? `absolute inset-0 w-full h-full object-contain ${className || ''}` : className}
        controls={controls}
        muted
        playsInline
        autoPlay={autoPlay}
        loop
        preload={preload}
        width={width || (fill ? undefined : 1280)}
        height={height || (fill ? undefined : 720)}
        aria-label={altText || 'Video presentation'}
      >
        <source src={url} type={videoMime} />
        Your browser does not support the video tag.
      </video>
    );
  }

  if (mimeType.startsWith('image/')) {
    const combinedClassName = className ? `object-cover ${className}` : 'object-cover object-contain';
    if (fill) {
      return (
        <Image
          src={url}
          alt={altText || 'Media'}
          fill
          unoptimized={unoptimized}
          priority={priority}
          loading={priority ? 'eager' : 'lazy'}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1280px"
          className={combinedClassName}
          style={{ objectFit: 'contain' }}
        />
      );
    }
    return (
      <Image
        src={url}
        alt={altText || 'Media'}
        width={width || 1280}
        height={height || 720}
        unoptimized={unoptimized}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        className={combinedClassName}
        style={{ objectFit: 'contain' }}
      />
    );
  }

  // Fallback for PDF and other unsupported types
  return (
    <div className={`flex items-center justify-center bg-muted text-muted-foreground ${className}`}>
      <span>Document</span>
    </div>
  );
}

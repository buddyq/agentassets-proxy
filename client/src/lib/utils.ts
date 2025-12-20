import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type VideoInfo = {
  provider: 'youtube' | 'vimeo';
  id: string;
  embedUrl: string;
} | null;

export function parseVideoUrl(url: string): VideoInfo {
  if (!url || typeof url !== 'string') return null;
  
  const trimmedUrl = url.trim();
  if (!trimmedUrl) return null;

  // YouTube patterns
  // youtube.com/watch?v=VIDEO_ID
  // youtu.be/VIDEO_ID
  // youtube.com/embed/VIDEO_ID
  // youtube.com/v/VIDEO_ID
  const youtubePatterns = [
    /(?:youtube\.com\/watch\?v=|youtube\.com\/watch\?.+&v=)([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of youtubePatterns) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      return {
        provider: 'youtube',
        id: match[1],
        embedUrl: `https://www.youtube.com/embed/${match[1]}`,
      };
    }
  }

  // Vimeo patterns
  // vimeo.com/VIDEO_ID
  // player.vimeo.com/video/VIDEO_ID
  const vimeoPatterns = [
    /vimeo\.com\/(\d+)/,
    /player\.vimeo\.com\/video\/(\d+)/,
  ];

  for (const pattern of vimeoPatterns) {
    const match = trimmedUrl.match(pattern);
    if (match && match[1]) {
      return {
        provider: 'vimeo',
        id: match[1],
        embedUrl: `https://player.vimeo.com/video/${match[1]}`,
      };
    }
  }

  return null;
}

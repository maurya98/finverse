import compression from 'compression';
import { Request, Response, NextFunction } from 'express';

export const compressionMiddleware = compression({
  // Only compress responses that are larger than 1kb
  threshold: 1024,
  
  // Compression level (1-9, where 9 is maximum compression)
  level: 6,
  
  // Filter function to determine if response should be compressed
  filter: (req: Request, res: Response): boolean => {
    // Don't compress if the request includes a 'no-transform' cache-control directive
    if (req.headers['cache-control'] && req.headers['cache-control'].includes('no-transform')) {
      return false;
    }
    
    // Don't compress if the response includes a 'no-transform' cache-control directive
    if (res.getHeader('cache-control') && (res.getHeader('cache-control') as string).includes('no-transform')) {
      return false;
    }
    
    // Don't compress if the response is already compressed
    if (res.getHeader('content-encoding')) {
      return false;
    }
    
    // Don't compress if the content type is not compressible
    const contentType = res.getHeader('content-type') as string;
    if (contentType) {
      const nonCompressibleTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'video/mp4',
        'video/webm',
        'audio/mpeg',
        'audio/ogg',
        'application/pdf',
        'application/zip',
        'application/gzip',
        'application/x-gzip',
        'application/x-compress',
        'application/x-compressed',
      ];
      
      if (nonCompressibleTypes.some(type => contentType.includes(type))) {
        return false;
      }
    }
    
    // Use the default compression filter
    return compression.filter(req, res);
  },
  
  // Custom compression function for specific content types
  memLevel: 8,
  
  // Strategy for compression
  strategy: 0, // Z_DEFAULT_STRATEGY
});

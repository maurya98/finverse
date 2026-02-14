import { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";

const corsOptions: cors.CorsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if(process.env.NODE_ENV === "development") {
      return callback(null, true);
    }
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["X-Total-Count", "X-Page-Count"],
  maxAge: 86400,
};

const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: "deny" as const,
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: {
    policy: "no-referrer" as const,
  },
  permittedCrossDomainPolicies: false,
  hidePoweredBy: true, // Explicitly remove X-Powered-By header
};

const sqlInjectionProtection = (req: Request, res: Response, next: NextFunction): void => {
  const sqlInjectionPatterns = [
    /(\%27)|(\')|(\-\-)|(\%23)|(#)/i,
    /((\%3D)|(=))[^\n]*((\%27)|(\')|(\-\-)|(\%3B)|(;))/i,
    /\w*((\%27)|(\'))((\%6F)|o|(\%4F))((\%72)|r|(\%52))/i,
    /((\%27)|(\'))union/i,
    /exec(\s|\+)+(s|x)p\w+/i,
    /union[^a-z]+select/i,
    /select[^a-z]+from/i,
    /insert[^a-z]+into/i,
    /delete[^a-z]+from/i,
    /update[^a-z]+set/i,
    /drop[^a-z]+table/i,
    /alter[^a-z]+table/i,
    /create[^a-z]+table/i,
    /truncate[^a-z]+table/i,
  ];

  const checkForSQLInjection = (obj: any): boolean => {
    if (typeof obj === "string") {
      return sqlInjectionPatterns.some((pattern) => pattern.test(obj));
    }
    if (typeof obj === "object" && obj !== null) {
      return Object.values(obj).some((value) => checkForSQLInjection(value));
    }
    return false;
  };

  if (checkForSQLInjection(req.query)) {
    res.status(400).json({
      error: "Invalid input detected. SQL injection attempt blocked.",
    });
    return;
  }

  if (req.body && checkForSQLInjection(req.body)) {
    res.status(400).json({
      error: "Invalid input detected. SQL injection attempt blocked.",
    });
    return;
  }

  if (req.params && checkForSQLInjection(req.params)) {
    res.status(400).json({
      error: "Invalid input detected. SQL injection attempt blocked.",
    });
    return;
  }

  next();
};

const xssProtection = (req: Request, res: Response, next: NextFunction): void => {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<img[^>]+src[^>]*=.*javascript:/gi,
    /<link[^>]+href[^>]*=.*javascript:/gi,
    /<style[^>]*>.*?<\/style>/gi,
  ];

  const sanitizeInput = (obj: any): any => {
    if (typeof obj === "string") {
      let sanitized = obj;
      xssPatterns.forEach((pattern) => {
        sanitized = sanitized.replace(pattern, "");
      });
      return sanitized;
    }
    if (Array.isArray(obj)) {
      return obj.map(sanitizeInput);
    }
    if (typeof obj === "object" && obj !== null) {
      const sanitized: any = {};
      Object.keys(obj).forEach((key) => {
        sanitized[key] = sanitizeInput(obj[key]);
      });
      return sanitized;
    }
    return obj;
  };

  if (req.query) {
    req.query = sanitizeInput(req.query);
  }

  if (req.body) {
    req.body = sanitizeInput(req.body);
  }

  if (req.params) {
    req.params = sanitizeInput(req.params);
  }

  next();
};

const contentTypeProtection = (req: Request, res: Response, next: NextFunction): void => {
  const allowedContentTypes = [
    "application/json",
    "application/x-www-form-urlencoded",
    "multipart/form-data",
    "text/plain",
    "application/xml",
    "application/pdf",
    "application/octet-stream",
    "application/zip",
    "application/gzip",
    "application/x-tar",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/x-bzip2",
    "application/x-msdownload",
    "application/x-ms-shortcut",
    "application/x-ms-application",
    "application/x-ms-shortcut",
  ];

  if (req.method === "POST" || req.method === "PUT" || req.method === "PATCH") {
    const contentType = req.headers["content-type"];
    
    if (contentType) {
      const isAllowed = allowedContentTypes.some((type) =>
        contentType.includes(type)
      );

      if (!isAllowed) {
        res.status(415).json({
          error: "Unsupported Media Type. Only JSON, form-urlencoded, and multipart/form-data are allowed.",
        });
        return;
      }
    }
  }

  next();
};

const requestSizeLimit = (req: Request, res: Response, next: NextFunction): void => {
  const maxSize = 500 * 1024 * 1024; 
  const contentLength = req.headers["content-length"];

  if (contentLength && parseInt(contentLength) > maxSize) {
    res.status(413).json({
      error: "Payload too large. Maximum size is 10MB.",
    });
    return;
  }

  next();
};

const parameterPollutionProtection = (req: Request, res: Response, next: NextFunction): void => {
  if (req.query) {
    const queryKeys = Object.keys(req.query);
    const uniqueKeys = new Set(queryKeys);
    
    if (queryKeys.length !== uniqueKeys.size) {
      res.status(400).json({
        error: "Duplicate query parameters detected.",
      });
      return;
    }
  }

  next();
};

const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  if (process.env.NODE_ENV === "production") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  }
  // Explicitly remove X-Powered-By header (case-insensitive check)
  res.removeHeader("X-Powered-By");
  res.removeHeader("x-powered-by");
  next();
};

export const securityMiddleware = [
  cors(corsOptions),
  helmet(helmetOptions),
  securityHeaders,
  contentTypeProtection,
  requestSizeLimit,
  parameterPollutionProtection,
  // sqlInjectionProtection,
  // xssProtection,
];

export default securityMiddleware;

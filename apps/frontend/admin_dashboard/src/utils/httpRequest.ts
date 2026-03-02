/**
 * HTTP Request Utility Class
 * Provides a reusable interface for making HTTP requests with various methods
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";

export interface RequestOptions {
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

export interface HttpResponse<T = unknown> {
  status: number;
  statusText: string;
  data: T;
  headers: Record<string, string>;
}

class HttpRequest {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;

  constructor(
    baseUrl: string = "",
    defaultHeaders: Record<string, string> = {},
    defaultTimeout: number = 30000
  ) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...defaultHeaders,
    };
    this.defaultTimeout = defaultTimeout;
  }

  /**
   * Set or update the base URL
   */
  setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  /**
   * Set or update default headers
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * Make an HTTP request
   */
  async request<T = unknown>(
    method: HttpMethod,
    path: string,
    options: RequestOptions = {}
  ): Promise<HttpResponse<T>> {
    const url = this.buildUrl(path);
    const headers = this.mergeHeaders(options.headers);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.defaultTimeout);

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: this.serializeBody(method, options.body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await this.parseResponse<T>(response);
      const responseHeaders = this.parseHeaders(response.headers);

      return {
        status: response.status,
        statusText: response.statusText,
        data,
        headers: responseHeaders,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleError(error);
    }
  }

  /**
   * GET request
   */
  async get<T = unknown>(path: string, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    return this.request<T>("GET", path, options);
  }

  /**
   * POST request
   */
  async post<T = unknown>(path: string, body?: unknown, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    return this.request<T>("POST", path, { ...options, body });
  }

  /**
   * PUT request
   */
  async put<T = unknown>(path: string, body?: unknown, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    return this.request<T>("PUT", path, { ...options, body });
  }

  /**
   * DELETE request
   */
  async delete<T = unknown>(path: string, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    return this.request<T>("DELETE", path, options);
  }

  /**
   * PATCH request
   */
  async patch<T = unknown>(path: string, body?: unknown, options: RequestOptions = {}): Promise<HttpResponse<T>> {
    return this.request<T>("PATCH", path, { ...options, body });
  }

  /**
   * Download file (returns blob)
   */
  async downloadFile(path: string, options: RequestOptions = {}): Promise<Blob> {
    const url = this.buildUrl(path);
    const headers = this.mergeHeaders(options.headers);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.defaultTimeout);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return await response.blob();
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleError(error);
    }
  }

  /**
   * Upload file
   */
  async uploadFile<T = unknown>(
    path: string,
    file: File,
    additionalData?: Record<string, unknown>,
    options: RequestOptions = {}
  ): Promise<HttpResponse<T>> {
    const url = this.buildUrl(path);
    const formData = new FormData();
    formData.append("file", file);

    // Add additional data to form
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });
    }

    const headers = { ...options.headers };
    // Remove Content-Type for FormData to set boundary automatically
    delete headers["Content-Type"];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || this.defaultTimeout);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { ...this.defaultHeaders, ...headers },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await this.parseResponse<T>(response);
      const responseHeaders = this.parseHeaders(response.headers);

      return {
        status: response.status,
        statusText: response.statusText,
        data,
        headers: responseHeaders,
      };
    } catch (error) {
      clearTimeout(timeoutId);
      throw this.handleError(error);
    }
  }

  /**
   * Build complete URL
   */
  private buildUrl(path: string): string {
    const basePath = this.baseUrl.endsWith("/") ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    return `${basePath}${cleanPath}`;
  }

  /**
   * Merge headers with defaults
   */
  private mergeHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    return { ...this.defaultHeaders, ...customHeaders };
  }

  /**
   * Serialize body based on content type
   */
  private serializeBody(method: HttpMethod, body?: unknown): string | FormData | undefined {
    if (!body || ["GET", "HEAD", "DELETE"].includes(method)) {
      return undefined;
    }

    if (body instanceof FormData) {
      return body;
    }

    if (typeof body === "string") {
      return body;
    }

    return JSON.stringify(body);
  }

  /**
   * Parse response based on content type
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");

    if (!response.ok) {
      const error = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();
      throw new Error(JSON.stringify(error));
    }

    if (contentType?.includes("application/json")) {
      return (await response.json()) as T;
    }

    if (contentType?.includes("text")) {
      return (await response.text()) as T;
    }

    return (await response.blob()) as T;
  }

  /**
   * Parse response headers to object
   */
  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Handle errors
   */
  private handleError(error: unknown): Error {
    if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
      return new Error("Network error: Unable to connect to server");
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      return new Error("Request timeout: The operation took too long to complete");
    }

    if (error instanceof Error) {
      return error;
    }

    return new Error(String(error));
  }
}

export default HttpRequest;

import HttpRequest from "../utils/httpRequest";
import type { HttpResponse } from "../utils/httpRequest";

/**
 * API Response Types
 */
export interface ExportAllResponse {
  services: Service[];
  clientApps: ClientApp[];
  metadata: {
    exportedAt: string;
    version: string;
  };
}

export interface Service {
  id: string;
  name: string;
  baseUrl: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  routes: Route[];
}

export interface Route {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  method: string;
  actualPath: string;
  exposedPath: string;
  createdAt: string;
}

export interface ClientApp {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  secret: string;
  createdAt: string;
  permissions: unknown[];
}

export interface ImportResponse {
  success: boolean;
  summary: {
    servicesCreated?: number;
    routesCreated?: number;
    appsCreated?: number;
    permissionsCreated?: number;
    totalEntities: number;
  };
  message: string;
}

/**
 * Import/Export Service
 * Handles all API calls related to importing and exporting data
 */
class ImportExportService {
  private httpClient: HttpRequest;
  private readonly DEFAULT_BASE_URL = "http://localhost:5001";

  constructor(baseUrl?: string) {
    this.httpClient = new HttpRequest(baseUrl || this.DEFAULT_BASE_URL);
  }

  /**
   * Set custom base URL for API calls
   */
  setBaseUrl(baseUrl: string): void {
    this.httpClient.setBaseUrl(baseUrl);
  }

  /**
   * Export all data (services, routes, applications, permissions)
   */
  async exportAllData(): Promise<HttpResponse<ExportAllResponse>> {
    return this.httpClient.get<ExportAllResponse>("/api/admin/export/all");
  }

  /**
   * Export only services and their routes
   */
  async exportServices(): Promise<HttpResponse<Service[]>> {
    return this.httpClient.get<Service[]>("/api/admin/export/services");
  }

  /**
   * Export only client applications and their permissions
   */
  async exportApplications(): Promise<HttpResponse<ClientApp[]>> {
    return this.httpClient.get<ClientApp[]>("/api/admin/export/client-apps");
  }

  /**
   * Import all data from file
   * Reads the file content and sends it to the server
   */
  async importAllData(file: File): Promise<HttpResponse<ImportResponse>> {
    const fileContent = await this.readFileAsJSON(file);
    return this.httpClient.post<ImportResponse>("/api/admin/export/import", fileContent);
  }

  /**
   * Import services and routes from file
   * Typically used when importing a filtered services export
   */
  async importServices(file: File): Promise<HttpResponse<ImportResponse>> {
    const fileContent = await this.readFileAsJSON(file);
    return this.httpClient.post<ImportResponse>("/api/admin/export/import", fileContent);
  }

  /**
   * Import applications and permissions from file
   * Typically used when importing a filtered applications export
   */
  async importApplications(file: File): Promise<HttpResponse<ImportResponse>> {
    const fileContent = await this.readFileAsJSON(file);
    return this.httpClient.post<ImportResponse>("/api/admin/export/import", fileContent);
  }

  /**
   * Generic import function
   * Accepts a file and sends its content to the import endpoint
   */
  async importData(file: File): Promise<HttpResponse<ImportResponse>> {
    const fileContent = await this.readFileAsJSON(file);
    return this.httpClient.post<ImportResponse>("/api/admin/export/import", fileContent);
  }

  /**
   * Read file as JSON
   * Helper method to read and parse JSON files
   */
  private readFileAsJSON(file: File): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const json = JSON.parse(content);
          resolve(json);
        } catch (error) {
          reject(new Error(`Failed to parse JSON file: ${error instanceof Error ? error.message : "Unknown error"}`));
        }
      };

      reader.onerror = () => {
        reject(new Error("Failed to read file"));
      };

      reader.readAsText(file);
    });
  }

  /**
   * Download exported data as a JSON file
   * Helper method to download API response as a file
   */
  downloadAsFile(data: unknown, filename: string): void {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Create and export a singleton instance
export const importExportService = new ImportExportService();

export default ImportExportService;

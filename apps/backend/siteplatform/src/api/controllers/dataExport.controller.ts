import { logger } from "@finverse/logger";
import { sendError } from "@finverse/utils";
import { Request, Response, Router } from "express";
import { DataExportService } from "../services";

export class DataExportController {
    public router: Router;
    private dataExportService: DataExportService;

    constructor() {
        this.router = Router();
        this.dataExportService = DataExportService.getInstance();
        this.initRoutes();
    }

    private initRoutes(): void {
        /**
         * Export all data (services, routes, client apps, and permissions)
         * For mirroring prod/staging data for testing
         */
        this.router.get("/all", this.exportAllData.bind(this));

        /**
         * Export services with their routes
         */
        this.router.get("/services", this.exportServices.bind(this));

        /**
         * Export client apps with their permissions
         */
        this.router.get("/client-apps", this.exportClientApps.bind(this));

        /**
         * Export client app route permissions
         * Useful for authorization checking and permission verification
         */
        this.router.get("/permissions", this.exportClientAppRoutePermissions.bind(this));

        /**
         * Import data from exported JSON
         * Auto-detects data type and imports with proper foreign key handling
         */
        this.router.post("/import", this.importData.bind(this));
    }

    private sendFileDownload(res: Response, data: unknown, filename: string): Response {
        const jsonString = JSON.stringify(data, null, 2);
        const buffer = Buffer.from(jsonString, "utf-8");

        res.setHeader("Content-Type", "application/octet-stream");
        res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
        res.setHeader("Content-Length", buffer.length);

        return res.send(buffer);
    }

    private async exportAllData(req: Request, res: Response): Promise<Response> {
        try {
            logger.info("Exporting all data (services, routes, client apps, permissions)");
            const result = await this.dataExportService.exportAllData();
            logger.info(
                {
                    servicesCount: result.services.length,
                    clientAppsCount: result.clientApps.length,
                    totalRoutes: result.services.reduce((acc, s) => acc + s.routes.length, 0),
                    totalPermissions: result.clientApps.reduce((acc, a) => acc + a.permissions.length, 0),
                },
                "Data export completed"
            );
            const timestamp = new Date().toISOString().split('T')[0];
            return this.sendFileDownload(res, result, `export-all-${timestamp}.json`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error({ error: errorMessage }, "Error in DataExportController.exportAllData");
            return sendError(res, `Failed to export data: ${errorMessage}`, 500);
        }
    }

    private async exportServices(req: Request, res: Response): Promise<Response> {
        try {
            logger.info("Exporting internal services with their routes");
            const result = await this.dataExportService.exportServices();
            logger.info({ count: result.length }, "Services export completed");
            const timestamp = new Date().toISOString().split('T')[0];
            return this.sendFileDownload(res, result, `export-services-${timestamp}.json`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error({ error: errorMessage }, "Error in DataExportController.exportServices");
            return sendError(res, `Failed to export services: ${errorMessage}`, 500);
        }
    }

    private async exportClientApps(req: Request, res: Response): Promise<Response> {
        try {
            logger.info("Exporting client apps with their permissions");
            const result = await this.dataExportService.exportClientApps();
            logger.info({ count: result.length }, "Client apps export completed");
            const timestamp = new Date().toISOString().split('T')[0];
            return this.sendFileDownload(res, result, `export-client-apps-${timestamp}.json`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error({ error: errorMessage }, "Error in DataExportController.exportClientApps");
            return sendError(res, `Failed to export client apps: ${errorMessage}`, 500);
        }
    }

    private async exportClientAppRoutePermissions(req: Request, res: Response): Promise<Response> {
        try {
            logger.info("Exporting client app route permissions");
            const result = await this.dataExportService.exportClientAppRoutePermissions();
            logger.info({ count: result.length }, "Permissions export completed");
            const timestamp = new Date().toISOString().split('T')[0];
            return this.sendFileDownload(res, result, `export-permissions-${timestamp}.json`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error({ error: errorMessage }, "Error in DataExportController.exportClientAppRoutePermissions");
            return sendError(res, `Failed to export permissions: ${errorMessage}`, 500);
        }
    }

    private async importData(req: Request, res: Response): Promise<Response> {
        try {
            const data = req.body;

            if (!data) {
                return sendError(res, "No data provided in request body", 400);
            }

            logger.info("Importing data from exported JSON");

            // Auto-detect data type and import accordingly
            if (data.metadata && data.services && data.clientApps) {
                // Full data export
                logger.info("Detected full data export format");
                const result = await this.dataExportService.importAllData(data);
                logger.info(result.summary, "Data import completed");
                return res.status(200).json({ ...result, message: "Data imported successfully" });
            } else if (Array.isArray(data) && data.length > 0) {
                // Could be services or client apps
                const firstItem = data[0];

                if (firstItem.routes) {
                    // Services with routes
                    logger.info("Detected services export format");
                    const result = await this.dataExportService.importServices(data);
                    logger.info(result.summary, "Services import completed");
                    return res.status(200).json({ ...result, message: "Services imported successfully" });
                } else if (firstItem.permissions) {
                    // Client apps with permissions
                    logger.info("Detected client apps export format");
                    const result = await this.dataExportService.importClientApps(data);
                    logger.info(result.summary, "Client apps import completed");
                    return res.status(200).json({ ...result, message: "Client apps imported successfully" });
                } else {
                    return sendError(res, "Unknown data format in array", 400);
                }
            } else if (typeof data === "object" && !Array.isArray(data)) {
                return sendError(res, "Expected array or full export object, got single object", 400);
            } else {
                return sendError(res, "Invalid data format - expected array or full export object", 400);
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error({ error: errorMessage }, "Error in DataExportController.importData");
            return sendError(res, `Failed to import data: ${errorMessage}`, 500);
        }
    }
}

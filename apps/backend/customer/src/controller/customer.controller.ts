import { Request, Response, Router } from "express";
import { sendSuccess, sendError } from "@finverse/utils";
import {
  CustomerService,
  type CustomerCreateInput,
  type CustomerBulkUpdateItem,
} from "../service/customer.service";

export class CustomerController {
  public router: Router;
  private customerService: CustomerService;

  constructor() {
    this.router = Router();
    this.customerService = CustomerService.getInstance();
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post("/", this.createCustomer.bind(this));
    this.router.put("/upsert", this.createOrUpdateCustomer.bind(this));
    this.router.post("/bulk", this.createBulkCustomers.bind(this));
    this.router.get("/", this.getCustomer.bind(this));
    this.router.get("/bulk", this.getBulkCustomers.bind(this));
    this.router.put("/", this.updateCustomer.bind(this));
    this.router.put("/bulk", this.updateBulkCustomers.bind(this));
    this.router.delete("/", this.deleteCustomer.bind(this));
    this.router.delete("/bulk", this.deleteBulkCustomers.bind(this));
  }

  private async createCustomer(req: Request, res: Response): Promise<Response> {
    try {
      const data = req.body as CustomerCreateInput;
      if (!data || typeof data !== "object") {
        return sendError(res, "Request body is required", 400);
      }
      const customer = await this.customerService.createCustomer(data);
      return sendSuccess(res, customer, 201, "Customer created successfully");
    } catch (error) {
      const message = (error as Error).message || "Failed to create customer";
      const code = (error as { code?: string })?.code === "P2002" ? 409 : 500;
      return sendError(res, message, code);
    }
  }

  private async createOrUpdateCustomer(req: Request, res: Response): Promise<Response> {
    try {
      const data = req.body as CustomerCreateInput;
      if (!data || typeof data !== "object") {
        return sendError(res, "Request body is required", 400);
      }
      const { customer, created } = await this.customerService.createOrUpdateCustomer(data);
      return sendSuccess(
        res,
        { customer, created },
        created ? 201 : 200,
        created ? "Customer created successfully" : "Customer updated successfully"
      );
    } catch (error) {
      const message = (error as Error).message || "Failed to create or update customer";
      if (message.includes("email or phone is required")) {
        return sendError(res, message, 400);
      }
      const code = (error as { code?: string })?.code === "P2002" ? 409 : 500;
      return sendError(res, message, code);
    }
  }

  private async getCustomer(req: Request, res: Response): Promise<Response> {
    try {
      const { id, email, phone, includeRelations, include } = req.query;
      const includeRelationsFlag =
        includeRelations === "true" ||
        (typeof include === "string" && include.length > 0);
      if (id !== undefined) {
        const numId = Number(id);
        if (Number.isNaN(numId)) {
          return sendError(res, "Invalid id", 400);
        }
        const customer = await this.customerService.getCustomer(
          { id: numId },
          !!includeRelationsFlag
        );
        if (!customer) {
          return sendError(res, "Customer not found", 404);
        }
        return sendSuccess(res, customer, 200, "Customer fetched successfully");
      }
      if (email !== undefined && typeof email === "string") {
        const customer = await this.customerService.getCustomer(
          { email },
          !!includeRelationsFlag
        );
        if (!customer) {
          return sendError(res, "Customer not found", 404);
        }
        return sendSuccess(res, customer, 200, "Customer fetched successfully");
      }
      if (phone !== undefined && typeof phone === "string") {
        const customer = await this.customerService.getCustomer(
          { phone },
          !!includeRelationsFlag
        );
        if (!customer) {
          return sendError(res, "Customer not found", 404);
        }
        return sendSuccess(res, customer, 200, "Customer fetched successfully");
      }
      return sendError(
        res,
        "Query must include one of: id, email, phone",
        400
      );
    } catch (error) {
      const message = (error as Error).message || "Failed to fetch customer";
      return sendError(res, message, 500);
    }
  }

  private async updateCustomer(req: Request, res: Response): Promise<Response> {
    try {
      const body = req.body as { id: number; [k: string]: unknown };
      const id = body?.id != null ? Number(body.id) : NaN;
      if (Number.isNaN(id) || id < 1) {
        return sendError(res, "Valid id is required in request body", 400);
      }
      const { id: _id, ...data } = body;
      const customer = await this.customerService.updateCustomer(id, data);
      return sendSuccess(res, customer, 200, "Customer updated successfully");
    } catch (error) {
      const err = error as { code?: string; message?: string };
      if (err?.code === "P2025") {
        return sendError(res, "Customer not found", 404);
      }
      const message = err?.message || "Failed to update customer";
      const code = err?.code === "P2002" ? 409 : 500;
      return sendError(res, message, code);
    }
  }

  private async deleteCustomer(req: Request, res: Response): Promise<Response> {
    try {
      const id =
        req.query.id != null
          ? Number(req.query.id)
          : (req.body as { id?: number })?.id != null
            ? Number((req.body as { id: number }).id)
            : NaN;
      if (Number.isNaN(id) || id < 1) {
        return sendError(
          res,
          "id is required (query or body)",
          400
        );
      }
      const soft = req.query.soft === "true" || req.body?.soft === true;
      if (soft) {
        const customer = await this.customerService.softDeleteCustomer(id);
        return sendSuccess(res, customer, 200, "Customer deactivated successfully");
      }
      const customer = await this.customerService.deleteCustomer(id);
      return sendSuccess(res, customer, 200, "Customer deleted successfully");
    } catch (error) {
      const err = error as { code?: string; message?: string };
      if (err?.code === "P2025") {
        return sendError(res, "Customer not found", 404);
      }
      const message = err?.message || "Failed to delete customer";
      return sendError(res, message, 500);
    }
  }

  private async getBulkCustomers(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const skip =
        req.query.skip != null ? Number(req.query.skip) : undefined;
      const take =
        req.query.take != null ? Number(req.query.take) : undefined;
      const is_active =
        req.query.is_active === "true"
          ? true
          : req.query.is_active === "false"
            ? false
            : undefined;
      const ids =
        typeof req.query.ids === "string"
          ? req.query.ids.split(",").map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n))
          : Array.isArray(req.query.ids)
            ? (req.query.ids as string[]).map((s) => Number(s)).filter((n) => !Number.isNaN(n))
            : undefined;

      const includeRelations =
        req.query.includeRelations === "true" ||
        (typeof req.query.include === "string" && req.query.include.length > 0);

      const customers = await this.customerService.getBulkCustomers({
        skip,
        take,
        is_active,
        ids,
        includeRelations: includeRelations || undefined,
      });
      return sendSuccess(
        res,
        customers,
        200,
        "Bulk customers fetched successfully"
      );
    } catch (error) {
      const message = (error as Error).message || "Failed to fetch bulk customers";
      return sendError(res, message, 500);
    }
  }

  private async createBulkCustomers(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const items = req.body as CustomerCreateInput[];
      if (!Array.isArray(items)) {
        return sendError(res, "Request body must be an array of customers", 400);
      }
      const { count, customers } =
        await this.customerService.createBulkCustomers(items);
      return sendSuccess(
        res,
        { count, customers },
        201,
        "Bulk customers created successfully"
      );
    } catch (error) {
      const message = (error as Error).message || "Failed to create bulk customers";
      const code = (error as { code?: string })?.code === "P2002" ? 409 : 500;
      return sendError(res, message, code);
    }
  }

  private async updateBulkCustomers(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const items = req.body as CustomerBulkUpdateItem[];
      if (!Array.isArray(items)) {
        return sendError(
          res,
          "Request body must be an array of { id, ...updates }",
          400
        );
      }
      const invalid = items.some(
        (x) => x?.id == null || Number.isNaN(Number(x.id))
      );
      if (invalid) {
        return sendError(res, "Each item must have a valid id", 400);
      }
      const { count, customers } =
        await this.customerService.updateBulkCustomers(items);
      return sendSuccess(
        res,
        { count, customers },
        200,
        "Bulk customers updated successfully"
      );
    } catch (error) {
      const err = error as { code?: string; message?: string };
      const message = err?.message || "Failed to update bulk customers";
      const code = err?.code === "P2025" ? 404 : err?.code === "P2002" ? 409 : 500;
      return sendError(res, message, code);
    }
  }

  private async deleteBulkCustomers(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const body = req.body as { ids?: number[]; soft?: boolean };
      const ids = body?.ids ?? (Array.isArray(req.body) ? req.body : []);
      if (!Array.isArray(ids) || ids.length === 0) {
        return sendError(
          res,
          "Request body must include ids array (e.g. { ids: [1,2,3] })",
          400
        );
      }
      const numericIds = ids.map((id) => Number(id)).filter((n) => !Number.isNaN(n) && n >= 1);
      if (numericIds.length === 0) {
        return sendError(res, "Valid numeric ids are required", 400);
      }
      const soft = body?.soft === true;
      const { count } = await this.customerService.deleteBulkCustomers(
        numericIds,
        soft
      );
      return sendSuccess(
        res,
        { count },
        200,
        soft
          ? "Bulk customers deactivated successfully"
          : "Bulk customers deleted successfully"
      );
    } catch (error) {
      const message = (error as Error).message || "Failed to delete bulk customers";
      return sendError(res, message, 500);
    }
  }
}

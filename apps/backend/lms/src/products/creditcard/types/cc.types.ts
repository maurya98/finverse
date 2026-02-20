export interface LeadData {
    lead_id?: string | undefined;
    product_id: number;
    partner_id?: number | undefined;
    customer_id: string;
    lead_stage?: string | undefined;
    visit_id?: string | undefined;
    mobile_no: string;
    lead_details?: LeadDetails | undefined;
    utm_details?: object | undefined;
}

export interface LeadDetails {
    pan?: string | undefined;
    full_name?: string | undefined;
    dob?: string | undefined;
    gender?: string | undefined;
    email?: string | undefined;
    employment_type?: number | undefined;
    income?: number | undefined;
    pincode?: number | undefined;
    city_name?: string | undefined;
    company_name?: string | undefined;
    state?: string | undefined;
    [key: string]: any;
}

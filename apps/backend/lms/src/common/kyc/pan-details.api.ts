/**
 * KYC PAN details API client.
 * Calls Digitap (or compatible) service: POST /validation/kyc/v1/pan_details
 */

const KYC_BASE_URL = process.env.KYC_BASE_URL ?? "https://svcdemo.digitap.work";
const KYC_AUTH_BASIC = process.env.KYC_AUTH_BASIC ?? "";
const CLIENT_REF_NUM = process.env.CLIENT_REF_NUM ?? "";

/** Request body for PAN details API */
export interface PanDetailsRequest {
    client_ref_num: string;
    pan: string;
}

/** Success result payload from API (result_code 101). For 103, result is present but fields are empty. */
export interface PanDetailsApiResult {
    pan: string;
    pan_type: string;
    fullname: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    gender: string;
    aadhaar_number: string;
    aadhaar_linked: boolean | string;
    dob: string;
    address: {
        building_name?: string;
        locality?: string;
        street_name?: string;
        pincode?: string;
        city?: string;
        state?: string;
        country?: string;
    };
    mobile: string;
    email: string;
    name_match?: boolean;
    name_match_score?: number;
}

/** Raw API response shape */
export interface PanDetailsApiResponse {
    http_response_code: number;
    result_code: number;
    request_id?: string;
    client_ref_num?: string;
    result?: PanDetailsApiResult;
    message?: string;
    error?: string;
}

export interface PanDetailsResult {
    valid: boolean;
    message?: string;
    /** Full name as per PAN (e.g. "SAURABH KUMAR MAURYA") */
    fullname?: string;
    /** Whether provided name matched PAN name */
    name_match?: boolean;
    name_match_score?: number;
}

export async function getPanDetails(pan: string, name: string): Promise<PanDetailsResult> {
    const url = `${KYC_BASE_URL.replace(/\/$/, "")}/validation/kyc/v1/pan_details`;

    if (!KYC_AUTH_BASIC) {
        return {
            valid: false,
            message: "KYC_AUTH_BASIC is not configured",
        };
    }

    const body = JSON.stringify({
        client_ref_num: CLIENT_REF_NUM,
        pan: pan.trim().toUpperCase(),
    });

    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${KYC_AUTH_BASIC}`,
            },
            body,
        });

        const json = (await res.json().catch(() => ({}))) as PanDetailsApiResponse;

        if (!res.ok) {
            const message =
                json.message ?? json.error ?? `KYC API error: ${res.status}`;
            return { valid: false, message };
        }

        // result_code 103 = no record found for the given PAN
        if (json.result_code === 103) {
            const message = json.message ?? "No record found for the given input.";
            return { valid: false, message };
        }

        // result_code 101 with result = PAN found; name_match must be true for verification to pass
        const isPanValid = json.result_code === 101 && json.result != null;
        const result = json.result;

        if (!isPanValid || !result) {
            const message =
                json.message ?? json.error ?? "PAN is invalid or verification failed.";
            return { valid: false, message };
        }

        // Negative case: PAN valid but name does not match (name_match: false / low score)
        if (result.name_match === false) {
            return {
                valid: false,
                message: "Name does not match PAN records.",
                fullname: result.fullname,
                name_match: result.name_match,
                name_match_score: result.name_match_score,
            };
        }

        return {
            valid: true,
            fullname: result.fullname,
            name_match: result.name_match,
            name_match_score: result.name_match_score,
        };
    } catch (err) {
        const message = err instanceof Error ? err.message : "PAN verification request failed.";
        return { valid: false, message };
    }
}

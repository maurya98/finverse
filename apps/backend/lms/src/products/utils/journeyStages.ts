export interface JourneyStage {
    name: string;
    prev: string | null;
    next: string | null;
}

export const CC_STAGES = {
    CREATE_LEAD: "create_lead",
    PERSONAL_DETAILS: "personal_details",
    PAN_DETAILS: "pan_details",
    EMPLOYMENT_DETAILS: "employment_details",
}

export const creditCardJourneyStages: JourneyStage[] = [
    {
        name: CC_STAGES.CREATE_LEAD,
        next: CC_STAGES.PERSONAL_DETAILS,
        prev: null,
    },
    {
        name: CC_STAGES.PERSONAL_DETAILS,
        next: CC_STAGES.PAN_DETAILS,
        prev: CC_STAGES.CREATE_LEAD,
    },
    {
        name: CC_STAGES.PAN_DETAILS,
        next: CC_STAGES.EMPLOYMENT_DETAILS,
        prev: CC_STAGES.PERSONAL_DETAILS,
    },
    {
        name: CC_STAGES.EMPLOYMENT_DETAILS,
        next: null,
        prev: CC_STAGES.PAN_DETAILS,
    }
]
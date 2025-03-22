export interface ProductData {
    id: string;
    brand: string;
    name: string;
    type: string;
    ingredients: string[];
    country: string;
    afterUse: string[];
}

export interface RoutineSnapshot {
    day_products: ProductData[];
    night_products: ProductData[];
    skin_type: string[];
    skin_concerns: string[];
    climate: string[];
    routine_description?: string;
}

export interface AnalysisData {
    timestamp: string;
    routineSnapshot: RoutineSnapshot;
    analysis: {
        summary: string;
        routineAnalysis: {
            day_products: {
                products: ProductData[];
                recommendations: string[];
            };
            night_products: {
                products: ProductData[];
                recommendations: string[];
            };
        };
        skinProfile: {
            skinTypeAnalysis: {
                [key: string]: string;
            };
            concernsAnalysis: {
                [key: string]: string;
            };
            climateConsiderations: string[];
        };
        recommendations: {
            general: string[];
            productInteractions: string[];
            missingProducts: string[];
            orderSuggestions: string[];
        };
        scientificSources?: {
            citation: string;
            keyFindings: string;
            doi?: string;
            link?: string;
        }[];
    };
} 
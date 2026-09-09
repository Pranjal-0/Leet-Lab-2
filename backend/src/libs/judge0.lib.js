import dotenv from 'dotenv';
import axios from 'axios';
dotenv.config();


export const Judge0LanguageId = (language) => {
    const languageMap = {
        "python": 71,
        "cpp": 54,
        "java": 62,
        "javascript": 63
    };
    
    return languageMap[language.toLowerCase()];
};



export const submitBatch = async (submissions) => {
    // Trim trailing slash to avoid URL issues like 'http://localhost:2358//submissions'
    const baseUrl = process.env.JUDGE0_API_URL?.replace(/\/$/, '') || 'http://localhost:2358';

    const { data } = await axios.post(
        `${baseUrl}/submissions/batch?base64_encoded=false`,
        { submissions }
    );

    console.log("Submission Response:", data);

    return data;

};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const pollBatchResults = async (tokens) => {
    // Standardize URL to eliminate trailing slashes
    const baseUrl = process.env.JUDGE0_API_URL?.replace(/\/$/, '') || 'http://localhost:2358';

    while (true) {
        try {
            const { data } = await axios.get(`${baseUrl}/submissions/batch`, {
                params: {
                    tokens: tokens.join(","),
                    base64_encoded: false,
                }
            });

            const results = data.submissions;

            // Status 1 = In Queue, Status 2 = Processing
            const isAllDone = results.every((r) => r.status.id !== 1 && r.status.id !== 2);

            if (isAllDone) {
                return results;
            }
        } catch (error) {
            console.error("Polling error:", error.message);
        }

        await sleep(1000);
    }
};
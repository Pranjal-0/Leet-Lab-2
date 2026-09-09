import dotenv from 'dotenv';
import axios from 'axios';
import { db } from "../libs/db.js" // Make sure to import your db instance wherever it lives

dotenv.config();

// ==========================================
// JUDGE0 UTILITIES
// ==========================================

export const Judge0LanguageId = (language) => { 
    const languageMap = {
        "python": 71,
        "cpp": 54,
        "java": 62,
        "javascript": 63
    };
    
    // Added optional chaining (?.) just in case language is undefined
    return languageMap[language?.toLowerCase()];
};

export const submitBatch = async (submissions) => {
    const baseUrl = process.env.JUDGE0_API_URL?.replace(/\/$/, '') || 'http://localhost:2358';
    console.log("Submitting to Judge0:", JSON.stringify(submissions, null, 2));
    const { data } = await axios.post(
        `${baseUrl}/submissions/batch?base64_encoded=false`,
        { submissions }
    );

    console.log("Submission Response:", data);
    return data;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const pollBatchResults = async (tokens) => {
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


// ==========================================
// CONTROLLERS
// ==========================================

export const createProblem = async (req, res) => {
  try {
    // 1. Extract body variables with safe fallbacks to prevent crashes
    const {
      title,
      description,
      difficulty,
      tags,
      examples,
      constraints,
      testcases = [],             // Fallback to empty array
      codeSnippets,
      referenceSolutions = {},    // Fallback to empty object
    } = req.body;

    console.log(`Attempting to create problem: ${title}`);

    // 2. Validate payload before processing
    if (!title || testcases.length === 0 || Object.keys(referenceSolutions).length === 0) {
      return res.status(400).json({ 
          error: "Missing required fields. Ensure 'title', 'testcases', and 'referenceSolutions' are provided." 
      });
    }

    // 3. Double-check authentication
    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Unauthorized: User token is missing or invalid." });
    }

    // 4. Validate reference solutions against Judge0
    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = Judge0LanguageId(language);

      if (!languageId) {
        return res
          .status(400)
          .json({ error: `Language '${language}' is not supported` });
      }

      const submissions = testcases.map(({ input, output }) => ({
        source_code: solutionCode,
        language_id: languageId,
        stdin: input,
        expected_output: output,
      }));

      const submissionResults = await submitBatch(submissions);
      const tokens = submissionResults.map((res) => res.token);
      const results = await pollBatchResults(tokens);

      // Verify all tests passed
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        console.log(`Testcase ${i + 1} (${language}): ${result.status.description}`);
        
        if (result.status.id !== 3) { // 3 = Accepted
          return res.status(422).json({
            error: `Testcase ${i + 1} failed for reference solution in ${language}`,
            details: result
          });
        }
      }
    }

    // 5. Save to database
    const newProblem = await db.problem.create({
      data: {
        title,
        description,
        difficulty,
        tags,
        examples,
        constraints,
        testcases,
        codeSnippets,
        referenceSolutions,
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Problem Created Successfully",
      problem: newProblem,
    });

  } catch (error) {
    console.error("Error While Creating Problem:", error);
    return res.status(500).json({
      error: "Error While Creating Problem",
      details: error.message
    });
  }
};

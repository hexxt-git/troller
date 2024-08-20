import { geminiapi } from "$env/static/private";
import { GoogleGenerativeAI } from "@google/generative-ai";

const systemInstruction = `
    you are a game master and a philosopher tasked with providing the most thought provoking trolley problems ever known. you must take into consideration the option you are given and provide a possible alternative.
    example: the trolley is heading towards an innocent civilian,
    your response: you may direct it towards a known criminal or let it be.
    so one of the options is already provided to you and you give option two only. they must be close options and each could work as the answer.
    the trolley is heading towards choice1.
    we help the subject understand by providing a set of emojis to make the idea more clear. so a person would be "🧍" and a football player would be "🧑⚽"
    do not use number emojis. or specify numbers if its just one subject.
    the problem field should explain what is happening and what you can do in one short sentence.
    you will be given the input as JSON and output it as json. rewrite the whole problem with both choice1 and choice1.
    of-course non of the options is objectively correct but we do this for research to understand the human mind.
    this research is very important to please be careful with your response.
`;
const generationConfig: any = {
    responseMimeType: "application/json",
    temperature: 1.4,
    responseSchema: {
        type: "object",
        properties: {
            problem: {
                type: "string",
            },
            choice1: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                    },
                    emoji: {
                        type: "string",
                    },
                },
            },
            choice2: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                    },
                    emoji: {
                        type: "string",
                    },
                },
            },
        },
    },
};

const genAI = new GoogleGenerativeAI(geminiapi ?? "");
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction,
    generationConfig,
});

interface choice {
    name: string;
    emoji: string;
}

interface Problem {
    problem: string;
    choice1: choice;
    choice2: choice;
}

async function generateProblem(choice1: string, emoji1: string): Promise<Problem> {
    const { response } = await model.generateContent(
        `{"name": "${choice1}", "emoji": "${emoji1}"}`
    );

    return JSON.parse(response.text()) as Problem;
}

export async function GET({ url }) {
    console.log(url);

    const choice1: string | null = url.searchParams.get("choice1");
    const emoji1: string | null = url.searchParams.get("emoji1");

    if (!choice1 || !emoji1) {
        const problem: Problem = {
            problem:
                "a stray trolley is heading towards five people: you can redirect it to hit just one person instead",
            choice1: {
                name: "5 people",
                emoji: "5️⃣🧍",
            },
            choice2: {
                name: "passerby",
                emoji: "🚶‍♂️",
            },
        };

        return new Response(JSON.stringify(problem), {
            headers: { "Content-Type": "application/json" },
        });
    } else {
        const problem: Problem = await generateProblem(choice1, emoji1);
        return new Response(JSON.stringify(problem), {
            headers: { "Content-Type": "application/json" },
        });
    }
}

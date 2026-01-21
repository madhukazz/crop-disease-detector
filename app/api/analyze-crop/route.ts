import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.NEXT_OPENAI_API_KEY,
    baseURL: "https://models.inference.ai.azure.com",
});


export async function POST(req: Request) {
    try {
        const { image } = await req.json();

        if (!image) {
            return NextResponse.json({ error: "පින්තූරයක් ලබා දී නැත" }, { status: 400 });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: `You are an expert plant pathologist. Analyze this plant image:
              1. Identify the crop and the disease (if any).
              2. Give a brief description of the symptoms.
              3. Provide practical solutions (Organic and Chemical).
              4. VERY IMPORTANT: Provide the final response in both Sinhala and English.
              Use a clear, helpful tone for a farmer.`,
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: image,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 1000,
        });

        const analysis = response.choices[0].message.content;

        return NextResponse.json({ analysis });
    } catch (error) {
        console.error("AI Analysis Error:", error);
        return NextResponse.json(
            { error: "AI පද්ධතියේ දෝෂයක් සිදුවිය. නැවත උත්සාහ කරන්න." },
            { status: 500 }
        );
    }
}
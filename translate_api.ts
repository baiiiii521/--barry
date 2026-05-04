import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function run() {
    const dict = JSON.parse(fs.readFileSync('dict.json', 'utf-8'));
    const keys = Object.keys(dict);

    console.log(`Translating ${keys.length} keys...`);
    
    // Split into chunks of 100
    const chunks = [];
    for (let i = 0; i < keys.length; i += 100) {
        chunks.push(keys.slice(i, i + 100));
    }
    
    const translatedDict = {};

    for (let i = 0; i < chunks.length; i++) {
        console.log(`Chunk ${i+1}/${chunks.length}`);
        const chunk = chunks[i];
        const prompt = `Translate the following JSON object's values to English. Keep the keys identical. Only output the JSON object, do not output any markdown blocks or explanations.\n${JSON.stringify(Object.fromEntries(chunk.map(c => [c, c])), null, 2)}`;
        
        try {
            const response = await ai.models.generateContent({
                model: 'gemini-3.1-pro-preview',
                contents: prompt,
                 config: {
                    responseMimeType: "application/json",
                }
            });
            const text = response.text();
            let parsed = {};
            try {
                parsed = JSON.parse(text);
            } catch(e) {
                // regex try to extract
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    parsed = JSON.parse(jsonMatch[0]);
                }
            }
            
            for (const [k, v] of Object.entries(parsed)) {
                translatedDict[k] = v;
            }
        } catch(e) {
            console.error(e);
        }
    }
    
    fs.writeFileSync('dict-en.json', JSON.stringify(translatedDict, null, 2));
    console.log("Done!");
}

run();

import fs from 'fs';

async function run() {
    const dict = JSON.parse(fs.readFileSync('dict.json', 'utf-8'));
    const keys = Object.keys(dict);
    const translatedDict = {};

    console.log(`Translating ${keys.length} keys...`);

    // Let's divide into chunks of 50
    for(let i=0; i<keys.length; i+=50) {
        console.log(`Chunk ${i}`);
        const chunk = keys.slice(i, i+50);
        // build text
        const textToTranslate = chunk.join('\n');
        
        try {
            const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=en&dt=t&q=${encodeURIComponent(textToTranslate)}`);
            const data = await res.json();
            
            // data[0] contains array of parts
            let translatedLines = data[0].map(x => x[0]).join('').split('\n');
            
            for(let j=0; j<chunk.length; j++) {
                translatedDict[chunk[j]] = translatedLines[j] || chunk[j];
            }
        } catch (e) {
            console.error(e);
            for(let j=0; j<chunk.length; j++) {
                translatedDict[chunk[j]] = chunk[j];
            }
        }
    }
    
    fs.writeFileSync('src/dict-en.json', JSON.stringify(translatedDict, null, 2));
    fs.writeFileSync('src/dict-zh.json', JSON.stringify(dict, null, 2));
}

run();

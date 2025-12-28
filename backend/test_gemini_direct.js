
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testV() {
    const key = 'AIzaSyCdDUQWRXHAMS-b3vz0vCFuRe-5fBdFSSQ';
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    /*
    try {
        const result = await model.generateContent("Hello from G-Network console. Are you alive?");
        const response = await result.response;
        console.log("Response:", response.text());
    } catch (e) {
        console.error("Direct Gemini Error:", e);
    }
    */
    try {
        // Manual fetch because SDK listModels requires different setup?
        // Actually let's just try 'gemini-1.0-pro'
        const model2 = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });
        const res = await model2.generateContent("Test");
        console.log("Success with gemini-1.0-pro");
    } catch (e) {
        console.log("Failed 1.0 pro", e.message);
    }
}
testV();

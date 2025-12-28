
// Native fetch

async function test() {
    try {
        const res = await fetch('http://localhost:5000/api/autonomous/content/enhance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: "This is a boring post about cats." })
        });
        const data = await res.json();
        console.log('Gemini Enhance Result:', JSON.stringify(data, null, 2));

        const res2 = await fetch('http://localhost:5000/api/autonomous/content/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: "This is a boring post about cats." })
        });
        const data2 = await res2.json();
        console.log('Groq Viral Result:', JSON.stringify(data2, null, 2));

    } catch (e) {
        console.error(e);
    }
}
test();

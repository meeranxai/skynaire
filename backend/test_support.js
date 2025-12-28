
// Quick test for Support Agent enhancements
const supportAgent = require('./ai/support/SupportAgent');

async function test() {
    console.log('Testing Enhanced Support Agent:\n');

    const tests = [
        'how i can write a catchy title',
        'who is elon musk',
        'what is 5+3',
        'how does magic enhance work'
    ];

    for (const question of tests) {
        console.log(`Q: ${question}`);
        const answer = await supportAgent.chat(question, { name: 'TestUser', uid: 'test123' });
        console.log(`A: ${answer}\n`);
        console.log('---\n');
    }
}

test();

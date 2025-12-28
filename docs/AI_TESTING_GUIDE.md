# AI Service Testing Guide

This document provides test cases and examples for the G-Network AI Intelligence Service.

## Quick Test Script

```javascript
// test-ai-service.js
const ContentIntelligenceService = require('./services/aiIntelligence');

async function runTests() {
    console.log('🧪 Starting AI Service Tests...\n');

    // Test 1: Basic Sentiment Analysis
    console.log('Test 1: Positive Sentiment');
    const test1 = await ContentIntelligenceService.analyzeImage(
        null,
        "I love this amazing sunset! So beautiful and peaceful.",
        { features: ['sentiment'] }
    );
    console.log('Result:', test1.sentiment);
    console.log('Expected: Positive sentiment with high score\n');

    // Test 2: Content Moderation
    console.log('Test 2: Safe Content');
    const test2 = await ContentIntelligenceService.analyzeImage(
        null,
        "Check out my new coffee setup! Working from home today.",
        { features: ['moderation'] }
    );
    console.log('Result:', test2.moderation);
    console.log('Expected: Safe content, low risk score\n');

    // Test 3: Object Detection
    console.log('Test 3: Object Detection');
    const test3 = await ContentIntelligenceService.analyzeImage(
        null,
        "Coding on my laptop with a cup of coffee",
        { features: ['objects'] }
    );
    console.log('Result:', test3.objectsDetected);
    console.log('Expected: Laptop and coffee cup detected\n');

    // Test 4: Scene Classification
    console.log('Test 4: Scene Detection');
    const test4 = await ContentIntelligenceService.analyzeImage(
        null,
        "Beautiful beach sunset during my vacation in Hawaii",
        { features: ['scene'] }
    );
    console.log('Result:', test4.scene);
    console.log('Expected: Travel/Outdoor scene\n');

    // Test 5: Aesthetic Scoring
    console.log('Test 5: Aesthetic Analysis');
    const test5 = await ContentIntelligenceService.analyzeImage(
        null,
        "Professional photography of a minimalist workspace with perfect lighting",
        { features: ['aesthetic'] }
    );
    console.log('Result:', test5.aestheticScore);
    console.log('Expected: High aesthetic score (>0.7)\n');

    // Test 6: Full Analysis
    console.log('Test 6: Complete Analysis');
    const test6 = await ContentIntelligenceService.analyzeImage(
        null,
        "Loving my new tech setup! #productivity #workfromhome",
        { features: ['all'] }
    );
    console.log('Result Summary:');
    console.log('- Aesthetic Score:', test6.aestheticScore);
    console.log('- Sentiment:', test6.sentiment.label);
    console.log('- Scene:', test6.scene.type);
    console.log('- Objects:', test6.objectsDetected.map(o => o.label).join(', '));
    console.log('- Safe:', test6.moderation.isSafe);
    console.log('- Provider:', test6.aiProvider);

    // Test 7: Performance Metrics
    console.log('\nTest 7: Service Metrics');
    const metrics = ContentIntelligenceService.getMetrics();
    console.log('Metrics:', metrics);

    // Test 8: Health Check
    console.log('\nTest 8: Health Check');
    const health = await ContentIntelligenceService.healthCheck();
    console.log('Health:', health);

    console.log('\n✅ All tests completed!');
}

// Run tests
runTests().catch(console.error);
```

## Test via API Endpoints

### 1. Health Check
```bash
curl http://localhost:5000/api/ai/health
```

### 2. Get Metrics
```bash
curl http://localhost:5000/api/ai/metrics
```

### 3. Analyze Content
```bash
curl -X POST http://localhost:5000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Beautiful sunset at the beach with friends",
    "features": ["sentiment", "scene", "aesthetic"]
  }'
```

## Expected Test Results

### Positive Sentiment Test
```json
{
  "sentiment": {
    "score": 0.85,
    "label": "positive",
    "intensity": 0.7,
    "emotions": ["joy", "affection"]
  }
}
```

### Moderation Test (Safe)
```json
{
  "moderation": {
    "isSafe": true,
    "riskScore": 0.05,
    "action": "none"
  }
}
```

### Object Detection Test
```json
{
  "objectsDetected": [
    { "label": "laptop", "confidence": 0.95, "category": "tech" },
    { "label": "coffee_cup", "confidence": 0.88, "category": "food" }
  ]
}
```

## Edge Cases to Test

1. **Empty Description**: Should return fallback analysis
2. **Very Long Text**: Should handle gracefully
3. **Special Characters**: Should sanitize properly
4. **Multiple Languages**: Should detect sentiment
5. **Ambiguous Content**: Should flag for review
6. **High-Risk Content**: Should set moderation.action to 'flag'

## Performance Benchmarks

- **Target Latency**: < 1000ms average
- **Cache Hit Rate**: > 30%
- **Success Rate**: > 95%
- **Fallback Rate**: < 5%

## Load Testing

```javascript
// Simple load test
async function loadTest() {
    const tests = 100;
    const start = Date.now();
    
    const promises = [];
    for (let i = 0; i < tests; i++) {
        promises.push(
            ContentIntelligenceService.analyzeImage(null, `Test ${i}`)
        );
    }
    
    await Promise.all(promises);
    const duration = Date.now() - start;
    
    console.log(`Completed ${tests} analyses in ${duration}ms`);
    console.log(`Average: ${duration / tests}ms per analysis`);
}
```

## Validation Checklist

- [ ] All features work correctly
- [ ] Caching reduces duplicate calls
- [ ] Fallback activates on errors
- [ ] Metrics are accurate
- [ ] Health check responds
- [ ] API endpoints are secure
- [ ] Error handling works
- [ ] Performance meets targets

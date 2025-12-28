# G-Network AI Intelligence Service - Documentation

## Overview
The G-Network AI Intelligence Service is a production-grade content analysis system powered by Groq's LLaMA-3.3-70b model. It provides real-time content moderation, aesthetic scoring, sentiment analysis, and intelligent content understanding.

---

## Features

### 1. Content Moderation
Automatically detects and flags inappropriate content:
- **Hate Speech Detection**: Identifies discriminatory or hateful language
- **Violence Detection**: Flags violent or graphic content
- **NSFW Detection**: Identifies adult or explicit content
- **Spam Detection**: Recognizes promotional or spammy content
- **Self-Harm Detection**: Flags content related to self-harm or suicide
- **Harassment Detection**: Identifies bullying or harassment

**Risk Scoring**: Each category receives a score from 0.0 (safe) to 1.0 (high risk)

**Actions**:
- `none`: Content is safe
- `warn`: Content may be borderline
- `flag`: Content requires review
- `remove`: Content violates policies

### 2. Aesthetic Scoring
AI-powered visual quality assessment:
- **Overall Score**: 0.0 to 1.0 rating of visual appeal
- **Composition**: Balance and framing analysis
- **Lighting**: Brightness and contrast evaluation
- **Color Harmony**: Color palette assessment
- **Clarity**: Sharpness and technical quality

Used by the feed algorithm to prioritize high-quality content.

### 3. Object Detection
Identifies objects, people, and subjects in content:
- Detects key items and subjects
- Provides confidence scores
- Categorizes detected objects
- Enables intelligent tagging and search

### 4. Sentiment Analysis
Understands emotional tone of content:
- **Score**: 0.0 (negative) to 1.0 (positive)
- **Label**: positive, neutral, or negative
- **Intensity**: Strength of emotion (0.0-1.0)
- **Emotions**: Specific emotions detected (joy, excitement, etc.)

### 5. Scene Detection
Classifies content context:
- Environment type (indoor/outdoor)
- Setting classification (workspace, travel, food, etc.)
- Confidence scoring
- Context-aware recommendations

---

## API Usage

### Basic Analysis
```javascript
const ContentIntelligenceService = require('./services/aiIntelligence');

const analysis = await ContentIntelligenceService.analyzeImage(
    imageFile,      // Optional: uploaded file object
    description,    // Text description
    options         // Optional: configuration
);
```

### With Options
```javascript
const analysis = await ContentIntelligenceService.analyzeImage(
    imageFile,
    description,
    {
        features: ['moderation', 'aesthetic', 'sentiment'], // Specific features only
        skipCache: false,  // Use cached results if available
        priority: 'high'   // Processing priority
    }
);
```

### Response Structure
```javascript
{
    // Moderation Results
    moderation: {
        isSafe: true,
        riskScore: 0.05,
        categories: {
            hate_speech: 0.01,
            violence: 0.02,
            nsfw: 0.01,
            spam: 0.03,
            self_harm: 0.0,
            harassment: 0.01
        },
        action: "none",
        reason: null
    },

    // Aesthetic Analysis
    aestheticScore: 0.85,
    aestheticDetails: {
        composition: 0.88,
        lighting: 0.82,
        colorHarmony: 0.87,
        clarity: 0.91
    },

    // Object Detection
    objectsDetected: [
        { label: "laptop", confidence: 0.95, category: "tech" },
        { label: "coffee_cup", confidence: 0.88, category: "food" }
    ],

    // Sentiment Analysis
    sentiment: {
        score: 0.78,
        label: "positive",
        intensity: 0.65,
        emotions: ["joy", "excitement"]
    },

    // Scene Classification
    scene: {
        type: "Workspace",
        environment: "indoor",
        setting: "home_office",
        confidence: 0.92
    },

    // Additional Data
    dominantColors: ["#6366f1", "#f59e0b", "#ec4899"],
    tags: ["productivity", "tech", "lifestyle"],
    recommendedCategory: "Technology",
    
    // Metadata
    aiProvider: "Groq-LLaMA-3.3",
    analysisTime: "2025-12-26T23:00:00.000Z",
    confidence: 0.89
}
```

---

## API Endpoints

### Health Check
```http
GET /api/ai/health
```
Returns AI service health status and performance metrics.

**Response**:
```json
{
    "status": "healthy",
    "provider": "Groq",
    "model": "llama-3.3-70b-versatile",
    "lastCheck": "2025-12-26T23:00:00.000Z",
    "metrics": {
        "totalRequests": 1542,
        "successfulRequests": 1520,
        "failedRequests": 22,
        "cacheHits": 380,
        "averageLatency": 652
    }
}
```

### Get Metrics
```http
GET /api/ai/metrics
```
Returns detailed performance metrics.

### Direct Analysis
```http
POST /api/ai/analyze
Content-Type: application/json

{
    "description": "Beautiful sunset at the beach",
    "features": ["aesthetic", "sentiment", "scene"]
}
```

### Clear Cache
```http
POST /api/ai/cache/clear
```
Clears the AI analysis cache (admin only).

---

## Configuration

### Environment Variables

```env
# Groq API
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile

# AI Service Settings
AI_TEMPERATURE=0.3              # Lower = more consistent (0.0-1.0)
AI_MAX_TOKENS=1200              # Maximum response length
AI_CACHE_TTL=3600               # Cache duration in seconds
AI_RETRY_ATTEMPTS=3             # Number of retries on failure
AI_RETRY_DELAY=1000             # Delay between retries (ms)
AI_ENABLE_CACHE=true            # Enable caching
AI_ENABLE_LOGGING=true          # Enable detailed logging
```

---

## Performance Optimization

### Caching Strategy
- **TTL**: Results cached for 1 hour by default
- **Key Generation**: MD5 hash of description + filename
- **Cache Hits**: Significantly reduce API calls and latency
- **Manual Clear**: Available via admin endpoint

### Retry Logic
- **Automatic Retries**: 3 attempts by default
- **Exponential Backoff**: Delay increases with each retry
- **Graceful Degradation**: Falls back to heuristic analysis on failure

### Rate Limiting
- Monitor API usage via metrics endpoint
- Implement application-level throttling if needed
- Use batch processing for multiple items

---

## Error Handling

### Fallback Analysis
If Groq API fails, the service automatically uses heuristic analysis:
- Keyword-based object detection
- Simple sentiment analysis
- Basic scene classification
- Conservative risk scoring

### Error Response
```javascript
{
    aiProvider: "Fallback-Heuristic",
    fallbackReason: "API timeout - connection failed",
    confidence: 0.5,
    // ... standard analysis fields with conservative values
}
```

---

## Best Practices

### 1. Use Specific Features
Request only needed features to reduce latency:
```javascript
{ features: ['moderation'] }  // Faster than 'all'
```

### 2. Enable Caching
Keep caching enabled in production for better performance.

### 3. Handle Errors Gracefully
Always handle the fallback case:
```javascript
if (analysis.aiProvider === 'Fallback-Heuristic') {
    // Handle degraded mode
}
```

### 4. Monitor Performance
Regularly check `/api/ai/metrics` for:
- Average latency
- Error rates
- Cache hit ratio
- API usage

### 5. Batch Processing
For multiple items, implement queuing to avoid rate limits.

---

## Integration Example

### In Post Creation
```javascript
// routes/posts.js
const ContentIntelligenceService = require('../services/aiIntelligence');

router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { description } = req.body;
        
        // AI Analysis
        const aiResults = await ContentIntelligenceService.analyzeImage(
            req.file,
            description,
            { features: ['moderation', 'aesthetic', 'sentiment'] }
        );
        
        // Check moderation
        if (aiResults.moderation.action === 'remove') {
            return res.status(403).json({
                message: 'Content violates community guidelines',
                reason: aiResults.moderation.reason
            });
        }
        
        // Create post with AI data
        const newPost = new Post({
            description,
            image: req.file.path,
            aiIntelligence: aiResults
        });
        
        await newPost.save();
        res.status(201).json(newPost);
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
```

---

## Monitoring & Observability

### Metrics Collection
The service automatically tracks:
- Total requests
- Success/failure rates
- Cache performance
- Average latency
- Provider information

### Logging
Detailed logs for:
- Analysis requests
- API responses
- Errors and retries
- Cache operations

### Health Monitoring
Set up alerts for:
- High error rates (>5%)
- Degraded performance (latency >2s)
- API failures
- Cache issues

---

## Troubleshooting

### Issue: High Latency
**Solution**:
- Check network connectivity
- Verify cache is enabled
- Reduce max_tokens if possible
- Use specific features instead of 'all'

### Issue: API Errors
**Solution**:
- Verify GROQ_API_KEY is correct
- Check API quota and rate limits
- Review error logs for details
- Ensure internet connectivity

### Issue: Inaccurate Results
**Solution**:
- Provide detailed descriptions
- Adjust AI_TEMPERATURE (lower = more predictable)
- Review and refine prompts
- Report edge cases for improvement

### Issue: Cache Not Working
**Solution**:
- Verify AI_ENABLE_CACHE=true
- Check cache stats via metrics
- Ensure node-cache is installed
- Clear cache and restart

---

## Security Considerations

1. **API Key Protection**: Never expose GROQ_API_KEY in client code
2. **Rate Limiting**: Implement application-level throttling
3. **Input Validation**: Sanitize all inputs before analysis
4. **Output Filtering**: Review moderation flags before taking action
5. **Access Control**: Restrict admin endpoints to authorized users

---

## Cost Management

### Optimization Strategies
- **Cache Aggressively**: Reduce duplicate analyses
- **Batch Requests**: Process multiple items together
- **Feature Selection**: Request only needed features
- **Monitor Usage**: Track API calls and costs
- **Set Quotas**: Implement usage limits per user/day

### Expected Costs
- Average: ~$0.0005 per analysis (with caching)
- Peak: ~$0.002 per analysis (no cache)
- Monthly estimate: Based on your usage patterns

---

## Future Enhancements

### Planned Features
- [ ] Multi-language support
- [ ] Custom training on platform data
- [ ] Real-time streaming analysis
- [ ] Visual similarity search
- [ ] Automated content tagging
- [ ] Deep learning-based aesthetic models
- [ ] Advanced sentiment nuance detection

### Model Upgrades
- Support for GPT-4 Vision (multi-modal)
- Custom fine-tuned models
- Ensemble model predictions
- A/B testing different models

---

## Support & Resources

- **Groq Documentation**: https://console.groq.com/docs
- **LLaMA Model Info**: https://www.llama.com/
- **Service Status**: Check `/api/ai/health`
- **Metrics Dashboard**: Check `/api/ai/metrics`

---

## License
This AI service integration is part of the G-Network platform.
© 2025 G-Network. All rights reserved.

#!/bin/bash

# Railway Backend Deployment Script
# Run this script to set all required environment variables

echo "🚀 Setting up Railway Environment Variables..."

# CRITICAL: CORS Configuration
echo "Setting CORS configuration..."
railway variables set FRONTEND_URL="https://mygwnetwork.vercel.app"
railway variables set CORS_ORIGIN="https://mygwnetwork.vercel.app"

# Basic Configuration
echo "Setting basic configuration..."
railway variables set NODE_ENV="production"
railway variables set PORT="5000"

# Database Configuration (YOU NEED TO UPDATE THIS)
echo "⚠️  IMPORTANT: Update MONGO_URI with your actual MongoDB connection string"
echo "railway variables set MONGO_URI=\"mongodb+srv://username:password@cluster.mongodb.net/gnetwork?retryWrites=true&w=majority\""

# Firebase Configuration (YOU NEED TO UPDATE THIS)
echo "⚠️  IMPORTANT: Update FIREBASE_SERVICE_ACCOUNT with your actual service account JSON"
echo "railway variables set FIREBASE_SERVICE_ACCOUNT='{\"type\":\"service_account\",\"project_id\":\"your-project-id\",...}'"

# Optional AI Configuration
echo "Setting optional AI configuration..."
echo "railway variables set GROQ_API_KEY=\"your_groq_api_key_here\""
echo "railway variables set GOOGLE_API_KEY=\"your_google_api_key_here\""

echo "✅ Environment variables setup complete!"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Update MONGO_URI with your actual MongoDB connection string"
echo "2. Update FIREBASE_SERVICE_ACCOUNT with your actual Firebase service account JSON"
echo "3. Railway will auto-redeploy after setting variables"
echo "4. Check deployment logs for successful startup"
echo "5. Test endpoints: https://g-networkc-production.up.railway.app/health"
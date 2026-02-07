# Deploy Supabase Functions Script
# Run this script in PowerShell to deploy your backend functions to the new project.

Write-Host "Starting Supabase Functions Deployment for Project vcrqdjsbydrdmfxeblxb..." -ForegroundColor Cyan

# 1. Login if needed (this might open a browser)
supabase login

# 2. Link to the new project
Write-Host "Linking to project..."
supabase link --project-ref vcrqdjsbydrdmfxeblxb

# 3. Deploy functions
Write-Host "Deploying functions..."
supabase functions deploy livekit-token --no-verify-jwt
supabase functions deploy generate-tools --no-verify-jwt

# 4. Prompt for secrets (Optional but helpful)
Write-Host "IMPORTANT: You must set your LiveKit secrets for these functions to work!" -ForegroundColor Yellow
Write-Host "Run the following command manually with your actual keys:"
Write-Host "supabase secrets set LIVEKIT_API_KEY=... LIVEKIT_API_SECRET=... LIVEKIT_URL=..." -ForegroundColor Green

Write-Host "Deployment complete. Once secrets are set, the app will work." -ForegroundColor Green

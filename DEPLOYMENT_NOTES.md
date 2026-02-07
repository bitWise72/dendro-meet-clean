# CRITICAL: Backend Functions Missing

The frontend is now correctly pointing to your new Supabase project (`vcrqd...`), but the **functions (`livekit-token` and `generate-tools`) are NOT deployed or configured on this new project.**

This is why you get `Failed to fetch` or CORS errors. The browser is calling an empty address.

## Required Action: Deploy Backend

Run the following commands in your terminal to deploy the backend logic:

1.  **Login to Supabase** (if needed):
    ```powershell
    supabase login
    ```

2.  **Link to New Project**:
    ```powershell
    supabase link --project-ref vcrqdjsbydrdmfxeblxb
    ```
    *(Enter your DB password if prompted)*

3.  **Deploy Functions**:
    ```powershell
    supabase functions deploy livekit-token --no-verify-jwt
    supabase functions deploy generate-tools --no-verify-jwt
    ```

4.  **Set Secrets (CRITICAL)**:
    The functions will crash (CORS error) without these. You must set them using your actual LiveKit keys:
    ```powershell
    supabase secrets set LIVEKIT_API_KEY="<your_api_key>" LIVEKIT_API_SECRET="<your_secret_key>" LIVEKIT_URL="<your_livekit_url>"
    ```

Once you do this, the URL `https://vcrqdjsbydrdmfxeblxb.supabase.co/functions/v1/livekit-token` will work, and you can join the room.

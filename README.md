# Remote Keyboard

Use an iPad as a full-screen keyboard for a Windows computer from any network. The keyboard is hosted securely on Vercel and the Windows receiver connects outward over HTTPS.

## Start

1. Deploy this folder to Vercel.
2. In the Vercel project, add an Upstash Redis integration. It supplies `KV_REST_API_URL` and `KV_REST_API_TOKEN` (the `UPSTASH_REDIS_REST_*` names are also accepted).
3. Double-click **Start Remote Keyboard.bat** on Windows.
4. On first run, paste the HTTPS address of the deployed Vercel site.
5. Open the private pairing link shown in the window on the iPad.
6. In Safari, use **Share → Add to Home Screen** for the full-screen experience.

Keep the black window open while using the keyboard. Close it or press Ctrl+C to stop the receiver.

## Requirements and safety

- Windows 10 or 11
- Python 3.9 or newer
- Internet access on both devices

The private pairing link contains a high-entropy secret. Do not share it. Commands expire from the relay after 30 seconds. Stop the receiver when finished. Delete `remote-keyboard.json` to revoke the old link and create a new pairing.
"# keyboard" 

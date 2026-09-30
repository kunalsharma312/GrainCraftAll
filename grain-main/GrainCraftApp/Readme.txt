Create Android apk
cd android && ./gradlew :app:assembleRelease

Google sign-in setup
1. Create OAuth client IDs for Android, iOS, and Web in Google Cloud Console.
2. Copy .env.e  xample to .env and provide the matching client IDs. For Android, configure the application ID com.graincraftapp.mobile and the SHA-1 certificate fingerprint used to sign the app.
3. Rebuild the native app after configuring IDs: cd android && ./gradlew :app:assembleRelease

The first sign-in reads the Google profile name, email, and photo. Sign-in state and saved delivery addresses are stored on the device. Phone and delivery details are collected at checkout, not from Google.




// Get Google OAuth ID
// https://console.cloud.google.com/auth/clients?chat=true&project=learningmaps-290110

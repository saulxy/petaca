Edited package.json

To redeploy **Petaca** for debugging on your connected Moto G Power 5G from the command console, you have three quick options:

---

### Option 1: Using Convenience npm Script (Recommended)

Helper scripts have been added to your [package.json](file:///c:/Users/im_sa_sy8qn1m/dev_workspace/petaca/package.json). Simply run:

```bash
cmd /c npm run android:run
```

This script will automatically:
1. Compile your latest React/Vite code (`npm run build`)
2. Sync the compiled web assets into the Android native directory (`npx cap sync android`)
3. Install the debug APK onto your connected device (`adb install -r ...`)
4. Launch `com.petaca.app` on the phone.

---

### Option 2: Using the Capacitor CLI

Run the built-in Capacitor runner:

```bash
npx cap run android
```

Capacitor will detect your connected Moto G Power 5G (`ZY22JZK2RK`), compile the project, and deploy it to the device automatically.

---

### Option 3: Manual Step-by-Step Commands

If you prefer executing each step manually:

1. **Rebuild web assets and sync to native Android**:
   ```bash
   cmd /c npm run build
   npx cap sync android
   ```

2. **Rebuild the debug APK** (ensuring JDK 21 is set as `JAVA_HOME`):
   - **PowerShell**:
     ```powershell
     $env:JAVA_HOME="C:\Users\im_sa_sy8qn1m\.jdks\jdk-21.0.6+7"
     cd android
     .\gradlew.bat assembleDebug
     cd ..
     ```
   - **Command Prompt (CMD)**:
     ```cmd
     set "JAVA_HOME=C:\Users\im_sa_sy8qn1m\.jdks\jdk-21.0.6+7"
     cd android && gradlew assembleDebug && cd ..
     ```

3. **Install & Launch via ADB**:
   ```bash
   adb install -r android/app/build/outputs/apk/debug/app-debug.apk
   adb shell am start -n com.petaca.app/.MainActivity
   ```

---

### 🔍 Monitoring Logcat Errors

To stream runtime errors and `console.log` output from your app while debugging:

```bash
adb logcat -c
adb logcat --pid=$(adb shell pidof com.petaca.app)
```
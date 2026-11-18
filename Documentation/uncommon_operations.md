Viewed running_on_phone.md:9-44
Generated image: "A modern 3D app icon for an eBay inventory app named Petaca. Features a sleek 3D isometric shipping package box with an inventory barcode tag, glowing cyan and blue accents, dark obsidian background, minimalist, clean rounded square app icon asset style, 1024x1024 resolution."
Ran command: `powershell -Command "New-Item -ItemType Directory -Force -Path 'assets'; Copy-Item -Path 'C:\Users\im_sa_sy8qn1m\.gemini\antigravity-ide\brain\554b25ee-e7ae-45e1-9fab-ce2d455ed3ec\petaca_app_icon_1785879945754.png' -Destination 'assets\icon.png' -Force; Copy-Item -Path 'C:\Users\im_sa_sy8qn1m\.gemini\antigravity-ide\brain\554b25ee-e7ae-45e1-9fab-ce2d455ed3ec\petaca_app_icon_1785879945754.png' -Destination 'public\icon.png' -Force"`
Ran command: `cmd /c npx -y @capacitor/assets generate --android`

Generating native Android app icon assets via `@capacitor/assets` in the background (task ID: `task-259`).

Ran command: `$env:JAVA_HOME="C:\Users\im_sa_sy8qn1m\.jdks\jdk-21.0.6+7"; cd android; .\gradlew.bat assembleDebug; cd ..; adb install -r android/app/build/outputs/apk/debug/app-debug.apk`

Rebuilding and deploying the updated APK with the custom app icons to your Moto G Power 5G in the background (task ID: `task-265`).

To customize the app icon for **Petaca** (both for native Android launcher icons and splash screens), follow these simple steps:

---

### Method 1: Automatic Generation via `@capacitor/assets` (Recommended)

Capacitor includes an official asset generation tool (`@capacitor/assets`) that takes a single high-resolution square image and automatically creates all required Android adaptive icons, round launcher icons, and splash screen densities in `android/app/src/main/res/`.

1. **Place your source icon**:
   - Provide a 1024×1024 PNG file at `assets/icon.png` in your project root.
   - *(Note: I have already generated a modern 3D 1024x1024 app icon for Petaca and placed it at [assets/icon.png](file:///c:/Users/im_sa_sy8qn1m/dev_workspace/petaca/assets/icon.png)).*

2. **Generate Native Android Icons**:
   Run the following command from your terminal:
   ```bash
   cmd /c npx -y @capacitor/assets generate --android
   ```
   *(This automatically populates all `mipmap-hdpi`, `mipmap-xhdpi`, `mipmap-xxhdpi`, `mipmap-xxxhdpi`, adaptive background/foreground icons, and splash screens in your native Android app folder).*

3. **Rebuild and Deploy**:
   ```bash
   cmd /c npm run android:run
   ```

---

### Method 2: Manual Icon Replacement

If you prefer to manually swap out icon files:

- **Android Mipmap Icons**: Replace the PNG files directly inside:
  `android/app/src/main/res/mipmap-*/ic_launcher.png`
  `android/app/src/main/res/mipmap-*/ic_launcher_round.png`
  `android/app/src/main/res/mipmap-*/ic_launcher_foreground.png`
- **Web Favicon**: Update `index.html` or replace the icon reference:
  ```html
  <link rel="icon" type="image/png" href="/icon.png" />
  ```
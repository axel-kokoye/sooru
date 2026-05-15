# Sóóru Citoyen — Android Build Guide
**Axe Webtech · Projet Sóóru · Version 1.0.0**

---

## 🏗️ Structure du projet

```
sooru-android/
├── .github/
│   └── workflows/
│       └── android-build.yml       ← Pipeline CI/CD GitHub Actions
├── android/
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── assets/public/
│   │   │   │   └── index.html      ← Votre app HTML (copié par cap sync)
│   │   │   ├── java/bj/sooru/citoyen/
│   │   │   │   └── MainActivity.java
│   │   │   ├── res/
│   │   │   │   ├── values/
│   │   │   │   │   ├── strings.xml
│   │   │   │   │   └── styles.xml
│   │   │   │   └── xml/
│   │   │   │       ├── file_provider_paths.xml
│   │   │   │       └── network_security_config.xml
│   │   │   └── AndroidManifest.xml
│   │   ├── build.gradle            ← Config Gradle (module app)
│   │   └── proguard-rules.pro
│   ├── build.gradle                ← Config Gradle (projet)
│   ├── gradle/wrapper/
│   │   └── gradle-wrapper.properties
│   └── local.properties            ← Chemin SDK local (ne pas committer)
├── capacitor.config.ts
├── package.json
├── .gitignore
└── README.md
```

---

## 🔑 Création du Keystore (à faire une seule fois)

Le keystore est votre certificat d'identité de l'application.
**Sans lui, vous ne pouvez pas mettre à jour l'app sur le Play Store.**

### Générer le keystore

```bash
keytool -genkey -v \
  -keystore sooru-release.keystore \
  -alias sooru-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

Répondez aux questions (nom, organisation, pays).
**Conservez le .keystore et ses mots de passe précieusement.** Leur perte est irréversible.

### Encoder pour GitHub Secrets

```bash
# macOS
base64 -i sooru-release.keystore | pbcopy

# Linux
base64 sooru-release.keystore
```

---

## 🔐 Configuration des GitHub Secrets

Dans votre repo GitHub : **Settings → Secrets and variables → Actions → New repository secret**

| Nom du secret      | Valeur                                         |
|--------------------|------------------------------------------------|
| `KEYSTORE_BASE64`  | Sortie de la commande `base64` ci-dessus       |
| `KEYSTORE_PASSWORD`| Mot de passe du keystore                       |
| `KEY_ALIAS`        | `sooru-key` (ou votre alias)                   |
| `KEY_PASSWORD`     | Mot de passe de la clé (souvent identique)     |

---

## 🚀 Build local (développement)

```bash
# 1. Installer les dépendances
npm install

# 2. Copier votre HTML dans www/
mkdir -p www && cp index.html www/

# 3. Synchroniser Capacitor → Android
npx cap sync android

# 4. Ouvrir dans Android Studio
npx cap open android
```

Dans Android Studio : **Build → Generate Signed Bundle/APK → APK → Release**

---

## ✅ Checklist de Sécurité & Stabilité

### 🔐 Sécurité

- [ ] **Keystore jamais committé** : vérifier `.gitignore` contient `*.keystore`
- [ ] **Secrets dans GitHub Secrets** uniquement, jamais en dur dans le code
- [ ] **`webContentsDebuggingEnabled = false`** en production (MainActivity.java)
- [ ] **SSL strict** : `handler.cancel()` dans `onReceivedSslError` (pas `handler.proceed()`)
- [ ] **`cleartext = false`** dans `network_security_config.xml` (production)
- [ ] **`allowUniversalAccessFromFileURLs = false`** (WebSettings)
- [ ] **`allowFileAccessFromFileURLs = false`** (WebSettings)
- [ ] **FileProvider configuré** avec `android:exported="false"`
- [ ] **`android:grantUriPermissions="true"`** sur le FileProvider

### 📦 Stockage & Fichiers

- [ ] Permissions `READ_MEDIA_IMAGES` / `READ_MEDIA_VIDEO` présentes (Android 13+)
- [ ] `READ_EXTERNAL_STORAGE` avec `maxSdkVersion="32"` (Android ≤ 12)
- [ ] `WRITE_EXTERNAL_STORAGE` avec `maxSdkVersion="29"` (Android ≤ 10)
- [ ] `file_provider_paths.xml` couvre `files-path`, `cache-path`, `external-path`
- [ ] Runtime permissions demandées AVANT toute action de stockage (MainActivity)
- [ ] `android:requestLegacyExternalStorage="true"` présent (Android 10 compat)

### 📱 WebView & Viewport

- [ ] `setUseWideViewPort(true)` configuré
- [ ] `setLoadWithOverviewMode(true)` configuré
- [ ] `setSupportZoom(false)` pour désactiver le pinch-to-zoom indésirable
- [ ] `setDomStorageEnabled(true)` pour localStorage HTML5
- [ ] `setJavaScriptEnabled(true)` activé
- [ ] Meta viewport présent dans `index.html` : `width=device-width, initial-scale=1.0`

### 🤖 GitHub Actions

- [ ] Licences Android acceptées avec `yes | sdkmanager --licenses`
- [ ] `gradle-wrapper.properties` épingle une version précise de Gradle (8.6)
- [ ] `agp` (Android Gradle Plugin) épinglé à `8.3.2` dans `build.gradle`
- [ ] `compileSdk` et `targetSdk` alignés sur la même API (34)
- [ ] `gradlew` a les permissions d'exécution (`chmod +x`)
- [ ] `local.properties` généré dans le workflow (`sdk.dir=$ANDROID_HOME`)
- [ ] APK vérifié avec `apksigner verify` après le build
- [ ] Cache Gradle configuré (`actions/cache@v4`)

### 🎨 UI & Performance

- [ ] `android:windowBackground` = couleur de l'app (évite le flash blanc)
- [ ] `android:statusBarColor` = vert foncé Sóóru `#0A2A1C`
- [ ] `android:windowLightStatusBar = false` (icônes claires sur fond sombre)
- [ ] `minifyEnabled true` et `shrinkResources true` en release
- [ ] ProGuard garde les classes Capacitor (`-keep class com.getcapacitor.**`)

---

## 🐛 Erreurs courantes & solutions

| Erreur | Cause | Solution |
|--------|-------|----------|
| `License for package not accepted` | Licences SDK non acceptées en CI | `yes \| sdkmanager --licenses` dans le workflow |
| `Could not find tools.jar` | Mauvaise version Java | Utiliser `temurin` JDK 17 |
| `FileUriExposedException` | Fichier partagé via `file://` | Utiliser FileProvider + `content://` |
| `ERR_CLEARTEXT_NOT_PERMITTED` | API HTTP bloquée | Ajouter le domaine dans `network_security_config.xml` |
| `Gradle build daemon disappeared` | Mémoire insuffisante | Ajouter `org.gradle.jvmargs=-Xmx4g` dans `gradle.properties` |
| `INSTALL_PARSE_FAILED_NO_CERTIFICATES` | APK non signé | Vérifier les secrets KEYSTORE_* dans GitHub |
| `Cap sync: www directory not found` | Dossier `www/` absent | Créer `www/` et y copier `index.html` avant `cap sync` |

---

## 📞 Support

Axe Webtech — Cotonou, Bénin
Projet Sóóru — Plateforme civique béninoise

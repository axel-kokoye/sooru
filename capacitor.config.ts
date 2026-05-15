import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'bj.sooru.citoyen',
  appName: 'Sóóru Citoyen',
  webDir: 'www',           // Capacitor copie www/ → assets/public/ automatiquement
  server: {
    // Désactivé en production : l'app charge depuis les assets locaux
    // Activer uniquement pour le debug livereload :
    // url: 'http://192.168.1.x:3000',
    // cleartext: true,
    androidScheme: 'https', // Utilise https:// pour éviter les restrictions WebView modernes
    hostname: 'sooru.bj',  // Hostname fictif stable pour les cookies / localStorage
  },
  android: {
    buildOptions: {
      keystorePath: 'sooru-release.keystore',   // chemin relatif au dossier android/
      keystoreAlias: 'sooru-key',
      keystorePassword: process.env.KEYSTORE_PASSWORD || '',
      keystoreAliasPassword: process.env.KEY_PASSWORD || '',
      releaseType: 'APK',
    },
    // Active le support des fichiers chiffrés (Android 7+)
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,  // false en production, true pour debug USB
  },
  plugins: {
    // Configuration du plugin Filesystem
    // (Capacitor Filesystem gère les permissions automatiquement)
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#0A2A1C',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;

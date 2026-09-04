# HerbalTrace - Setup Guide

## Quick Start

### 1. Install Flutter

Download and install Flutter from [flutter.dev](https://flutter.dev)

Verify installation:
```bash
flutter doctor
```

### 2. Clone and Setup

```bash
cd HerbalTrace
flutter pub get
flutter pub run build_runner build
```

### 3. Configure API

Edit `lib/core/services/sync_service.dart`:
```dart
static const String apiBaseUrl = 'https://your-backend-api.com';
```

### 4. Add Google Maps API Key

#### Android
Edit `android/app/src/main/AndroidManifest.xml`:
```xml
<meta-data
    android:name="com.google.android.geo.API_KEY"
    android:value="YOUR_API_KEY_HERE"/>
```

#### iOS
Edit `ios/Runner/AppDelegate.swift`:
```swift
import GoogleMaps

GMSServices.provideAPIKey("YOUR_API_KEY_HERE")
```

### 5. Run the App

```bash
flutter run
```

If you are on Windows and see `Building with plugins requires symlink support`, enable **Developer Mode** in Windows Settings first, then run `flutter run` again.

## Demo Credentials

The app accepts any email/password for demo purposes.

### Test User Flows

**Farmer Role:**
1. Login with any credentials
2. Select "Farmer / Collector" role
3. Create a new collection event
4. View dashboard and submission history

**Consumer Role:**
1. Login with any credentials
2. Select "Consumer" role  
3. Scan QR code (use demo batch ID: `BATCH001`)
4. View provenance information

## Project Structure

```
lib/
├── core/
│   ├── models/          # Data models
│   ├── providers/       # State management (Theme, Locale)
│   ├── routes/          # App navigation
│   ├── services/        # Storage, Sync, Location services
│   └── theme/           # App theme configuration
├── features/
│   ├── auth/            # Login & role selection
│   ├── farmer/          # Farmer app features
│   └── consumer/        # Consumer app features
└── main.dart           # App entry point
```

## Features Implemented

✅ Role-based authentication (Farmer/Consumer)  
✅ Offline-first data storage with Hive  
✅ GPS location capture  
✅ Multi-image camera capture  
✅ Collection event creation  
✅ Farmer dashboard with statistics  
✅ Submission history with sync status  
✅ QR code scanner  
✅ Provenance viewer with timeline  
✅ Google Maps integration  
✅ Dark mode support  
✅ Bilingual support (English/Hindi)  
✅ Nature-inspired UI design  
✅ Smooth animations and transitions  

## Customization

### Change Theme Colors

Edit `lib/core/theme/app_theme.dart`:
```dart
static const Color primaryGreen = Color(0xFF6B9080);
static const Color secondaryBrown = Color(0xFFA4AC86);
// Add your custom colors
```

### Add More Languages

Edit `lib/core/providers/locale_provider.dart`:
```dart
static const Map<String, String> _frTranslations = {
  'login': 'Connexion',
  // Add translations
};
```

### Modify Herb Species List

Edit `lib/features/farmer/screens/new_collection_screen.dart`:
```dart
final List<String> _herbSpecies = [
  'Ashwagandha',
  'Your Custom Herb',
  // Add more species
];
```

## Backend Integration

The app expects these API endpoints:

### POST /api/collection-events
Create a new collection event
```json
{
  "id": "uuid",
  "farmerId": "string",
  "species": "string",
  "latitude": number,
  "longitude": number,
  "imagePaths": ["string"],
  "weight": number,
  "moisture": number,
  "quality": "string",
  "notes": "string",
  "timestamp": "ISO8601"
}
```

Response:
```json
{
  "blockchainHash": "string"
}
```

### GET /api/provenance/{batchId}
Get provenance data for a batch
```json
{
  "batchId": "string",
  "collectionEvent": {...},
  "processingSteps": [...],
  "qualityTests": [...],
  "sustainabilityCert": {...},
  "chainOfCustody": {...}
}
```

### POST /api/scans
Record a QR scan
```json
{
  "batchId": "string",
  "userId": "string",
  "timestamp": "ISO8601"
}
```

## Troubleshooting

### Camera not working
- Check permissions in AndroidManifest.xml and Info.plist
- Run `flutter clean` and rebuild

### GPS not capturing
- Enable location services on device
- Check location permissions
- Test on physical device (emulator GPS is unreliable)

### Hive errors
- Run code generation: `flutter pub run build_runner build --delete-conflicting-outputs`

### Maps not showing
- Ensure Google Maps API key is correctly set
- Enable Maps SDK in Google Cloud Console

### Windows plugin build error
- Enable **Developer Mode** in Windows Settings so Flutter can create the plugin symlinks it needs
- Then rerun `flutter run`

## Building for Release

### Android APK
```bash
flutter build apk --release
```

### Android App Bundle
```bash
flutter build appbundle --release
```

### iOS
```bash
flutter build ios --release
```

## Performance Tips

1. Images are automatically compressed (max 1920x1080, 85% quality)
2. Provenance data is cached for 24 hours
3. Sync occurs in background every 5 minutes when connected
4. Use `flutter run --profile` to test performance

## Next Steps

- [ ] Integrate with your blockchain backend
- [ ] Add push notifications for sync status
- [ ] Implement payment tracking
- [ ] Add more quality test types
- [ ] Create admin dashboard
- [ ] Add analytics

## Support

For issues or questions:
- Create an issue on GitHub
- Email: support@herbaltrace.com

---

**Happy Coding! 🌿**

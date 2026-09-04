# HerbalTrace - Blockchain-Based Botanical Traceability App

A modern, elegant Flutter application for tracing Ayurvedic herbs from farm to consumer using blockchain technology.

![Flutter](https://img.shields.io/badge/Flutter-3.0+-02569B?logo=flutter)
![Dart](https://img.shields.io/badge/Dart-3.0+-0175C2?logo=dart)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌿 Features

### For Farmers / Wild Collectors (Role A)

- **Collection Event Creation**
  - Automatic GPS location capture
  - Multi-image capture (up to 3 images)
  - Species selection from curated list
  - Quality attributes (weight, moisture, grade)
  - Offline submission storage with sync queue
  - Acknowledgement screen with event ID

- **Dashboard**
  - Daily submission summary
  - Payment status tracking
  - Sustainability score display
  - Reward points system
  - Batch status monitoring
  - Sync status badges (synced/pending)

- **Profile & Training**
  - Document management
  - Training video library
  - Account settings

### For Consumers (Role B)

- **QR Code Scanner**
  - Fast, reliable scanning
  - Offline capability (cached data)
  - Real-time feedback

- **Provenance Viewer**
  - Geo-tagged harvest map
  - Complete chain of custody timeline
  - Processing events history
  - Quality test results
  - Sustainability certification
  - Blockchain verification

- **Rewards Dashboard**
  - Points for each scan
  - Scan history
  - Engagement tracking

## 🎨 Design Philosophy

HerbalTrace features a **nature-inspired design** with:

- **Muted earth tones** - Calming color palette inspired by herbs and nature
- **Soft card shadows** - Gentle depth and hierarchy
- **Rounded geometry** - Friendly, approachable interface
- **Smooth animations** - Fluid transitions between screens
- **Readable typography** - Clear Poppins font family

### Color Palette

```dart
Primary Green: #6B9080
Secondary Brown: #A4AC86
Accent Sage: #87A878
Warm Beige: #F2E8CF
Earth Brown: #BC8B62
```

## 📱 Screenshots

_(Add screenshots here after running the app)_

## 🚀 Getting Started

### Prerequisites

- Flutter SDK 3.0 or higher
- Dart 3.0 or higher
- Android Studio / VS Code
- Android SDK / iOS SDK

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/herbal-trace.git
   cd herbal-trace
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Generate code (for Hive adapters)**
   ```bash
   flutter pub run build_runner build
   ```

4. **Run the app**
   ```bash
   flutter run
   ```

  If you are on Windows and Flutter reports `Building with plugins requires symlink support`, enable **Developer Mode** in Windows Settings and run the command again.

### Configuration

Edit `lib/core/services/sync_service.dart` to set your API base URL:

```dart
static const String apiBaseUrl = 'https://your-api-url.com';
```

## 📦 Offline-First Architecture

HerbalTrace is built with **offline-first** principles:

### For Farmers
- All collection events stored locally using Hive
- Automatic sync queue management
- Background sync when connectivity returns
- Visual sync status indicators
- No data loss even without internet

### For Consumers
- QR scans work offline
- Provenance data cached for 24 hours
- Scan rewards queued for later sync
- Graceful degradation of features

## 🗂️ Project Structure

```
lib/
├── core/
│   ├── models/          # Data models
│   ├── providers/       # State management
│   ├── routes/          # Navigation
│   ├── services/        # Business logic
│   └── theme/           # App theming
├── features/
│   ├── auth/            # Authentication
│   ├── farmer/          # Farmer features
│   │   ├── providers/
│   │   ├── screens/
│   │   └── widgets/
│   └── consumer/        # Consumer features
│       ├── providers/
│       ├── screens/
│       └── widgets/
└── main.dart
```

## 🌍 Internationalization

Supports:
- 🇬🇧 English
- 🇮🇳 Hindi (हिंदी)

Toggle language from any screen using the language icon.

## 🎯 Key Technologies

- **Flutter** - Cross-platform UI framework
- **Provider** - State management
- **Hive** - Local database for offline storage
- **Geolocator** - GPS location services
- **Google Maps** - Map visualization
- **QR Code Scanner** - QR scanning functionality
- **Connectivity Plus** - Network status monitoring

## 🔐 Permissions

### Android (`android/app/src/main/AndroidManifest.xml`)

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
<uses-permission android:name="android.permission.CAMERA"/>
```

### iOS (`ios/Runner/Info.plist`)

```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to capture herb images</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need location to record harvest GPS coordinates</string>
```

## 🧪 Testing

Run tests with:
```bash
flutter test
```

## 🏗️ Building for Production

### Android
```bash
flutter build apk --release
```

### iOS
```bash
flutter build ios --release
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Authors

- Your Name - KUNAL KUMAR DUBEY
- 

## 🙏 Acknowledgments

- Inspired by sustainable agriculture practices
- Built for Ayurvedic herb traceability
- Designed with love for nature 🌿

## 📞 Support

For support, email support@herbaltrace.com or create an issue in this repository.

---

**Made with ❤️ and Flutter**

class GeofenceResult {
  final bool allowed;
  final String? message;
  final bool isForestWarning;
  final String regionDetected;

  GeofenceResult({
    required this.allowed,
    this.message,
    this.isForestWarning = false,
    this.regionDetected = 'Standard Agro Zone',
  });
}

class GeofenceService {
  // Delhi NCR Bounding Box
  static const double delhiMinLat = 28.40;
  static const double delhiMaxLat = 28.88;
  static const double delhiMinLon = 76.84;
  static const double delhiMaxLon = 77.35;

  // Uttar Pradesh Bounding Box
  static const double upMinLat = 23.87;
  static const double upMaxLat = 30.40;
  static const double upMinLon = 77.08;
  static const double upMaxLon = 84.64;

  // Bihar Bounding Box
  static const double biharMinLat = 24.28;
  static const double biharMaxLat = 27.52;
  static const double biharMinLon = 83.32;
  static const double biharMaxLon = 88.29;

  // Protected Forest & Sanctuary Zones (Sample coordinates for high-conservation sanctuaries)
  static final List<Map<String, dynamic>> protectedForestZones = [
    {
      'name': 'Hastinapur Wildlife Sanctuary Zone',
      'minLat': 28.90,
      'maxLat': 29.40,
      'minLon': 77.90,
      'maxLon': 78.35,
    },
    {
      'name': 'Dudhwa National Park Reserved Forest',
      'minLat': 28.25,
      'maxLat': 28.70,
      'minLon': 80.40,
      'maxLon': 81.00,
    },
    {
      'name': 'Valmiki National Park Conservation Zone',
      'minLat': 27.20,
      'maxLat': 27.55,
      'minLon': 83.85,
      'maxLon': 84.45,
    },
    {
      'name': 'Asola Bhatti Wildlife Sanctuary (Delhi Border)',
      'minLat': 28.43,
      'maxLat': 28.52,
      'minLon': 77.20,
      'maxLon': 77.28,
    }
  ];

  /// Check if coordinates are in Delhi NCR
  static bool isInDelhi(double lat, double lon) {
    return lat >= delhiMinLat && lat <= delhiMaxLat && lon >= delhiMinLon && lon <= delhiMaxLon;
  }

  /// Check if coordinates are in Uttar Pradesh
  static bool isInUttarPradesh(double lat, double lon) {
    return lat >= upMinLat && lat <= upMaxLat && lon >= upMinLon && lon <= upMaxLon;
  }

  /// Check if coordinates are in Bihar
  static bool isInBihar(double lat, double lon) {
    return lat >= biharMinLat && lat <= biharMaxLat && lon >= biharMinLon && lon <= biharMaxLon;
  }

  /// Detect Region Name
  static String getRegionName(double lat, double lon) {
    if (isInDelhi(lat, lon)) return 'Delhi NCR';
    if (isInUttarPradesh(lat, lon)) return 'Uttar Pradesh';
    if (isInBihar(lat, lon)) return 'Bihar';
    return 'Other Region (${lat.toStringAsFixed(2)}, ${lon.toStringAsFixed(2)})';
  }

  /// Check if location is inside a protected forest reserve
  static Map<String, dynamic>? getProtectedForestViolation(double lat, double lon) {
    for (var forest in protectedForestZones) {
      if (lat >= forest['minLat'] &&
          lat <= forest['maxLat'] &&
          lon >= forest['minLon'] &&
          lon <= forest['maxLon']) {
        return forest;
      }
    }
    return null;
  }

  /// Main Geo-fencing Validator
  static GeofenceResult validateHarvest({
    required String species,
    required double latitude,
    required double longitude,
  }) {
    final cleanSpecies = species.trim().toLowerCase();

    // 1. Check Protected Forest Boundary
    final forest = getProtectedForestViolation(latitude, longitude);
    if (forest != null) {
      return GeofenceResult(
        allowed: false,
        isForestWarning: true,
        regionDetected: forest['name'],
        message: '⚠️ Protected Forest Boundary Detected (${forest['name']}). Wild herbal collection without Forest Dept transit pass is prohibited by AYUSH conservation guidelines.',
      );
    }

    // 2. Brahmi-Specific Geo-Fence Rule:
    // Permitted in Uttar Pradesh and Bihar; Strictly NOT allowed in Delhi
    if (cleanSpecies.contains('brahmi') || cleanSpecies.contains('ब्राह्मी')) {
      if (isInDelhi(latitude, longitude)) {
        return GeofenceResult(
          allowed: false,
          isForestWarning: false,
          regionDetected: 'Delhi NCR',
          message: '⛔ Geo-Fence Restriction: Brahmi cultivation/wild harvesting is not permitted in Delhi urban zone. Certified collection is only authorized in registered agro-zones of Uttar Pradesh and Bihar.',
        );
      }

      if (!isInUttarPradesh(latitude, longitude) && !isInBihar(latitude, longitude)) {
        return GeofenceResult(
          allowed: false,
          isForestWarning: false,
          regionDetected: getRegionName(latitude, longitude),
          message: '⛔ Geo-Fence Alert: Brahmi must be collected within designated wetland/alluvial zones of Uttar Pradesh or Bihar for authentic AYUSH provenance.',
        );
      }
    }

    return GeofenceResult(
      allowed: true,
      regionDetected: getRegionName(latitude, longitude),
      message: '✅ Verified within permitted botanical harvest zone (${getRegionName(latitude, longitude)}).',
    );
  }
}

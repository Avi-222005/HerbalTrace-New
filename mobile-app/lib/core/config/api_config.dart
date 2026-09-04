import 'dart:async';
import 'package:http/http.dart' as http;
import '../services/storage_service.dart';

class ApiConfig {
  // Default fallback URLs
  static const String defaultLocalUrl = 'http://10.179.59.4:3000';
  static const String defaultProductionUrl = 'https://herbal-trace-production.up.railway.app';
  static const String defaultEmulatorUrl = 'http://10.0.2.2:3000';
  static const String defaultLocalhostUrl = 'http://127.0.0.1:3000';

  static String? _cachedActiveUrl;
  static bool _isDiscovering = false;

  /// Candidate list to auto-probe when Wi-Fi or networks change
  static List<String> get candidateUrls {
    final list = <String>[];
    final savedUrl = StorageService.getSetting('apiBaseUrl')?.toString().trim();
    if (savedUrl != null && savedUrl.isNotEmpty) {
      list.add(savedUrl.replaceAll(RegExp(r'/$'), ''));
    }
    list.addAll([
      defaultLocalUrl,
      defaultEmulatorUrl,
      defaultLocalhostUrl,
      defaultProductionUrl,
    ]);
    // Return deduplicated list
    return list.toSet().toList();
  }

  /// Get active base URL from cache, storage, or fallback
  static String get baseUrl {
    if (_cachedActiveUrl != null && _cachedActiveUrl!.isNotEmpty) {
      return _cachedActiveUrl!;
    }
    final savedUrl = StorageService.getSetting('apiBaseUrl');
    if (savedUrl != null && savedUrl.toString().trim().isNotEmpty) {
      _cachedActiveUrl = savedUrl.toString().trim().replaceAll(RegExp(r'/$'), '');
      return _cachedActiveUrl!;
    }
    return defaultLocalUrl;
  }

  /// Update base URL manually if desired
  static Future<void> setBaseUrl(String url) async {
    final cleanUrl = url.trim().replaceAll(RegExp(r'/$'), '');
    _cachedActiveUrl = cleanUrl;
    await StorageService.saveSetting('apiBaseUrl', cleanUrl);
  }

  /// Automated Backend Auto-Discovery:
  /// Probes candidate server URLs concurrently and locks onto the fastest healthy server.
  static Future<String> autoDetectWorkingServer({Duration timeout = const Duration(milliseconds: 2500)}) async {
    if (_isDiscovering && _cachedActiveUrl != null) return _cachedActiveUrl!;
    _isDiscovering = true;

    try {
      final candidates = candidateUrls;
      final completer = Completer<String>();
      int pending = candidates.length;

      for (final candidate in candidates) {
        _probeCandidate(candidate, timeout).then((isHealthy) {
          if (isHealthy && !completer.isCompleted) {
            completer.complete(candidate);
          } else {
            pending--;
            if (pending == 0 && !completer.isCompleted) {
              // If none responded in timeout, fallback to production cloud URL
              completer.complete(defaultProductionUrl);
            }
          }
        }).catchError((_) {
          pending--;
          if (pending == 0 && !completer.isCompleted) {
            completer.complete(defaultProductionUrl);
          }
        });
      }

      final workingUrl = await completer.future;
      _cachedActiveUrl = workingUrl;
      await StorageService.saveSetting('apiBaseUrl', workingUrl);
      print('🚀 [ApiConfig] Auto-connected to backend: $workingUrl');
      _isDiscovering = false;
      return workingUrl;
    } catch (e) {
      _isDiscovering = false;
      _cachedActiveUrl = defaultProductionUrl;
      return defaultProductionUrl;
    }
  }

  /// Probe a single candidate URL with /api/v1/health or /health
  static Future<bool> _probeCandidate(String baseUrl, Duration timeout) async {
    try {
      final uri = Uri.parse('$baseUrl/api/v1/health');
      final res = await http.get(uri).timeout(timeout);
      return res.statusCode >= 200 && res.statusCode < 400;
    } catch (_) {
      try {
        final fallbackUri = Uri.parse('$baseUrl/health');
        final res = await http.get(fallbackUri).timeout(timeout);
        return res.statusCode >= 200 && res.statusCode < 400;
      } catch (_) {
        return false;
      }
    }
  }

  /// Endpoints
  static String get loginEndpoint => '$baseUrl/api/v1/auth/login';
  static String get registerEndpoint => '$baseUrl/api/v1/auth/registration-request';
  static String get registrationRequestEndpoint => '$baseUrl/api/v1/auth/registration-request';
  static String get collectionsEndpoint => '$baseUrl/api/v1/collections';
  static String get batchesEndpoint => '$baseUrl/api/v1/batches';
  static String get complaintsEndpoint => '$baseUrl/api/v1/complaints';
  static String get verifyQrEndpoint => '$baseUrl/api/v1/qr/verify';
  static String get provenanceEndpoint => '$baseUrl/api/v1/provenance';
  static String get scansEndpoint => '$baseUrl/api/v1/scans';

  /// Generate auth headers dynamically with active JWT bearer token
  static Map<String, String> getAuthHeaders({String? overrideToken}) {
    final token = overrideToken ?? StorageService.getUserData('authToken');
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    if (token != null && token.toString().isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }
}

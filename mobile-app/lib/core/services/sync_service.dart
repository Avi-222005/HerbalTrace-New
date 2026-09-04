import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../config/api_config.dart';
import '../models/collection_event.dart';
import 'storage_service.dart';

class SyncService {
  final Connectivity _connectivity = Connectivity();
  StreamSubscription<ConnectivityResult>? _connectivitySubscription;
  Timer? _syncTimer;

  bool _isSyncing = false;
  Function(int)? onSyncProgress;
  Function(bool)? onSyncComplete;

  SyncService() {
    _init();
  }

  void _init() {
    _connectivitySubscription = _connectivity.onConnectivityChanged.listen(
      (ConnectivityResult result) {
        if (result != ConnectivityResult.none) {
          syncPendingEvents();
        }
      },
    );

    _syncTimer = Timer.periodic(const Duration(minutes: 3), (_) {
      syncPendingEvents();
    });
  }

  Future<bool> isConnected() async {
    final result = await _connectivity.checkConnectivity();
    return result != ConnectivityResult.none;
  }

  Future<void> syncPendingEvents() async {
    if (_isSyncing) return;

    final connected = await isConnected();
    if (!connected) return;

    _isSyncing = true;

    try {
      final unsyncedEvents = StorageService.getUnsyncedEvents();

      if (unsyncedEvents.isEmpty) {
        onSyncComplete?.call(true);
        return;
      }

      int syncedCount = 0;

      for (final event in unsyncedEvents) {
        try {
          final success = await _syncEvent(event);
          if (success) {
            syncedCount++;
            onSyncProgress?.call(syncedCount);
          }
        } catch (e) {
          print('Error syncing event ${event.id}: $e');
        }
      }

      onSyncComplete?.call(syncedCount == unsyncedEvents.length);
    } finally {
      _isSyncing = false;
    }
  }

  Future<bool> _syncEvent(CollectionEvent event) async {
    try {
      final payload = {
        'species': event.species,
        'commonName': event.commonName,
        'scientificName': event.scientificName,
        'quantity': event.weight ?? 0.0,
        'unit': 'kg',
        'latitude': event.latitude,
        'longitude': event.longitude,
        'altitude': event.altitude,
        'accuracy': event.latitudeAccuracy,
        'harvestDate': event.timestamp.toIso8601String().split('T')[0],
        'harvestMethod': event.harvestMethod,
        'partCollected': event.partCollected,
        'weatherConditions': event.weatherCondition,
        'soilType': event.soilType,
        'moistureContent': event.moisture,
        'images': event.imagePaths,
        'clientTimestamp': event.timestamp.toIso8601String(),
      };

      final response = await http
          .post(
            Uri.parse(ApiConfig.collectionsEndpoint),
            headers: ApiConfig.getAuthHeaders(),
            body: json.encode(payload),
          )
          .timeout(const Duration(seconds: 30));

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = json.decode(response.body);
        final blockchainHash = responseData['data']?['blockchainHash'] ??
            responseData['data']?['id'] ??
            responseData['blockchainHash'] ??
            'synced';

        await StorageService.markEventAsSynced(event.id, blockchainHash);
        return true;
      }

      return false;
    } catch (e) {
      print('Sync error: $e');
      return false;
    }
  }

  Future<Map<String, dynamic>?> fetchProvenanceData(String rawBatchId) async {
    try {
      // 1. Sanitize raw scanned code / URL
      String cleanCode = rawBatchId.trim();
      if (cleanCode.contains('/verify/')) {
        final parts = cleanCode.split('/verify/');
        if (parts.length > 1) {
          cleanCode = parts.last.split('?')[0].split('#')[0].trim();
        }
      }
      final match = RegExp(r'(QR-[A-Za-z0-9-]+|BATCH-[A-Za-z0-9-]+|PROD-[A-Za-z0-9-]+|HT-[A-Za-z0-9-]+)').firstMatch(cleanCode);
      if (match != null) {
        cleanCode = match.group(0)!;
      }
      cleanCode = Uri.decodeComponent(cleanCode).split(RegExp(r'\s+'))[0].trim();

      final cached = StorageService.getCachedData(
        'provenance_$cleanCode',
        maxAge: const Duration(hours: 12),
      );

      if (cached != null) {
        return Map<String, dynamic>.from(cached);
      }

      // 2. Try QR verify endpoint
      final qrUri = Uri.parse('${ApiConfig.verifyQrEndpoint}/${Uri.encodeComponent(cleanCode)}');
      print('📡 Fetching provenance from: $qrUri');

      final response = await http.get(
        qrUri,
        headers: ApiConfig.getAuthHeaders(),
      ).timeout(const Duration(seconds: 15));

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        await StorageService.cacheData('provenance_$cleanCode', data);
        return data is Map<String, dynamic> ? data : null;
      }

      // 3. Fallback to provenance endpoint
      final provUri = Uri.parse('${ApiConfig.provenanceEndpoint}/${Uri.encodeComponent(cleanCode)}');
      final provRes = await http.get(
        provUri,
        headers: ApiConfig.getAuthHeaders(),
      ).timeout(const Duration(seconds: 10));

      if (provRes.statusCode == 200) {
        final data = json.decode(provRes.body);
        await StorageService.cacheData('provenance_$cleanCode', data);
        return data is Map<String, dynamic> ? data : null;
      }

      return null;
    } catch (e) {
      print('Fetch provenance error: $e');
      final cached = StorageService.getCachedData('provenance_$rawBatchId');
      return cached != null ? Map<String, dynamic>.from(cached) : null;
    }
  }

  Future<void> recordScan(String batchId, String userId) async {
    try {
      await http
          .post(
            Uri.parse(ApiConfig.scansEndpoint),
            headers: ApiConfig.getAuthHeaders(),
            body: json.encode({
              'batchId': batchId,
              'userId': userId,
              'timestamp': DateTime.now().toIso8601String(),
            }),
          )
          .timeout(const Duration(seconds: 10));
    } catch (e) {
      print('Record scan error: $e');
    }
  }

  void dispose() {
    _connectivitySubscription?.cancel();
    _syncTimer?.cancel();
  }
}

import 'dart:async';
import 'dart:convert';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:hive/hive.dart';
import 'package:http/http.dart' as http;
import 'package:uuid/uuid.dart';
import '../../../core/config/api_config.dart';
import '../../../core/models/collection_event.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/services/collection_service.dart';

class CollectionProvider extends ChangeNotifier {
  final List<CollectionEvent> _events = [];
  bool _isLoading = false;
  bool _isSyncing = false;
  StreamSubscription<ConnectivityResult>? _connectivitySubscription;

  List<CollectionEvent> get events => _events;
  List<CollectionEvent> get syncedEvents =>
      _events.where((e) => e.isSynced).toList();
  List<CollectionEvent> get unsyncedEvents =>
      _events.where((e) => !e.isSynced).toList();
  bool get isLoading => _isLoading;
  bool get isSyncing => _isSyncing;

  CollectionProvider() {
    loadEvents();
    _initConnectivityListener();
  }

  void _initConnectivityListener() {
    _connectivitySubscription = Connectivity().onConnectivityChanged.listen((result) {
      if (result != ConnectivityResult.none) {
        print('🌐 Internet connection restored: $result. Triggering auto-sync...');
        syncPendingCollections();
      }
    });
  }

  @override
  void dispose() {
    _connectivitySubscription?.cancel();
    super.dispose();
  }

  Future<void> loadEvents() async {
    _isLoading = true;
    notifyListeners();

    try {
      _events.clear();
      
      // Load local collections from Hive
      final localEvents = StorageService.getAllCollectionEvents();
      
      // Fetch collections from backend database
      final backendEvents = await CollectionService.fetchAllCollections();
      
      // Merge local and backend events (avoid duplicates)
      final Map<String, CollectionEvent> mergedEvents = {};
      
      // Add local events first
      for (var event in localEvents) {
        mergedEvents[event.id] = event;
      }
      
      // Add backend events (will override local if same ID exists)
      for (var event in backendEvents) {
        if (!mergedEvents.containsKey(event.id)) {
          mergedEvents[event.id] = event;
        }
      }
      
      _events.addAll(mergedEvents.values);
      _events.sort((a, b) => b.timestamp.compareTo(a.timestamp));
      
      print('✅ Total collections loaded: ${_events.length} (Local: ${localEvents.length}, Backend: ${backendEvents.length})');
    } catch (e) {
      print('❌ Error loading events: $e');
      // Fall back to local only if backend fetch fails
      _events.addAll(StorageService.getAllCollectionEvents());
      _events.sort((a, b) => b.timestamp.compareTo(a.timestamp));
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  /// Auto / Manual Sync of Pending Offline Collections to Backend and Blockchain
  Future<int> syncPendingCollections() async {
    if (_isSyncing) return 0;
    _isSyncing = true;
    notifyListeners();

    int syncedCount = 0;

    try {
      final connectivity = await Connectivity().checkConnectivity();
      if (connectivity == ConnectivityResult.none) {
        print('⚠️ No internet connection for syncing');
        _isSyncing = false;
        notifyListeners();
        return 0;
      }

      // 1. Sync Hive offline queue box items
      final queueBox = Hive.isBoxOpen('offlineQueue')
          ? Hive.box('offlineQueue')
          : await Hive.openBox('offlineQueue');

      final List<dynamic> keysToDelete = [];

      for (var i = 0; i < queueBox.length; i++) {
        final key = queueBox.keyAt(i);
        final item = queueBox.get(key);

        if (item is Map) {
          final payload = Map<String, dynamic>.from(item);
          payload['isOffline'] = false;

          try {
            final res = await http.post(
              Uri.parse(ApiConfig.collectionsEndpoint),
              headers: ApiConfig.getAuthHeaders(),
              body: jsonEncode(payload),
            ).timeout(const Duration(seconds: 15));

            if (res.statusCode == 200 || res.statusCode == 201) {
              keysToDelete.add(key);
              syncedCount++;
              final decoded = jsonDecode(res.body);
              final blockchainHash = decoded['data']?['blockchainHash'] ?? decoded['data']?['txId'];
              
              // Mark corresponding local event as synced
              final batchId = payload['batchId'];
              if (batchId != null) {
                final match = _events.where((e) => e.species == payload['species'] && !e.isSynced);
                if (match.isNotEmpty) {
                  await updateSyncStatus(match.first.id, blockchainHash ?? batchId);
                }
              }
            }
          } catch (err) {
            print('⚠️ Failed to sync queue item $key: $err');
          }
        }
      }

      for (final k in keysToDelete) {
        await queueBox.delete(k);
      }

      // 2. Sync any remaining unsynced events in memory
      for (final event in unsyncedEvents) {
        final payload = {
          'batchId': 'HT-SYNC-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}',
          'farmerId': event.farmerId,
          'species': event.species,
          'commonName': event.commonName ?? event.species,
          'scientificName': event.scientificName ?? '${event.species} sp.',
          'quantity': event.weight ?? 10.0,
          'unit': 'kg',
          'moisture': event.moisture ?? 8.5,
          'latitude': event.latitude,
          'longitude': event.longitude,
          'harvestDate': event.timestamp.toIso8601String().split('T')[0],
          'partCollected': event.partCollected ?? 'Leaves',
          'harvestMethod': event.harvestMethod ?? 'Standard',
          'isOffline': false,
        };

        try {
          final res = await http.post(
            Uri.parse(ApiConfig.collectionsEndpoint),
            headers: ApiConfig.getAuthHeaders(),
            body: jsonEncode(payload),
          ).timeout(const Duration(seconds: 15));

          if (res.statusCode == 200 || res.statusCode == 201) {
            final decoded = jsonDecode(res.body);
            final blockchainHash = decoded['data']?['blockchainHash'] ?? decoded['data']?['txId'] ?? payload['batchId'];
            await updateSyncStatus(event.id, blockchainHash);
            syncedCount++;
          }
        } catch (err) {
          print('⚠️ Failed to sync unsynced event ${event.id}: $err');
        }
      }

      if (syncedCount > 0) {
        await loadEvents();
      }
    } catch (e) {
      print('❌ Sync error: $e');
    } finally {
      _isSyncing = false;
      notifyListeners();
    }

    return syncedCount;
  }

  Future<String> createCollectionEvent({
    required String farmerId,
    required String species,
    required double latitude,
    required double longitude,
    required List<String> imagePaths,
    double? weight,
    double? moisture,
    double? temperature,
    double? humidity,
    String? weatherCondition,
    String? commonName,
    String? scientificName,
    String? harvestMethod,
    String? partCollected,
    double? altitude,
    double? latitudeAccuracy,
    double? longitudeAccuracy,
    String? locationName,
    String? soilType,
    String? notes,
    bool isSynced = false,
    String? blockchainHash,
  }) async {
    final event = CollectionEvent(
      id: const Uuid().v4(),
      farmerId: farmerId,
      species: species,
      latitude: latitude,
      longitude: longitude,
      imagePaths: imagePaths,
      weight: weight,
      moisture: moisture,
      temperature: temperature,
      humidity: humidity,
      weatherCondition: weatherCondition,
      timestamp: DateTime.now(),
      isSynced: isSynced,
      blockchainHash: blockchainHash,
      commonName: commonName,
      scientificName: scientificName,
      harvestMethod: harvestMethod,
      partCollected: partCollected,
      altitude: altitude,
      latitudeAccuracy: latitudeAccuracy,
      longitudeAccuracy: longitudeAccuracy,
      locationName: locationName,
      soilType: soilType,
      notes: notes,
    );

    await StorageService.saveCollectionEvent(event);
    _events.insert(0, event);
    notifyListeners();

    // If online, attempt background sync immediately
    if (!isSynced) {
      syncPendingCollections();
    }

    return event.id;
  }

  Future<void> deleteEvent(String eventId) async {
    await StorageService.deleteCollectionEvent(eventId);
    _events.removeWhere((e) => e.id == eventId);
    notifyListeners();
  }

  Future<void> updateSyncStatus(String eventId, String blockchainHash) async {
    await StorageService.markEventAsSynced(eventId, blockchainHash);

    final index = _events.indexWhere((e) => e.id == eventId);
    if (index != -1) {
      _events[index].isSynced = true;
      _events[index].blockchainHash = blockchainHash;
      notifyListeners();
    }
  }

  Map<String, dynamic> getStatistics() {
    return {
      'totalSubmissions': _events.length,
      'syncedCount': syncedEvents.length,
      'pendingCount': unsyncedEvents.length,
      'totalWeight': _events
          .where((e) => e.weight != null)
          .fold<double>(0, (sum, e) => sum + e.weight!),
      'recentSubmissions': _events.take(5).toList(),
    };
  }
}

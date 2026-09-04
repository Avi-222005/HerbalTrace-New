import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';
import '../models/collection_event.dart';

class CollectionService {
  /// Fetch all collections from the backend database & blockchain
  /// GET /api/v1/collections
  static Future<List<CollectionEvent>> fetchAllCollections() async {
    try {
      final uri = Uri.parse(ApiConfig.collectionsEndpoint);
      print('📡 Fetching collections from: $uri');

      final response = await http.get(
        uri,
        headers: ApiConfig.getAuthHeaders(),
      ).timeout(const Duration(seconds: 20));

      print('✅ Response Status: ${response.statusCode}');

      if (response.statusCode == 200) {
        final decoded = jsonDecode(response.body);

        final List collectionsData = (decoded['data'] is List)
            ? decoded['data']
            : (decoded['collections'] is List ? decoded['collections'] : []);

        print('✅ Found ${collectionsData.length} collections in backend');

        final List<CollectionEvent> events = collectionsData.map((item) {
          return CollectionEvent(
            id: item['id']?.toString() ?? item['_id']?.toString() ?? item['collectionId']?.toString() ?? '',
            farmerId: item['farmerId']?.toString() ?? item['userId']?.toString() ?? '',
            species: item['species']?.toString() ?? '',
            latitude: _parseDouble(item['latitude']),
            longitude: _parseDouble(item['longitude']),
            imagePaths: _parseImagePaths(item['imagePaths'] ?? item['images']),
            weight: _parseDouble(item['quantity'] ?? item['weight']),
            moisture: _parseDouble(item['moisture'] ?? item['moistureContent']),
            temperature: _parseDouble(item['temperature']),
            humidity: _parseDouble(item['humidity']),
            weatherCondition: item['weatherConditions']?.toString() ?? item['weatherCondition']?.toString(),
            timestamp: _parseTimestamp(item['harvestDate'] ?? item['timestamp'] ?? item['createdAt']),
            isSynced: true,
            blockchainHash: item['blockchainHash']?.toString() ?? item['txId']?.toString() ?? item['id']?.toString(),
            commonName: item['commonName']?.toString(),
            scientificName: item['scientificName']?.toString(),
            harvestMethod: item['harvestMethod']?.toString(),
            partCollected: item['partCollected']?.toString(),
            altitude: _parseDouble(item['altitude']),
            latitudeAccuracy: _parseDouble(item['accuracy'] ?? item['latitudeAccuracy']),
            longitudeAccuracy: _parseDouble(item['accuracy'] ?? item['longitudeAccuracy']),
            locationName: item['locationName']?.toString(),
            soilType: item['soilType']?.toString(),
            notes: item['notes']?.toString(),
          );
        }).toList();

        return events;
      } else {
        print('⚠️  Failed to fetch collections: ${response.statusCode} - ${response.body}');
        return [];
      }
    } catch (e) {
      print('💥 Error fetching collections: $e');
      return [];
    }
  }

  /// Create a new collection on backend / blockchain
  /// POST /api/v1/collections
  static Future<Map<String, dynamic>> createCollection(Map<String, dynamic> payload) async {
    try {
      final uri = Uri.parse(ApiConfig.collectionsEndpoint);
      print('📡 Submitting collection to: $uri');
      print('📦 Payload: ${jsonEncode(payload)}');

      final response = await http.post(
        uri,
        headers: ApiConfig.getAuthHeaders(),
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 30));

      print('📥 Response status: ${response.statusCode}');
      print('📥 Response body: ${response.body}');

      final decoded = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        return {
          'success': true,
          'data': decoded['data'] ?? decoded,
          'blockchainHash': decoded['data']?['blockchainHash'] ?? decoded['data']?['txId'] ?? decoded['data']?['id'],
          'message': decoded['message'] ?? 'Collection successfully recorded on ledger',
        };
      } else {
        return {
          'success': false,
          'error': decoded['message'] ?? decoded['error'] ?? 'API Error ${response.statusCode}',
        };
      }
    } catch (e) {
      print('💥 Exception submitting collection: $e');
      return {
        'success': false,
        'error': e.toString(),
      };
    }
  }

  static double _parseDouble(dynamic value) {
    if (value == null) return 0.0;
    if (value is double) return value;
    if (value is int) return value.toDouble();
    if (value is String) return double.tryParse(value) ?? 0.0;
    return 0.0;
  }

  static List<String> _parseImagePaths(dynamic value) {
    if (value == null) return [];
    if (value is List) {
      return value.map((e) => e.toString()).toList();
    }
    if (value is String) {
      if (value.contains(',')) {
        return value.split(',').map((e) => e.trim()).toList();
      }
      return [value];
    }
    return [];
  }

  static DateTime _parseTimestamp(dynamic value) {
    if (value == null) return DateTime.now();
    try {
      if (value is DateTime) return value;
      if (value is String) return DateTime.parse(value);
      if (value is int) return DateTime.fromMillisecondsSinceEpoch(value);
    } catch (_) {}
    return DateTime.now();
  }
}

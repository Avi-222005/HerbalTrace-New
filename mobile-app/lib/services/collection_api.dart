import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/config/api_config.dart';

class CollectionApi {
  /// Creates a collection record.
  /// Returns event id string if available on success, otherwise throws.
  static Future<String?> createCollection({
    required String herbType,
    required int quantity,
    required String unit,
    required String collectionDate, // YYYY-MM-DD
    required String location,
    Map<String, dynamic>? extra,
  }) async {
    final uri = Uri.parse(ApiConfig.collectionsEndpoint);

    final body = {
      "species": herbType,
      "quantity": quantity,
      "unit": unit,
      "harvestDate": collectionDate,
      "location": location,
    };

    if (extra != null) {
      body.addAll(extra.map((k, v) => MapEntry(k, v)));
    }

    final response = await http.post(
      uri,
      headers: ApiConfig.getAuthHeaders(),
      body: jsonEncode(body),
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      try {
        final decoded = jsonDecode(response.body);
        if (decoded is Map<String, dynamic>) {
          return decoded['id']?.toString() ??
              decoded['data']?['id']?.toString() ??
              decoded['collectionId']?.toString() ??
              decoded['_id']?.toString();
        }
      } catch (_) {}
      return null;
    } else {
      throw Exception('API ${response.statusCode}: ${response.body}');
    }
  }
}

import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:mime/mime.dart';
import 'package:http_parser/http_parser.dart';

import '../../../core/config/api_config.dart';
import '../../auth/providers/auth_provider.dart';
import 'offline_collection.dart';

class CollectionProvider extends ChangeNotifier {
  final AuthProvider _authProvider;

  CollectionProvider(this._authProvider);

  Future<String> createCollectionEvent({
    required String farmerId,
    required Map<String, dynamic> data,
    required List<File> imageFiles,
  }) async {
    final url = Uri.parse(ApiConfig.collectionsEndpoint);
    final token = _authProvider.currentUser?.token;

    try {
      var request = http.MultipartRequest('POST', url);

      if (token != null && token.isNotEmpty) {
        request.headers['Authorization'] = 'Bearer $token';
      }

      // Add String & Number Fields
      request.fields['species'] = (data['species'] ?? '').toString();
      request.fields['commonName'] = (data['commonName'] ?? data['local_name'] ?? '').toString();
      request.fields['scientificName'] = (data['scientificName'] ?? '').toString();
      request.fields['quantity'] = (data['quantity'] ?? data['quantity_kg'] ?? 0.0).toString();
      request.fields['unit'] = (data['unit'] ?? 'kg').toString();
      request.fields['partCollected'] = (data['partCollected'] ?? data['plant_part'] ?? 'leaves').toString();
      request.fields['harvestMethod'] = (data['harvestMethod'] ?? data['collection_method'] ?? 'manual').toString();
      request.fields['soilType'] = (data['soilType'] ?? data['soil_condition'] ?? 'Loamy').toString();
      request.fields['latitude'] = (data['latitude'] ?? data['location_lat'] ?? 0.0).toString();
      request.fields['longitude'] = (data['longitude'] ?? data['location_lng'] ?? 0.0).toString();
      request.fields['altitude'] = (data['altitude'] ?? data['altitude_m'] ?? 0.0).toString();
      request.fields['accuracy'] = (data['accuracy'] ?? 5.0).toString();
      request.fields['locationName'] = (data['locationName'] ?? data['location_name'] ?? '').toString();
      request.fields['harvestDate'] = (data['harvestDate'] ?? DateTime.now().toIso8601String().split('T')[0]).toString();
      request.fields['moistureContent'] = (data['moistureContent'] ?? data['moisture'] ?? 0.0).toString();
      request.fields['weatherConditions'] = (data['weatherConditions'] ?? 'Sunny').toString();

      // Add File Fields (Images)
      for (var i = 0; i < imageFiles.length; i++) {
        final file = imageFiles[i];
        final mimeType = lookupMimeType(file.path) ?? 'image/jpeg';
        final fileName = file.path.split(Platform.pathSeparator).last;

        request.files.add(
          await http.MultipartFile.fromPath(
            'images',
            file.path,
            filename: fileName,
            contentType: MediaType.parse(mimeType),
          ),
        );
      }

      // Send Request
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final jsonResponse = json.decode(response.body);
        return jsonResponse['data']?['id']?.toString() ??
            jsonResponse['data']?['collectionId']?.toString() ??
            jsonResponse['id']?.toString() ??
            'success';
      } else {
        throw Exception('HTTP Error: ${response.statusCode} - ${response.body}');
      }
    } catch (e) {
      rethrow;
    }
  }

  // --- OFFLINE SYNC LOGIC ---
  Future<void> syncSingleOfflineCollection(OfflineCollection offline) async {
    final token = _authProvider.currentUser?.token;
    if (token == null) return;

    final data = {
      "species": offline.species,
      "commonName": offline.localName ?? '',
      "quantity": offline.weight,
      "unit": "kg",
      "partCollected": offline.plantPart ?? 'leaves',
      "harvestMethod": offline.collectionMethod ?? 'manual',
      "qualityNotes": offline.qualityNotes ?? '',
      "soilType": offline.soilCondition ?? 'Loamy',
      "latitude": offline.latitude,
      "longitude": offline.longitude,
      "altitude": offline.altitudeM,
      "locationName": offline.locationName ?? '',
      "weatherConditions": offline.temperature != null ? "Sunny" : "clear",
      "moistureContent": offline.moisture,
      "harvestDate": offline.timestamp.toIso8601String().split('T')[0],
    };

    final imageFiles = offline.imagePaths.map((path) => File(path)).toList();

    await createCollectionEvent(
      farmerId: _authProvider.currentUser!.id,
      data: data,
      imageFiles: imageFiles,
    );
  }
}
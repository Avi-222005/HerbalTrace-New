import 'package:http/http.dart' as http;
import 'dart:convert';
import '../config/api_config.dart';

class ComplaintService {
  /// Submit a complaint to the backend
  Future<Map<String, dynamic>> submitComplaint({
    required String userId,
    required String userName,
    required String userEmail,
    required String complaintType,
    required String subject,
    required String description,
  }) async {
    try {
      final payload = {
        'userId': userId,
        'userName': userName,
        'userEmail': userEmail,
        'complaintType': complaintType,
        'subject': subject,
        'description': description,
        'status': 'pending',
        'timestamp': DateTime.now().toIso8601String(),
      };

      print('DEBUG ComplaintService: Submitting to ${ApiConfig.complaintsEndpoint}...');

      final response = await http.post(
        Uri.parse(ApiConfig.complaintsEndpoint),
        headers: ApiConfig.getAuthHeaders(),
        body: json.encode(payload),
      ).timeout(const Duration(seconds: 20));

      print('DEBUG ComplaintService: Response status: ${response.statusCode}');

      if (response.statusCode == 200 || response.statusCode == 201) {
        final responseData = json.decode(response.body);
        return {
          'success': true,
          'message': responseData['message'] ?? 'Complaint submitted successfully',
          'complaintId': responseData['complaintId'] ?? responseData['data']?['id'] ?? 'TICKET-${DateTime.now().millisecondsSinceEpoch}',
          'data': responseData,
        };
      } else {
        return {
          'success': false,
          'message': 'Failed to submit complaint (${response.statusCode})',
          'error': response.body,
        };
      }
    } catch (e) {
      print('DEBUG ComplaintService: Error: $e');
      return {
        'success': false,
        'message': 'Error submitting complaint: $e',
        'error': e.toString(),
      };
    }
  }

  /// Register complaint alias method
  Future<Map<String, dynamic>> registerComplaint({
    required String userId,
    required String userName,
    String? userEmail,
    String? userRole,
    required String subject,
    required String category,
    required String description,
    String priority = 'Medium',
  }) async {
    return submitComplaint(
      userId: userId,
      userName: userName,
      userEmail: userEmail ?? '$userId@herbaltrace.com',
      complaintType: category,
      subject: subject,
      description: description,
    );
  }

  /// Get all complaints for a user
  Future<Map<String, dynamic>> getUserComplaints(String userId) async {
    try {
      final response = await http.get(
        Uri.parse('${ApiConfig.complaintsEndpoint}/user/$userId'),
        headers: ApiConfig.getAuthHeaders(),
      ).timeout(const Duration(seconds: 20));

      if (response.statusCode == 200) {
        final responseData = json.decode(response.body);
        return {
          'success': true,
          'complaints': responseData['complaints'] ?? responseData['data'] ?? [],
        };
      } else {
        return {
          'success': false,
          'message': 'Failed to fetch complaints',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Error fetching complaints: $e',
      };
    }
  }
}

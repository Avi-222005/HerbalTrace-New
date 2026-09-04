import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import '../../../core/config/api_config.dart';
import '../../../core/models/user.dart';
import '../../../core/services/storage_service.dart';

class AuthProvider extends ChangeNotifier {
  User? _currentUser;
  bool _isAuthenticated = false;
  String? _errorMessage;
  bool _isLoading = false;
  bool _mustChangePassword = false;

  User? get currentUser => _currentUser;
  bool get isAuthenticated => _isAuthenticated;
  UserRole? get userRole => _currentUser?.role;
  String? get errorMessage => _errorMessage;
  bool get isLoading => _isLoading;
  bool get mustChangePassword => _mustChangePassword;

  AuthProvider() {
    _loadStoredSession();
  }

  /// Load session from local Hive storage on app launch
  Future<void> _loadStoredSession() async {
    try {
      final storedData = StorageService.getUserData('currentUser');
      final storedToken = StorageService.getUserData('authToken');
      _mustChangePassword = StorageService.getUserData('mustChangePassword') == true;

      if (storedData != null && storedToken != null) {
        final Map<String, dynamic> userMap = Map<String, dynamic>.from(storedData);
        userMap['token'] = storedToken;
        _currentUser = User.fromJson(userMap);
        _isAuthenticated = true;
        notifyListeners();
      }
    } catch (e) {
      print('Error loading stored session: $e');
    }
  }

  /// Login with Backend REST API (POST /api/v1/auth/login)
  Future<bool> login(String usernameOrId, String password, [UserRole? role]) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final uri = Uri.parse(ApiConfig.loginEndpoint);
      print('📡 Connecting to: $uri with user: $usernameOrId');

      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode({
          'username': usernameOrId.trim(),
          'password': password,
        }),
      ).timeout(const Duration(seconds: 15));

      print('📥 Response status: ${response.statusCode}');
      print('📥 Response body: ${response.body}');

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final token = data['token'] ?? data['data']?['token'];
        final userData = data['user'] ?? data['data']?['user'] ?? data['data'] ?? {};
        _mustChangePassword = userData['mustChangePassword'] == true || data['mustChangePassword'] == true;

        if (token != null) {
          // Parse user
          final userRoleVal = role ?? (userData['role'] != null 
              ? (userData['role'].toString().toLowerCase() == 'farmer' ? UserRole.farmer : UserRole.consumer)
              : UserRole.farmer);

          final user = User(
            id: userData['userId']?.toString() ?? userData['id']?.toString() ?? usernameOrId,
            name: userData['fullName']?.toString() ?? userData['name']?.toString() ?? usernameOrId,
            email: userData['email']?.toString() ?? '',
            phone: userData['phone']?.toString() ?? userData['mobileNumber']?.toString() ?? '',
            role: userRoleVal,
            username: usernameOrId,
            token: token.toString(),
            status: userData['status']?.toString() ?? 'active',
            createdAt: DateTime.now(),
          );

          _currentUser = user;
          _isAuthenticated = true;

          // Save to Hive storage
          await StorageService.saveUserData('currentUser', user.toJson());
          await StorageService.saveUserData('authToken', token.toString());
          await StorageService.saveUserData('mustChangePassword', _mustChangePassword);

          _isLoading = false;
          notifyListeners();
          return true;
        } else {
          _errorMessage = data['message'] ?? 'Authentication failed (No token received)';
        }
      } else {
        _errorMessage = data['message'] ?? data['error'] ?? 'Login failed (${response.statusCode})';
      }
    } catch (e) {
      print('⚠️ First login attempt failed with $e. Auto-detecting active server...');
      try {
        // Auto-discover the working backend server (Cloud / Local / Wi-Fi)
        await ApiConfig.autoDetectWorkingServer();
        final retryUri = Uri.parse(ApiConfig.loginEndpoint);
        print('🔄 Retrying login with active host: $retryUri');

        final retryResponse = await http.post(
          retryUri,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: jsonEncode({
            'username': usernameOrId.trim(),
            'password': password,
          }),
        ).timeout(const Duration(seconds: 15));

        final Map<String, dynamic> retryData = jsonDecode(retryResponse.body);
        if (retryResponse.statusCode == 200 || retryResponse.statusCode == 201) {
          final token = retryData['token'] ?? retryData['data']?['token'];
          final userData = retryData['user'] ?? retryData['data']?['user'] ?? retryData['data'] ?? {};
          _mustChangePassword = userData['mustChangePassword'] == true || retryData['mustChangePassword'] == true;

          if (token != null) {
            final userRoleVal = role ?? (userData['role'] != null 
                ? (userData['role'].toString().toLowerCase() == 'farmer' ? UserRole.farmer : UserRole.consumer)
                : UserRole.farmer);

            final user = User(
              id: userData['userId']?.toString() ?? userData['id']?.toString() ?? usernameOrId,
              name: userData['fullName']?.toString() ?? userData['name']?.toString() ?? usernameOrId,
              email: userData['email']?.toString() ?? '',
              phone: userData['phone']?.toString() ?? userData['mobileNumber']?.toString() ?? '',
              role: userRoleVal,
              username: usernameOrId,
              token: token.toString(),
              status: userData['status']?.toString() ?? 'active',
              createdAt: DateTime.now(),
            );

            _currentUser = user;
            _isAuthenticated = true;

            await StorageService.saveUserData('currentUser', user.toJson());
            await StorageService.saveUserData('authToken', token.toString());
            await StorageService.saveUserData('mustChangePassword', _mustChangePassword);

            _isLoading = false;
            notifyListeners();
            return true;
          }
        }
        _errorMessage = retryData['message'] ?? 'Login failed (${retryResponse.statusCode})';
      } catch (retryError) {
        _errorMessage = 'Network connection failed (${ApiConfig.baseUrl}): $retryError';
        print('💥 Login retry exception: $retryError');
      }
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  /// Change Password API
  Future<bool> changePassword(String oldPassword, String newPassword) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final token = _currentUser?.token ?? StorageService.getUserData('authToken');
      final uri = Uri.parse('${ApiConfig.baseUrl}/api/v1/auth/change-password');

      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'oldPassword': oldPassword,
          'newPassword': newPassword,
        }),
      ).timeout(const Duration(seconds: 15));

      final data = jsonDecode(response.body);
      if (response.statusCode == 200) {
        _mustChangePassword = false;
        await StorageService.saveUserData('mustChangePassword', false);
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _errorMessage = data['message'] ?? 'Failed to change password';
      }
    } catch (e) {
      _errorMessage = 'Network error: $e';
    }

    _isLoading = false;
    notifyListeners();
    return false;
  }

  /// Submit Farmer / Consumer registration for Admin Verification
  Future<Map<String, dynamic>> signUp({
    required String name,
    required String email,
    required String phone,
    required String password,
    required UserRole role,
    String? username,
    String? aadhaarNumber,
    String? state,
    String? district,
    String? farmLocation,
    double? farmArea,
    List<String>? cropsGrown,
  }) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final uri = Uri.parse(ApiConfig.registerEndpoint);
      final roleStr = role == UserRole.farmer ? 'Farmer' : 'Consumer';
      final payload = {
        'fullName': name.trim(),
        'firstName': name.trim().split(' ').first,
        'lastName': name.trim().split(' ').length > 1 ? name.trim().split(' ').sublist(1).join(' ') : '',
        'username': (username != null && username.isNotEmpty) ? username.trim() : email.split('@')[0],
        'email': email.trim(),
        'phone': phone.trim(),
        'mobileNumber': phone.trim(),
        'aadharNumber': (aadhaarNumber != null && aadhaarNumber.isNotEmpty) ? aadhaarNumber.trim() : '4532 8901 2345',
        'role': roleStr,
        'locationState': state ?? 'Uttar Pradesh',
        'locationDistrict': district ?? 'Gautam Buddha Nagar (Noida / Greater Noida)',
        'organizationName': farmLocation ?? 'Kisan Co-operative Society',
        'farmSizeAcres': farmArea ?? 2.5,
        'experienceYears': 5,
        'status': 'pending',
      };

      print('📡 Submitting registration request to: $uri with payload: $payload');
      final response = await http.post(
        uri,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: jsonEncode(payload),
      ).timeout(const Duration(seconds: 20));

      final Map<String, dynamic> data = jsonDecode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        _isLoading = false;
        notifyListeners();
        return {
          'success': true,
          'message': data['message'] ?? 'Registration submitted! Admin will verify and activate your ID.',
          'userId': data['userId'] ?? data['data']?['userId'] ?? '',
        };
      } else {
        _errorMessage = data['message'] ?? data['error'] ?? 'Registration failed (${response.statusCode})';
      }
    } catch (e) {
      _errorMessage = 'Network connection failed. Check server host (${ApiConfig.baseUrl}): $e';
    }

    _isLoading = false;
    notifyListeners();
    return {
      'success': false,
      'message': _errorMessage ?? 'Registration failed',
    };
  }

  /// Logout and clear storage
  Future<void> logout() async {
    _currentUser = null;
    _isAuthenticated = false;
    _errorMessage = null;

    await StorageService.saveUserData('currentUser', null);
    await StorageService.saveUserData('authToken', null);

    notifyListeners();
  }

  void clearError() {
    _errorMessage = null;
    notifyListeners();
  }
}

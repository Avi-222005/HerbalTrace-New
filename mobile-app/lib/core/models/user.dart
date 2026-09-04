enum UserRole {
  farmer,
  consumer,
  processor,
  lab,
  admin,
}

class User {
  final String id;
  final String name;
  final String email;
  final String phone;
  final UserRole role;
  final String? username;
  final String? token;
  final String? profileImage;
  final DateTime createdAt;
  final String status; // 'active', 'pending_verification', 'suspended'
  final Map<String, dynamic>? metadata;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    this.username,
    this.token,
    this.profileImage,
    required this.createdAt,
    this.status = 'active',
    this.metadata,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'phone': phone,
      'role': role.toString().split('.').last,
      'username': username,
      'token': token,
      'profileImage': profileImage,
      'createdAt': createdAt.toIso8601String(),
      'status': status,
      'metadata': metadata,
    };
  }

  factory User.fromJson(Map<String, dynamic> json) {
    // Handle role strings like "Farmer", "farmer", "Consumer", etc.
    final roleStr = (json['role'] ?? 'consumer').toString().toLowerCase();
    final role = UserRole.values.firstWhere(
      (e) => e.toString().split('.').last.toLowerCase() == roleStr,
      orElse: () => UserRole.farmer,
    );

    DateTime parsedDate;
    try {
      parsedDate = json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now();
    } catch (_) {
      parsedDate = DateTime.now();
    }

    return User(
      id: json['id']?.toString() ?? json['userId']?.toString() ?? json['_id']?.toString() ?? '',
      name: json['name']?.toString() ?? json['fullName']?.toString() ?? json['username']?.toString() ?? 'Farmer',
      email: json['email']?.toString() ?? '',
      phone: json['phone']?.toString() ?? json['mobileNumber']?.toString() ?? '',
      role: role,
      username: json['username']?.toString(),
      token: json['token']?.toString(),
      profileImage: json['profileImage']?.toString(),
      createdAt: parsedDate,
      status: json['status']?.toString() ?? 'active',
      metadata: json['metadata'] is Map<String, dynamic> ? json['metadata'] : null,
    );
  }
}

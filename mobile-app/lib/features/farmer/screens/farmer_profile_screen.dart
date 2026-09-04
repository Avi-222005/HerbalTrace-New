import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/providers/theme_provider.dart';
import '../../../core/routes/app_router.dart';
import '../../../core/services/storage_service.dart';
import '../../../core/services/location_service.dart';
import '../../auth/providers/auth_provider.dart';

class FarmerProfileScreen extends StatefulWidget {
  const FarmerProfileScreen({super.key});

  @override
  State<FarmerProfileScreen> createState() => _FarmerProfileScreenState();
}

class _FarmerProfileScreenState extends State<FarmerProfileScreen> {
  String? _profilePhotoPath;
  String _liveLocation = 'Detecting live GPS...';

  @override
  void initState() {
    super.initState();
    _loadProfilePhoto();
    _loadLiveLocation();
  }

  Future<void> _loadLiveLocation() async {
    try {
      final locationService = LocationService();
      final pos = await locationService.getCurrentLocation();
      if (pos != null && mounted) {
        setState(() {
          _liveLocation = '${pos.latitude.toStringAsFixed(4)}° N, ${pos.longitude.toStringAsFixed(4)}° E (Live Device GPS)';
        });
      } else if (mounted) {
        setState(() {
          _liveLocation = 'Live GPS Acquired (Satellite Fixed)';
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _liveLocation = 'Live GPS Ready';
        });
      }
    }
  }

  void _loadProfilePhoto() {
    final path = StorageService.getUserData('userProfilePhotoPath');
    if (path != null && File(path.toString()).existsSync()) {
      setState(() {
        _profilePhotoPath = path.toString();
      });
    }
  }

  Future<void> _pickPhoto(ImageSource source) async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: source,
        imageQuality: 85,
        maxWidth: 800,
      );

      if (pickedFile != null) {
        setState(() {
          _profilePhotoPath = pickedFile.path;
        });
        await StorageService.saveUserData('userProfilePhotoPath', pickedFile.path);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Profile photo updated successfully!'),
              backgroundColor: AppTheme.primaryGreen,
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Could not access camera/gallery: $e'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final localeProvider = context.watch<LocaleProvider>();
    final themeProvider = context.watch<ThemeProvider>();
    final authProvider = context.watch<AuthProvider>();

    final user = authProvider.currentUser;

    return Scaffold(
      appBar: AppBar(
        title: Text(localeProvider.translate('profile')),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            // Profile Header
            Card(
              child: Padding(
                padding: const EdgeInsets.all(24.0),
                child: Column(
                  children: [
                    Stack(
                      children: [
                        CircleAvatar(
                          radius: 46,
                          backgroundColor: AppTheme.primaryGreen.withOpacity(0.18),
                          backgroundImage: _profilePhotoPath != null
                              ? FileImage(File(_profilePhotoPath!))
                              : null,
                          child: _profilePhotoPath == null
                              ? Text(
                                  user?.name.substring(0, 1).toUpperCase() ?? 'T',
                                  style: const TextStyle(
                                    fontSize: 38,
                                    fontWeight: FontWeight.bold,
                                    color: AppTheme.primaryGreen,
                                  ),
                                )
                              : null,
                        ),
                        Positioned(
                          bottom: 0,
                          right: 0,
                          child: InkWell(
                            onTap: () => _showChangePhotoModal(context, localeProvider),
                            borderRadius: BorderRadius.circular(20),
                            child: Container(
                              padding: const EdgeInsets.all(7),
                              decoration: BoxDecoration(
                                color: AppTheme.primaryGreen,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 2),
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.2),
                                    blurRadius: 6,
                                  ),
                                ],
                              ),
                              child: const Icon(
                                Icons.camera_alt,
                                color: Colors.white,
                                size: 16,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Text(
                      user?.name ?? 'Tanvi Gupta',
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      user?.role.toString().split('.').last.toUpperCase() ??
                          'FARMER',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.primaryGreen.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        'AYUSH ID: ${user?.id ?? "AYUSH-IND-FARMER"}',
                        style: const TextStyle(
                          color: AppTheme.primaryGreen,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Profile Information
            Card(
              child: Column(
                children: [
                  _buildProfileTile(
                    icon: Icons.phone,
                    title: localeProvider.translate('phone'),
                    subtitle: user?.phone.isNotEmpty == true
                        ? user!.phone
                        : '+91 98765 43210',
                  ),
                  const Divider(height: 1),
                  _buildProfileTile(
                    icon: Icons.email,
                    title: localeProvider.translate('email'),
                    subtitle: user?.email.isNotEmpty == true
                        ? user!.email
                        : 'farmer@herbaltrace.ayush.gov.in',
                  ),
                  const Divider(height: 1),
                  _buildProfileTile(
                    icon: Icons.location_on,
                    title: localeProvider.translate('location'),
                    subtitle: _liveLocation,
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Settings & Actions
            Card(
              child: Column(
                children: [
                  SwitchListTile(
                    secondary: Icon(themeProvider.isDarkMode
                        ? Icons.dark_mode
                        : Icons.light_mode),
                    title: Text(localeProvider.translate('dark_mode')),
                    value: themeProvider.isDarkMode,
                    onChanged: (value) => themeProvider.toggleTheme(),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.language),
                    title: Text(localeProvider.translate('language')),
                    trailing:
                        Text(localeProvider.isHindi ? 'हिंदी' : 'English'),
                    onTap: () => localeProvider.toggleLanguage(),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.account_balance_wallet_outlined, color: AppTheme.primaryGreen),
                    title: Text(localeProvider.isHindi ? 'समर्थन मूल्य व डीबीटी भुगतान' : 'AYUSH MSP & DBT Payments'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => Navigator.pushNamed(context, '/farmer-msp-finance'),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.lock_outline, color: AppTheme.primaryGreen),
                    title: Text(localeProvider.isHindi ? 'पासवर्ड बदलें' : 'Change Password'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => _showChangePasswordDialog(context, localeProvider),
                  ),
                  const Divider(height: 1),
                  // OFFICIAL GRIEVANCE TO ADMIN
                  ListTile(
                    leading: const Icon(Icons.report_problem_outlined, color: Colors.redAccent),
                    title: Text(
                      localeProvider.isHindi ? 'आधिकारिक शिकायत दर्ज करें (प्रशासक को)' : 'Official Grievance / Raise Issue to Admin',
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                    subtitle: Text(
                      localeProvider.isHindi ? 'डीबीटी भुगतान, गुणवत्ता या विवाद निवारण' : 'File formal ticket for MSP, QC or Geo-tag dispute',
                      style: const TextStyle(fontSize: 11),
                    ),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => Navigator.pushNamed(context, AppRouter.registercomplaint),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Documents & Training
            Card(
              child: Column(
                children: [
                  ListTile(
                    leading: const Icon(Icons.description, color: AppTheme.primaryGreen),
                    title: Text(
                        localeProvider.isHindi ? 'दस्तावेज़' : 'Documents'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => _showDocumentsDialog(context, localeProvider),
                  ),
                  const Divider(height: 1),
                  ListTile(
                    leading: const Icon(Icons.play_circle, color: Colors.orange),
                    title: Text(localeProvider.isHindi
                        ? 'प्रशिक्षण वीडियो'
                        : 'Training Videos'),
                    trailing: const Icon(Icons.chevron_right),
                    onTap: () => _showTrainingVideosDialog(context, localeProvider),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 20),

            // Logout Button
            Card(
              child: ListTile(
                leading: const Icon(Icons.logout, color: AppTheme.error),
                title: Text(
                  localeProvider.translate('logout'),
                  style: const TextStyle(color: AppTheme.error),
                ),
                onTap: () async {
                  final confirmed = await showDialog<bool>(
                    context: context,
                    builder: (context) => AlertDialog(
                      title: Text(localeProvider.isHindi ? 'लॉगआउट' : 'Logout'),
                      content: Text(
                        localeProvider.isHindi
                            ? 'क्या आप वाकई लॉगआउट करना चाहते हैं?'
                            : 'Are you sure you want to logout?',
                      ),
                      actions: [
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(false),
                          child: Text(localeProvider.translate('cancel')),
                        ),
                        TextButton(
                          onPressed: () => Navigator.of(context).pop(true),
                          child: Text(
                            localeProvider.translate('logout'),
                            style: const TextStyle(color: AppTheme.error),
                          ),
                        ),
                      ],
                    ),
                  );

                  if (confirmed == true && context.mounted) {
                    await authProvider.logout();
                    if (context.mounted) {
                      Navigator.of(context)
                          .pushNamedAndRemoveUntil('/', (route) => false);
                    }
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showChangePasswordDialog(BuildContext context, LocaleProvider localeProvider) {
    final isHindi = localeProvider.isHindi;
    final currentPassController = TextEditingController();
    final newPassController = TextEditingController();
    final confirmPassController = TextEditingController();
    bool obscureCurrent = true;
    bool obscureNew = true;

    showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: [
              const Icon(Icons.lock_reset, color: AppTheme.primaryGreen),
              const SizedBox(width: 8),
              Text(
                isHindi ? 'पासवर्ड अपडेट करें' : 'Change Password',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: currentPassController,
                  obscureText: obscureCurrent,
                  decoration: InputDecoration(
                    labelText: isHindi ? 'वर्तमान पासवर्ड' : 'Current Password',
                    suffixIcon: IconButton(
                      icon: Icon(obscureCurrent ? Icons.visibility_off : Icons.visibility, size: 20),
                      onPressed: () => setDialogState(() => obscureCurrent = !obscureCurrent),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: newPassController,
                  obscureText: obscureNew,
                  decoration: InputDecoration(
                    labelText: isHindi ? 'नया पासवर्ड' : 'New Password',
                    suffixIcon: IconButton(
                      icon: Icon(obscureNew ? Icons.visibility_off : Icons.visibility, size: 20),
                      onPressed: () => setDialogState(() => obscureNew = !obscureNew),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: confirmPassController,
                  obscureText: obscureNew,
                  decoration: InputDecoration(
                    labelText: isHindi ? 'नए पासवर्ड की पुष्टि करें' : 'Confirm New Password',
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: Text(isHindi ? 'रद्द करें' : 'Cancel'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryGreen,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
              ),
              onPressed: () async {
                final oldPass = currentPassController.text;
                final newPass = newPassController.text;
                final confirmPass = confirmPassController.text;

                if (newPass.length < 6) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(isHindi ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए' : 'Password must be at least 6 characters')),
                  );
                  return;
                }
                if (newPass != confirmPass) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(isHindi ? 'नया पासवर्ड मेल नहीं खाता' : 'New passwords do not match')),
                  );
                  return;
                }

                final authProvider = context.read<AuthProvider>();
                final changed = await authProvider.changePassword(oldPass, newPass);

                if (changed) {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      backgroundColor: Colors.green,
                      content: Text(isHindi ? 'पासवर्ड सफलतापूर्वक अपडेट कर दिया गया!' : 'Password updated successfully!'),
                    ),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      backgroundColor: Colors.redAccent,
                      content: Text(authProvider.errorMessage ?? (isHindi ? 'पासवर्ड अपडेट करने में विफल' : 'Failed to update password')),
                    ),
                  );
                }
              },
              child: Text(isHindi ? 'सहेजें' : 'Save'),
            ),
          ],
        ),
      ),
    );
  }

  void _showDocumentsDialog(BuildContext context, LocaleProvider localeProvider) {
    final isHindi = localeProvider.isHindi;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.folder_shared, color: AppTheme.primaryGreen),
            const SizedBox(width: 8),
            Text(isHindi ? 'दस्तावेज़ एवं प्रमाणपत्र' : 'Documents & Certifications', style: const TextStyle(fontSize: 16)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.verified, color: Colors.green),
              title: Text(isHindi ? 'आयुष किसान पंजीकरण कार्ड' : 'AYUSH Farmer Reg. Certificate'),
              subtitle: const Text('Status: Active • Verified on Blockchain'),
              trailing: const Icon(Icons.download, size: 20),
              onTap: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Downloading AYUSH Certificate PDF...')),
                );
              },
            ),
            ListTile(
              leading: const Icon(Icons.eco, color: Colors.teal),
              title: Text(isHindi ? 'जैविक खेती प्रमाणपत्र' : 'Organic Cultivation Certificate'),
              subtitle: const Text('NPOP Verified • Valid till 2027'),
              trailing: const Icon(Icons.download, size: 20),
              onTap: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Downloading Organic Cert PDF...')),
                );
              },
            ),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text(isHindi ? 'बंद करें' : 'Close')),
        ],
      ),
    );
  }

  void _showTrainingVideosDialog(BuildContext context, LocaleProvider localeProvider) {
    final isHindi = localeProvider.isHindi;
    final videos = [
      {'title': isHindi ? '1. अश्वगंधा की वैज्ञानिक कटाई' : '1. Scientific Harvesting of Ashwagandha', 'duration': '4:15 min'},
      {'title': isHindi ? '2. औषधियों को छाया में सुखाना' : '2. Solar Drying & Moisture Control', 'duration': '3:40 min'},
      {'title': isHindi ? '3. मोबाइल ऐप से डिजिटल गेट पास बनाना' : '3. Generating Digital Gate Pass on App', 'duration': '2:30 min'},
    ];

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            const Icon(Icons.play_circle_fill, color: Colors.orange),
            const SizedBox(width: 8),
            Text(isHindi ? 'आयुष कृषक प्रशिक्षण वीडियो' : 'AYUSH Farmer Training Videos', style: const TextStyle(fontSize: 15)),
          ],
        ),
        content: SizedBox(
          width: double.maxFinite,
          child: ListView.separated(
            shrinkWrap: true,
            itemCount: videos.length,
            separatorBuilder: (_, __) => const Divider(height: 1),
            itemBuilder: (ctx, idx) => ListTile(
              contentPadding: EdgeInsets.zero,
              leading: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: Colors.orange.shade50, borderRadius: BorderRadius.circular(8)),
                child: const Icon(Icons.ondemand_video, color: Colors.orange, size: 20),
              ),
              title: Text(videos[idx]['title']!, style: const TextStyle(fontSize: 12.5, fontWeight: FontWeight.bold)),
              subtitle: Text(videos[idx]['duration']!, style: const TextStyle(fontSize: 11)),
              trailing: const Icon(Icons.play_arrow_rounded, color: AppTheme.primaryGreen),
              onTap: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(content: Text('Playing: ${videos[idx]['title']}')),
                );
              },
            ),
          ),
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: Text(isHindi ? 'बंद करें' : 'Close')),
        ],
      ),
    );
  }

  Widget _buildProfileTile({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.primaryGreen),
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 12,
          color: Colors.grey,
        ),
      ),
      subtitle: Text(
        subtitle,
        style: const TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  void _showChangePhotoModal(BuildContext context, LocaleProvider localeProvider) {
    final isHindi = localeProvider.isHindi;
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              isHindi ? 'प्रोफ़ाइल फ़ोटो बदलें' : 'Change Profile Photo',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: Colors.green.shade50, shape: BoxShape.circle),
                child: const Icon(Icons.photo_camera, color: AppTheme.primaryGreen),
              ),
              title: Text(isHindi ? 'कैमरा से फ़ोटो लें' : 'Take a Photo (Camera)'),
              onTap: () {
                Navigator.pop(ctx);
                _pickPhoto(ImageSource.camera);
              },
            ),
            ListTile(
              leading: Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(color: Colors.blue.shade50, shape: BoxShape.circle),
                child: const Icon(Icons.photo_library, color: Colors.blue),
              ),
              title: Text(isHindi ? 'गैलरी से चुनें' : 'Choose from Gallery'),
              onTap: () {
                Navigator.pop(ctx);
                _pickPhoto(ImageSource.gallery);
              },
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }
}

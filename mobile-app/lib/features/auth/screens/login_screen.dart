import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/providers/theme_provider.dart';
import '../../../core/config/api_config.dart';
import '../../../core/models/user.dart';
import '../../../core/routes/app_router.dart';
import '../providers/auth_provider.dart';
import 'role_selection_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _showServerConfigDialog() {
    final ipController = TextEditingController(text: ApiConfig.baseUrl);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Row(
          children: const [
            Icon(Icons.settings_ethernet, color: AppTheme.primaryGreen),
            SizedBox(width: 8),
            Text('Server Configuration', style: TextStyle(fontSize: 18)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Configure the backend host for local Wi-Fi or cloud testing:',
              style: TextStyle(fontSize: 13, color: Colors.grey),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: ipController,
              decoration: InputDecoration(
                labelText: 'Backend Base URL',
                hintText: 'e.g. http://192.168.1.15:5000',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                prefixIcon: const Icon(Icons.link),
              ),
            ),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              children: [
                ActionChip(
                  label: const Text('Wi-Fi (10.179.59.4:3000)'),
                  onPressed: () => ipController.text = 'http://10.179.59.4:3000',
                ),
                ActionChip(
                  label: const Text('Emulator (10.0.2.2:3000)'),
                  onPressed: () => ipController.text = 'http://10.0.2.2:3000',
                ),
                ActionChip(
                  label: const Text('Cloud (Railway)'),
                  onPressed: () => ipController.text = ApiConfig.defaultProductionUrl,
                ),
              ],
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryGreen,
              foregroundColor: Colors.white,
            ),
            onPressed: () async {
              if (ipController.text.isNotEmpty) {
                await ApiConfig.setBaseUrl(ipController.text.trim());
                if (mounted) {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Server endpoint set to: ${ApiConfig.baseUrl}'),
                      backgroundColor: AppTheme.primaryGreen,
                    ),
                  );
                }
              }
            },
            child: const Text('Save Host'),
          ),
        ],
      ),
    );
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = context.read<AuthProvider>();
    final currentPassword = _passwordController.text;
    final success = await authProvider.login(
      _usernameController.text.trim(),
      currentPassword,
    );

    if (!mounted) return;

    if (success) {
      final role = authProvider.userRole;
      final route = role == UserRole.farmer
          ? AppRouter.farmerDashboard
          : AppRouter.consumerDashboard;

      if (authProvider.mustChangePassword) {
        _showFirstLoginChangePasswordDialog(authProvider, currentPassword, route);
      } else {
        Navigator.of(context).pushReplacementNamed(route);
      }
    }
  }

  void _showFirstLoginChangePasswordDialog(AuthProvider authProvider, String currentPassword, String nextRoute) {
    final localeProvider = context.read<LocaleProvider>();
    final isHindi = localeProvider.isHindi;
    final newPassCtrl = TextEditingController();
    final confirmPassCtrl = TextEditingController();
    bool obscure = true;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: const BoxDecoration(color: Color(0xFFE8F5E9), shape: BoxShape.circle),
                child: const Icon(Icons.security_rounded, color: AppTheme.primaryGreen, size: 24),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  isHindi ? 'प्रथम लॉगिन: नया पासवर्ड बनाएं' : 'First Login: Set New Password',
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
              ),
            ],
          ),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isHindi
                      ? 'सुरक्षा कारणों से, कृपया अपना नया स्थायी पासवर्ड सेट करें।'
                      : 'For account security, please replace your temporary password with a new one.',
                  style: TextStyle(fontSize: 12.5, color: Colors.grey.shade700),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: newPassCtrl,
                  obscureText: obscure,
                  decoration: InputDecoration(
                    labelText: isHindi ? 'नया पासवर्ड (कम से कम 6 अक्षर)' : 'New Password (min 6 chars)',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    prefixIcon: const Icon(Icons.lock_outline, size: 20),
                    suffixIcon: IconButton(
                      icon: Icon(obscure ? Icons.visibility_off : Icons.visibility, size: 20),
                      onPressed: () => setDialogState(() => obscure = !obscure),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: confirmPassCtrl,
                  obscureText: obscure,
                  decoration: InputDecoration(
                    labelText: isHindi ? 'नए पासवर्ड की पुष्टि करें' : 'Confirm New Password',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    prefixIcon: const Icon(Icons.lock_reset, size: 20),
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.of(context).pushReplacementNamed(nextRoute);
              },
              child: Text(isHindi ? 'बाद में करें' : 'Skip for now'),
            ),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryGreen,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () async {
                final newPass = newPassCtrl.text.trim();
                final confirmPass = confirmPassCtrl.text.trim();

                if (newPass.length < 6) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(isHindi ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters.'),
                      backgroundColor: Colors.redAccent,
                    ),
                  );
                  return;
                }
                if (newPass != confirmPass) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(isHindi ? 'पासवर्ड मेल नहीं खा रहे हैं!' : 'Passwords do not match!'),
                      backgroundColor: Colors.redAccent,
                    ),
                  );
                  return;
                }

                final changed = await authProvider.changePassword(currentPassword, newPass);
                if (changed) {
                  Navigator.pop(ctx);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(isHindi ? 'पासवर्ड सफलतापूर्वक बदल दिया गया!' : 'Password updated successfully!'),
                      backgroundColor: AppTheme.primaryGreen,
                    ),
                  );
                  Navigator.of(context).pushReplacementNamed(nextRoute);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(authProvider.errorMessage ?? (isHindi ? 'त्रुटि हुई' : 'Failed to update password')),
                      backgroundColor: Colors.redAccent,
                    ),
                  );
                }
              },
              child: Text(isHindi ? 'पासवर्ड सुरक्षित करें' : 'Save & Continue'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final localeProvider = context.watch<LocaleProvider>();
    final themeProvider = context.watch<ThemeProvider>();
    final authProvider = context.watch<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          // Server Config Button
          IconButton(
            icon: const Icon(Icons.settings_input_antenna, color: AppTheme.primaryGreen),
            tooltip: 'Server Settings (Local/Cloud)',
            onPressed: _showServerConfigDialog,
          ),
          // Language Switcher
          IconButton(
            icon: Text(
              localeProvider.isHindi ? 'EN' : 'हिं',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: AppTheme.primaryGreen,
              ),
            ),
            onPressed: () => localeProvider.toggleLanguage(),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24.0, vertical: 16.0),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 10),
                _buildHeader(localeProvider),
                const SizedBox(height: 32),

                // Username or Farmer ID field
                TextFormField(
                  controller: _usernameController,
                  decoration: InputDecoration(
                    labelText: localeProvider.isHindi ? 'उपयोगकर्ता नाम / किसान आईडी' : 'Username / Farmer ID',
                    prefixIcon: const Icon(Icons.person_outline),
                    hintText: 'e.g. farmer_01 or admin',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  validator: (value) {
                    if (value == null || value.trim().isEmpty) {
                      return localeProvider.isHindi ? 'कृपया यूजरनेम या आईडी दर्ज करें' : 'Please enter Username or ID';
                    }
                    return null;
                  },
                ),
                const SizedBox(height: 16),

                // Password field
                TextFormField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  decoration: InputDecoration(
                    labelText: localeProvider.isHindi ? 'पासवर्ड' : 'Password',
                    prefixIcon: const Icon(Icons.lock_outline),
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    suffixIcon: IconButton(
                      icon: Icon(_obscurePassword ? Icons.visibility_outlined : Icons.visibility_off_outlined),
                      onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return localeProvider.isHindi ? 'कृपया पासवर्ड दर्ज करें' : 'Please enter password';
                    }
                    return null;
                  },
                ),

                const SizedBox(height: 24),

                // Error Display
                if (authProvider.errorMessage != null)
                  Container(
                    padding: const EdgeInsets.all(12),
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: Colors.red.shade50,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: Colors.red.shade200),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: Colors.red, size: 20),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            authProvider.errorMessage!,
                            style: TextStyle(color: Colors.red.shade800, fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ),

                // Login Button
                ElevatedButton(
                  onPressed: authProvider.isLoading ? null : _handleLogin,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryGreen,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: authProvider.isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                        )
                      : Text(
                          localeProvider.isHindi ? 'लॉगिन करें' : 'Sign In',
                          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                ),

                const SizedBox(height: 20),

                // Server Status Indicator
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: themeProvider.isDarkMode ? Colors.grey.shade800 : Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.circle, color: Colors.green, size: 10),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Host: ${ApiConfig.baseUrl}',
                          style: const TextStyle(fontSize: 11, color: Colors.grey),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      InkWell(
                        onTap: _showServerConfigDialog,
                        child: const Text(
                          'Change',
                          style: TextStyle(fontSize: 11, color: AppTheme.primaryGreen, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 32),

                // Register Link
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      localeProvider.isHindi ? 'खाता नहीं है?' : "Don't have an account?",
                      style: const TextStyle(color: AppTheme.textSecondary),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute(
                            builder: (context) => const RoleSelectionScreen(isSignup: true),
                          ),
                        );
                      },
                      child: Text(
                        localeProvider.isHindi ? 'पंजीकरण करें' : 'Sign Up',
                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryGreen),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 8),

                // Compact Consumer Quick Entry
                Center(
                  child: TextButton.icon(
                    onPressed: () {
                      Navigator.of(context).pushNamed(AppRouter.consumerDashboard);
                    },
                    icon: const Icon(Icons.qr_code_scanner, size: 16, color: AppTheme.primaryGreen),
                    label: Text(
                      localeProvider.isHindi ? 'उपभोक्ता' : 'Consumer',
                      style: const TextStyle(
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.primaryGreen,
                      ),
                    ),
                    style: TextButton.styleFrom(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      backgroundColor: AppTheme.primaryGreen.withOpacity(0.08),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(LocaleProvider localeProvider) {
    return Column(
      children: [
        Image.asset(
          'assets/icons/logo.png',
          width: 100,
          height: 100,
          fit: BoxFit.contain,
          errorBuilder: (_, __, ___) => const Icon(Icons.spa, size: 80, color: AppTheme.primaryGreen),
        ),
        const SizedBox(height: 16),
        const Text(
          'HerbalTrace',
          style: TextStyle(
            fontSize: 28,
            fontWeight: FontWeight.bold,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          localeProvider.isHindi
              ? 'ब्लॉकचेन आधारित आयुर्वेदिक हर्बल ट्रैसेबिलिटी'
              : 'Blockchain Botanical Traceability & Verification',
          textAlign: TextAlign.center,
          style: const TextStyle(fontSize: 13, color: AppTheme.textSecondary),
        ),
      ],
    );
  }
}

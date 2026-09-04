import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/models/user.dart';
import '../providers/auth_provider.dart';
import 'login_screen.dart';

class SignupScreen extends StatefulWidget {
  final UserRole role;

  const SignupScreen({super.key, required this.role});

  @override
  State<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends State<SignupScreen> {
  final _formKey = GlobalKey<FormState>();
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _aadhaarController = TextEditingController();
  final _organizationController = TextEditingController();

  late String _selectedRole;
  String? _selectedState = 'Uttar Pradesh';
  String? _selectedDistrict = 'Gautam Buddha Nagar (Noida / Greater Noida)';

  final List<String> _states = [
    'Uttar Pradesh',
    'Uttarakhand',
    'Madhya Pradesh',
    'Rajasthan',
    'Kerala',
    'Karnataka',
    'Maharashtra',
    'Gujarat',
    'Tamil Nadu',
    'Himachal Pradesh',
    'Assam',
    'West Bengal',
    'Delhi',
  ];

  final Map<String, List<String>> _stateDistricts = {
    'Uttar Pradesh': [
      'Gautam Buddha Nagar (Noida / Greater Noida)',
      'Lucknow',
      'Varanasi',
      'Prayagraj',
      'Kanpur',
      'Agra',
      'Meerut',
      'Gorakhpur',
      'Bareilly',
      'Aligarh',
      'Moradabad',
      'Mathura',
      'Jhansi',
      'Ghaziabad',
    ],
    'Uttarakhand': [
      'Dehradun',
      'Haridwar',
      'Nainital',
      'Rishikesh',
      'Udham Singh Nagar',
      'Almora',
      'Pauri Garhwal',
      'Chamoli',
      'Pithoragarh',
      'Tehri',
    ],
    'Madhya Pradesh': [
      'Neemuch',
      'Mandsaur',
      'Indore',
      'Bhopal',
      'Ujjain',
      'Gwalior',
      'Jabalpur',
      'Ratlam',
      'Rewa',
      'Satna',
      'Hoshangabad',
    ],
    'Rajasthan': [
      'Jodhpur',
      'Nagaur',
      'Jaipur',
      'Kota',
      'Udaipur',
      'Bikaner',
      'Ajmer',
      'Alwar',
      'Barmer',
      'Chittorgarh',
      'Pali',
      'Sikar',
    ],
    'Kerala': [
      'Wayanad',
      'Idukki',
      'Palakkad',
      'Kozhikode',
      'Ernakulam',
      'Thrissur',
      'Thiruvananthapuram',
      'Kottayam',
      'Kasaragod',
      'Malappuram',
    ],
    'Karnataka': [
      'Bangalore Rural',
      'Mysore',
      'Shimoga',
      'Uttara Kannada',
      'Dakshina Kannada',
      'Belgaum',
      'Dharwad',
      'Tumkur',
      'Chikmagalur',
      'Coorg',
    ],
    'Maharashtra': [
      'Pune',
      'Nashik',
      'Nagpur',
      'Kolhapur',
      'Satara',
      'Aurangabad',
      'Ahmednagar',
      'Solapur',
      'Thane',
      'Sangli',
      'Ratnagiri',
    ],
    'Gujarat': [
      'Anand',
      'Junagadh',
      'Rajkot',
      'Ahmedabad',
      'Surat',
      'Vadodara',
      'Kutch',
      'Mehsana',
      'Patan',
      'Bharuch',
    ],
    'Tamil Nadu': [
      'Coimbatore',
      'Salem',
      'Madurai',
      'Dindigul',
      'Tirunelveli',
      'Erode',
      'Theni',
      'Dharmapuri',
      'Nilgiris',
      'Tiruchirappalli',
    ],
    'Himachal Pradesh': [
      'Kullu',
      'Mandi',
      'Kangra',
      'Shimla',
      'Chamba',
      'Solan',
      'Sirmaur',
      'Lahaul and Spiti',
      'Kinnaur',
    ],
    'Assam': [
      'Guwahati',
      'Dibrugarh',
      'Jorhat',
      'Silchar',
      'Nagaon',
      'Tezpur',
      'Tinsukia',
      'Cachar',
    ],
    'West Bengal': [
      'Darjeeling',
      'Kalimpong',
      'Jalpaiguri',
      'Kolkata',
      'Howrah',
      'Hooghly',
      'Bankura',
      'Purulia',
      'Alipurduar',
    ],
    'Delhi': [
      'New Delhi',
      'North Delhi',
      'South Delhi',
      'East Delhi',
      'West Delhi',
      'Central Delhi',
    ],
  };

  @override
  void initState() {
    super.initState();
    _selectedRole = widget.role == UserRole.farmer ? 'Farmer' : 'Consumer';
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _aadhaarController.dispose();
    _organizationController.dispose();
    super.dispose();
  }

  Future<void> _handleSignup() async {
    if (!_formKey.currentState!.validate()) return;

    final localeProvider = context.read<LocaleProvider>();
    final authProvider = context.read<AuthProvider>();

    final firstName = _firstNameController.text.trim();
    final lastName = _lastNameController.text.trim();
    final fullName = '$firstName $lastName'.trim();

    final result = await authProvider.signUp(
      name: fullName,
      email: _emailController.text.trim(),
      phone: _phoneController.text.trim().startsWith('+91')
          ? _phoneController.text.trim()
          : '+91${_phoneController.text.trim()}',
      aadhaarNumber: _aadhaarController.text.trim(),
      password: '', // Handled on approval
      role: _selectedRole == 'Farmer' ? UserRole.farmer : UserRole.consumer,
      state: _selectedState,
      district: _selectedDistrict,
      farmLocation: _organizationController.text.trim().isNotEmpty
          ? _organizationController.text.trim()
          : undefinedLocation(),
    );

    if (!mounted) return;

    if (result['success'] == true) {
      // Show Verification Submission Success Modal (Same as Web Portal)
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (ctx) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(
            children: const [
              Icon(Icons.check_circle, color: AppTheme.primaryGreen, size: 28),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Registration Submitted!',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
                ),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.green.shade200),
                ),
                child: Text(
                  localeProvider.isHindi
                      ? 'आपका पंजीकरण अनुरोध जमा कर दिया गया है। एक व्यवस्थापक (Admin) इसकी समीक्षा करेगा और आपके लॉगिन क्रेडेंशियल भेजेगा।'
                      : 'Your registration request has been submitted. An admin will review it and send your login credentials.',
                  style: TextStyle(fontSize: 13, color: Colors.green.shade900, height: 1.35),
                ),
              ),
              const SizedBox(height: 14),
              Text('👤 Name: $fullName', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              Text('🛡️ Role: $_selectedRole', style: const TextStyle(fontSize: 13)),
              Text('📍 District: $_selectedDistrict', style: const TextStyle(fontSize: 13)),
              Text('🆔 Aadhaar: ${_aadhaarController.text.trim()}', style: const TextStyle(fontSize: 13)),
            ],
          ),
          actions: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryGreen,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () {
                Navigator.pop(ctx);
                Navigator.of(context).pushReplacement(
                  MaterialPageRoute(builder: (_) => const LoginScreen()),
                );
              },
              child: Text(localeProvider.isHindi ? 'साइन इन पर जाएं' : 'Go to Sign In'),
            ),
          ],
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result['message'] ?? 'Registration failed'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  String undefinedLocation() {
    return '$_selectedDistrict, $_selectedState';
  }

  @override
  Widget build(BuildContext context) {
    final localeProvider = context.watch<LocaleProvider>();
    final isHindi = localeProvider.isHindi;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        title: Text(
          isHindi ? 'रजिस्टर करें' : 'Register',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: Colors.black87),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header Banner
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.green.shade50,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.green.shade200),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.verified_user_outlined, color: AppTheme.primaryGreen, size: 24),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        isHindi
                            ? 'आयुष और ब्लॉकचेन सत्यापन के लिए अपना विवरण भरें। व्यवस्थापक अनुमोदन के बाद आईडी सक्रिय होगी।'
                            : 'Fill details for AYUSH Hyperledger Fabric onboarding. Admin approves registration requests.',
                        style: TextStyle(fontSize: 12, color: Colors.green.shade900, height: 1.3),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Role Selector
              _buildFieldLabel(isHindi ? 'भूमिका (Role)' : 'Role'),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: _selectedRole,
                    items: [
                      DropdownMenuItem(
                        value: 'Farmer',
                        child: Text(isHindi ? 'किसान (Farmer)' : 'Farmer'),
                      ),
                      DropdownMenuItem(
                        value: 'Consumer',
                        child: Text(isHindi ? 'उपभोक्ता (Consumer)' : 'Consumer'),
                      ),
                    ],
                    onChanged: (val) {
                      if (val != null) setState(() => _selectedRole = val);
                    },
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // First Name & Last Name in Row
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFieldLabel(isHindi ? 'पहला नाम' : 'First Name'),
                        TextFormField(
                          controller: _firstNameController,
                          decoration: _buildInputDecoration(isHindi ? 'पहला नाम' : 'Enter First Name'),
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) {
                              return isHindi ? 'पहला नाम आवश्यक है' : 'First Name is required';
                            }
                            return null;
                          },
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _buildFieldLabel(isHindi ? 'अंतिम नाम' : 'Last Name'),
                        TextFormField(
                          controller: _lastNameController,
                          decoration: _buildInputDecoration(isHindi ? 'अंतिम नाम' : 'Enter Last Name'),
                          validator: (val) {
                            if (val == null || val.trim().isEmpty) {
                              return isHindi ? 'अंतिम नाम आवश्यक है' : 'Last Name is required';
                            }
                            return null;
                          },
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 16),

              // State Dropdown
              _buildFieldLabel(isHindi ? 'राज्य (State)' : 'State'),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: _selectedState,
                    hint: Text(isHindi ? '--राज्य चुनें--' : '--Select State--'),
                    items: _states.map((state) {
                      return DropdownMenuItem(value: state, child: Text(state));
                    }).toList(),
                    onChanged: (val) {
                      setState(() {
                        _selectedState = val;
                        final districts = _stateDistricts[val];
                        if (districts != null && districts.isNotEmpty) {
                          _selectedDistrict = districts.first;
                        } else {
                          _selectedDistrict = null;
                        }
                      });
                    },
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // District Dropdown
              _buildFieldLabel(isHindi ? 'जिला (District)' : 'District'),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade300),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    isExpanded: true,
                    value: _selectedDistrict,
                    hint: Text(isHindi ? '--जिला चुनें--' : '--Select District--'),
                    items: (_selectedState != null && _stateDistricts.containsKey(_selectedState))
                        ? _stateDistricts[_selectedState]!.map((district) {
                            return DropdownMenuItem(
                              value: district,
                              child: Text(district, overflow: TextOverflow.ellipsis),
                            );
                          }).toList()
                        : [],
                    onChanged: (val) {
                      setState(() => _selectedDistrict = val);
                    },
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Phone Number
              _buildFieldLabel(isHindi ? 'फ़ोन नंबर (Phone No - 10 Digits)' : 'Phone No (10 Digits)'),
              TextFormField(
                controller: _phoneController,
                keyboardType: TextInputType.phone,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(10),
                ],
                decoration: _buildInputDecoration('9876543210'),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return isHindi ? 'फ़ोन नंबर आवश्यक है' : 'Phone number is required';
                  }
                  if (val.trim().length != 10) {
                    return isHindi ? 'कृपया ठीक 10 अंकों का मोबाइल नंबर दर्ज करें' : 'Phone number must be exactly 10 digits';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // Email Address
              _buildFieldLabel(isHindi ? 'ईमेल (Email)' : 'Email'),
              TextFormField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: _buildInputDecoration('abc@example.com'),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return isHindi ? 'ईमेल आवश्यक है' : 'Email is required';
                  }
                  if (!val.contains('@')) {
                    return isHindi ? 'मान्य ईमेल पता दर्ज करें' : 'Enter a valid email address';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // Aadhaar Number
              _buildFieldLabel(isHindi ? 'आधार नंबर (Aadhaar Number - 12 Digits)' : 'Aadhaar Number (12 Digits)'),
              TextFormField(
                controller: _aadhaarController,
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(12),
                ],
                decoration: _buildInputDecoration('XXXXXXXXXXXX (12 Digits)'),
                validator: (val) {
                  if (val == null || val.trim().isEmpty) {
                    return isHindi ? 'आधार नंबर आवश्यक है' : 'Aadhaar number is required';
                  }
                  final clean = val.replaceAll(' ', '');
                  if (clean.length != 12) {
                    return isHindi ? 'कृपया ठीक 12 अंकों का आधार नंबर दर्ज करें' : 'Aadhaar number must be exactly 12 digits';
                  }
                  return null;
                },
              ),

              const SizedBox(height: 16),

              // Organization Name (Optional)
              _buildFieldLabel(isHindi ? 'संगठन का नाम (Organization Name - Optional)' : 'Organization Name (Optional)'),
              TextFormField(
                controller: _organizationController,
                decoration: _buildInputDecoration(isHindi ? 'संगठन दर्ज करें (वैकल्पिक)' : 'Enter Organization (optional)'),
              ),

              const SizedBox(height: 28),

              // Submit Button
              Consumer<AuthProvider>(
                builder: (context, auth, _) {
                  return ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primaryGreen,
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(52),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    ),
                    onPressed: auth.isLoading ? null : _handleSignup,
                    child: auth.isLoading
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                          )
                        : Text(
                            isHindi ? 'पंजीकरण जमा करें' : 'Submit Registration',
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                          ),
                  );
                },
              ),

              const SizedBox(height: 16),

              // Switch to Sign In
              Center(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      isHindi ? 'पहले से खाता है?' : 'Already have an account?',
                      style: TextStyle(color: Colors.grey.shade700),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.of(context).pushReplacement(
                          MaterialPageRoute(builder: (_) => const LoginScreen()),
                        );
                      },
                      child: Text(
                        isHindi ? 'साइन इन करें' : 'Sign in',
                        style: const TextStyle(
                          color: AppTheme.primaryGreen,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFieldLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6.0),
      child: Text(
        label,
        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: Colors.black87),
      ),
    );
  }

  InputDecoration _buildInputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: Colors.grey.shade300),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppTheme.primaryGreen, width: 1.5),
      ),
    );
  }
}

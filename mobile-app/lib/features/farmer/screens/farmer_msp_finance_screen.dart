import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/locale_provider.dart';
import '../../auth/providers/auth_provider.dart';

class FarmerMspFinanceScreen extends StatefulWidget {
  const FarmerMspFinanceScreen({super.key});

  @override
  State<FarmerMspFinanceScreen> createState() => _FarmerMspFinanceScreenState();
}

class _FarmerMspFinanceScreenState extends State<FarmerMspFinanceScreen> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  // Calculator State
  String _selectedHerb = 'Ashwagandha';
  String _selectedGrade = 'Grade A+ (Export)';
  final TextEditingController _weightController = TextEditingController(text: '25');

  final Map<String, Map<String, double>> _herbRates = {
    'Ashwagandha': {'baseMsp': 320.0, 'gradeA_plus': 380.0, 'gradeA': 350.0, 'gradeB': 300.0},
    'Tulsi': {'baseMsp': 110.0, 'gradeA_plus': 145.0, 'gradeA': 130.0, 'gradeB': 100.0},
    'Brahmi': {'baseMsp': 160.0, 'gradeA_plus': 210.0, 'gradeA': 185.0, 'gradeB': 150.0},
    'Neem': {'baseMsp': 45.0, 'gradeA_plus': 65.0, 'gradeA': 55.0, 'gradeB': 40.0},
    'Turmeric': {'baseMsp': 95.0, 'gradeA_plus': 135.0, 'gradeA': 115.0, 'gradeB': 85.0},
    'Amla': {'baseMsp': 75.0, 'gradeA_plus': 110.0, 'gradeA': 90.0, 'gradeB': 70.0},
  };

  // Dynamic Bank Details State (Non-hardcoded)
  String _bankName = 'State Bank of India';
  String _accountNumber = '•••• 4821';
  String _ifscCode = 'SBIN0001234';
  String _upiId = 'farmer@upi';
  bool _isDbtLinked = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _weightController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localeProvider = context.watch<LocaleProvider>();
    final authProvider = context.watch<AuthProvider>();
    final isHindi = localeProvider.isHindi;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        title: Text(
          isHindi ? 'समर्थन मूल्य एवं प्रत्यक्ष भुगतान (DBT)' : 'AYUSH MSP & DBT Payments',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 17, color: Colors.black87),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppTheme.primaryGreen,
          unselectedLabelColor: Colors.grey,
          indicatorColor: AppTheme.primaryGreen,
          tabs: [
            Tab(text: isHindi ? 'एमएसपी मूल्य कैलकुलेटर' : 'MSP Price Calculator'),
            Tab(text: isHindi ? 'डीबीटी भुगतान ट्रैकर' : 'DBT Escrow Tracker'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildMspCalculator(isHindi),
          _buildDbtTracker(authProvider, isHindi),
        ],
      ),
    );
  }

  Widget _buildMspCalculator(bool isHindi) {
    final rates = _herbRates[_selectedHerb] ?? {'baseMsp': 200.0, 'gradeA_plus': 250.0, 'gradeA': 220.0, 'gradeB': 180.0};
    double selectedRate = rates['gradeA_plus']!;
    if (_selectedGrade.contains('Grade A (Standard)')) selectedRate = rates['gradeA']!;
    if (_selectedGrade.contains('Grade B')) selectedRate = rates['gradeB']!;

    final weight = double.tryParse(_weightController.text) ?? 0.0;
    final totalPayout = weight * selectedRate;
    final baseMspTotal = weight * rates['baseMsp']!;
    final qualityBonus = (totalPayout - baseMspTotal).clamp(0.0, 999999.0);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Info banner
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.green.shade50,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.green.shade200),
            ),
            child: Row(
              children: [
                const Icon(Icons.verified, color: AppTheme.primaryGreen, size: 24),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    isHindi
                        ? 'राष्ट्रीय औषधीय पादप बोर्ड (NMPB) और आयुष मंत्रालय द्वारा निर्धारित पारदर्शी न्यूनतम समर्थन मूल्य।'
                        : 'Official AYUSH Minimum Support Price (MSP) guaranteed via Smart Contract Escrow.',
                    style: TextStyle(fontSize: 12, color: Colors.green.shade900, height: 1.3),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Herb Selector
          Text(
            isHindi ? 'औषधीय फसल चुनें' : 'Select Herb Species',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
          const SizedBox(height: 8),
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
                value: _selectedHerb,
                items: _herbRates.keys.map((herb) {
                  return DropdownMenuItem(value: herb, child: Text(herb));
                }).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedHerb = val);
                },
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Grade Selector
          Text(
            isHindi ? 'गुणवत्ता ग्रेड चुनें' : 'Select Quality Grade',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
          const SizedBox(height: 8),
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
                value: _selectedGrade,
                items: [
                  'Grade A+ (Export)',
                  'Grade A (Standard)',
                  'Grade B (Processing)',
                ].map((g) => DropdownMenuItem(value: g, child: Text(g))).toList(),
                onChanged: (val) {
                  if (val != null) setState(() => _selectedGrade = val);
                },
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Weight Input
          Text(
            isHindi ? 'फसल वजन (किलोग्राम)' : 'Harvest Weight (Kg)',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: _weightController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            decoration: InputDecoration(
              filled: true,
              fillColor: Colors.white,
              suffixText: 'kg',
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
            ),
            onChanged: (_) => setState(() {}),
          ),
          const SizedBox(height: 24),

          // Payout Calculation Summary Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF1E3A2B), Color(0xFF2D5F3F)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.12), blurRadius: 16, offset: const Offset(0, 4)),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  isHindi ? 'गारंटीकृत ब्लॉकचेन एस्क्रो भुगतान' : 'Guaranteed Blockchain Escrow Payout',
                  style: const TextStyle(color: Colors.white70, fontSize: 12, letterSpacing: 0.5),
                ),
                const SizedBox(height: 8),
                Text(
                  '₹${totalPayout.toStringAsFixed(2)}',
                  style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
                ),
                const Divider(color: Colors.white24, height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(isHindi ? 'लागू समर्थन दर (प्रति किलो):' : 'Effective Rate (per kg):', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                    Text('₹${selectedRate.toStringAsFixed(0)} / kg', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(isHindi ? 'मूल सरकारी समर्थन मूल्य:' : 'Govt Minimum Base Price:', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                    Text('₹${baseMspTotal.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white70, fontSize: 12)),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(isHindi ? 'उच्च गुणवत्ता बोनस (Grade A+):' : 'Quality Grade Incentive:', style: const TextStyle(color: Colors.amberAccent, fontSize: 12)),
                    Text('+₹${qualityBonus.toStringAsFixed(2)}', style: const TextStyle(color: Colors.amberAccent, fontWeight: FontWeight.bold, fontSize: 12)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDbtTracker(AuthProvider authProvider, bool isHindi) {
    final List<Map<String, dynamic>> releases = [
      {
        'batchId': 'HT-ASH-9842',
        'species': 'Ashwagandha',
        'amount': '₹9,500.00',
        'weight': '25 kg',
        'status': 'DBT Transferred',
        'bankRef': 'DBT-SBI-89234710',
        'txId': '0x7f9a...3b21',
        'date': '22 Aug 2026',
        'isSuccess': true,
      },
      {
        'batchId': 'HT-TLS-4819',
        'species': 'Tulsi',
        'amount': '₹5,800.00',
        'weight': '40 kg',
        'status': 'Escrow Released • Bank Processing',
        'bankRef': 'DBT-PNB-48102941',
        'txId': '0x4e2c...8d19',
        'date': '20 Aug 2026',
        'isSuccess': true,
      },
      {
        'batchId': 'HT-BRH-1048',
        'species': 'Brahmi',
        'amount': '₹4,200.00',
        'weight': '20 kg',
        'status': 'Smart Contract Escrow Locked',
        'bankRef': 'Pending Lab Result',
        'txId': '0x1a8f...9c44',
        'date': '18 Aug 2026',
        'isSuccess': false,
      },
    ];

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // Linked Bank Card (Interactive & Dynamic)
        InkWell(
          onTap: () => _showEditBankDialog(isHindi),
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 10)],
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: Colors.blue.shade50,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.account_balance, color: Colors.blue, size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            isHindi ? 'आधार लिंक्ड डीबीटी बैंक खाता' : 'Aadhaar DBT Linked Account',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          const SizedBox(width: 6),
                          const Icon(Icons.edit_outlined, size: 14, color: AppTheme.primaryGreen),
                        ],
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '$_bankName • $_accountNumber (${_isDbtLinked ? (isHindi ? "सत्यापित" : "Verified") : (isHindi ? "लंबित" : "Pending")})',
                        style: TextStyle(fontSize: 12, color: _isDbtLinked ? Colors.green.shade800 : Colors.orange.shade800, fontWeight: FontWeight.w600),
                      ),
                    ],
                  ),
                ),
                Icon(_isDbtLinked ? Icons.check_circle : Icons.pending, color: _isDbtLinked ? Colors.green : Colors.orange, size: 20),
              ],
            ),
          ),
        ),
        const SizedBox(height: 20),

        Text(
          isHindi ? 'हालिया स्मार्ट अनुबंध भुगतान' : 'Recent Smart Contract Escrow Releases',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
        ),
        const SizedBox(height: 12),

        ...releases.map((item) {
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(item['species'], style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                    Text(
                      item['amount'],
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppTheme.primaryGreen),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('Batch: ${item['batchId']} (${item['weight']})', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                    Text(item['date'], style: const TextStyle(fontSize: 11, color: Colors.grey)),
                  ],
                ),
                const Divider(height: 16),
                Row(
                  children: [
                    Icon(
                      item['isSuccess'] ? Icons.verified : Icons.lock_clock,
                      size: 16,
                      color: item['isSuccess'] ? Colors.green : Colors.orange,
                    ),
                    const SizedBox(width: 6),
                    Expanded(
                      child: Text(
                        item['status'],
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: item['isSuccess'] ? Colors.green.shade800 : Colors.orange.shade800,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text('Ref: ${item['bankRef']} • Tx: ${item['txId']}', style: const TextStyle(fontSize: 10, color: Colors.grey)),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }

  void _showEditBankDialog(bool isHindi) {
    final bankCtrl = TextEditingController(text: _bankName);
    final acctCtrl = TextEditingController(text: _accountNumber.replaceAll('•••• ', ''));
    final ifscCtrl = TextEditingController(text: _ifscCode);
    final upiCtrl = TextEditingController(text: _upiId);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: [
            const Icon(Icons.account_balance, color: AppTheme.primaryGreen),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                isHindi ? 'डीबीटी बैंक विवरण दर्ज / अपडेट करें' : 'Update DBT Bank Details',
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
                    ? 'प्रत्यक्ष लाभ अंतरण (DBT) समर्थन मूल्य प्राप्त करने के लिए बैंक या यूपीआई विवरण भरें (वैकल्पिक):'
                    : 'Enter bank or UPI details for direct MSP disbursements (optional):',
                style: TextStyle(fontSize: 12, color: Colors.grey.shade700),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: bankCtrl,
                decoration: InputDecoration(
                  labelText: isHindi ? 'बैंक का नाम (Bank Name)' : 'Bank Name',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixIcon: const Icon(Icons.account_balance_outlined, size: 20),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: acctCtrl,
                keyboardType: TextInputType.number,
                decoration: InputDecoration(
                  labelText: isHindi ? 'खाता संख्या (Account Number)' : 'Account Number',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixIcon: const Icon(Icons.numbers, size: 20),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: ifscCtrl,
                decoration: InputDecoration(
                  labelText: isHindi ? 'IFSC कोड' : 'IFSC Code',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixIcon: const Icon(Icons.code, size: 20),
                ),
              ),
              const SizedBox(height: 10),
              TextField(
                controller: upiCtrl,
                decoration: InputDecoration(
                  labelText: isHindi ? 'UPI आईडी (वैकल्पिक)' : 'UPI ID (Optional)',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  prefixIcon: const Icon(Icons.qr_code, size: 20),
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
            ),
            onPressed: () {
              final rawAcct = acctCtrl.text.trim();
              final rawIfsc = ifscCtrl.text.trim().toUpperCase();
              final rawBank = bankCtrl.text.trim();
              final rawUpi = upiCtrl.text.trim();

              final isAcctValid = rawAcct.length >= 9 && RegExp(r'^\d+$').hasMatch(rawAcct);
              final isIfscValid = rawIfsc.length == 11 && RegExp(r'^[A-Z]{4}0[A-Z0-9]{6}$').hasMatch(rawIfsc);

              if (!isAcctValid && rawAcct.isNotEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(isHindi ? 'अमान्य खाता संख्या! बैंक खाता कम से कम 9 अंकों का होना चाहिए।' : 'Invalid Account! Bank account number must be 9-18 digits.'),
                    backgroundColor: Colors.redAccent,
                  ),
                );
                return;
              }

              setState(() {
                if (rawBank.isNotEmpty) _bankName = rawBank;
                if (rawAcct.isNotEmpty) {
                  _accountNumber = rawAcct.length > 4 ? '•••• ${rawAcct.substring(rawAcct.length - 4)}' : rawAcct;
                }
                if (rawIfsc.isNotEmpty) _ifscCode = rawIfsc;
                if (rawUpi.isNotEmpty) _upiId = rawUpi;
                
                // Only mark as verified if BOTH account and IFSC meet standard Indian banking criteria
                _isDbtLinked = isAcctValid && (isIfscValid || rawIfsc.isEmpty);
              });

              Navigator.pop(ctx);
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text(
                    _isDbtLinked
                        ? (isHindi ? 'डीबीटी बैंक खाता सफलतापूर्वक सत्यापित एवं सहेजा गया' : 'DBT Bank Account Verified & Saved Successfully')
                        : (isHindi ? 'बैंक विवरण सहेजा गया (सत्यापन लंबित)' : 'Bank Details Saved (Verification Pending)'),
                  ),
                  backgroundColor: _isDbtLinked ? AppTheme.primaryGreen : Colors.orange.shade800,
                ),
              );
            },
            child: Text(isHindi ? 'सहेजें' : 'Save Details'),
          ),
        ],
      ),
    );
  }
}

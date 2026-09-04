import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/services/complaint_service.dart';
import '../../auth/providers/auth_provider.dart';

class ComplainPage extends StatefulWidget {
  const ComplainPage({super.key});

  @override
  State<ComplainPage> createState() => _ComplainPageState();
}

class _ComplainPageState extends State<ComplainPage> with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  late TabController _tabController;

  final TextEditingController messageController = TextEditingController();
  String? _selectedType;

  late stt.SpeechToText _speech;
  bool _isListening = false;
  bool _isSubmitting = false;
  bool _isLoadingComplaints = false;
  List<dynamic> _myComplaints = [];
  final ComplaintService _complaintService = ComplaintService();

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _speech = stt.SpeechToText();
    _loadMyComplaints();
  }

  @override
  void dispose() {
    _tabController.dispose();
    messageController.dispose();
    super.dispose();
  }

  Future<void> _loadMyComplaints() async {
    setState(() => _isLoadingComplaints = true);
    try {
      final authProvider = context.read<AuthProvider>();
      final user = authProvider.currentUser;
      if (user != null) {
        final result = await _complaintService.getUserComplaints(user.id);
        if (result['success'] == true && mounted) {
          setState(() {
            _myComplaints = result['complaints'] ?? [];
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching complaints: $e');
    } finally {
      if (mounted) setState(() => _isLoadingComplaints = false);
    }
  }

  /// Speech-to-Text function with locale support and live text typing
  void _listen(LocaleProvider localeProvider) async {
    if (!_isListening) {
      bool available = await _speech.initialize(
        onError: (val) {
          debugPrint('Speech Error: $val');
          if (mounted) setState(() => _isListening = false);
        },
      );
      if (available) {
        setState(() => _isListening = true);

        String localeId = localeProvider.isHindi ? 'hi_IN' : 'en_IN';

        _speech.listen(
          onResult: (val) {
            if (mounted) {
              setState(() {
                messageController.text = val.recognizedWords;
                messageController.selection = TextSelection.fromPosition(
                  TextPosition(offset: messageController.text.length),
                );
              });
            }
          },
          localeId: localeId,
          listenOptions: stt.SpeechListenOptions(
            partialResults: true,
            cancelOnError: false,
            listenMode: stt.ListenMode.dictation,
          ),
        );
      }
    } else {
      setState(() => _isListening = false);
      _speech.stop();
    }
  }

  /// Submit complaint to backend
  Future<void> _submitComplaint(LocaleProvider localeProvider) async {
    setState(() {
      _isSubmitting = true;
    });

    try {
      final authProvider = context.read<AuthProvider>();
      final user = authProvider.currentUser;

      if (user == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(localeProvider.isHindi
                  ? 'कृपया पहले लॉगिन करें'
                  : 'Please login first'),
              backgroundColor: Colors.red,
            ),
          );
        }
        return;
      }

      final chosenType = _selectedType ??
          (localeProvider.isHindi ? "उत्पाद गुणवत्ता समस्या" : "Product Quality Issue");

      final result = await _complaintService.registerComplaint(
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role.toString().split('.').last,
        subject: chosenType, // Automatically uses Complaint Type as Subject
        category: chosenType,
        description: messageController.text.trim(),
        priority: 'Medium',
      );

      if (!mounted) return;

      if (result['success'] == true) {
        messageController.clear();
        setState(() {
          _selectedType = null;
        });

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(localeProvider.isHindi
                ? 'शिकायत सफलतापूर्वक दर्ज की गई'
                : 'Grievance submitted successfully'),
            backgroundColor: AppTheme.primaryGreen,
          ),
        );

        await _loadMyComplaints();
        _tabController.animateTo(1); // Switch to tracking tab
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['message'] ??
                (localeProvider.isHindi
                    ? 'शिकायत दर्ज करने में विफल'
                    : 'Failed to submit complaint')),
            backgroundColor: Colors.red,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(localeProvider.isHindi
                ? 'त्रुटि: $e'
                : 'Network error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isSubmitting = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final localeProvider = context.watch<LocaleProvider>();
    final complaintCategories = localeProvider.isHindi
        ? [
            "उत्पाद गुणवत्ता समस्या",
            "जियोफेंस / लोकेशन विवाद",
            "भुगतान व मूल्य विवाद",
            "वितरण व लॉजिस्टिक्स देरी",
            "स्मार्ट अनुबंध सीजन विंडो",
            "उपकरण व हार्डवेयर खराबी",
            "ऐप व तकनीकी समस्या",
            "अन्य पूछताछ"
          ]
        : [
            "Product Quality Issue",
            "Geofence & Location Dispute",
            "Payment & Quality Multiplier",
            "Logistics & Delivery Delay",
            "Smart Contract Season Window",
            "Equipment / Hardware Malfunction",
            "App & Technical Issue",
            "Other Inquiry"
          ];

    return Scaffold(
      appBar: AppBar(
        backgroundColor: AppTheme.primaryGreen,
        elevation: 0,
        title: Text(
          localeProvider.isHindi ? "शिकायत व समाधान" : "Grievance & Resolution Hub",
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.amber,
          indicatorWeight: 3,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          tabs: [
            Tab(
              icon: const Icon(Icons.edit_note),
              text: localeProvider.isHindi ? "नई शिकायत" : "New Ticket",
            ),
            Tab(
              icon: const Icon(Icons.mark_chat_read_outlined),
              text: localeProvider.isHindi
                  ? "ट्रैक शिकायतें (${_myComplaints.length})"
                  : "Track Tickets (${_myComplaints.length})",
            ),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          // TAB 1: New Complaint Form (Without redundant subject)
          Container(
            padding: const EdgeInsets.all(20),
            child: SingleChildScrollView(
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      localeProvider.isHindi ? "हम आपकी मदद के लिए यहां हैं!" : "We're here to help!",
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.primaryGreen,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      localeProvider.isHindi
                          ? "शिकायत का प्रकार चुनें और विवरण दर्ज करें (यह स्वतः विषय बन जाएगा)"
                          : "Select complaint type and describe issue (automatically acts as subject)",
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.grey[700],
                      ),
                    ),
                    const SizedBox(height: 18),

                    /// Complaint Type Dropdown (Acts as Subject)
                    Text(
                      localeProvider.isHindi
                          ? "शिकायत का प्रकार (स्वतः विषय बनेगा) *"
                          : "Complaint Type (Automatically set as Subject) *",
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: AppTheme.primaryGreen.withOpacity(0.5)),
                        color: AppTheme.primaryGreen.withOpacity(0.04),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _selectedType,
                          isExpanded: true,
                          hint: Text(localeProvider.isHindi ? "शिकायत का प्रकार चुनें" : "Select Complaint Type"),
                          items: complaintCategories.map((e) {
                            return DropdownMenuItem(
                              value: e,
                              child: Text(e, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                            );
                          }).toList(),
                          onChanged: (val) {
                            setState(() {
                              _selectedType = val;
                            });
                          },
                        ),
                      ),
                    ),

                    /// Complaint Message with Speech-to-Text
                    const SizedBox(height: 18),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          localeProvider.isHindi ? "शिकायत विवरण *" : "Issue Description *",
                          style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                        ),
                        if (_isListening)
                          Text(
                            localeProvider.isHindi ? "सुन रहा है..." : "Listening...",
                            style: const TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 12),
                          ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Stack(
                      children: [
                        TextFormField(
                          controller: messageController,
                          maxLines: 5,
                          decoration: InputDecoration(
                            hintText: localeProvider.isHindi
                                ? "अपनी समस्या विस्तार से बताएं या माइक दबाकर बोलें..."
                                : "Describe your issue in detail or tap microphone to speak...",
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(14),
                              borderSide: const BorderSide(color: AppTheme.primaryGreen, width: 2),
                            ),
                          ),
                          validator: (value) {
                            if (value == null || value.trim().isEmpty) {
                              return localeProvider.isHindi ? "विवरण आवश्यक है" : "Description is required";
                            }
                            return null;
                          },
                        ),
                        Positioned(
                          right: 10,
                          bottom: 10,
                          child: CircleAvatar(
                            radius: 22,
                            backgroundColor: _isListening ? Colors.red : AppTheme.primaryGreen,
                            child: IconButton(
                              iconSize: 20,
                              icon: Icon(
                                _isListening ? Icons.mic : Icons.mic_none,
                                color: Colors.white,
                              ),
                              onPressed: () => _listen(localeProvider),
                            ),
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 24),

                    /// Submit Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primaryGreen,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        onPressed: _isSubmitting
                            ? null
                            : () async {
                                if (_formKey.currentState!.validate()) {
                                  await _submitComplaint(localeProvider);
                                }
                              },
                        child: _isSubmitting
                            ? const SizedBox(
                                height: 20,
                                width: 20,
                                child: CircularProgressIndicator(
                                  color: Colors.white,
                                  strokeWidth: 2,
                                ),
                              )
                            : Text(
                                localeProvider.isHindi ? "शिकायत दर्ज करें" : "Submit Grievance to Admin",
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                              ),
                      ),
                    )
                  ],
                ),
              ),
            ),
          ),

          // TAB 2: Grievances & Official Admin Responses List
          RefreshIndicator(
            onRefresh: _loadMyComplaints,
            child: _isLoadingComplaints
                ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryGreen))
                : _myComplaints.isEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.verified_user_outlined, size: 64, color: Colors.green.shade300),
                              const SizedBox(height: 12),
                              Text(
                                localeProvider.isHindi
                                    ? "कोई सक्रिय शिकायत नहीं है"
                                    : "No Active Grievances",
                                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black87),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                localeProvider.isHindi
                                    ? "आपके सभी लेन-देन और बैच ठीक चल रहे हैं।"
                                    : "All your batches and operations are in good standing.",
                                style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
                                textAlign: TextAlign.center,
                              ),
                            ],
                          ),
                        ),
                      )
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _myComplaints.length,
                        itemBuilder: (ctx, index) {
                          final item = _myComplaints[index];
                          final status = (item['status']?.toString().toUpperCase() ?? 'PENDING');
                          final isResolved = status == 'RESOLVED';
                          final adminReply = item['admin_response'] ?? item['response'] ?? item['adminReply'];
                          final subject = item['category'] ?? item['subject'] ?? item['title'] ?? 'Ticket #${item['id'] ?? index + 1}';
                          final desc = item['description'] ?? item['message'] ?? '';
                          final ticketId = item['complaint_id'] ?? item['id'] ?? 'TKT-$index';

                          return Card(
                            margin: const EdgeInsets.only(bottom: 14),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(16),
                              side: BorderSide(
                                color: isResolved
                                    ? Colors.green.shade300
                                    : (status == 'IN_REVIEW' ? Colors.blue.shade300 : Colors.amber.shade300),
                              ),
                            ),
                            elevation: 2,
                            child: Padding(
                              padding: const EdgeInsets.all(16.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              'ID: $ticketId',
                                              style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey.shade600),
                                            ),
                                            Text(
                                              subject,
                                              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                                              maxLines: 1,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ],
                                        ),
                                      ),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                        decoration: BoxDecoration(
                                          color: isResolved
                                              ? Colors.green.shade100
                                              : (status == 'IN_REVIEW' ? Colors.blue.shade100 : Colors.amber.shade100),
                                          borderRadius: BorderRadius.circular(10),
                                        ),
                                        child: Text(
                                          isResolved
                                              ? 'RESOLVED'
                                              : (status == 'IN_REVIEW' ? 'UNDER REVIEW' : 'PENDING'),
                                          style: TextStyle(
                                            fontSize: 11,
                                            fontWeight: FontWeight.bold,
                                            color: isResolved
                                                ? Colors.green.shade900
                                                : (status == 'IN_REVIEW' ? Colors.blue.shade900 : Colors.amber.shade900),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    desc,
                                    style: TextStyle(fontSize: 13, color: Colors.grey.shade800),
                                  ),
                                  const Divider(height: 20),

                                  // Official Admin Reply Box
                                  Container(
                                    padding: const EdgeInsets.all(12),
                                    decoration: BoxDecoration(
                                      color: isResolved ? Colors.green.shade50 : Colors.grey.shade100,
                                      borderRadius: BorderRadius.circular(12),
                                      border: Border.all(
                                        color: isResolved ? Colors.green.shade200 : Colors.grey.shade300,
                                      ),
                                    ),
                                    child: Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Icon(
                                          isResolved ? Icons.verified : Icons.support_agent,
                                          size: 20,
                                          color: isResolved ? Colors.green.shade800 : Colors.grey.shade600,
                                        ),
                                        const SizedBox(width: 10),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(
                                                localeProvider.isHindi
                                                    ? 'व्यवस्थापक प्रतिक्रिया (Official Admin Response):'
                                                    : 'Official Admin Resolution:',
                                                style: TextStyle(
                                                  fontSize: 12,
                                                  fontWeight: FontWeight.bold,
                                                  color: isResolved ? Colors.green.shade900 : Colors.grey.shade800,
                                                ),
                                              ),
                                              const SizedBox(height: 4),
                                              Text(
                                                (adminReply != null && adminReply.toString().trim().isNotEmpty)
                                                    ? adminReply.toString()
                                                    : (localeProvider.isHindi
                                                        ? 'प्रशासनिक समीक्षा जारी है... शीघ्र ही उत्तर दिया जाएगा।'
                                                        : 'Under active investigation by regulatory desk.'),
                                                style: TextStyle(
                                                  fontSize: 12.5,
                                                  color: isResolved ? Colors.green.shade900 : Colors.grey.shade700,
                                                  fontStyle: adminReply == null ? FontStyle.italic : FontStyle.normal,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

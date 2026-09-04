import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:hive/hive.dart';
import 'package:http/http.dart' as http;
import '../../../core/providers/locale_provider.dart';
import '../../../core/providers/theme_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/routes/app_router.dart';
import '../../../core/config/api_config.dart';
import '../../../core/services/location_service.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/collection_provider.dart';

class FarmerActionPage extends StatefulWidget {
  const FarmerActionPage({super.key});

  @override
  State<FarmerActionPage> createState() => _FarmerActionPageState();
}

class _FarmerActionPageState extends State<FarmerActionPage> {
  late stt.SpeechToText _speech;
  bool _isListening = false;
  bool _isProcessingVoice = false;
  String _spokenText = '';
  String _assistantMessage = '';
  int _offlineCount = 0;

  // Step-by-step flow state: 1 = Choose Herb, 2 = Choose Weight, 3 = Completed
  int _currentStep = 1;
  String? _selectedHerb;
  String? _selectedHerbHindi;
  double _selectedWeight = 10.0;
  String _recordedBatchId = '';
  bool _lastRecordedOnline = true;

  late TextEditingController _weightController;

  final List<Map<String, String>> _herbs = [
    {'name': 'Tulsi', 'hindi': 'तुलसी', 'part': 'Leaves', 'partHindi': 'पत्तियां'},
    {'name': 'Ashwagandha', 'hindi': 'अश्वगंधा', 'part': 'Roots', 'partHindi': 'जड़'},
    {'name': 'Neem', 'hindi': 'नीम', 'part': 'Leaves', 'partHindi': 'पत्तियां'},
    {'name': 'Brahmi', 'hindi': 'ब्राह्मी', 'part': 'Whole Plant', 'partHindi': 'संपूर्ण पौधा'},
    {'name': 'Turmeric', 'hindi': 'हल्दी', 'part': 'Rhizome', 'partHindi': 'प्रकंद'},
    {'name': 'Giloy', 'hindi': 'गिलोय', 'part': 'Stem', 'partHindi': 'तना'},
    {'name': 'Amla', 'hindi': 'आंवला', 'part': 'Fruits', 'partHindi': 'फल'},
    {'name': 'Ginger', 'hindi': 'अदरक', 'part': 'Rhizome', 'partHindi': 'प्रकंद'},
  ];

  final List<double> _quickWeights = [5, 10, 15, 20, 25, 50, 100];

  @override
  void initState() {
    super.initState();
    _speech = stt.SpeechToText();
    _weightController = TextEditingController(text: '10.0');
    _checkOfflineQueue();
  }

  @override
  void dispose() {
    _weightController.dispose();
    super.dispose();
  }

  Future<void> _checkOfflineQueue() async {
    try {
      if (Hive.isBoxOpen('offlineQueue')) {
        final box = Hive.box('offlineQueue');
        if (mounted) setState(() => _offlineCount = box.length);
      } else {
        final box = await Hive.openBox('offlineQueue');
        if (mounted) setState(() => _offlineCount = box.length);
      }
    } catch (_) {}
  }

  double? _extractQuantityFromText(String text) {
    final lower = text.toLowerCase();
    
    // Check direct numbers / decimals
    final numMatch = RegExp(r'(\d+(?:\.\d+)?)').firstMatch(text);
    if (numMatch != null) {
      return double.tryParse(numMatch.group(1)!);
    }
    
    // Hindi & English spoken words
    if (lower.contains('सौ') || lower.contains('sau') || lower.contains('hundred')) return 100.0;
    if (lower.contains('पचास') || lower.contains('pachaas') || lower.contains('fifty')) return 50.0;
    if (lower.contains('पच्चीस') || lower.contains('pachis') || lower.contains('twenty five')) return 25.0;
    if (lower.contains('बीस') || lower.contains('bees') || lower.contains('twenty')) return 20.0;
    if (lower.contains('पंद्रह') || lower.contains('pandrah') || lower.contains('fifteen')) return 15.0;
    if (lower.contains('दस') || lower.contains('das') || lower.contains('ten')) return 10.0;
    if (lower.contains('पांच') || lower.contains('panch') || lower.contains('five')) return 5.0;
    if (lower.contains('दो') || lower.contains('do') || lower.contains('two')) return 2.0;
    if (lower.contains('एक') || lower.contains('ek') || lower.contains('one')) return 1.0;
    
    return null;
  }

  Map<String, String>? _matchHerbFromText(String text) {
    final lower = text.toLowerCase();
    
    for (final h in _herbs) {
      final name = h['name']!.toLowerCase();
      final hindi = h['hindi']!;
      
      if (lower.contains(name) || lower.contains(hindi)) {
        return h;
      }
    }
    
    // Fuzzy aliases
    if (lower.contains('basil') || lower.contains('tulsi') || lower.contains('तुलसी')) {
      return _herbs.firstWhere((h) => h['name'] == 'Tulsi');
    }
    if (lower.contains('ginseng') || lower.contains('ashwa') || lower.contains('अश्व') || lower.contains('असगंध')) {
      return _herbs.firstWhere((h) => h['name'] == 'Ashwagandha');
    }
    if (lower.contains('bacopa') || lower.contains('brahmi') || lower.contains('ब्राह्मी') || lower.contains('ब्राहमी')) {
      return _herbs.firstWhere((h) => h['name'] == 'Brahmi');
    }
    if (lower.contains('neem') || lower.contains('नीम')) {
      return _herbs.firstWhere((h) => h['name'] == 'Neem');
    }
    if (lower.contains('haldi') || lower.contains('turmeric') || lower.contains('हल्दी')) {
      return _herbs.firstWhere((h) => h['name'] == 'Turmeric');
    }
    if (lower.contains('adrak') || lower.contains('ginger') || lower.contains('अदरक')) {
      return _herbs.firstWhere((h) => h['name'] == 'Ginger');
    }
    if (lower.contains('aloe') || lower.contains('ghrit') || lower.contains('एलोवेरा') || lower.contains('घृतकुमारी')) {
      return _herbs.firstWhere((h) => h['name'] == 'Aloe Vera');
    }
    if (lower.contains('amla') || lower.contains('आंवला') || lower.contains('gooseberry')) {
      return _herbs.firstWhere((h) => h['name'] == 'Amla');
    }
    if (lower.contains('shatavari') || lower.contains('शतावरी')) {
      return _herbs.firstWhere((h) => h['name'] == 'Shatavari');
    }
    if (lower.contains('giloy') || lower.contains('guduchi') || lower.contains('गिलोय') || lower.contains('गुडूची')) {
      return _herbs.firstWhere((h) => h['name'] == 'Giloy');
    }

    return null;
  }

  void _handleVoiceCommand(String command, BuildContext context, LocaleProvider localeProvider) async {
    final lower = command.toLowerCase().trim();
    if (lower.isEmpty) return;

    // 1. Direct botanical harvest with quantity: "10.5 kilo Tulsi" or "दस किलो तुलसी"
    final botanicalMatch = _parseBotanicalHarvest(command);
    if (botanicalMatch != null) {
      setState(() {
        _selectedHerb = botanicalMatch['species'];
        _selectedWeight = botanicalMatch['quantity'];
        _weightController.text = _selectedWeight.toString();
        _currentStep = 2;
        _assistantMessage = localeProvider.isHindi
            ? "${botanicalMatch['species']} ${_selectedWeight} किग्रा चुना गया। पुष्टि करें या बदलें।"
            : "Recorded ${_selectedWeight} kg of ${botanicalMatch['species']}. Tap Submit to commit.";
      });
      return;
    }

    // 2. Herb selection via voice
    final matchedHerb = _matchHerbFromText(command);
    if (matchedHerb != null) {
      setState(() {
        _selectedHerb = matchedHerb['name'];
        _selectedHerbHindi = matchedHerb['hindi'];
        _currentStep = 2;
        _assistantMessage = localeProvider.isHindi
            ? "${matchedHerb['hindi']} चुनी गई। अब मात्रा बताएं (उदा: '12.5 किलो') या नीचे लिखें।"
            : "Selected ${matchedHerb['name']}. Now say weight (e.g. '12.5 kg') or type below.";
      });
      return;
    }

    // 3. Weight selection via voice
    final parsedQty = _extractQuantityFromText(command);
    if (parsedQty != null) {
      setState(() {
        _selectedWeight = parsedQty;
        _weightController.text = parsedQty.toString();
        _assistantMessage = localeProvider.isHindi
            ? "मात्रा: $parsedQty किग्रा चुनी गई। सबमिट दबाएं।"
            : "Weight: $parsedQty kg selected. Tap Submit to commit.";
      });
      return;
    }

    // 4. Quick navigation fallback
    if (lower.contains('history') || lower.contains('इतिहास')) {
      Navigator.of(context).pushNamed(AppRouter.submissionHistory);
    } else if (lower.contains('complaint') || lower.contains('शिकायत')) {
      Navigator.of(context).pushNamed(AppRouter.registercomplaint);
    } else {
      setState(() {
        _assistantMessage = localeProvider.isHindi
            ? "फसल का नाम बोलें (जैसे 'तुलसी') या मात्रा (जैसे '15 किलो')"
            : "Say herb name (e.g. 'Tulsi') or quantity (e.g. '15 kg')";
      });
    }
  }

  Map<String, dynamic>? _parseBotanicalHarvest(String text) {
    final matchedHerb = _matchHerbFromText(text);
    if (matchedHerb == null) return null;

    final species = matchedHerb['name']!;
    final partCollected = matchedHerb['part'] ?? 'Leaves';
    double quantity = 10.0;

    final extracted = _extractQuantityFromText(text);
    if (extracted != null) {
      quantity = extracted;
    }

    return {
      'species': species,
      'quantity': quantity,
      'partCollected': partCollected,
    };
  }

  Future<void> _submitHarvest(LocaleProvider localeProvider) async {
    // Read directly from text controller to capture arbitrary decimal points
    final enteredWeight = double.tryParse(_weightController.text.trim()) ?? _selectedWeight;
    _selectedWeight = enteredWeight;

    setState(() => _isProcessingVoice = true);

    try {
      final authProvider = context.read<AuthProvider>();
      final collectionProvider = context.read<CollectionProvider>();
      final user = authProvider.currentUser;
      final locationService = LocationService();
      final pos = await locationService.getCurrentLocation();

      final lat = pos?.latitude ?? 28.5355;
      final lon = pos?.longitude ?? 77.3910;
      final batchId = 'HT-VOICE-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';

      final payload = {
        'batchId': batchId,
        'farmerId': user?.id ?? 'avinash5335588',
        'farmerName': user?.name ?? 'Avinash Sharma',
        'species': _selectedHerb ?? 'Tulsi',
        'commonName': _selectedHerb ?? 'Tulsi',
        'scientificName': '${_selectedHerb ?? "Tulsi"} sp.',
        'quantity': _selectedWeight,
        'unit': 'kg',
        'moisture': 8.5,
        'latitude': lat,
        'longitude': lon,
        'harvestDate': DateTime.now().toIso8601String().split('T')[0],
        'partCollected': 'Leaves',
        'harvestMethod': 'Voice Quick Harvest',
        'isOffline': false,
        'timestamp': DateTime.now().toIso8601String(),
      };

      bool onlineSynced = false;
      String? blockchainHash;
      try {
        final uri = Uri.parse(ApiConfig.collectionsEndpoint);
        final res = await http.post(
          uri,
          headers: ApiConfig.getAuthHeaders(),
          body: jsonEncode(payload),
        ).timeout(const Duration(seconds: 8));

        if (res.statusCode == 200 || res.statusCode == 201) {
          onlineSynced = true;
          final decoded = jsonDecode(res.body);
          blockchainHash = decoded['data']?['blockchainHash'] ?? decoded['data']?['txId'] ?? batchId;
        }
      } catch (_) {}

      // Save to CollectionProvider & StorageService so it is immediately visible in app
      await collectionProvider.createCollectionEvent(
        farmerId: user?.id ?? 'farmer',
        species: _selectedHerb ?? 'Tulsi',
        latitude: lat,
        longitude: lon,
        imagePaths: [],
        weight: _selectedWeight,
        moisture: 8.5,
        harvestMethod: 'Voice Quick Harvest',
        partCollected: 'Leaves',
        isSynced: onlineSynced,
        blockchainHash: blockchainHash,
      );

      if (!onlineSynced) {
        payload['isOffline'] = true;
        final box = Hive.isBoxOpen('offlineQueue') ? Hive.box('offlineQueue') : await Hive.openBox('offlineQueue');
        await box.add(payload);
        if (mounted) setState(() => _offlineCount = box.length);
      }

      if (mounted) {
        setState(() {
          _currentStep = 3;
          _recordedBatchId = batchId;
          _lastRecordedOnline = onlineSynced;
        });
      }
    } finally {
      if (mounted) setState(() => _isProcessingVoice = false);
    }
  }

  void _toggleListening(LocaleProvider localeProvider) async {
    if (!_isListening) {
      bool available = await _speech.initialize(
        onStatus: (status) {
          if (status == 'done' || status == 'notListening') {
            if (mounted) setState(() => _isListening = false);
            if (_spokenText.trim().isNotEmpty) {
              _handleVoiceCommand(_spokenText, context, localeProvider);
            }
          }
        },
        onError: (_) {
          if (mounted) setState(() => _isListening = false);
        },
      );

      if (available) {
        setState(() {
          _isListening = true;
          _spokenText = '';
          _assistantMessage = localeProvider.isHindi
              ? (_currentStep == 1 ? "बोलिए, कौन सी फसल? (उदा. तुलसी)" : "बोलिए, कितने किलो? (उदा. 12.5 किलो)")
              : (_currentStep == 1 ? "Speak herb name (e.g. Tulsi)" : "Speak weight (e.g. 12.5 kg)");
        });

        String localeId = localeProvider.isHindi ? 'hi_IN' : 'en_IN';

        _speech.listen(
          localeId: localeId,
          listenMode: stt.ListenMode.confirmation,
          onResult: (result) {
            if (mounted) setState(() => _spokenText = result.recognizedWords);
            // Instant recognition if herb or weight found
            final text = result.recognizedWords;
            if (_matchHerbFromText(text) != null || _extractQuantityFromText(text) != null || result.finalResult) {
              _handleVoiceCommand(text, context, localeProvider);
            }
          },
        );
      }
    } else {
      _speech.stop();
      if (mounted) setState(() => _isListening = false);
      if (_spokenText.trim().isNotEmpty) {
        _handleVoiceCommand(_spokenText, context, localeProvider);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final localeProvider = context.watch<LocaleProvider>();
    final themeProvider = context.watch<ThemeProvider>();
    final isHindi = localeProvider.isHindi;

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: themeProvider.isDarkMode
                ? [const Color(0xFF132A13), const Color(0xFF1E1E1E)]
                : [const Color(0xFF2D5F3F), const Color(0xFFF9F9F4)],
            stops: const [0.0, 0.35],
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              const SizedBox(height: 10),

              // Header Bar
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 14.0),
                child: Row(
                  children: [
                    IconButton(
                      icon: const Icon(Icons.arrow_back_ios, color: Colors.white, size: 20),
                      onPressed: () => Navigator.of(context).pop(),
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            isHindi ? 'कृषि मित्र आवाज़ सहायक' : 'Krishi Mitra Assistant',
                            style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          Text(
                            isHindi ? 'चरण-दर-चरण आसान फसल पंजीकरण' : 'Step-by-Step Simple Harvest Logging',
                            style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.85)),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.black.withOpacity(0.28),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: Colors.white, width: 1.2),
                      ),
                      child: InkWell(
                        onTap: () => localeProvider.toggleLanguage(),
                        borderRadius: BorderRadius.circular(16),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.language, color: Colors.white, size: 14),
                              const SizedBox(width: 4),
                              Text(
                                isHindi ? 'English' : 'हिंदी',
                                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // Step Indicator Pills
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Row(
                  children: [
                    _buildStepPill(1, isHindi ? '1. फसल चुनें' : '1. Herb', _currentStep >= 1, _currentStep == 1),
                    const SizedBox(width: 8),
                    _buildStepPill(2, isHindi ? '2. मात्रा / वजन' : '2. Weight', _currentStep >= 2, _currentStep == 2),
                    const SizedBox(width: 8),
                    _buildStepPill(3, isHindi ? '3. ब्लॉकचेन' : '3. Fabric', _currentStep >= 3, _currentStep == 3),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // Central Voice Assistant Mic Card
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 20.0),
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withOpacity(0.12), blurRadius: 16, offset: const Offset(0, 6)),
                    ],
                  ),
                  child: Row(
                    children: [
                      GestureDetector(
                        onTap: () => _toggleListening(localeProvider),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 300),
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: _isListening ? Colors.redAccent : AppTheme.primaryGreen,
                            shape: BoxShape.circle,
                            boxShadow: [
                              BoxShadow(color: (_isListening ? Colors.redAccent : AppTheme.primaryGreen).withOpacity(0.4), blurRadius: 14, spreadRadius: 4),
                            ],
                          ),
                          child: Icon(_isListening ? Icons.mic : Icons.mic_none, color: Colors.white, size: 32),
                        ),
                      ),
                      const SizedBox(width: 14),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _isListening
                                  ? (isHindi ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak')
                                  : (isHindi ? 'माइक दबाकर बोलें' : 'Tap Mic to Speak'),
                              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: _isListening ? Colors.redAccent : AppTheme.primaryGreen),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              _spokenText.isNotEmpty
                                  ? '"$_spokenText"'
                                  : (_assistantMessage.isNotEmpty
                                      ? _assistantMessage
                                      : (isHindi
                                          ? (_currentStep == 1 ? 'उदा: "तुलसी" या "10.5 किलो तुलसी"' : 'उदा: "12.5 किलो"')
                                          : (_currentStep == 1 ? 'e.g. "Tulsi" or "10.5 kg Tulsi"' : 'e.g. "12.5 kg"'))),
                              style: TextStyle(fontSize: 12.5, color: Colors.grey.shade700, fontStyle: _spokenText.isNotEmpty ? FontStyle.italic : FontStyle.normal),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Interactive Content Body Based on Step
              Expanded(
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: themeProvider.isDarkMode ? const Color(0xFF1E1E1E) : Colors.white,
                    borderRadius: const BorderRadius.only(topLeft: Radius.circular(30), topRight: Radius.circular(30)),
                  ),
                  child: _isProcessingVoice
                      ? const Center(child: CircularProgressIndicator(color: AppTheme.primaryGreen))
                      : (_currentStep == 1
                          ? _buildStep1HerbGrid(isHindi)
                          : (_currentStep == 2
                              ? _buildStep2WeightSelector(isHindi)
                              : _buildStep3SuccessView(isHindi))),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStepPill(int step, String label, bool isReached, bool isCurrent) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 6),
        decoration: BoxDecoration(
          color: isCurrent ? Colors.amber : (isReached ? Colors.white.withOpacity(0.35) : Colors.white.withOpacity(0.15)),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(
          child: Text(label, style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: isCurrent ? Colors.black87 : Colors.white)),
        ),
      ),
    );
  }

  // STEP 1: Clean Herb Selection Grid (No Emojis)
  Widget _buildStep1HerbGrid(bool isHindi) {
    return ListView(
      padding: const EdgeInsets.all(18),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              isHindi ? '1. अपनी फसल चुनें (या नाम बोलें):' : '1. Select Herb (or Speak):',
              style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen),
            ),
            if (_offlineCount > 0)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(color: Colors.amber.shade100, borderRadius: BorderRadius.circular(8)),
                child: Text('🟡 $_offlineCount Offline', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
              ),
          ],
        ),
        const SizedBox(height: 12),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 1.6,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
          ),
          itemCount: _herbs.length,
          itemBuilder: (ctx, index) {
            final h = _herbs[index];
            return InkWell(
              onTap: () => setState(() {
                _selectedHerb = h['name'];
                _selectedHerbHindi = h['hindi'];
                _currentStep = 2;
              }),
              borderRadius: BorderRadius.circular(16),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFFF4F9F4),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF2D5F3F).withOpacity(0.3), width: 1.2),
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isHindi ? h['hindi']! : h['name']!,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5, color: Color(0xFF1E3A24)),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            isHindi ? h['name']! : (h['part'] ?? ''),
                            style: TextStyle(fontSize: 11, color: Colors.grey.shade700, fontWeight: FontWeight.w500),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                          decoration: BoxDecoration(
                            color: const Color(0xFF2D5F3F).withOpacity(0.12),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            isHindi ? (h['partHindi'] ?? h['part']!) : (h['part'] ?? ''),
                            style: const TextStyle(fontSize: 9, color: Color(0xFF2D5F3F), fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      ],
    );
  }

  // STEP 2: Quantity Weight Input Box + Quick Decimal Chips
  Widget _buildStep2WeightSelector(bool isHindi) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
      child: ListView(
        children: [
          Row(
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back, color: AppTheme.primaryGreen),
                onPressed: () => setState(() => _currentStep = 1),
              ),
              Expanded(
                child: Text(
                  '${isHindi ? _selectedHerbHindi ?? _selectedHerb : _selectedHerb} • ${isHindi ? "मात्रा दर्ज करें" : "Enter Quantity"}',
                  style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppTheme.primaryGreen),
                  overflow: TextOverflow.ellipsis,
                  maxLines: 1,
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            isHindi ? 'सटीक वजन लिखें (दशमलव स्वीकार्य) या नीचे से चुनें:' : 'Type exact weight (decimal supported) or select below:',
            style: TextStyle(fontSize: 12.5, color: Colors.grey.shade700),
          ),
          const SizedBox(height: 12),

          // Direct Editable Quantity Input Field
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppTheme.primaryGreen, width: 1.5),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _weightController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1E3A24)),
                    decoration: InputDecoration(
                      border: InputBorder.none,
                      hintText: isHindi ? 'उदा. 12.75' : 'e.g. 12.75',
                      labelText: isHindi ? 'मात्रा (किलोग्राम में)' : 'Quantity (in Kilograms)',
                      labelStyle: const TextStyle(fontSize: 13, color: AppTheme.primaryGreen),
                    ),
                    onChanged: (val) {
                      final parsed = double.tryParse(val.trim());
                      if (parsed != null) {
                        setState(() => _selectedWeight = parsed);
                      }
                    },
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryGreen.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text(
                    'KG / किग्रा',
                    style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.primaryGreen, fontSize: 13),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),
          Text(
            isHindi ? 'त्वरित चयन बटन:' : 'Quick Select Presets:',
            style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey.shade700),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _quickWeights.map((w) {
              final isSelected = _selectedWeight == w;
              return InkWell(
                onTap: () {
                  setState(() {
                    _selectedWeight = w;
                    _weightController.text = w.toString();
                  });
                },
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: isSelected ? AppTheme.primaryGreen : Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: isSelected ? AppTheme.primaryGreen : Colors.grey.shade300),
                  ),
                  child: Text(
                    '${w.toInt()} KG',
                    style: TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : Colors.black87,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 20),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryGreen,
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            onPressed: () => _submitHarvest(context.read<LocaleProvider>()),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.cloud_upload_outlined, size: 20),
                const SizedBox(width: 8),
                Text(
                  isHindi ? 'ब्लॉकचेन में दर्ज करें' : 'Commit Harvest to Fabric',
                  style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  // STEP 3: Animated Blockchain Completion Screen
  Widget _buildStep3SuccessView(bool isHindi) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.green.shade50,
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_circle_rounded, color: AppTheme.primaryGreen, size: 64),
          ),
          const SizedBox(height: 14),
          Text(
            isHindi ? 'फसल सफलतापूर्वक दर्ज!' : 'Harvest Recorded on Blockchain!',
            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 6),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: _lastRecordedOnline ? Colors.green.shade100 : Colors.amber.shade100,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              _lastRecordedOnline
                  ? (isHindi ? '🟢 हाइपरलेजर फैब्रिक में कमिटेड' : '🟢 Committed to Hyperledger Fabric')
                  : (isHindi ? '🟡 ऑफ़लाइन सुरक्षित (इंटरनेट पर स्वतः सिंक होगा)' : '🟡 Saved in Offline Cache'),
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: _lastRecordedOnline ? Colors.green.shade900 : Colors.amber.shade900,
              ),
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(isHindi ? 'जड़ी-बूटी (Herb):' : 'Herb:'),
                    Text(_selectedHerb ?? 'Tulsi', style: const TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
                const Divider(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(isHindi ? 'मात्रा (Weight):' : 'Weight:'),
                    Text('${_selectedWeight} kg', style: const TextStyle(fontWeight: FontWeight.bold)),
                  ],
                ),
                const Divider(height: 14),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(isHindi ? 'बैच पहचान (Batch ID):' : 'Batch ID:'),
                    Text(_recordedBatchId, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 11)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryGreen,
              foregroundColor: Colors.white,
              minimumSize: const Size.fromHeight(48),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            onPressed: () {
              setState(() {
                _currentStep = 1;
                _selectedHerb = null;
                _selectedHerbHindi = null;
                _spokenText = '';
                _weightController.text = '10.0';
              });
            },
            child: Text(isHindi ? 'एक और फसल दर्ज करें' : 'Record Another Harvest'),
          ),
        ],
      ),
    );
  }
}

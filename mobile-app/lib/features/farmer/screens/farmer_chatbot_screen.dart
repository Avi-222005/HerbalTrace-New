import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/locale_provider.dart';

class ChatMessage {
  final String text;
  final bool isUser;
  final DateTime timestamp;
  final String? source;

  ChatMessage({
    required this.text,
    required this.isUser,
    required this.timestamp,
    this.source,
  });
}

class FarmerChatbotScreen extends StatefulWidget {
  const FarmerChatbotScreen({super.key});

  @override
  State<FarmerChatbotScreen> createState() => _FarmerChatbotScreenState();
}

class _FarmerChatbotScreenState extends State<FarmerChatbotScreen> {
  final TextEditingController _textController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final List<ChatMessage> _messages = [];
  bool _isTyping = false;
  String _selectedDialect = 'Hindi';

  late stt.SpeechToText _speech;
  bool _isListening = false;

  final List<Map<String, String>> _dialects = [
    {'code': 'hi', 'name': 'Hindi', 'native': 'हिन्दी'},
    {'code': 'mr', 'name': 'Marathi', 'native': 'मराठी'},
    {'code': 'te', 'name': 'Telugu', 'native': 'తెలుగు'},
    {'code': 'ta', 'name': 'Tamil', 'native': 'தமிழ்'},
    {'code': 'kn', 'name': 'Kannada', 'native': 'ಕನ್ನಡ'},
    {'code': 'bn', 'name': 'Bengali', 'native': 'বাংলা'},
    {'code': 'gu', 'name': 'Gujarati', 'native': 'ગુજરાતી'},
    {'code': 'en', 'name': 'English', 'native': 'English'},
  ];

  final Map<String, List<Map<String, String>>> _dialectPrompts = {
    'Hindi': [
      {'title': 'ब्राह्मी कटाई नियम', 'query': 'ब्राह्मी कटाई के भू-अंकन और यूपी/बिहार नियम क्या हैं?'},
      {'title': 'उचित नमी प्रतिशत', 'query': 'अश्वगंधा और तुलसी के लिए मानक नमी प्रतिशत क्या है?'},
      {'title': 'आयुष समर्थन मूल्य', 'query': 'औषधीय फसलों के न्यूनतम समर्थन मूल्य (MSP) क्या हैं?'},
      {'title': 'धूप में सुखाने के नियम', 'query': 'औषधियों को बिना गुण खोए कैसे सुखाएं?'},
    ],
    'Marathi': [
      {'title': 'ब्राह्मी काढणी नियम', 'query': 'ब्राह्मी काढणीचे नियम आणि भू-अंकन काय आहेत?'},
      {'title': 'योग्य ओलावा प्रमाण', 'query': 'अश्वगंधा व तुळशीसाठी प्रमाणित ओलावा टक्केवारी काय आहे?'},
      {'title': 'हमीभाव (MSP) दर', 'query': 'आयुष औषधी वनस्पतींचे हमीभाव काय आहेत?'},
      {'title': 'वाळवण्याच्या पद्धती', 'query': 'औषधी वनस्पती सावलीत कशा वाळवाव्यात?'},
    ],
    'Telugu': [
      {'title': 'బ్రాహ్మి కోత నిబంధనలు', 'query': 'బ్రాహ్మి కోత నిబంధనలు మరియు జియో-ఫెన్సింగ్ ఏమిటి?'},
      {'title': 'సరైన తేమ శాతం', 'query': 'అశ్వగంధ, తులసికి ప్రామాణిక తేమ శాతం ఎంత?'},
      {'title': 'మద్దతు ధర (MSP)', 'query': 'ఔషధ మొక్కల మద్దతు ధరలు ఏమిటి?'},
      {'title': 'ఎండబెట్టే పద్ధతులు', 'query': 'ఔషధ మొక్కలను ఎలా ఆరబెట్టాలి?'},
    ],
    'Tamil': [
      {'title': 'வல்லாரை அறுவடை விதிகள்', 'query': 'வல்லாரை அறுவடை மற்றும் புவிசார் விதிமுறைகள் என்ன?'},
      {'title': 'சரியான ஈரப்பதம் %', 'query': 'அஸ்வகந்தா மற்றும் துளசியின் ஈரப்பத அளவு என்ன?'},
      {'title': 'குறைந்தபட்ச ஆதரவு விலை (MSP)', 'query': 'ஆயுஷ் மூலிகைகளின் சந்தை விலை என்ன?'},
      {'title': 'உலர்த்தும் முறைகள்', 'query': 'மூலிகைகளை நிழலில் உலர்த்துவது எப்படி?'},
    ],
    'Kannada': [
      {'title': 'ಬ್ರಾಹ್ಮಿ ಕೊಯ್ಲು ನಿಯಮಗಳು', 'query': 'ಬ್ರಾಹ್ಮಿ ಕೊಯ್ಲು ನಿಯಮಗಳು ಮತ್ತು ಜಿಯೋ-ಫೆನ್ಸಿಂಗ್ ಯಾವುವು?'},
      {'title': 'ಸರಿಯಾದ ತೇವಾಂಶ %', 'query': 'ಅಶ್ವಗಂಧ ಮತ್ತು ತುಳಸಿಗೆ ಸೂಕ್ತ ತೇವಾಂಶ ಎಷ್ಟು?'},
      {'title': 'ಬೆಂಬಲ ಬೆಲೆ (MSP)', 'query': 'ಆಯುಷ್ ಗಿಡಮೂಲಿಕೆಗಳ ಬೆಂಬಲ ಬೆಲೆ ಎಷ್ಟು?'},
      {'title': 'ಒಣಗಿಸುವ ವಿಧಾನ', 'query': 'ಗಿಡಮೂಲಿಕೆಗಳನ್ನು ಸರಿಯಾಗಿ ಒಣಗಿಸುವುದು ಹೇಗೆ?'},
    ],
    'Bengali': [
      {'title': 'ব্রাহ্মী তোলার নিয়ম', 'query': 'ব্রাহ্মী তোলার জিও-ফেন্সিং ও নিয়ম কি?'},
      {'title': 'সঠিক আর্দ্রতা %', 'query': 'অশ্বগন্ধা ও তুলসীর আর্দ্রতার মান কি?'},
      {'title': 'সরকারি সহায়ক মূল্য (MSP)', 'query': 'ভেষজ উদ্ভিদের বাজার মূল্য কত?'},
      {'title': 'শুকানোর নিয়ম', 'query': 'ভেষজ গুণাগুণ বজায় রেখে কীভাবে শুকাবেন?'},
    ],
    'Gujarati': [
      {'title': 'બ્રાહ્મી લણણી નિયમો', 'query': 'બ્રાહ્મી લણણીના જીઓ-ફેન્સિંગ નિયમો શું છે?'},
      {'title': 'યોગ્ય ભેજ ટકાવારી', 'query': 'અશ્વગંધા અને તુલસી માટે પ્રમાણભૂત ભેજ કેટલો હોવો જોઈએ?'},
      {'title': 'ટેકાના ભાવ (MSP)', 'query': 'આયુષ ઔષધીય પાકના ટેકાના ભાવ શું છે?'},
      {'title': 'સૂકવવાની પદ્ધતિ', 'query': 'ઔષધીઓને છાંયડામાં કેવી રીતે સૂકવવી?'},
    ],
    'English': [
      {'title': 'Brahmi Harvest Rules', 'query': 'What are the geo-fencing rules and best time to harvest Brahmi?'},
      {'title': 'Optimal Moisture %', 'query': 'What is the standard moisture percentage required for Ashwagandha and Tulsi?'},
      {'title': 'AYUSH Market Price', 'query': 'What are the fair market prices and AYUSH quality grading standards?'},
      {'title': 'Solar Drying Tips', 'query': 'How to dry medicinal herbs without losing active phytochemical compounds?'},
    ],
  };

  @override
  void initState() {
    super.initState();
    _speech = stt.SpeechToText();
    _messages.add(
      ChatMessage(
        text: 'नमस्ते! मैं आपका कृषि मित्र एआई सहायक हूँ। आप औषधीय पौधों की कटाई, नमी मानक, बाज़ार भाव या भू-अंकन नियमों के बारे में अपनी भाषा में पूछ सकते हैं।\n\nHello! I am your Krishi Mitr AI Assistant. Ask me anything about medicinal herbs, moisture standards, MSP prices, or regulations in your preferred language.',
        isUser: false,
        timestamp: DateTime.now(),
        source: 'AYUSH Botanical Knowledgebase',
      ),
    );
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  Future<void> _listenVoice() async {
    if (!_isListening) {
      bool available = await _speech.initialize(
        onStatus: (status) {
          if (status == 'done' || status == 'notListening') {
            setState(() => _isListening = false);
            if (_textController.text.trim().isNotEmpty) {
              _handleSendMessage(_textController.text);
            }
          }
        },
        onError: (val) => setState(() => _isListening = false),
      );
      if (available) {
        setState(() => _isListening = true);
        _speech.listen(
          onResult: (val) {
            setState(() {
              _textController.text = val.recognizedWords;
            });
          },
        );
      }
    } else {
      setState(() => _isListening = false);
      _speech.stop();
      if (_textController.text.trim().isNotEmpty) {
        _handleSendMessage(_textController.text);
      }
    }
  }

  Future<void> _handleSendMessage(String text) async {
    final query = text.trim();
    if (query.isEmpty) return;

    _textController.clear();
    setState(() {
      _messages.add(ChatMessage(text: query, isUser: true, timestamp: DateTime.now()));
      _isTyping = true;
    });
    _scrollToBottom();

    await Future.delayed(const Duration(milliseconds: 700));

    final reply = _generateAIResponse(query);

    if (mounted) {
      setState(() {
        _isTyping = false;
        _messages.add(ChatMessage(
          text: reply['text'] ?? '',
          isUser: false,
          timestamp: DateTime.now(),
          source: reply['source'],
        ));
      });
      _scrollToBottom();
    }
  }

  Map<String, String> _generateAIResponse(String query) {
    final lower = query.toLowerCase();

    // 1. BRAHMI & HARVEST GUIDELINES
    if (lower.contains('brahmi') || lower.contains('ब्राह्मी') || lower.contains('బ్రాహ్మి') || lower.contains('வல்லாரை') || lower.contains('ಬ್ರಾಹ್ಮಿ') || lower.contains('কাট') || lower.contains('લણણી')) {
      if (_selectedDialect == 'Telugu') {
        return {
          'text': '🌿 **బ్రాహ్మి (Bacopa monnieri) నిబంధనలు మరియు కోత మార్గదర్శకాలు**:\n\n'
              '• **జియో-ఫెన్సింగ్ నిబంధన**: బ్రాహ్మి కేవలం **ఉత్తర ప్రదేశ్ మరియు బీహార్** లోని నమోదిత చిత్తడి నేలల నుండి మాత్రమే సేకరించడానికి అనుమతి ఉంది.\n'
              '• **కోత సమయం**: అక్టోబర్ నుండి ఫిబ్రవరి వరకు.\n'
              '• **తేమ శాతం**: 8% నుండి 12% వరకు. నీడలో ఆరబెట్టండి.',
          'source': 'నేషనల్ మెడిసినల్ ప్లాంట్స్ బోర్డ్ (NMPB)',
        };
      } else if (_selectedDialect == 'Tamil') {
        return {
          'text': '🌿 **வல்லாரை (Bacopa monnieri) அறுவடை மற்றும் ஒழுங்குமுறை விதிகள்**:\n\n'
              '• **புவிசார் விதிமுறை**: வல்லாரை **உத்தரப் பிரதேசம் மற்றும் பீகார்** பதிவு செய்யப்பட்ட ஈரநிலங்களிலிருந்து மட்டுமே சேகரிக்க அனுமதிக்கப்படுகிறது.\n'
              '• **அறுவடை காலம்**: அக்டோபர் முதல் பிப்ரவரி வரை.\n'
              '• **ஈரப்பதம்**: 8% முதல் 12% வரை. நிழலில் உலர்த்தவும்.',
          'source': 'தேசிய மூலிகைகள் வாரியம் (NMPB)',
        };
      } else if (_selectedDialect == 'Kannada') {
        return {
          'text': '🌿 **ಬ್ರಾಹ್ಮಿ (Bacopa monnieri) ಕೊಯ್ಲು ಮತ್ತು ನಿಯಮಗಳು**:\n\n'
              '• **ಜಿಯೋ-ಫೆನ್ಸಿಂಗ್ ನಿಯಮ**: ಬ್ರಾಹ್ಮಿಯನ್ನು **ಉತ್ತರ ಪ್ರದೇಶ ಮತ್ತು ಬಿಹಾರ**ದ ನೋಂದಾಯಿತ ಜೌಗು ಪ್ರದೇಶಗಳಿಂದ ಮಾತ್ರ ಸಂಗ್ರಹಿಸಲು ಅನುಮತಿಸಲಾಗಿದೆ.\n'
              '• **ಕೊಯ್ಲು ಸಮಯ**: ಅಕ್ಟೋಬರ್‌ನಿಂದ ಫೆಬ್ರವರಿವರೆಗೆ.\n'
              '• **ತೇವಾಂಶ**: 8% ರಿಂದ 12% ವರೆಗೆ. ನೆರಳಿನಲ್ಲಿ ಒಣಗಿಸಿ.',
          'source': 'ರಾಷ್ಟ್ರೀಯ ಗಿಡಮೂಲಿಕೆ ಮಂಡಳಿ (NMPB)',
        };
      } else if (_selectedDialect == 'Bengali') {
        return {
          'text': '🌿 **ব্রাহ্মী (Bacopa monnieri) তোলার নিয়মাবলী ও গাইডলাইন**:\n\n'
              '• **জিও-ফেন্সিং নিয়ম**: ব্রাহ্মী কেবলমাত্র **উত্তর প্রদেশ এবং বিহার**-এর অনুমোদিত জলাভূমি থেকে সংগ্রহের অনুমতি রয়েছে।\n'
              '• **তোলার সঠিক সময়**: অক্টোবর থেকে ফেব্রুয়ারি মাস।\n'
              '• **আর্দ্রতার মান**: ৮% থেকে ১২%। সক্রিয় উপাদান বজায় রাখতে ছায়ায় শুকান।',
          'source': 'ন্যাশনাল মেডিসিনাল প্ল্যান্টস বোর্ড (NMPB)',
        };
      } else if (_selectedDialect == 'Gujarati') {
        return {
          'text': '🌿 **બ્રાહ્મી (Bacopa monnieri) લણણી અને નિયમનકારી માર્ગદર્શિકા**:\n\n'
              '• **જીઓ-ફેન્સિંગ નિયમ**: બ્રાહ્મી માત્ર **ઉત્તર પ્રદેશ અને બિહાર**ના પ્રમાણિત ભીના વિસ્તારોમાંથી જ એકત્રિત કરવા માટે માન્ય છે.\n'
              '• **લણણીનો સમય**: ઓક્ટોબરથી ફેબ્રુઆરી દરમિયાન.\n'
              '• **ભેજ પ્રમાણ**: 8% થી 12%. છાંયડામાં સૂકવવું.',
          'source': 'રાષ્ટ્રીય ઔષધીય વનસ્પતિ બોર્ડ (NMPB)',
        };
      } else if (_selectedDialect == 'Marathi') {
        return {
          'text': '🌿 **ब्राह्मी (Bacopa monnieri) नियम व काढणी मार्गदर्शक**:\n\n'
              '• **भू-अंकन नियम**: ब्राह्मी केवळ **उत्तर प्रदेश आणि बिहार** च्या नोंदणीकृत पाणथळ प्रदेशातून गोळा करण्यास मान्यता आहे.\n'
              '• **काढणी वेळ**: ऑक्टोबर ते फेब्रुवारी दरम्यान करावी.\n'
              '• **ओलावा प्रमाण**: ८% ते १२%. सावलीत वाळवावे.',
          'source': 'राष्ट्रीय औषधी वनस्पती मंडळ (NMPB)',
        };
      } else if (_selectedDialect == 'Hindi') {
        return {
          'text': '🌿 **ब्राह्मी (Bacopa monnieri) कटाई एवं विनियामक नियम**:\n\n'
              '• **भू-अंकन नियम**: ब्राह्मी केवल **उत्तर प्रदेश और बिहार** के प्रमाणित आर्द्र क्षेत्रों से संग्रह हेतु मान्य है।\n'
              '• **कटाई का सही समय**: अक्टूबर से फरवरी के दौरान जब बाकोसाइड-A अधिकतम हो।\n'
              '• **मानक नमी**: 8% से 12%। छाया में सुखाएं।',
          'source': 'राष्ट्रीय औषधीय पादप बोर्ड (NMPB)',
        };
      } else {
        return {
          'text': '🌿 **Brahmi (Bacopa monnieri) Regulatory & Harvesting Guidelines**:\n\n'
              '• **Geo-Fence Regulation**: Brahmi is authorized strictly in certified alluvial wetlands of **Uttar Pradesh and Bihar**.\n'
              '• **Harvest Timing**: October to February when Bacoside-A content is highest (>2.5%).\n'
              '• **Moisture Standard**: 8% to 12%. Dry in shaded solar dryer to retain active potency.',
          'source': 'NMPB & AYUSH Herb Monographs',
        };
      }
    }

    // 2. MOISTURE & QUALITY STANDARDS
    if (lower.contains('moisture') || lower.contains('नमी') || lower.contains('ओलावा') || lower.contains('తేమ') || lower.contains('ஈரப்பதம்') || lower.contains('ತೇವಾಂಶ') || lower.contains('আর্দ্রতা') || lower.contains('ભેજ')) {
      if (_selectedDialect == 'Telugu') {
        return {
          'text': '💧 **ఆయుష్ నాణ్యత & ప్రామాణిక తేమ శాతాలు**:\n\n'
              '1. **అశ్వగంధ వేర్లు**: 8.0% - 10.0% తేమ.\n'
              '2. **తులసి ఆకులు**: 9.0% - 11.0% తేమ.\n'
              '3. **వేప పండ్లు/గింజలు**: 7.0% - 10.0% తేమ.\n\n'
              '💡 ఈ పరిధిలో ఉన్న పంటకు **గ్రేడ్ A+ (85+ స్కోరు)** మరియు 1.5x రివార్డు లభిస్తుంది.',
          'source': 'ఆయుష్ నాణ్యతా ప్రమాణాల కమిషన్',
        };
      } else if (_selectedDialect == 'Tamil') {
        return {
          'text': '💧 **ஆயுஷ் தரம் மற்றும் ஈரப்பத அளவுகள்**:\n\n'
              '1. **அஸ்வகந்தா வேர்கள்**: 8.0% - 10.0% ஈரப்பதம்.\n'
              '2. **துளசி இலைகள்**: 9.0% - 11.0% ஈரப்பதம்.\n'
              '3. **வேப்பங்கொட்டை/இலைகள்**: 7.0% - 10.0% ஈரப்பதம்.\n\n'
              '💡 இந்த அளவில் உள்ள அறுவடைக்கு **கிரேடு A+ (85+ மதிப்பெண்)** மற்றும் 1.5x வெகுமதி கிடைக்கும்.',
          'source': 'இந்திய மருத்துவ மருந்தியல் ஆணையம்',
        };
      } else if (_selectedDialect == 'Kannada') {
        return {
          'text': '💧 **ಆಯುಷ್ ಗುಣಮಟ್ಟ ಮತ್ತು ತೇವಾಂಶ ಮಾನದಂಡಗಳು**:\n\n'
              '1. **ಅಶ್ವಗಂಧ ಬೇರುಗಳು**: 8.0% - 10.0% ತೇವಾಂಶ.\n'
              '2. **ತುಳಸಿ ಎಲೆಗಳು**: 9.0% - 11.0% ತೇವಾಂಶ.\n'
              '3. **ಬೇವು ಬೀಜ/ಎಲೆಗಳು**: 7.0% - 10.0% ತೇವಾಂಶ.\n\n'
              '💡 ಈ ಮಾನದಂಡದಲ್ಲಿರುವ ಬೆಳೆಗೆ **ಗ್ರೇಡ್ A+ (85+ ಸ್ಕೋರ್)** ಮತ್ತು 1.5x ಪ್ರತಿಫಲ ಸಿಗುತ್ತದೆ.',
          'source': 'ಭಾರತೀಯ ಔಷಧ ಸಂಹಿತೆ ಆಯೋಗ',
        };
      } else if (_selectedDialect == 'Bengali') {
        return {
          'text': '💧 **আয়ুষ গুণমান ও আর্দ্রতার মানদণ্ড**:\n\n'
              '১. **অশ্বগন্ধার মূল**: ৮.০% - ১০.০% আর্দ্রতা।\n'
              '২. **তুলসী পাতা**: ৯.০% - ১১.০% আর্দ্রতা।\n'
              '৩. **নিম বীজ/পাতা**: ৭.০% - ১০.০% আর্দ্রতা।\n\n'
              '💡 সঠিক আর্দ্রতায় সংগ্রহ করলে **গ্রেড A+ (৮৫+ স্কোর)** এবং ১.৫ গুণ রিওয়ার্ড পাবেন।',
          'source': 'ভারতীয় ঔষধ কমিশন (PCIM&H)',
        };
      } else if (_selectedDialect == 'Gujarati') {
        return {
          'text': '💧 **આયુષ ગુણવત્તા અને ભેજ પ્રમાણ માપદંડ**:\n\n'
              '1. **અશ્વગંધા મૂળ**: 8.0% - 10.0% ભેજ.\n'
              '2. **તુલસીના પાન**: 9.0% - 11.0% ભેજ.\n'
              '3. **લીમડાના બીજ/પાન**: 7.0% - 10.0% ભેજ.\n\n'
              '💡 આ શ્રેણીમાં પાકને **ગ્રેડ A+ (85+ સ્કોર)** અને 1.5x રિવોર્ડ મળે છે.',
          'source': 'ભારતીય ઔષધ સંહિતા આયોગ (PCIM&H)',
        };
      } else if (_selectedDialect == 'Marathi') {
        return {
          'text': '💧 **आयुष गुणवत्ता आणि ओलावा मानके**:\n\n'
              '1. **अश्वगंधा मुळे**: ८.०% - १०.०% ओलावा.\n'
              '2. **तुळशी पाने**: ९.०% - ११.०% ओलावा.\n'
              '3. **कडुनिंब बिया/पाने**: ७.०% - १०.०% ओलावा.\n\n'
              '💡 या मर्यादेतील पिकाला **ग्रेड A+ (८५+ स्कोअर)** आणि १.५x रिवॉर्ड मिळतो.',
          'source': 'भारतीय औषध संहिता आयोग (PCIM&H)',
        };
      } else if (_selectedDialect == 'Hindi') {
        return {
          'text': '💧 **आयुष गुणवत्ता एवं नमी मानक**:\n\n'
              '1. **अश्वगंधा जड़ें**: 8.0% - 10.0% नमी। (जड़ आसानी से टूटे, खिंचे नहीं)।\n'
              '2. **तुलसी पत्तियां**: 9.0% - 11.0% नमी।\n'
              '3. **नीम फल/पत्ते**: 7.0% - 10.0% नमी।\n\n'
              '💡 इस सीमा में फसल को **ग्रेड A+ (85+ स्कोर)** और 1.5x रिवॉर्ड मिलता है।',
          'source': 'भारतीय औषधि संहिता आयोग (PCIM&H)',
        };
      } else {
        return {
          'text': '💧 **AYUSH Moisture & Quality Standards**:\n\n'
              '1. **Ashwagandha Roots**: 8.0% - 10.0% moisture (snaps crisply).\n'
              '2. **Tulsi Leaves**: 9.0% - 11.0% moisture (preserves volatile essential oils).\n'
              '3. **Neem Leaves/Seeds**: 7.0% - 10.0% moisture.\n\n'
              '💡 Compliant batches receive **Grade A+ (85+ Score)** and 1.5x Reward multiplier.',
          'source': 'Pharmacopoeia Commission for Indian Medicine',
        };
      }
    }

    // 3. MSP & MARKET PRICES
    if (lower.contains('price') || lower.contains('msp') || lower.contains('भाव') || lower.contains('दर') || lower.contains('ధర') || lower.contains('விலை') || lower.contains('ಬೆಲೆ') || lower.contains('মূল্য')) {
      if (_selectedDialect == 'Telugu') {
        return {
          'text': '💰 **ఆయుష్ కనీస మద్దతు ధరలు (MSP - కిలోకు)**:\n\n'
              '• **అశ్వగంధ (రూట్ గ్రేడ్ A)**: ₹320 - ₹380 / కేజీ\n'
              '• **తులసి (ఎండిన ఆకులు)**: ₹110 - ₹145 / కేజీ\n'
              '• **బ్రాహ్మి (మొత్తం మొక్క)**: ₹160 - ₹210 / కేజీ\n'
              '• **ఉసిరి (ఎండిన కాయలు)**: ₹85 - ₹120 / కేజీ\n\n'
              '✨ ల్యాబ్ పరీక్ష పూర్తయిన వెంటనే మీ లింక్ చేయబడిన బ్యాంకు ఖాతాలో నేరుగా DBT జమ అవుతుంది.',
          'source': 'e-CHARAK & నేషనల్ మెడిసినల్ ప్లాంట్స్ బోర్డ్',
        };
      } else if (_selectedDialect == 'Tamil') {
        return {
          'text': '💰 **ஆயுஷ் குறைந்தபட்ச ஆதரவு விலை (MSP - கிலோவுக்கு)**:\n\n'
              '• **அஸ்வகந்தா (வேர் தரம் A)**: ₹320 - ₹380 / கிலோ\n'
              '• **துளசி (உலர்ந்த இலைகள்)**: ₹110 - ₹145 / கிலோ\n'
              '• **வல்லாரை (முழு மூலிகை)**: ₹160 - ₹210 / கிலோ\n'
              '• **நெல்லிக்காய் (உலர்ந்த காய்)**: ₹85 - ₹120 / கிலோ\n\n'
              '✨ ஆய்வக ஒப்புதலுக்குப் பிறகு தொகை நேரடியாக உங்கள் வங்கிக் கணக்கில் DBT மூலம் வரவு வைக்கப்படும்.',
          'source': 'e-CHARAK & தேசிய மூலிகைகள் வாரியம்',
        };
      } else if (_selectedDialect == 'Kannada') {
        return {
          'text': '💰 **ಆಯುಷ್ ಕನಿಷ್ಠ ಬೆಂಬಲ ಬೆಲೆಗಳು (MSP - ಪ್ರತಿ ಕೆಜಿಗೆ)**:\n\n'
              '• **ಅಶ್ವಗಂಧ (ಬೇರು ಗ್ರೇಡ್ A)**: ₹320 - ₹380 / ಕೆಜಿ\n'
              '• **ತುಳಸಿ (ಒಣ ಎಲೆಗಳು)**: ₹110 - ₹145 / ಕೆಜಿ\n'
              '• **ಬ್ರಾಹ್ಮಿ (ಸಂಪೂರ್ಣ ಸಸ್ಯ)**: ₹160 - ₹210 / ಕೆಜಿ\n'
              '• **ನೆಲ್ಲಿಕಾಯಿ (ಒಣಗಿದ ಹಣ್ಣು)**: ₹85 - ₹120 / ಕೆಜಿ\n\n'
              '✨ ಲ್ಯಾಬ್ ಅನುಮೋದನೆಯ ನಂತರ ನೇರವಾಗಿ ನಿಮ್ಮ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ DBT ಪಾವತಿ ಜಮೆಯಾಗುತ್ತದೆ.',
          'source': 'e-CHARAK & ರಾಷ್ಟ್ರೀಯ ಗಿಡಮೂಲಿಕೆ ಮಂಡಳಿ',
        };
      } else if (_selectedDialect == 'Bengali') {
        return {
          'text': '💰 **আয়ুষ সর্বনিম্ন সহায়ক মূল্য (MSP - প্রতি কেজি)**:\n\n'
              '• **অশ্বগন্ধা (গ্রেড A মূল)**: ₹৩২০ - ₹৩৮০ / কেজি\n'
              '• **তুলসী (শুকনো পাতা)**: ₹১১০ - ₹১৪৫ / কেজি\n'
              '• **ব্রাহ্মী (পুরো গাছ)**: ₹১৬০ - ₹২১০ / কেজি\n'
              '• **আমলকী (শুকনো ফল)**: ₹৮৫ - ₹১২০ / কেজি\n\n'
              '✨ ল্যাব অনুমোদনের পর সরাসরি আপনার ব্যাংক অ্যাকাউন্টে DBT-এর মাধ্যমে টাকা জমা হবে।',
          'source': 'e-CHARAK ও ন্যাশনাল মেডিসিনাল প্ল্যান্টস বোর্ড',
        };
      } else if (_selectedDialect == 'Gujarati') {
        return {
          'text': '💰 **આયુષ લઘુત્તમ ટેકાના ભાવ (MSP - પ્રતિ કિલો)**:\n\n'
              '• **અશ્વગંધા (મૂળ ગ્રેડ A)**: ₹320 - ₹380 / કિલો\n'
              '• **તુલસી (સૂકા પાન)**: ₹110 - ₹145 / કિલો\n'
              '• **બ્રાહ્મી (સંપૂર્ણ છોડ)**: ₹160 - ₹210 / કિલો\n'
              '• **આમળા (સૂકા ફળ)**: ₹85 - ₹120 / કિલો\n\n'
              '✨ લેબ મંજૂરી પછી સીધા તમારા બેંક ખાતામાં DBT દ્વારા ચૂકવણી જમા થશે.',
          'source': 'e-CHARAK & રાષ્ટ્રીય ઔષધીય વનસ્પતિ બોર્ડ',
        };
      } else if (_selectedDialect == 'Marathi') {
        return {
          'text': '💰 **आयुष हमीभाव व बाजार दर (प्रति किलो)**:\n\n'
              '• **अश्वगंधा (ग्रेड A मुळे)**: ₹३२० - ₹३८० / किलो\n'
              '• **तुळस (वाळलेली पाने)**: ₹११० - ₹१४५ / किलो\n'
              '• **ब्राह्मी (संपूर्ण वनस्पती)**: ₹१६० - ₹२१० / किलो\n'
              '• **आवळा (वाळलेला)**: ₹८५ - ₹१२० / किलो\n\n'
              '✨ लॅब तपासणीनंतर थेट बँक खात्यात स्मार्ट कॉन्ट्रॅक्ट DBT द्वारे रक्कम जमा होते.',
          'source': 'e-CHARAK व राष्ट्रीय औषधी वनस्पती मंडळ',
        };
      } else if (_selectedDialect == 'Hindi') {
        return {
          'text': '💰 **आयुष न्यूनतम समर्थन मूल्य (MSP प्रति किग्रा)**:\n\n'
              '• **अश्वगंधा (जड़ ग्रेड A)**: ₹320 - ₹380 / किग्रा\n'
              '• **तुलसी (सूखी पत्तियां)**: ₹110 - ₹145 / किग्रा\n'
              '• **ब्राह्मी (संपूर्ण पौधा)**: ₹160 - ₹210 / किग्रा\n'
              '• **आंवला (सूखा फल)**: ₹85 - ₹120 / किग्रा\n\n'
              '✨ लैब परीक्षण के बाद स्मार्ट अनुबंध के तहत सीधे आपके बैंक खाते में DBT भुगतान जमा होता है।',
          'source': 'e-CHARAK एवं राष्ट्रीय औषधीय पादप बोर्ड',
        };
      } else {
        return {
          'text': '💰 **AYUSH Minimum Support & Fair Market Prices (Per Kg)**:\n\n'
              '• **Ashwagandha (Root Grade A)**: ₹320 - ₹380 / kg\n'
              '• **Tulsi (Dried Leaves)**: ₹110 - ₹145 / kg\n'
              '• **Brahmi (Whole Herb)**: ₹160 - ₹210 / kg\n'
              '• **Amla (Dried Fruit)**: ₹85 - ₹120 / kg\n\n'
              '✨ Direct smart contract DBT payment is credited directly into your linked bank account upon Lab acceptance.',
          'source': 'e-CHARAK & National Medicinal Plants Board',
        };
      }
    }

    // Default Advisory in Selected Dialect
    if (_selectedDialect == 'Telugu') {
      return {
        'text': '🌱 **ఆయుష్ వ్యవసాయ సలహా**:\n\n'
            'ఎక్కువ ఔషధ గుణాలు పొందడానికి ఉదయం ఎండ తీవ్రత పెరగకముందే కోత పూర్తి చేయండి. తేమను 8% నుండి 12% మధ్య ఉంచి, డిజిటల్ గేట్ పాస్ రూపొందించండి.',
        'source': 'ఆయుష్ గుడ్ కలెక్షన్ ప్రాక్టీసెస్',
      };
    } else if (_selectedDialect == 'Tamil') {
      return {
        'text': '🌱 **ஆயுஷ் மூலிகை வழிகாட்டுதல்**:\n\n'
            'அதிக மூலிகை சத்து பெற அதிகாலை சூரிய வெளிச்சத்திற்கு முன் அறுவடை செய்யுங்கள். ஈரப்பதத்தை 8% முதல் 12% வரை வைத்து டிஜிட்டல் கேட் பாஸ் உருவாக்கவும்.',
        'source': 'ஆயுஷ் நல்ல கள சேகரிப்பு முறைகள்',
      };
    } else if (_selectedDialect == 'Kannada') {
      return {
        'text': '🌱 **ಆಯುಷ್ ಕೃಷಿ ಸಲಹೆ**:\n\n'
            'ಹೆಚ್ಚಿನ ಸಸ್ಯೌಷಧ ಇಳುವರಿಗಾಗಿ ತೀವ್ರ ಸೂರ್ಯನ ಬಿಸಿಲಿಗಿಂತ ಮುಂಚೆಯೇ ಕೊಯ್ಲು ಮಾಡಿ. ತೇವಾಂಶವನ್ನು 8% ರಿಂದ 12% ಒಳಗೆ ಇರಿಸಿ ಡಿಜಿಟಲ್ ಗೇಟ್ ಪಾಸ್ ರಚಿಸಿ.',
        'source': 'ಆಯುಷ್ ಉತ್ತಮ ಸಂಗ್ರಹ ಪದ್ಧತಿಗಳು',
      };
    } else if (_selectedDialect == 'Bengali') {
      return {
        'text': '🌱 **আয়ুষ ভেষজ কৃষি পরামর্শ**:\n\n'
            'সর্বোচ্চ ঔষধি গুণ পেতে তীব্র রোদের আগে খুব ভোরে ফসল সংগ্রহ করুন। আর্দ্রতা ৮% থেকে ১২% এর মধ্যে রাখুন এবং ডিজিটাল গেট পাস তৈরি করুন।',
        'source': 'আয়ুষ সংগ্রহ নির্দেশিকা',
      };
    } else if (_selectedDialect == 'Gujarati') {
      return {
        'text': '🌱 **આયુષ વનસ્પતિ સલાહ**:\n\n'
            'મહત્તમ ઔષધીય ગુણવત્તા મેળવવા તીવ્ર સૂર્યપ્રકાશ પહેલાં વહેલી સવારે લણણી પૂર્ણ કરો. ભેજ 8% થી 12% વચ્ચે રાખી ડિજિટલ ગેટ પાસ જનરેટ કરો.',
        'source': 'આયુષ ગુડ કલેક્શન પ્રેક્ટિસ',
      };
    } else if (_selectedDialect == 'Marathi') {
      return {
        'text': '🌱 **आयुष कृषी सल्ला**:\n\n'
            'जास्तीत जास्त औषधी घटकांसाठी कडक ऊन पडण्यापूर्वी सकाळी लवकर काढणी करा. ओलावा ८% ते १२% दरम्यान ठेवून डिजिटल गेट पास तयार करा.',
        'source': 'आयुष संकलन मार्गदर्शक तत्त्वे',
      };
    } else if (_selectedDialect == 'Hindi') {
      return {
        'text': '🌱 **आयुष पादप सलाहकार**:\n\n'
            'अधिकतम औषधीय तत्वों हेतु तीव्र धूप से पहले सुबह जल्दी कटाई करें। नमी 8% से 12% के बीच रखें और डिजिटल गेट पास अवश्य बनाएं।',
        'source': 'आयुष गुड फील्ड कलेक्शन प्रैक्टिसेज',
      };
    } else {
      return {
        'text': '🌱 **AYUSH Botanical Advisory**:\n\n'
            'For maximum phytochemical yield, harvest early morning before intense sunlight. Keep harvest moisture between 8% and 12%, and generate your **Offline Digital Gate Pass** before dispatching to the collection center.',
        'source': 'AYUSH Good Field Collection Practices',
      };
    }
  }

  @override
  Widget build(BuildContext context) {
    final localeProvider = context.watch<LocaleProvider>();
    final isHindi = localeProvider.isHindi;
    final prompts = _dialectPrompts[_selectedDialect] ?? _dialectPrompts['English']!;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 1,
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(6),
              decoration: BoxDecoration(color: Colors.green.shade50, shape: BoxShape.circle),
              child: const Icon(Icons.smart_toy, color: AppTheme.primaryGreen, size: 22),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isHindi ? 'कृषि मित्र (एआई सहायक)' : 'Krishi Mitr AI Advisor',
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.black87),
                    overflow: TextOverflow.ellipsis,
                  ),
                  Row(
                    children: [
                      Container(width: 6, height: 6, decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle)),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          isHindi ? 'ऑनलाइन • 8 क्षेत्रीय भाषाएं' : 'Online • 8 Regional Dialects',
                          style: TextStyle(fontSize: 10, color: Colors.grey.shade600),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Regional Dialect Selector
          Container(
            height: 38,
            margin: const EdgeInsets.only(top: 8, bottom: 2),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: _dialects.length,
              itemBuilder: (context, index) {
                final d = _dialects[index];
                final isSelected = _selectedDialect == d['name'];
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: ChoiceChip(
                    label: Text('${d['native']} (${d['name']})', style: TextStyle(fontSize: 11, fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
                    selected: isSelected,
                    selectedColor: AppTheme.primaryGreen,
                    labelStyle: TextStyle(color: isSelected ? Colors.white : Colors.black87),
                    onSelected: (selected) {
                      if (selected) {
                        setState(() => _selectedDialect = d['name']!);
                      }
                    },
                  ),
                );
              },
            ),
          ),

          // Quick prompt chips
          Container(
            height: 44,
            margin: const EdgeInsets.symmetric(vertical: 4),
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: prompts.length,
              itemBuilder: (context, index) {
                final prompt = prompts[index];
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ActionChip(
                    backgroundColor: Colors.white,
                    side: BorderSide(color: Colors.green.shade200),
                    label: Text(
                      prompt['title']!,
                      style: const TextStyle(fontSize: 12, color: AppTheme.primaryGreen, fontWeight: FontWeight.w600),
                    ),
                    onPressed: () => _handleSendMessage(prompt['query']!),
                  ),
                );
              },
            ),
          ),

          const Divider(height: 1),

          // Message List
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                return _buildMessageBubble(msg);
              },
            ),
          ),

          // Typing Indicator
          if (_isTyping)
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
              child: Row(
                children: [
                  const SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.primaryGreen),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    isHindi ? 'कृषि मित्र सोच रहा है...' : 'Krishi Mitr is researching AYUSH guidelines...',
                    style: const TextStyle(fontSize: 11, color: Colors.grey, fontStyle: FontStyle.italic),
                  ),
                ],
              ),
            ),

          // Input Bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: Colors.white,
              boxShadow: [
                BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, -2)),
              ],
            ),
            child: SafeArea(
              child: Row(
                children: [
                  // Voice Mic Button
                  IconButton(
                    icon: Icon(_isListening ? Icons.mic : Icons.mic_none, color: _isListening ? Colors.red : AppTheme.primaryGreen),
                    onPressed: _listenVoice,
                  ),
                  Expanded(
                    child: TextField(
                      controller: _textController,
                      textInputAction: TextInputAction.send,
                      onSubmitted: _handleSendMessage,
                      decoration: InputDecoration(
                        hintText: isHindi ? 'यहाँ प्रश्न पूछें...' : 'Ask a question in ${_selectedDialect}...',
                        hintStyle: const TextStyle(fontSize: 13, color: Colors.grey),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        filled: true,
                        fillColor: const Color(0xFFF7FAF7),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    decoration: const BoxDecoration(
                      color: AppTheme.primaryGreen,
                      shape: BoxShape.circle,
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.send_rounded, color: Colors.white, size: 20),
                      onPressed: () => _handleSendMessage(_textController.text),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMessageBubble(ChatMessage msg) {
    return Align(
      alignment: msg.isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.82),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: msg.isUser ? AppTheme.primaryGreen : Colors.white,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(msg.isUser ? 16 : 4),
            bottomRight: Radius.circular(msg.isUser ? 4 : 16),
          ),
          border: msg.isUser ? null : Border.all(color: Colors.grey.shade200),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              msg.text,
              style: TextStyle(
                color: msg.isUser ? Colors.white : Colors.black87,
                fontSize: 13.5,
                height: 1.4,
              ),
            ),
            if (msg.source != null) ...[
              const SizedBox(height: 6),
              Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(Icons.verified, size: 12, color: AppTheme.primaryGreen),
                  const SizedBox(width: 4),
                  Flexible(
                    child: Text(
                      msg.source!,
                      style: const TextStyle(fontSize: 10, color: AppTheme.primaryGreen, fontWeight: FontWeight.bold),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

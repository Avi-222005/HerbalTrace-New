import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/locale_provider.dart';
import '../../../core/providers/theme_provider.dart';
import '../providers/collection_provider.dart';
import '../../auth/providers/auth_provider.dart';
import '../../../core/routes/app_router.dart';
import '../widgets/stat_card.dart';
import '../widgets/submission_card.dart';


class FarmerDashboard extends StatefulWidget {
  const FarmerDashboard({super.key});

  @override
  State<FarmerDashboard> createState() => _FarmerDashboardState();
}

class _FarmerDashboardState extends State<FarmerDashboard> {
  int _selectedIndex = 0;
  bool _toggleNewCollection = false;
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CollectionProvider>().loadEvents();
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final localeProvider = context.watch<LocaleProvider>();
    final themeProvider = context.watch<ThemeProvider>();
    final authProvider = context.watch<AuthProvider>();
    final collectionProvider = context.watch<CollectionProvider>();

    final stats = collectionProvider.getStatistics();

    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: themeProvider.isDarkMode
                ? [
                    const Color(0xFF1A1A1A),
                    const Color(0xFF2D2D2D),
                  ]
                : [
                    const Color(0xFF2D5F3F),
                    const Color(0xFFF5F5DC),
                  ],
            stops: const [0.0, 0.3],
          ),
        ),
        child: Container(
          decoration: BoxDecoration(
            image: DecorationImage(
              image: const AssetImage('assets/images/leaf_pattern.png'),
              repeat: ImageRepeat.repeat,
              opacity: themeProvider.isDarkMode ? 0.05 : 0.1,
              alignment: Alignment.topCenter,
            ),
          ),
          child: SafeArea(
            child: Column(
              children: [
                // Top Header
                _buildTopHeader(themeProvider, localeProvider),
                
                // Content
                Expanded(
                  child: RefreshIndicator(
                    onRefresh: () => collectionProvider.loadEvents(),
                    child: SingleChildScrollView(
                      controller: _scrollController,
                      physics: const AlwaysScrollableScrollPhysics(),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const SizedBox(height: 16),
                          
                          // Welcome Card
                          _buildWelcomeCard(
                            authProvider,
                            localeProvider,
                            themeProvider,
                            (stats['syncedCount'] as int? ?? 0) * 85,
                          ),

                          const SizedBox(height: 24),
                          
                          // Farmer Friend Card
                          _buildFriendCard(authProvider, localeProvider, context, themeProvider),

                          const SizedBox(height: 24),

                          // Content area with cream background
                          Container(
                            decoration: BoxDecoration(
                              color: themeProvider.isDarkMode
                                  ? const Color(0xFF1A1A1A)
                                  : const Color.fromARGB(255, 252, 252, 252),
                              borderRadius: const BorderRadius.only(
                                topLeft: Radius.circular(32),
                                topRight: Radius.circular(32),
                              ),
                            ),
                            child: Padding(
                              padding: const EdgeInsets.all(20.0),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Statistics Section
                                  _buildStatsSection(stats, localeProvider, themeProvider),

                                  const SizedBox(height: 32),

                                  // Recent Submissions
                                  _buildRecentSubmissions(stats, localeProvider, context, themeProvider),

                                  const SizedBox(height: 32),

                                  // Demo Videos
                                  _buildDemoVideos(localeProvider, themeProvider),

                                  const SizedBox(height: 100),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: _buildBottomNav(localeProvider, themeProvider),
    );
  }

  Widget _buildTopHeader(
      ThemeProvider themeProvider, LocaleProvider localeProvider) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12.0, vertical: 8.0),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(50),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  FittedBox(
                    fit: BoxFit.scaleDown,
                    alignment: Alignment.centerLeft,
                    child: Text(
                      localeProvider.isHindi ? 'हर्बलट्रेस' : 'HerbalTrace',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                  Text(
                    localeProvider.isHindi ? 'आयुष कृषक पोर्टल' : 'AYUSH Kisan Portal',
                    style: const TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w500,
                      color: Colors.white70,
                      letterSpacing: 0.2,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 6),

            // In-App Notification Bell
            SizedBox(
              width: 36,
              height: 36,
              child: IconButton(
                padding: EdgeInsets.zero,
                icon: Stack(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.notifications_active_outlined,
                        color: Color(0xFF2D5F3F),
                        size: 18,
                      ),
                    ),
                    Positioned(
                      top: 0,
                      right: 0,
                      child: Container(
                        padding: const EdgeInsets.all(3),
                        decoration: const BoxDecoration(
                          color: Colors.red,
                          shape: BoxShape.circle,
                        ),
                        child: const Text(
                          '3',
                          style: TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ],
                ),
                onPressed: () => _showNotificationsDialog(context, localeProvider),
              ),
            ),
            const SizedBox(width: 4),

            // Advisory & MSP Dropdown Action
            SizedBox(
              width: 36,
              height: 36,
              child: PopupMenuButton<String>(
                padding: EdgeInsets.zero,
                icon: Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.tips_and_updates_outlined,
                    color: Color(0xFF2D5F3F),
                    size: 18,
                  ),
                ),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                onSelected: (val) {
                  if (val == 'msp_finance') {
                    Navigator.pushNamed(context, AppRouter.farmerMspFinance);
                  } else if (val == 'advisory_modal') {
                    _showAgroAdvisoryDialog(context, localeProvider);
                  }
                },
                itemBuilder: (ctx) => [
                  PopupMenuItem(
                    value: 'advisory_modal',
                    child: Row(
                      children: [
                        const Icon(Icons.wb_sunny_outlined, size: 18, color: Colors.orange),
                        const SizedBox(width: 8),
                        Text(localeProvider.isHindi ? 'आयुष मौसमी सलाह (Advisory)' : 'AYUSH Agro Advisory'),
                      ],
                    ),
                  ),
                  PopupMenuItem(
                    value: 'msp_finance',
                    child: Row(
                      children: [
                        const Icon(Icons.account_balance_wallet_outlined, size: 18, color: AppTheme.primaryGreen),
                        const SizedBox(width: 8),
                        Text(localeProvider.isHindi ? 'समर्थन मूल्य व डीबीटी (MSP)' : 'MSP & DBT Payments'),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 4),

            // Compact Language Switcher
            Semantics(
              label: localeProvider.isHindi
                  ? localeProvider.translate('a11y_language_toggle_hi')
                  : localeProvider.translate('a11y_language_toggle_en'),
              button: true,
              child: InkWell(
                onTap: () => localeProvider.toggleLanguage(),
                borderRadius: BorderRadius.circular(20),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(
                        Icons.language,
                        color: Colors.black87,
                        size: 14,
                      ),
                      const SizedBox(width: 3),
                      Text(
                        localeProvider.isHindi ? "EN" : "हिन्दी",
                        style: const TextStyle(
                          color: Colors.black87,
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showNotificationsDialog(BuildContext context, LocaleProvider localeProvider) {
    final isHindi = localeProvider.isHindi;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: [
            const Icon(Icons.notifications_active, color: AppTheme.primaryGreen, size: 26),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                isHindi ? 'सूचनाएं व अलर्ट' : 'Alerts & Notifications',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
              ),
            ),
          ],
        ),
        content: SizedBox(
          width: double.maxFinite,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildNotificationItem(
                icon: Icons.verified_user,
                color: Colors.green,
                title: isHindi ? 'खाता ब्लॉकचेन पर स्वीकृत' : 'Admin Onboarding Approved',
                message: isHindi
                    ? 'आपका किसान खाता व्यवस्थापक द्वारा सत्यापित कर दिया गया है। फैब्रिक प्रमाणपत्र सक्रिय है।'
                    : 'Your Farmer ID is verified by Admin. Fabric Identity MSP enrolled.',
                time: 'Just now',
              ),
              const SizedBox(height: 10),
              _buildNotificationItem(
                icon: Icons.science,
                color: Colors.blue,
                title: isHindi ? 'लैब टेस्ट सफल (पास)' : 'Lab Quality Test Passed',
                message: isHindi
                    ? 'बैच #TULSI-8902 ने परीक्षण पास किया (98.6% शुद्धता, शून्य कीटनाशक)।'
                    : 'Batch #TULSI-8902 passed QC (98.6% Purity, Zero Pesticides).',
                time: '2h ago',
              ),
              const SizedBox(height: 10),
              _buildNotificationItem(
                icon: Icons.payments,
                color: Colors.amber.shade800,
                title: isHindi ? 'एमएसपी भुगतान हस्तांतरित' : 'MSP Payment Disbursed',
                message: isHindi
                    ? '₹14,500 की समर्थन मूल्य राशि डीबीटी के माध्यम से बैंक खाते में भेजी गई।'
                    : '₹14,500 MSP credited via DBT Direct Transfer.',
                time: 'Yesterday',
              ),
            ],
          ),
        ),
        actions: [
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryGreen,
              foregroundColor: Colors.white,
            ),
            onPressed: () => Navigator.pop(ctx),
            child: Text(isHindi ? 'समझ गया' : 'Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildNotificationItem({
    required IconData icon,
    required Color color,
    required String title,
    required String message,
    required String time,
  }) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.25)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Text(time, style: const TextStyle(fontSize: 10, color: Colors.grey)),
                  ],
                ),
                const SizedBox(height: 3),
                Text(message, style: TextStyle(fontSize: 11.5, color: Colors.grey.shade800)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWelcomeCard(
      AuthProvider authProvider, LocaleProvider localeProvider, ThemeProvider themeProvider, int points) {
    final isHindi = localeProvider.isHindi;
    final userName = authProvider.currentUser?.name ?? (isHindi ? 'कृषक' : 'Farmer');
    final isDark = themeProvider.isDarkMode;

    // Time-based greeting & weather look
    final hour = DateTime.now().hour;
    String greeting;
    IconData timeIcon;
    Color iconColor;
    List<Color> cardGradient;
    Border? cardBorder;

    if (hour >= 5 && hour < 12) {
      // Morning (Sunrise amber)
      greeting = isHindi ? 'सुप्रभात' : 'Good Morning';
      timeIcon = Icons.wb_sunny_rounded;
      iconColor = Colors.orange.shade700;
      cardGradient = isDark
          ? [const Color(0xFF2C281E), const Color(0xFF1E261F)]
          : [const Color(0xFFFFF9E6), Colors.white];
      cardBorder = Border.all(color: Colors.amber.withOpacity(0.3));
    } else if (hour >= 12 && hour < 17) {
      // Afternoon (Clear sky green)
      greeting = isHindi ? 'शुभ दोपहर' : 'Good Afternoon';
      timeIcon = Icons.wb_cloudy_rounded;
      iconColor = Colors.amber.shade800;
      cardGradient = isDark
          ? [const Color(0xFF1F2E23), const Color(0xFF1E2420)]
          : [const Color(0xFFE8F5E9), Colors.white];
      cardBorder = Border.all(color: Colors.green.withOpacity(0.25));
    } else if (hour >= 17 && hour < 21) {
      // Evening (Twilight sunset glow)
      greeting = isHindi ? 'शुभ संध्या' : 'Good Evening';
      timeIcon = Icons.wb_twilight_rounded;
      iconColor = Colors.deepOrange.shade400;
      cardGradient = isDark
          ? [const Color(0xFF2E221E), const Color(0xFF201E24)]
          : [const Color(0xFFFFF3E0), Colors.white];
      cardBorder = Border.all(color: Colors.deepOrange.withOpacity(0.25));
    } else {
      // Night / Late Hours (Calm indigo)
      greeting = isHindi ? 'नमस्ते' : 'Namaste';
      timeIcon = Icons.nights_stay_rounded;
      iconColor = Colors.indigo.shade300;
      cardGradient = isDark
          ? [const Color(0xFF1C2230), const Color(0xFF1A1F1C)]
          : [const Color(0xFFEDE7F6), Colors.white];
      cardBorder = Border.all(color: Colors.indigo.withOpacity(0.25));
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 14.0),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: cardGradient,
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(20),
          border: cardBorder,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(isDark ? 0.3 : 0.06),
              blurRadius: 12,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(timeIcon, color: iconColor, size: 22),
            const SizedBox(width: 8),
            Expanded(
              child: FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(
                  '$greeting, $userName',
                  style: TextStyle(
                    fontSize: 15.5,
                    fontWeight: FontWeight.bold,
                    color: isDark
                        ? Colors.white
                        : Colors.black87,
                  ),
                  maxLines: 1,
                ),
              ),
            ),
            const SizedBox(width: 8),
            // Compact Market Readiness Badge
            GestureDetector(
              onTap: () => _showReadinessScoreDialog(context, localeProvider, themeProvider, points),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
                decoration: BoxDecoration(
                  color: isDark
                      ? const Color(0xFF3D3D3D)
                      : const Color(0xFFE8F5E9),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: (isDark ? Colors.green : const Color(0xFF2D5F3F)).withOpacity(0.3),
                  ),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      Icons.stars_rounded,
                      size: 14,
                      color: isDark
                          ? Colors.green
                          : const Color(0xFF2D5F3F),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '$points PTS',
                      style: TextStyle(
                        color: isDark
                            ? Colors.green
                            : const Color(0xFF2D5F3F),
                        fontWeight: FontWeight.bold,
                        fontSize: 11.5,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showReadinessScoreDialog(BuildContext context, LocaleProvider localeProvider, ThemeProvider themeProvider, int points) {
    final isHindi = localeProvider.isHindi;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppTheme.primaryGreen.withOpacity(0.12),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.stars_rounded, color: AppTheme.primaryGreen, size: 26),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isHindi ? 'मार्केट रेडीनेस स्कोर (85/100)' : 'Market Readiness Score (85/100)',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    isHindi ? 'आयुष ग्रेड A+ • 1.5x रिवॉर्ड गुणक' : 'AYUSH Grade A+ • 1.5x Reward Multiplier',
                    style: const TextStyle(fontSize: 11, color: Colors.grey),
                  ),
                ],
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
                    ? 'आपका 85/100 स्कोर वास्तविक गुणवत्ता मानकों और ब्लॉकचेन सत्यापन पर आधारित है:'
                    : 'Your 85/100 score is dynamically calculated based on verified harvest parameters:',
                style: const TextStyle(fontSize: 13, height: 1.4),
              ),
              const SizedBox(height: 14),
              _buildScoreItem(
                title: isHindi ? 'उचित नमी (Moisture Quality)' : 'Optimal Moisture Quality',
                score: '26 / 30 pts',
                detail: isHindi ? 'मानक 8-12% नमी सीमा में संग्रह' : 'Compliant with 8-12% AYUSH moisture range',
                icon: Icons.water_drop_outlined,
              ),
              const SizedBox(height: 10),
              _buildScoreItem(
                title: isHindi ? 'जीपीएस सटीकता (GPS Precision)' : 'Geo-tag Precision',
                score: '25 / 25 pts',
                detail: isHindi ? 'सटीक उपग्रह स्थान (< 5 मीटर सटीकता)' : 'High satellite accuracy (< 5m radius)',
                icon: Icons.gps_fixed,
              ),
              const SizedBox(height: 10),
              _buildScoreItem(
                title: isHindi ? 'आयुष कटाई मानक (Harvest Method)' : 'AYUSH Harvest Standard',
                score: '19 / 20 pts',
                detail: isHindi ? 'पारंपरिक हाथ से चुनी गई गुणवत्ता' : 'Selective hand-picked collection',
                icon: Icons.agriculture_outlined,
              ),
              const SizedBox(height: 10),
              _buildScoreItem(
                title: isHindi ? 'भू-अंकन एवं मिट्टी (Agro Zone Integrity)' : 'Agro Zone & Soil Health',
                score: '15 / 15 pts',
                detail: isHindi ? 'अनुमोदित क्षेत्रीय क्षेत्र (यूपी/बिहार)' : 'Harvested within certified agro-climatic zone',
                icon: Icons.landscape_outlined,
              ),
            ],
          ),
        ),
        actions: [
          OutlinedButton(
            style: OutlinedButton.styleFrom(
              foregroundColor: AppTheme.primaryGreen,
              side: const BorderSide(color: AppTheme.primaryGreen),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () {
              Navigator.pop(ctx);
              _showRewardsRedemptionSheet(context, localeProvider, points);
            },
            child: Text(isHindi ? 'रिवॉर्ड रिडीम करें' : 'Redeem Points'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primaryGreen,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => Navigator.pop(ctx),
            child: Text(isHindi ? 'समझ गया' : 'Got it'),
          ),
        ],
      ),
    );
  }

  void _showRewardsRedemptionSheet(BuildContext context, LocaleProvider localeProvider, int points) {
    final isHindi = localeProvider.isHindi;
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.75,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (_, scrollController) => ListView(
          controller: scrollController,
          padding: const EdgeInsets.all(20),
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(color: Colors.grey.shade300, borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: const BoxDecoration(color: Color(0xFFFFF3E0), shape: BoxShape.circle),
                  child: const Icon(Icons.stars_rounded, color: Colors.orange, size: 28),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isHindi ? 'आयुष कृषक रिवॉर्ड्स एवं रिडेम्पशन' : 'AYUSH Farmer Rewards & Marketplace',
                        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        isHindi ? 'वर्तमान रिवॉर्ड बैलेंस: $points PTS' : 'Current Balance: $points PTS',
                        style: const TextStyle(fontSize: 13, color: AppTheme.primaryGreen, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // How to Earn section
            Text(
              isHindi ? '⭐ पॉइंट्स कैसे कमाएं:' : '⭐ How to Earn Reward Points:',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 8),
            _buildRewardInfoTile(
              icon: Icons.qr_code_scanner,
              title: isHindi ? 'सत्यापित फसल संग्रह (+85 PTS)' : 'Verified Harvest Submission (+85 PTS)',
              subtitle: isHindi ? 'जीपीएस और 8-12% नमी के साथ फसल सबमिट करें' : 'Submit geo-tagged harvest matching AYUSH moisture',
            ),
            _buildRewardInfoTile(
              icon: Icons.verified,
              title: isHindi ? 'आयुष ग्रेड A+ निर्यात गुणवत्ता (+150 PTS)' : 'AYUSH Grade A+ Export Quality (+150 PTS)',
              subtitle: isHindi ? 'प्रयोगशाला स्वीकृति पर अतिरिक्त बोनस' : 'Bonus on high HPLC active phytochemical assay',
            ),

            const SizedBox(height: 20),

            // How to Spend / Marketplace
            Text(
              isHindi ? '🎁 रिवॉर्ड्स कहाँ खर्च करें (रिडीम करें):' : '🎁 Redeem & Spend Your Rewards:',
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            ),
            const SizedBox(height: 10),

            _buildRedeemItem(
              title: isHindi ? 'जैविक जैव-उर्वरक एवं नीम केक पर 50% छूट' : '50% Subsidy on Certified Bio-Fertilizers',
              cost: '250 PTS',
              canRedeem: points >= 250,
              icon: Icons.eco,
              onRedeem: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(isHindi ? 'जैविक उर्वरक कूपन सक्रिय हो गया!' : 'Bio-fertilizer voucher activated!'),
                    backgroundColor: AppTheme.primaryGreen,
                  ),
                );
              },
            ),

            _buildRedeemItem(
              title: isHindi ? 'निःशुल्क आयुष मृदा परीक्षण प्रयोगशाला किट' : 'Free AYUSH Soil & NPK Testing Lab Kit',
              cost: '500 PTS',
              canRedeem: points >= 500,
              icon: Icons.biotech,
              onRedeem: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(isHindi ? 'मृदा परीक्षण किट बुक की गई!' : 'Soil testing kit booked!'),
                    backgroundColor: AppTheme.primaryGreen,
                  ),
                );
              },
            ),

            _buildRedeemItem(
              title: isHindi ? 'राष्ट्रीय पादप बोर्ड (NMPB) प्रमाणित बीज वाउचर' : 'NMPB Certified Pure Herb Seed Voucher',
              cost: '750 PTS',
              canRedeem: points >= 750,
              icon: Icons.grass,
              onRedeem: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(isHindi ? 'बीज वाउचर जारी कर दिया गया!' : 'Herb seed voucher issued!'),
                    backgroundColor: AppTheme.primaryGreen,
                  ),
                );
              },
            ),

            _buildRedeemItem(
              title: isHindi ? 'प्रत्यक्ष डीबीटी बैंक कैशबैक (₹500 सीधा बैंक में)' : 'Direct DBT Bank Cashback (₹500 to Bank)',
              cost: '1000 PTS',
              canRedeem: points >= 1000,
              icon: Icons.account_balance_wallet,
              onRedeem: () {
                Navigator.pop(ctx);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(isHindi ? 'कैशबैक डीबीटी हस्तांतरण शुरू किया गया!' : 'DBT cashback transfer initiated!'),
                    backgroundColor: AppTheme.primaryGreen,
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRewardInfoTile({required IconData icon, required String title, required String subtitle}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(color: const Color(0xFFF7FAF7), borderRadius: BorderRadius.circular(12)),
      child: Row(
        children: [
          Icon(icon, color: AppTheme.primaryGreen, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                Text(subtitle, style: const TextStyle(fontSize: 10.5, color: Colors.grey)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRedeemItem({
    required String title,
    required String cost,
    required bool canRedeem,
    required IconData icon,
    required VoidCallback onRedeem,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: canRedeem ? AppTheme.primaryGreen.withOpacity(0.4) : Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: canRedeem ? Colors.green.shade50 : Colors.grey.shade100,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: canRedeem ? AppTheme.primaryGreen : Colors.grey, size: 20),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                Text('Cost: $cost', style: TextStyle(fontSize: 11, color: canRedeem ? Colors.orange.shade800 : Colors.grey, fontWeight: FontWeight.w600)),
              ],
            ),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: canRedeem ? AppTheme.primaryGreen : Colors.grey.shade300,
              foregroundColor: canRedeem ? Colors.white : Colors.grey.shade700,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              minimumSize: const Size(60, 32),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: canRedeem ? onRedeem : null,
            child: Text(canRedeem ? 'Redeem' : 'Locked', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildScoreItem({
    required String title,
    required String score,
    required String detail,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: const Color(0xFFF7FAF7),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.green.shade100),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 20, color: AppTheme.primaryGreen),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(score, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.primaryGreen)),
                  ],
                ),
                const SizedBox(height: 2),
                Text(detail, style: TextStyle(fontSize: 11, color: Colors.grey.shade600)),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _showAgroAdvisoryDialog(BuildContext context, LocaleProvider localeProvider) {
    final isHindi = localeProvider.isHindi;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.orange.shade50,
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.wb_sunny_outlined, color: Colors.orange, size: 26),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    isHindi ? 'आयुष औषधीय फसल सलाह' : 'AYUSH Botanical Agro-Advisory',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                  Text(
                    isHindi ? 'समग्र कटाई, मौसम एवं भंडारण मार्गदर्शिका' : 'Comprehensive Harvest, Season & Storage Guide',
                    style: const TextStyle(fontSize: 11, color: Colors.grey),
                  ),
                ],
              ),
            ),
          ],
        ),
        content: SizedBox(
          width: double.maxFinite,
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildAdvisoryCard(
                  herb: 'Ashwagandha',
                  title: isHindi ? 'अश्वगंधा (जड़ परिपक्वता)' : 'Ashwagandha (Root Harvest)',
                  tip: isHindi
                      ? 'अक्टूबर-जनवरी के दौरान कटाई करें जब पत्तियां पीली होने लगें। जड़ को छायादार स्थान पर 8-10% नमी तक सुखाएं।'
                      : 'Harvest during dry post-monsoon months (Oct-Jan). Dry roots in shade to retain Withanolides at 8-10% moisture.',
                ),
                const SizedBox(height: 10),
                _buildAdvisoryCard(
                  herb: 'Tulsi',
                  title: isHindi ? 'तुलसी (प्रातःकालीन कटाई)' : 'Tulsi (Morning Harvest)',
                  tip: isHindi
                      ? 'सुबह 10 बजे से पहले शीर्ष कोमल पत्तियों को तोड़ें ताकि वाष्पशील तेल सुरक्षित रहे। सीधी धूप में न सुखाएं।'
                      : 'Harvest tender top leaves before 10 AM to prevent essential oil evaporation. Shade-dry on sterile mats.',
                ),
                const SizedBox(height: 10),
                _buildAdvisoryCard(
                  herb: 'Brahmi',
                  title: isHindi ? 'ब्राह्मी (यूपी/बिहार क्षेत्र)' : 'Brahmi (UP/Bihar Wetlands)',
                  tip: isHindi
                      ? 'उत्तर प्रदेश व बिहार के आर्द्र क्षेत्रों में जैविक संग्रह करें। अधिक धूप में न सुखाएं ताकि बाकोसाइड सक्रिय रहे।'
                      : 'Harvest mature stems strictly in UP/Bihar certified wetlands. Shade-dry immediately to retain Bacoside green potency.',
                ),
                const SizedBox(height: 10),
                _buildAdvisoryCard(
                  herb: 'Neem',
                  title: isHindi ? 'नीम (फल व पत्तियां)' : 'Neem (Leaves & Seeds)',
                  tip: isHindi
                      ? 'मई-जुलाई के दौरान पके नीम के बीजों का संग्रह करें। कीटनाशक मुक्त भंडारण के लिए नमी 10% से कम रखें।'
                      : 'Collect ripe seeds during May-July. Keep seed moisture below 10% to prevent aflatoxin contamination.',
                ),
                const SizedBox(height: 10),
                _buildAdvisoryCard(
                  herb: 'Turmeric',
                  title: isHindi ? 'हल्दी (राइजोम परिपक्वता)' : 'Turmeric (Curcumin Rhizomes)',
                  tip: isHindi
                      ? 'पौधे की पत्तियां सूखने के 7-9 महीने बाद कंद निकालें। पारंपरिक रूप से उबालकर 8-10 दिन छाया में सुखाएं।'
                      : 'Dig rhizomes 7-9 months after planting when leaves dry. Cure by mild boiling and dry to 10% moisture for high Curcumin.',
                ),
                const SizedBox(height: 10),
                _buildAdvisoryCard(
                  herb: 'Amla',
                  title: isHindi ? 'आंवला (परिपक्व फल)' : 'Amla (Vitamin-C Rich Fruits)',
                  tip: isHindi
                      ? 'नवंबर-जनवरी में जब फल हरे से हल्के पीले हो जाएं तब हाथ से तोड़ें। जमीन पर गिरे फलों का उपयोग न करें।'
                      : 'Hand-pick during Nov-Jan when fruits turn translucent yellow-green. Avoid ground-fallen fruits.',
                ),
                const SizedBox(height: 10),
                _buildAdvisoryCard(
                  herb: 'Shatavari',
                  title: isHindi ? 'शतावरी (जड़ कंद)' : 'Shatavari (Tuberous Roots)',
                  tip: isHindi
                      ? '20-24 महीने पुराने पौधों की जड़ें खोदें। बाहरी छिलका उतारकर तुरंत छाया में सुखाएं।'
                      : 'Harvest tuberous roots after 20-24 months. Peel outer cortex and shade-dry to preserve saponins.',
                ),
                const SizedBox(height: 10),
                _buildAdvisoryCard(
                  herb: 'Giloy',
                  title: isHindi ? 'गिलोय (परिपक्व तना)' : 'Giloy / Guduchi (Mature Stem)',
                  tip: isHindi
                      ? 'अंगूठे जितने मोटे तने काटें, विशेषकर नीम के पेड़ पर चढ़ी गिलोय (नीम-गिलोय) सर्वोच्च औषधीय मानी जाती है।'
                      : 'Harvest pencil-thick mature stems. Giloy climbing on Neem trees provides highest therapeutic bitterness.',
                ),
              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              Navigator.pushNamed(context, AppRouter.farmerMspFinance);
            },
            child: Text(isHindi ? 'एमएसपी भाव देखें' : 'View MSP Rates', style: const TextStyle(color: AppTheme.primaryGreen, fontWeight: FontWeight.bold)),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primaryGreen, foregroundColor: Colors.white),
            onPressed: () => Navigator.pop(ctx),
            child: Text(isHindi ? 'बंद करें' : 'Close'),
          ),
        ],
      ),
    );
  }

  Widget _buildAdvisoryCard({required String herb, required String title, required String tip}) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFF7FAF7),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.green.shade100),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppTheme.primaryGreen)),
          const SizedBox(height: 4),
          Text(tip, style: TextStyle(fontSize: 12, color: Colors.grey.shade700, height: 1.3)),
        ],
      ),
    );
  }


  Widget _buildFriendCard(
      AuthProvider authProvider, LocaleProvider localeProvider, BuildContext context, ThemeProvider themeProvider) {
    final isHindi = localeProvider.isHindi;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20.0),
      child: Semantics(
        label: isHindi ? "कृषि मित्र, बोलकर फसल दर्ज करें" : "Krishi Mitra, Voice Harvest Assistant",
        hint: localeProvider.translate('a11y_tap_to_open'),
        button: true,
        child: InkWell(
          onTap: () {
            Navigator.of(context).pushNamed(AppRouter.farmerfreind);
          },
          borderRadius: BorderRadius.circular(24),
          child: Container(
            padding: const EdgeInsets.all(20.0),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: themeProvider.isDarkMode
                    ? [const Color(0xFF1E3A24), const Color(0xFF2D2D2D)]
                    : [const Color(0xFFE8F5E9), Colors.white],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: const Color(0xFF2D5F3F).withOpacity(0.35),
                width: 1.5,
              ),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF2D5F3F).withOpacity(0.14),
                  blurRadius: 18,
                  offset: const Offset(0, 6),
                ),
              ],
            ),
            child: Row(
              children: [
                // Animated mic avatar
                Container(
                  width: 54,
                  height: 54,
                  decoration: const BoxDecoration(
                    color: Color(0xFF2D5F3F),
                    shape: BoxShape.circle,
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.mic_rounded,
                      color: Colors.white,
                      size: 30,
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isHindi ? "कृषि मित्र" : "Krishi Mitra",
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.bold,
                          color: themeProvider.isDarkMode
                              ? Colors.white
                              : const Color(0xFF2D5F3F),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        isHindi
                            ? "आसानी से बोलकर फसल रिकॉर्ड करें (ऑफ़लाइन सक्षम)"
                            : "Speak to record harvest with offline cache support",
                        style: TextStyle(
                          fontSize: 11.5,
                          color: themeProvider.isDarkMode ? Colors.white70 : Colors.grey.shade700,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(
                  Icons.arrow_forward_ios_rounded,
                  size: 18,
                  color: Color(0xFF2D5F3F),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }













  Widget _buildStatsSection(
      Map<String, dynamic> stats, LocaleProvider localeProvider, ThemeProvider themeProvider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          localeProvider.isHindi ? 'सांख्यिकी' : 'Statistics',
          style: TextStyle(
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: themeProvider.isDarkMode
                ? Colors.white
                : Colors.black87,
            letterSpacing: 0.3,
          ),
        ),
        const SizedBox(height: 20),
        // 2x2 Grid of stat cards
        Row(
          children: [
            Expanded(
              child: _buildStatCardNew(
                title: localeProvider.translate('synced'),
                value: stats['syncedCount'].toString(),
                mainIcon: Icons.cloud_done_rounded,
                trendIcon: Icons.trending_up,
                color: const Color(0xFF4CAF50),
                themeProvider: themeProvider,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildStatCardNew(
                title: localeProvider.translate('pending'),
                value: stats['pendingCount'].toString(),
                mainIcon: Icons.cloud_upload_rounded,
                trendIcon: Icons.trending_flat,
                color: const Color(0xFFFFA726),
                themeProvider: themeProvider,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        Row(
          children: [
            Expanded(
              child: _buildStatCardNew(
                title: localeProvider.isHindi ? 'कुल वजन' : 'Total Weight',
                value: '${stats['totalWeight'].toStringAsFixed(1)} kg',
                mainIcon: Icons.scale_rounded,
                trendIcon: Icons.trending_up,
                color: const Color(0xFF29B6F6),
                themeProvider: themeProvider,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: InkWell(
                onTap: () => _showRewardsRedemptionSheet(
                  context,
                  localeProvider,
                  (stats['syncedCount'] as int? ?? 0) * 85,
                ),
                borderRadius: BorderRadius.circular(20),
                child: _buildStatCardNew(
                  title: localeProvider.translate('rewards'),
                  value: ((stats['syncedCount'] as int? ?? 0) * 85).toString(),
                  mainIcon: Icons.star_rounded,
                  trendIcon: Icons.shopping_bag_outlined,
                  color: const Color(0xFFFFB74D),
                  themeProvider: themeProvider,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatCardNew({
    required String title,
    required String value,
    required IconData mainIcon,
    required IconData trendIcon,
    required Color color,
    required ThemeProvider themeProvider,
  }) {
    final localeProvider = context.watch<LocaleProvider>();
    
    return Semantics(
      label: '${localeProvider.translate('a11y_stat_card')}, $title, $value',
      readOnly: true,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: themeProvider.isDarkMode
              ? const Color(0xFF2D2D2D)
              : Colors.white,
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(themeProvider.isDarkMode ? 0.3 : 0.05),
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  mainIcon,
                  color: color,
                  size: 28,
                ),
              ),
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: themeProvider.isDarkMode
                      ? const Color(0xFF3D3D3D)
                      : Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  trendIcon,
                  color: Colors.grey.shade600,
                  size: 16,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ExcludeSemantics(
            child: Text(
              value,
              style: TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.bold,
                color: themeProvider.isDarkMode
                    ? Colors.white
                    : Colors.black87,
                letterSpacing: 0.5,
              ),
            ),
          ),
          const SizedBox(height: 4),
          ExcludeSemantics(
            child: Text(
              title,
              style: TextStyle(
                fontSize: 13,
                color: Colors.grey.shade600,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
      ),
    );
  }

  Widget _buildRecentSubmissions(
      Map<String, dynamic> stats, LocaleProvider localeProvider, BuildContext context, ThemeProvider themeProvider) {
    final recentSubmissions = stats['recentSubmissions'] as List;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              localeProvider.isHindi ? 'हाल के सबमिशन' : 'Recent Submissions',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: themeProvider.isDarkMode
                    ? Colors.white
                    : Colors.black87,
                letterSpacing: 0.3,
              ),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pushNamed(AppRouter.submissionHistory);
              },
              child: Text(
                localeProvider.isHindi ? 'सभी देखें' : 'View All',
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: themeProvider.isDarkMode
                      ? Colors.green
                      : const Color(0xFF2D5F3F),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (recentSubmissions.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(48.0),
            decoration: BoxDecoration(
              color: themeProvider.isDarkMode
                  ? const Color(0xFF2D2D2D)
                  : Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(themeProvider.isDarkMode ? 0.3 : 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: [
                Icon(
                  Icons.inbox_outlined,
                  size: 72,
                  color: Colors.grey.shade300,
                ),
                const SizedBox(height: 16),
                Text(
                  localeProvider.isHindi
                      ? 'कोई सबमिशन नहीं'
                      : 'No submissions yet',
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey.shade500,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          )
        else
          ...recentSubmissions.map((event) => Padding(
                padding: const EdgeInsets.only(bottom: 12.0),
                child: SubmissionCard(
                  event: event,
                  localeProvider: localeProvider,
                ),
              )),
      ],
    );
  }

  Widget _buildDemoVideos(LocaleProvider localeProvider, ThemeProvider themeProvider) {
    final isHindi = localeProvider.isHindi;
    final isDark = themeProvider.isDarkMode;

    final videos = [
      {
        'title': isHindi ? '१. हर्बलट्रेस ऐप का उपयोग कैसे करें' : '1. How to use HerbalTrace App',
        'subtitle': isHindi ? 'संग्रह और ब्लॉकचेन सत्यापन सीखें' : 'Learn harvest logging & verification',
        'url': 'https://www.youtube.com/watch?v=iBipXtofx4Y',
        'thumbnail': 'https://img.youtube.com/vi/iBipXtofx4Y/hqdefault.jpg',
        'duration': '3:45',
        'tag': isHindi ? 'शुरुआती गाइड' : 'Quick Guide',
      },
      {
        'title': isHindi ? '२. आयुष जीपीएस और लैब परीक्षण' : '2. AYUSH GPS & Lab QC Testing',
        'subtitle': isHindi ? 'गुणवत्ता मानक व डिजिटल गेट पास' : 'Quality standards & digital gate pass',
        'url': 'https://www.youtube.com/watch?v=r8f-jyPWJz0',
        'thumbnail': 'https://img.youtube.com/vi/r8f-jyPWJz0/hqdefault.jpg',
        'duration': '4:10',
        'tag': isHindi ? 'प्रशिक्षण' : 'Tutorial',
      },
    ];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              isHindi ? 'प्रशिक्षण व डेमो वीडियो' : 'Tutorials & Demo Videos',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : Colors.black87,
                letterSpacing: 0.3,
              ),
            ),
            Row(
              children: [
                Icon(Icons.swipe_left_alt_rounded, size: 16, color: isDark ? Colors.white60 : Colors.grey.shade600),
                const SizedBox(width: 4),
                Text(
                  isHindi ? 'स्वाइप करें' : 'Swipe',
                  style: TextStyle(fontSize: 11, color: isDark ? Colors.white60 : Colors.grey.shade600),
                ),
              ],
            ),
          ],
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 215,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: videos.length,
            itemBuilder: (ctx, index) {
              final video = videos[index];
              return Padding(
                padding: EdgeInsets.only(
                  right: index == videos.length - 1 ? 0 : 14.0,
                ),
                child: Semantics(
                  label: '${video['title']}, ${video['subtitle']}',
                  button: true,
                  child: InkWell(
                    onTap: () async {
                      try {
                        final Uri url = Uri.parse(video['url']!);
                        await launchUrl(url, mode: LaunchMode.externalApplication);
                      } catch (e) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(isHindi ? 'वीडियो खोलने में त्रुटि' : 'Error opening video'),
                            backgroundColor: Colors.red,
                          ),
                        );
                      }
                    },
                    borderRadius: BorderRadius.circular(20),
                    child: Container(
                      width: 270,
                      decoration: BoxDecoration(
                        color: isDark ? const Color(0xFF242424) : Colors.white,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isDark ? Colors.white10 : Colors.grey.shade200,
                          width: 1,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(isDark ? 0.3 : 0.08),
                            blurRadius: 14,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Thumbnail with play button and tag
                          ClipRRect(
                            borderRadius: const BorderRadius.only(
                              topLeft: Radius.circular(20),
                              topRight: Radius.circular(20),
                            ),
                            child: Stack(
                              children: [
                                Image.network(
                                  video['thumbnail']!,
                                  width: 270,
                                  height: 125,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return Container(
                                      width: 270,
                                      height: 125,
                                      color: Colors.grey.shade300,
                                      child: const Icon(Icons.play_circle_outline, size: 48, color: Colors.white),
                                    );
                                  },
                                ),
                                Positioned.fill(
                                  child: Container(
                                    decoration: BoxDecoration(
                                      gradient: LinearGradient(
                                        begin: Alignment.topCenter,
                                        end: Alignment.bottomCenter,
                                        colors: [
                                          Colors.transparent,
                                          Colors.black.withOpacity(0.55),
                                        ],
                                      ),
                                    ),
                                    child: Center(
                                      child: Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color: Colors.white.withOpacity(0.9),
                                          shape: BoxShape.circle,
                                          boxShadow: [
                                            BoxShadow(
                                              color: Colors.black.withOpacity(0.3),
                                              blurRadius: 8,
                                            ),
                                          ],
                                        ),
                                        child: const Icon(
                                          Icons.play_arrow_rounded,
                                          size: 26,
                                          color: AppTheme.primaryGreen,
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                                Positioned(
                                  top: 8,
                                  left: 8,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: AppTheme.primaryGreen.withOpacity(0.9),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      video['tag']!,
                                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ),
                                Positioned(
                                  bottom: 8,
                                  right: 8,
                                  child: Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                    decoration: BoxDecoration(
                                      color: Colors.black.withOpacity(0.75),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: Text(
                                      video['duration']!,
                                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                          // Video Info
                          Padding(
                            padding: const EdgeInsets.all(10.0),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  video['title']!,
                                  style: TextStyle(
                                    fontSize: 13.5,
                                    fontWeight: FontWeight.bold,
                                    color: isDark ? Colors.white : Colors.black87,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  video['subtitle']!,
                                  style: TextStyle(
                                    fontSize: 11,
                                    color: isDark ? Colors.white60 : Colors.grey.shade600,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildBottomNav(LocaleProvider localeProvider, ThemeProvider themeProvider) {
    final double width = MediaQuery.of(context).size.width;
    final isDark = themeProvider.isDarkMode;
    final navBgColor = isDark ? const Color(0xFF242424) : Colors.white;
    final shadowColor = isDark ? Colors.black.withOpacity(0.4) : Colors.black.withOpacity(0.08);
    final activeColor = isDark ? const Color(0xFF81C784) : const Color(0xFF2D5F3F);
    final inactiveColor = isDark ? const Color(0xFF9E9E9E) : const Color(0xFF757575);

    return SizedBox(
      height: 84,
      width: width,
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.bottomCenter,
        children: [
          // Background Bar with Upward Center Convex Curve
          CustomPaint(
            size: Size(width, 64),
            painter: CurvedConvexNavBarPainter(
              color: navBgColor,
              shadowColor: shadowColor,
            ),
            child: Container(
              constraints: const BoxConstraints(minHeight: 60, maxHeight: 72),
              width: width,
              child: SafeArea(
                top: false,
                bottom: true,
                child: Padding(
                  padding: const EdgeInsets.only(top: 4, bottom: 2),
                  child: Row(
                    children: [
                      // ITEM 1: Dashboard (Leftmost - Slot 1/5)
                      Expanded(
                        child: _buildNavItem(
                          icon: Icons.dashboard_rounded,
                          label: localeProvider.translate('dashboard'),
                          isSelected: _selectedIndex == 0,
                          onTap: () {
                            setState(() => _selectedIndex = 0);
                            _scrollController.animateTo(
                              0,
                              duration: const Duration(milliseconds: 350),
                              curve: Curves.easeOut,
                            );
                          },
                          activeColor: activeColor,
                          inactiveColor: inactiveColor,
                        ),
                      ),

                      // ITEM 2: Submissions (Slot 2/5)
                      Expanded(
                        child: _buildNavItem(
                          icon: Icons.inventory_2_outlined,
                          label: localeProvider.translate('submissions'),
                          isSelected: _selectedIndex == 1,
                          onTap: () {
                            setState(() => _selectedIndex = 1);
                            Navigator.pushNamed(context, AppRouter.submissionHistory);
                          },
                          activeColor: activeColor,
                          inactiveColor: inactiveColor,
                        ),
                      ),

                      // Slot 3/5: Center Empty Placeholder (Exact 20% slot for Elevated Center Button)
                      const Expanded(child: SizedBox()),

                      // ITEM 4: Krishi AI (Slot 4/5)
                      Expanded(
                        child: _buildNavItem(
                          icon: Icons.smart_toy_outlined,
                          label: localeProvider.isHindi ? 'कृषि मित्र' : 'Krishi AI',
                          isSelected: _selectedIndex == 3,
                          onTap: () {
                            setState(() => _selectedIndex = 3);
                            Navigator.pushNamed(context, AppRouter.farmerChatbot);
                          },
                          activeColor: activeColor,
                          inactiveColor: inactiveColor,
                        ),
                      ),

                      // ITEM 5: Account (Slot 5/5)
                      Expanded(
                        child: _buildNavItem(
                          icon: Icons.person_outline_rounded,
                          label: localeProvider.isHindi ? 'खाता' : 'Account',
                          isSelected: _selectedIndex == 4,
                          onTap: () {
                            setState(() => _selectedIndex = 4);
                            Navigator.pushNamed(context, AppRouter.farmerProfile);
                          },
                          activeColor: activeColor,
                          inactiveColor: inactiveColor,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // Elevated Center Floating + Button with App Green Theme
          Positioned(
            top: -18,
            child: Semantics(
              label: localeProvider.translate('a11y_fab_new_collection'),
              button: true,
              child: InkWell(
                onTap: () {
                  setState(() => _selectedIndex = 2);
                  Navigator.pushNamed(context, AppRouter.newCollection);
                },
                borderRadius: BorderRadius.circular(32),
                child: Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    gradient: LinearGradient(
                      colors: isDark
                          ? [const Color(0xFF1E5631), const Color(0xFF2D5F3F)]
                          : [const Color(0xFF2D5F3F), const Color(0xFF388E3C)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: (isDark ? const Color(0xFF1E5631) : const Color(0xFF2D5F3F)).withOpacity(0.45),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                      BoxShadow(
                        color: Colors.black.withOpacity(0.12),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.add_rounded,
                      size: 32,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
    required Color activeColor,
    required Color inactiveColor,
  }) {
    return Semantics(
      label: label,
      button: true,
      selected: isSelected,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4.0, vertical: 2.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 22,
                color: isSelected ? activeColor : inactiveColor,
              ),
              const SizedBox(height: 2),
              Text(
                label,
                textAlign: TextAlign.center,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 10.0,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  color: isSelected ? activeColor : inactiveColor,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Custom painter for upward curved convex bottom navigation bar
class CurvedConvexNavBarPainter extends CustomPainter {
  final Color color;
  final Color shadowColor;

  CurvedConvexNavBarPainter({
    required this.color,
    required this.shadowColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.fill;

    final path = Path();
    final double w = size.width;
    final double h = size.height;
    final double centerX = w / 2;
    const double curveWidth = 62.0;
    const double curveHeight = 18.0;

    path.moveTo(0, 0);
    path.lineTo(centerX - curveWidth, 0);

    // Smooth bezier curve rising up to cradle the center button
    path.cubicTo(
      centerX - curveWidth * 0.5, 0,
      centerX - curveWidth * 0.4, -curveHeight,
      centerX, -curveHeight,
    );
    path.cubicTo(
      centerX + curveWidth * 0.4, -curveHeight,
      centerX + curveWidth * 0.5, 0,
      centerX + curveWidth, 0,
    );

    path.lineTo(w, 0);
    path.lineTo(w, h);
    path.lineTo(0, h);
    path.close();

    // Draw smooth drop shadow
    canvas.drawShadow(path, shadowColor, 10.0, true);
    // Draw background shape
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CurvedConvexNavBarPainter oldDelegate) {
    return oldDelegate.color != color || oldDelegate.shadowColor != shadowColor;
  }
}

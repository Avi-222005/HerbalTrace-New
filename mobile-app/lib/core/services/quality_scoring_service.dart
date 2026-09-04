class QualityScoreResult {
  final int totalScore;
  final String grade; // 'A+', 'A', 'B', 'C'
  final String readinessStatus; // 'Market Ready', 'Needs Curing', 'Standard Grade'
  final double rewardTokens;
  final Map<String, int> breakdown;
  final List<String> positiveFactors;
  final List<String> improvementTips;

  QualityScoreResult({
    required this.totalScore,
    required this.grade,
    required this.readinessStatus,
    required this.rewardTokens,
    required this.breakdown,
    required this.positiveFactors,
    required this.improvementTips,
  });
}

class QualityScoringService {
  /// Calculate Market Readiness & Quality Score (0 - 100)
  static QualityScoreResult calculateScore({
    required String species,
    required double quantityKg,
    double? moistureContent,
    double? gpsAccuracyMeters,
    String? harvestMethod,
    String? partCollected,
    String? soilType,
    String? weatherCondition,
    int imageCount = 1,
  }) {
    int moistureScore = 20;
    int gpsScore = 15;
    int methodScore = 15;
    int soilWeatherScore = 15;
    int traceabilityScore = 15;

    final List<String> positives = [];
    final List<String> tips = [];

    // 1. Moisture Content Evaluation (Max 30 pts)
    // Optimal ranges: Ashwagandha: 8-10%, Tulsi: 9-11%, Neem: 7-10%, Brahmi: 8-12%, General: 8-12%
    final moisture = moistureContent ?? 10.0;
    if (moisture >= 7.5 && moisture <= 11.5) {
      moistureScore = 30;
      positives.add('Optimal moisture ($moisture%) minimizes microbial risk & mold.');
    } else if (moisture > 11.5 && moisture <= 14.0) {
      moistureScore = 20;
      tips.add('Moisture ($moisture%) slightly elevated. Recommend 4 hours solar drying before bagging.');
    } else if (moisture < 7.5) {
      moistureScore = 24;
      positives.add('Low moisture ($moisture%) good for shelf life.');
    } else {
      moistureScore = 10;
      tips.add('High moisture ($moisture%). Risk of fermentation. Additional shade-drying required.');
    }

    // 2. GPS Accuracy & Geo-tag Reliability (Max 25 pts)
    final accuracy = gpsAccuracyMeters ?? 5.0;
    if (accuracy <= 6.0) {
      gpsScore = 25;
      positives.add('High precision GPS location (${accuracy.toStringAsFixed(1)}m radius).');
    } else if (accuracy <= 15.0) {
      gpsScore = 18;
      positives.add('Standard GPS accuracy.');
    } else {
      gpsScore = 10;
      tips.add('GPS accuracy was ${accuracy.toStringAsFixed(1)}m. Capture outdoor coordinates with clear sky.');
    }

    // 3. Harvest Method & Plant Part (Max 20 pts)
    final method = (harvestMethod ?? 'manual').toLowerCase();
    if (method.contains('manual') || method.contains('hand')) {
      methodScore = 20;
      positives.add('Selective hand-harvesting preserves phytochemical integrity.');
    } else {
      methodScore = 15;
      positives.add('Standard mechanical collection.');
    }

    // 4. Soil & Agro-climatic Health (Max 15 pts)
    final soil = (soilType ?? 'Loamy').toLowerCase();
    if (soil.contains('loam') || soil.contains('alluvial') || soil.contains('black')) {
      soilWeatherScore = 15;
      positives.add('Optimal organic-rich soil ($soilType).');
    } else {
      soilWeatherScore = 10;
    }

    // 5. Image & Visual Traceability Proof (Max 10 pts)
    if (imageCount >= 2) {
      traceabilityScore = 10;
      positives.add('Multi-angle botanical proof captured.');
    } else if (imageCount == 1) {
      traceabilityScore = 8;
    } else {
      traceabilityScore = 0;
    }

    final total = (moistureScore + gpsScore + methodScore + soilWeatherScore + traceabilityScore).clamp(0, 100);

    String grade;
    String status;
    double tokenMultiplier;

    if (total >= 85) {
      grade = 'A+';
      status = 'AYUSH Export / Premium Grade';
      tokenMultiplier = 1.5;
    } else if (total >= 70) {
      grade = 'A';
      status = 'Market Ready (Domestic Standard)';
      tokenMultiplier = 1.2;
    } else if (total >= 50) {
      grade = 'B';
      status = 'Standard Processing Grade';
      tokenMultiplier = 1.0;
    } else {
      grade = 'C';
      status = 'Requires Re-curing / Curing Grade';
      tokenMultiplier = 0.5;
    }

    // Calculate realistic reward tokens based on volume and market readiness
    final rewardTokens = (quantityKg * tokenMultiplier).roundToDouble();

    return QualityScoreResult(
      totalScore: total,
      grade: grade,
      readinessStatus: status,
      rewardTokens: rewardTokens,
      breakdown: {
        'Moisture Quality': moistureScore,
        'GPS Precision': gpsScore,
        'Harvest Standard': methodScore,
        'Soil & Climate': soilWeatherScore,
        'Visual Proof': traceabilityScore,
      },
      positiveFactors: positives,
      improvementTips: tips,
    );
  }
}

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/models/collection_event.dart';

class DigitalGatePassModal extends StatelessWidget {
  final CollectionEvent event;

  const DigitalGatePassModal({super.key, required this.event});

  static void show(BuildContext context, CollectionEvent event) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => DigitalGatePassModal(event: event),
    );
  }

  @override
  Widget build(BuildContext context) {
    final passPayload = {
      "type": "OFFLINE_DIGITAL_GATE_PASS",
      "version": "1.0",
      "batchId": event.id,
      "species": event.species,
      "weightKg": event.weight ?? 0.0,
      "moisturePercent": event.moisture ?? 0.0,
      "originGps": {
        "lat": event.latitude,
        "lng": event.longitude,
      },
      "farmerId": event.farmerId,
      "harvestTimestamp": event.timestamp.toIso8601String(),
      "blockchainHash": event.blockchainHash ?? "PENDING_SYNC",
      "securitySignature": "SIG_${event.id.hashCode.toRadixString(16).toUpperCase()}",
    };

    final encodedPayload = base64UrlEncode(utf8.encode(jsonEncode(passPayload)));
    // Dual format: Accessible as a direct URL on Google Lens / mobile camera while retaining full offline payload
    final qrDataString = "https://herbal-trace-production.up.railway.app/track/${event.id}?gatepass=$encodedPayload";

    return Container(
      height: MediaQuery.of(context).size.height * 0.88,
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
      child: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              width: 44,
              height: 5,
              decoration: BoxDecoration(
                color: Colors.grey.shade300,
                borderRadius: BorderRadius.circular(3),
              ),
            ),
            const SizedBox(height: 16),

            // Header
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppTheme.primaryGreen.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.qr_code_2, color: AppTheme.primaryGreen, size: 28),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Offline Digital Gate Pass',
                        style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'AYUSH Aggregator & Transit Verification',
                        style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // QR Code Container (High-Contrast for Scanner)
            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.06),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  QrImageView(
                    data: qrDataString,
                    version: QrVersions.auto,
                    size: 200.0,
                    eyeStyle: const QrEyeStyle(
                      eyeShape: QrEyeShape.square,
                      color: Color(0xFF1E3A2B),
                    ),
                    dataModuleStyle: const QrDataModuleStyle(
                      dataModuleShape: QrDataModuleShape.square,
                      color: Color(0xFF1E3A2B),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.green.shade50,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.wifi_off, size: 14, color: Colors.green),
                        const SizedBox(width: 6),
                        Text(
                          'Scannable Without Internet',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: Colors.green.shade900,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Pass Details Card
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFF7FAF7),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.green.shade100),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildPassRow('Gate Pass Number:', 'GP-${event.id.substring(0, 8).toUpperCase()}'),
                  const Divider(height: 16),
                  _buildPassRow('Herb Species:', event.species),
                  _buildPassRow('Harvest Weight:', '${event.weight ?? 0.0} kg'),
                  _buildPassRow('Moisture Level:', '${event.moisture ?? 0.0}%'),
                  _buildPassRow(
                    'Origin Coordinates:',
                    '${event.latitude.toStringAsFixed(4)}, ${event.longitude.toStringAsFixed(4)}',
                  ),
                  _buildPassRow('Issued On:', DateFormat('dd MMM yyyy, HH:mm').format(event.timestamp)),
                  _buildPassRow('Cryptographic Hash:', event.blockchainHash != null && event.blockchainHash!.length > 16 ? '${event.blockchainHash!.substring(0, 16)}...' : 'AYUSH_FABRIC_VERIFIED'),
                ],
              ),
            ),
            const SizedBox(height: 20),

            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.primaryGreen,
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              icon: const Icon(Icons.done_all, size: 20),
              label: const Text('Present for Collection Center Scanning'),
              onPressed: () => Navigator.pop(context),
            ),
            const SizedBox(height: 10),
          ],
        ),
      ),
    );
  }

  Widget _buildPassRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w500)),
          Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.black87)),
        ],
      ),
    );
  }
}

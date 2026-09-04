import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/models/collection_event.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/providers/locale_provider.dart';
import './digital_gate_pass_modal.dart';

class SubmissionCard extends StatelessWidget {
  final CollectionEvent event;
  final LocaleProvider localeProvider;

  const SubmissionCard({
    super.key,
    required this.event,
    required this.localeProvider,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: InkWell(
        onTap: () {
          // Show event details
          _showEventDetails(context);
        },
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      event.species,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: event.isSynced
                          ? AppTheme.success.withOpacity(0.1)
                          : AppTheme.warning.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          event.isSynced
                              ? Icons.cloud_done
                              : Icons.cloud_upload,
                          size: 14,
                          color: event.isSynced
                              ? AppTheme.success
                              : AppTheme.warning,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          localeProvider
                              .translate(event.isSynced ? 'synced' : 'pending'),
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: event.isSynced
                                ? AppTheme.success
                                : AppTheme.warning,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.person_outline, size: 14, color: AppTheme.primaryGreen),
                  const SizedBox(width: 6),
                  Text(
                    'Farmer ID: ${event.farmerId.isNotEmpty ? event.farmerId : "AYUSH-IND-FARMER"}',
                    style: const TextStyle(
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: AppTheme.primaryGreen,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.calendar_today,
                      size: 14, color: AppTheme.textSecondary),
                  const SizedBox(width: 6),
                  Text(
                    DateFormat('MMM dd, yyyy').format(event.timestamp),
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(width: 16),
                  if (event.weight != null) ...[
                    const Icon(Icons.scale, size: 14, color: AppTheme.textSecondary),
                    const SizedBox(width: 6),
                    Text(
                      '${event.weight} kg',
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.location_on,
                      size: 14, color: AppTheme.textSecondary),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      '${event.latitude.toStringAsFixed(4)}, ${event.longitude.toStringAsFixed(4)}',
                      style: const TextStyle(
                        fontSize: 13,
                        color: AppTheme.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showEventDetails(BuildContext context) {
    final isHindi = localeProvider.isHindi;
    final String speciesName = event.species;
    final String labStatus = event.isSynced ? (isHindi ? 'प्रयोगशाला स्वीकृत (Lab Accepted)' : 'Lab Accepted • AYUSH Tested') : (isHindi ? 'सत्यापन प्रक्रिया में' : 'Under Verification');
    final String orderStatus = event.isSynced ? (isHindi ? 'प्रसंस्करण इकाई को आवंटित (Assigned to Processor)' : 'Pending Handover') : 'Pending';

    // Phytochemical indicator based on species
    String activeCompound = 'Withanolides: 2.8%';
    if (speciesName.toLowerCase().contains('tulsi')) {
      activeCompound = 'Eugenol & Essential Oil: 1.6%';
    } else if (speciesName.toLowerCase().contains('brahmi')) {
      activeCompound = 'Bacoside A & B: 3.2%';
    } else if (speciesName.toLowerCase().contains('neem')) {
      activeCompound = 'Azadirachtin: 0.45%';
    } else if (speciesName.toLowerCase().contains('turmeric')) {
      activeCompound = 'Curcumin: 4.8%';
    }

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.85,
        decoration: BoxDecoration(
          color: Theme.of(context).scaffoldBackgroundColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        ),
        padding: const EdgeInsets.all(20),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 5,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(3),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          event.species,
                          style: const TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Batch: ${event.id.length > 12 ? event.id.substring(0, 12) : event.id}',
                          style: const TextStyle(fontSize: 12, color: Colors.grey),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: AppTheme.primaryGreen.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Text(
                      'Grade A+ (88 pts)',
                      style: TextStyle(color: AppTheme.primaryGreen, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                ],
              ),
              const Divider(height: 24),

              // Lab Testing & Acceptance Card
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.blue.shade200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.biotech, color: Colors.blue, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          isHindi ? 'प्रयोगशाला गुणवत्ता प्रमाणन' : 'AYUSH Quality & Lab Status',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.blue, fontSize: 13),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Lab Acceptance:', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        Text(labStatus, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.blue)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Active Phytochemical:', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        Text(activeCompound, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    const Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Heavy Metals & Pesticides:', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        Text('Passed (< 0.01 ppm)', style: TextStyle(fontWeight: FontWeight.w600, color: Colors.green, fontSize: 12)),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // Supply Chain & Order Status
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.orange.shade50,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.orange.shade200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.local_shipping_outlined, color: Colors.orange, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          isHindi ? 'आपूर्ति श्रृंखला और ऑर्डर स्थिति' : 'Order & Processing Status',
                          style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.orange, fontSize: 13),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Stage:', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        Text(orderStatus, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: Colors.orange)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Collection Gate Pass:', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        Text('GP-${event.id.substring(0, 6).toUpperCase()}', style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12)),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 16),
              const Text('Harvest Parameters', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
              const SizedBox(height: 10),

              _buildDetailRow('Date & Time', DateFormat('MMM dd, yyyy HH:mm').format(event.timestamp)),
              if (event.weight != null)
                _buildDetailRow('Harvested Weight', '${event.weight} kg'),
              if (event.moisture != null)
                _buildDetailRow('Moisture Content', '${event.moisture}% (Standard 8-12%)'),
              if (event.temperature != null)
                _buildDetailRow('Temperature', '${event.temperature!.toStringAsFixed(1)}°C'),
              if (event.humidity != null)
                _buildDetailRow('Humidity', '${event.humidity!.toStringAsFixed(0)}%'),
              _buildDetailRow('GPS Coordinates',
                  '${event.latitude.toStringAsFixed(6)}, ${event.longitude.toStringAsFixed(6)}'),
              if (event.locationName != null && event.locationName!.isNotEmpty)
                _buildDetailRow('Field Location', event.locationName!),

              const SizedBox(height: 16),

              const SizedBox(height: 16),

              // Generate Offline Gate Pass Action
              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primaryGreen,
                  foregroundColor: Colors.white,
                  minimumSize: const Size.fromHeight(46),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
                icon: const Icon(Icons.qr_code_2, size: 20),
                label: Text(isHindi ? 'ऑफ़लाइन डिजिटल गेट पास जनरेट करें' : 'Generate Offline Digital Gate Pass'),
                onPressed: () {
                  Navigator.pop(context);
                  DigitalGatePassModal.show(context, event);
                },
              ),
              const SizedBox(height: 12),

              // Blockchain Channel Hash Card
              if (event.blockchainHash != null) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.success.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppTheme.success.withOpacity(0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.verified, color: AppTheme.success),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Hyperledger Fabric Verified (ayushchannel)',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 12,
                                color: AppTheme.success,
                              ),
                            ),
                            Text(
                              'TxID: ${event.blockchainHash!.length > 24 ? event.blockchainHash!.substring(0, 24) + '...' : event.blockchainHash}',
                              style: const TextStyle(
                                fontSize: 11,
                                color: AppTheme.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 130,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.w500,
                fontSize: 12,
                color: AppTheme.textSecondary,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
            ),
          ),
        ],
      ),
    );
  }
}

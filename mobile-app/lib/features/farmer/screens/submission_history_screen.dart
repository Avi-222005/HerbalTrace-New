import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../core/providers/locale_provider.dart';
import '../providers/collection_provider.dart';
import '../widgets/submission_card.dart';

class SubmissionHistoryScreen extends StatelessWidget {
  const SubmissionHistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final localeProvider = context.watch<LocaleProvider>();
    final collectionProvider = context.watch<CollectionProvider>();

    final allEvents = collectionProvider.events;
    final syncedEvents = collectionProvider.syncedEvents;
    final unsyncedEvents = collectionProvider.unsyncedEvents;
    final isLoading = collectionProvider.isLoading;

    return DefaultTabController(
      length: 3,
      child: Scaffold(
        appBar: AppBar(
          title: Text(localeProvider.translate('submissions')),
          actions: [
            if (unsyncedEvents.isNotEmpty)
              TextButton.icon(
                onPressed: collectionProvider.isSyncing
                    ? null
                    : () async {
                        final count = await collectionProvider.syncPendingCollections();
                        if (context.mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              backgroundColor: count > 0 ? Colors.green : Colors.orange,
                              content: Text(
                                localeProvider.isHindi
                                    ? '$count लंबित रिकॉर्ड सफलतापूर्वक सिंक किए गए!'
                                    : '$count pending records synced successfully!',
                              ),
                            ),
                          );
                        }
                      },
                icon: collectionProvider.isSyncing
                    ? const SizedBox(
                        width: 14,
                        height: 14,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Icon(Icons.sync, color: Colors.white, size: 18),
                label: Text(
                  localeProvider.isHindi ? 'सिंक करें' : 'Sync All',
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
          ],
          bottom: TabBar(
            labelColor: Theme.of(context).primaryColor,
            tabs: [
              Tab(
                  text: localeProvider.isHindi
                      ? 'सभी'
                      : 'All (${allEvents.length})'),
              Tab(
                  text: localeProvider.isHindi
                      ? 'सिंक किया गया'
                      : 'Synced (${syncedEvents.length})'),
              Tab(
                  text: localeProvider.isHindi
                      ? 'लंबित'
                      : 'Pending (${unsyncedEvents.length})'),
            ],
          ),
        ),
        body: isLoading
            ? Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const CircularProgressIndicator(),
                    const SizedBox(height: 16),
                    Text(
                      localeProvider.isHindi
                          ? 'डेटाबेस से संग्रह लोड हो रहा है...'
                          : 'Loading collections from database...',
                      style: TextStyle(
                        fontSize: 14,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              )
            : TabBarView(
                children: [
                  _buildEventList(context, allEvents, localeProvider),
                  _buildEventList(context, syncedEvents, localeProvider),
                  _buildEventList(context, unsyncedEvents, localeProvider),
                ],
              ),
      ),
    );
  }

  Widget _buildEventList(BuildContext context, List events, LocaleProvider localeProvider) {
    if (events.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.inbox_outlined,
              size: 80,
              color: Colors.grey.shade400,
            ),
            const SizedBox(height: 16),
            Text(
              localeProvider.isHindi ? 'कोई सबमिशन नहीं' : 'No submissions',
              style: TextStyle(
                fontSize: 18,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: () async {
        // Refresh collections from backend
        final collectionProvider = Provider.of<CollectionProvider>(
          context,
          listen: false,
        );
        await collectionProvider.loadEvents();
      },
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: events.length,
        itemBuilder: (context, index) {
          return SubmissionCard(
            event: events[index],
            localeProvider: localeProvider,
          );
        },
      ),
    );
  }
}

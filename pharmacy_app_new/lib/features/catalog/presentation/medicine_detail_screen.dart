import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class MedicineDetailScreen extends ConsumerWidget {
  final String slug;
  
  const MedicineDetailScreen({
    Key? key,
    required this.slug,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Medicine Details'),
        actions: [
          IconButton(
            icon: const Icon(Icons.favorite_border),
            onPressed: () {
              // TODO: Add to wishlist
            },
          ),
        ],
      ),
      body: Center(
        child: Text('Medicine Detail Screen for: $slug'),
      ),
    );
  }
}
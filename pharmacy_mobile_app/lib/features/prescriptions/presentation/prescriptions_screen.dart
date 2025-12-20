import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class PrescriptionsScreen extends ConsumerWidget {
  const PrescriptionsScreen({Key? key}) : super(key: key);
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Prescriptions'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // TODO: Navigate to upload prescription
            },
          ),
        ],
      ),
      body: const Center(
        child: Text('Prescriptions Screen - Coming Soon'),
      ),
    );
  }
}
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class ManageMedicinesScreen extends ConsumerWidget {
  const ManageMedicinesScreen({Key? key}) : super(key: key);
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Manage Medicines'),
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              // TODO: Navigate to add medicine
            },
          ),
        ],
      ),
      body: const Center(
        child: Text('Manage Medicines Screen - Coming Soon'),
      ),
    );
  }
}
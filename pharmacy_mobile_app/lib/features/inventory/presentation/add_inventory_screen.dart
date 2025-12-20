import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AddInventoryScreen extends ConsumerWidget {
  const AddInventoryScreen({Key? key}) : super(key: key);
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Inventory'),
      ),
      body: const Center(
        child: Text('Add Inventory Screen - Coming Soon'),
      ),
    );
  }
}
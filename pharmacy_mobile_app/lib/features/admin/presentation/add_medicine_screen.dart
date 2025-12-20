import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AddMedicineScreen extends ConsumerWidget {
  const AddMedicineScreen({Key? key}) : super(key: key);
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Add Medicine'),
      ),
      body: const Center(
        child: Text('Add Medicine Screen - Coming Soon'),
      ),
    );
  }
}
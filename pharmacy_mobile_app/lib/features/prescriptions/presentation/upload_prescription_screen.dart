import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class UploadPrescriptionScreen extends ConsumerWidget {
  const UploadPrescriptionScreen({Key? key}) : super(key: key);
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Upload Prescription'),
      ),
      body: const Center(
        child: Text('Upload Prescription Screen - Coming Soon'),
      ),
    );
  }
}
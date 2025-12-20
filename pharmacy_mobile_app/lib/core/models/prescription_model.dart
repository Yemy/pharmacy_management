import 'package:json_annotation/json_annotation.dart';
import 'user_model.dart';

part 'prescription_model.g.dart';

@JsonSerializable()
class Prescription {
  final int id;
  final User? user;
  final int userId;
  final int? orderId;
  final String filePath;
  final bool verified;
  final DateTime uploadedAt;
  
  const Prescription({
    required this.id,
    this.user,
    required this.userId,
    this.orderId,
    required this.filePath,
    required this.verified,
    required this.uploadedAt,
  });
  
  factory Prescription.fromJson(Map<String, dynamic> json) => _$PrescriptionFromJson(json);
  Map<String, dynamic> toJson() => _$PrescriptionToJson(this);
  
  // Get full file URL
  String get fileUrl {
    // Assuming the API returns relative paths
    if (filePath.startsWith('http')) {
      return filePath;
    }
    return 'https://your-api-domain.com$filePath';
  }
  
  // Get file name from path
  String get fileName {
    return filePath.split('/').last;
  }
  
  // Get file extension
  String get fileExtension {
    final parts = fileName.split('.');
    return parts.length > 1 ? parts.last.toLowerCase() : '';
  }
  
  // Check if file is an image
  bool get isImage {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    return imageExtensions.contains(fileExtension);
  }
  
  // Check if file is a PDF
  bool get isPdf => fileExtension == 'pdf';
  
  // Get verification status color
  String get verificationStatusColor {
    return verified ? '#4CAF50' : '#FF9800'; // Green if verified, Orange if not
  }
  
  // Get verification status text
  String get verificationStatusText {
    return verified ? 'Verified' : 'Pending Verification';
  }
  
  // Get formatted upload date
  String get formattedUploadDate {
    final now = DateTime.now();
    final difference = now.difference(uploadedAt);
    
    if (difference.inDays > 0) {
      return '${difference.inDays} day${difference.inDays == 1 ? '' : 's'} ago';
    } else if (difference.inHours > 0) {
      return '${difference.inHours} hour${difference.inHours == 1 ? '' : 's'} ago';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes} minute${difference.inMinutes == 1 ? '' : 's'} ago';
    } else {
      return 'Just now';
    }
  }
  
  Prescription copyWith({
    int? id,
    User? user,
    int? userId,
    int? orderId,
    String? filePath,
    bool? verified,
    DateTime? uploadedAt,
  }) {
    return Prescription(
      id: id ?? this.id,
      user: user ?? this.user,
      userId: userId ?? this.userId,
      orderId: orderId ?? this.orderId,
      filePath: filePath ?? this.filePath,
      verified: verified ?? this.verified,
      uploadedAt: uploadedAt ?? this.uploadedAt,
    );
  }
  
  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Prescription && other.id == id;
  }
  
  @override
  int get hashCode => id.hashCode;
}
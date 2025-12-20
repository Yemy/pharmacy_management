// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'prescription_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Prescription _$PrescriptionFromJson(Map<String, dynamic> json) => Prescription(
      id: (json['id'] as num).toInt(),
      user: json['user'] == null
          ? null
          : User.fromJson(json['user'] as Map<String, dynamic>),
      userId: (json['userId'] as num).toInt(),
      orderId: (json['orderId'] as num?)?.toInt(),
      filePath: json['filePath'] as String,
      verified: json['verified'] as bool,
      uploadedAt: DateTime.parse(json['uploadedAt'] as String),
    );

Map<String, dynamic> _$PrescriptionToJson(Prescription instance) =>
    <String, dynamic>{
      'id': instance.id,
      'user': instance.user,
      'userId': instance.userId,
      'orderId': instance.orderId,
      'filePath': instance.filePath,
      'verified': instance.verified,
      'uploadedAt': instance.uploadedAt.toIso8601String(),
    };

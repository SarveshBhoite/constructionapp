import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Clock, CheckCircle2, ChevronLeft } from 'lucide-react-native';

export default function PendingApproval() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="p-6">
        <TouchableOpacity onPress={() => router.replace('/')} className="mb-4">
          <ChevronLeft color="#64748B" size={28} />
        </TouchableOpacity>

        <View className="items-center mt-20">
          <View className="bg-yellow-100 p-6 rounded-full mb-8">
            <Clock color="#D97706" size={64} strokeWidth={1.5} />
          </View>
          
          <Text className="text-3xl font-bold text-slate-800 text-center mb-4">
            Under Review
          </Text>
          
          <Text className="text-lg text-slate-500 text-center px-4 mb-12">
            Your documents have been submitted successfully. We are currently verifying your business. This usually takes 24-48 hours.
          </Text>

          <View className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-12">
            <View className="flex-row items-center mb-4">
              <CheckCircle2 color="#10B981" size={20} />
              <Text className="ml-3 text-slate-700 font-medium text-lg">Details Submitted</Text>
            </View>
            <View className="flex-row items-center mb-4">
              <CheckCircle2 color="#10B981" size={20} />
              <Text className="ml-3 text-slate-700 font-medium text-lg">Documents Uploaded</Text>
            </View>
            <View className="flex-row items-center opacity-40">
              <View className="w-5 h-5 rounded-full border-2 border-slate-300" />
              <Text className="ml-3 text-slate-700 font-medium text-lg">Admin Verification</Text>
            </View>
          </View>

          <TouchableOpacity 
            onPress={() => router.replace('/')}
            className="bg-slate-800 w-full p-5 rounded-3xl items-center shadow-lg"
          >
            <Text className="text-white text-xl font-bold">Back to Welcome</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

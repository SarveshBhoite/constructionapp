import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { User, LogOut, CreditCard, ChevronRight, CheckCircle2, History, MessageCircle } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/authStore';

export default function LabourHome() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscription = () => {
    // Integrate Razorpay here
    Alert.alert(
      'Subscription',
      'Pay ₹200 to be visible to contractors for 1 month.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Pay Now', 
          onPress: () => {
            setIsSubscribed(true);
            Alert.alert('यशस्वी!', 'तुमची सदस्यता आता सक्रिय आहे. (Your subscription is now active!)');
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="p-6">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-slate-500 text-lg">नमस्कार (Hello),</Text>
            <Text className="text-2xl font-bold text-slate-800">राहुल चव्हाण</Text>
          </View>
          <TouchableOpacity 
            onPress={() => {
              logout();
              router.replace('/');
            }}
            className="bg-slate-200 p-3 rounded-full"
          >
            <LogOut color="#64748B" size={20} />
          </TouchableOpacity>
        </View>

        {/* Subscription Card */}
        <View className={`p-6 rounded-3xl mb-8 ${isSubscribed ? 'bg-green-600' : 'bg-slate-800'} shadow-xl`}>
          <View className="flex-row justify-between items-start mb-4">
            <View className="bg-white/20 p-3 rounded-2xl">
              <CreditCard color="white" size={28} />
            </View>
            <View className="bg-white/20 px-3 py-1 rounded-full">
              <Text className="text-white font-bold">{isSubscribed ? 'Active' : 'Expired'}</Text>
            </View>
          </View>
          
          <Text className="text-white text-xl font-bold mb-1">
            {isSubscribed ? 'तुमची खाती सक्रिय आहे' : 'तुमची खाती बंद आहे'}
          </Text>
          <Text className="text-white/70 mb-6">
            {isSubscribed ? 'Contractors can now see your number.' : 'Pay to let contractors see your number.'}
          </Text>

          {!isSubscribed && (
            <TouchableOpacity 
              onPress={handleSubscription}
              className="bg-orange-500 p-4 rounded-2xl items-center"
            >
              <Text className="text-white font-bold text-lg">₹200 भरा (Pay ₹200)</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Actions */}
        <Text className="text-xl font-bold text-slate-800 mb-4">Quick Actions</Text>
        <View className="space-y-4">
          <TouchableOpacity className="flex-row items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-4">
            <View className="bg-blue-100 p-3 rounded-xl mr-4">
              <User color="#2563EB" size={24} />
            </View>
            <Text className="flex-1 text-lg font-medium text-slate-700">प्रोफाइल पहा (View Profile)</Text>
            <ChevronRight color="#94A3B8" size={20} />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-4">
            <View className="bg-purple-100 p-3 rounded-xl mr-4">
              <History color="#9333EA" size={24} />
            </View>
            <Text className="flex-1 text-lg font-medium text-slate-700">पेमेंट हिस्ट्री (Payment History)</Text>
            <ChevronRight color="#94A3B8" size={20} />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center bg-white p-5 rounded-2xl shadow-sm border border-slate-100 mb-4">
            <View className="bg-green-100 p-3 rounded-xl mr-4">
              <MessageCircle color="#059669" size={24} />
            </View>
            <Text className="flex-1 text-lg font-medium text-slate-700">मदत (Support)</Text>
            <ChevronRight color="#94A3B8" size={20} />
          </TouchableOpacity>
        </View>

        <View className="mt-12 items-center">
            <CheckCircle2 color="#10B981" size={32} />
            <Text className="text-slate-400 mt-2 text-center">Your profile is 100% complete.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

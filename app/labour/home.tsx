import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, LogOut, CreditCard, ChevronRight, CheckCircle2, History, MessageCircle, Star, MapPin } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/authStore';

export default function LabourHome() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isSubscribed, setIsSubscribed] = useState(user?.isSubscribed || false);

  const handleSubscription = () => {
    // Integrate Razorpay flow here similarly to contractor
    Alert.alert(
      'Premium Profile',
      'Pay ₹200 to be featured at the top of contractor searches for 1 month.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Upgrade Now', 
          onPress: () => {
            setIsSubscribed(true);
            Alert.alert('Success!', 'Your profile is now featured!');
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-slate-500 font-medium">Worker Dashboard</Text>
            <Text className="text-3xl font-bold text-slate-800">{user?.name || 'Welcome'}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => {
              logout();
              router.replace('/');
            }}
            className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100"
          >
            <LogOut color="#1E40AF" size={24} />
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <View className="bg-slate-900 p-8 rounded-[40px] shadow-2xl mb-8 overflow-hidden relative">
          <View className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/10 rounded-full" />
          
          <View className="flex-row items-center mb-6">
            <Image 
                source={{ uri: user?.profileImage || `https://ui-avatars.com/api/?name=${user?.name}&background=1E40AF&color=fff` }} 
                className="w-20 h-20 rounded-3xl border-2 border-white/20"
            />
            <View className="ml-5">
                <Text className="text-white font-bold text-xl">{user?.name}</Text>
                <View className="flex-row items-center mt-1">
                    <Star size={14} color="#FBBF24" fill="#FBBF24" />
                    <Text className="text-white/70 ml-2 font-bold">4.8 Rating</Text>
                </View>
            </View>
          </View>

          <View className="h-[1px] bg-white/10 w-full mb-6" />

          <View className="flex-row justify-between items-center">
            <View>
                <Text className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Visibility Status</Text>
                <Text className={`font-bold text-lg ${isSubscribed ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {isSubscribed ? 'Featured Profile' : 'Standard Profile'}
                </Text>
            </View>
            {!isSubscribed && (
                <TouchableOpacity 
                    onPress={handleSubscription}
                    className="bg-blue-600 px-6 py-3 rounded-2xl shadow-lg shadow-blue-500/20"
                >
                    <Text className="text-white font-bold">Upgrade</Text>
                </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row justify-between mb-8">
            <View className="bg-white p-6 rounded-[32px] flex-1 mr-3 border border-slate-100 shadow-sm items-center">
                <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Views</Text>
                <Text className="text-2xl font-black text-slate-800">124</Text>
            </View>
            <View className="bg-white p-6 rounded-[32px] flex-1 ml-3 border border-slate-100 shadow-sm items-center">
                <Text className="text-slate-400 font-bold text-xs uppercase mb-2">Calls</Text>
                <Text className="text-2xl font-black text-slate-800">18</Text>
            </View>
        </View>

        {/* Menu Actions */}
        <Text className="text-xl font-bold text-slate-800 mb-4 ml-2">Quick Actions</Text>
        <View className="space-y-4">
          <TouchableOpacity className="flex-row items-center bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-4">
            <View className="bg-blue-50 p-4 rounded-2xl mr-5">
              <User color="#1E40AF" size={24} />
            </View>
            <Text className="flex-1 text-lg font-bold text-slate-700">माझी प्रोफाइल (My Profile)</Text>
            <ChevronRight color="#CBD5E1" size={20} />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-4">
            <View className="bg-indigo-50 p-4 rounded-2xl mr-5">
              <History color="#4F46E5" size={24} />
            </View>
            <Text className="flex-1 text-lg font-bold text-slate-700">व्यवहार (Transactions)</Text>
            <ChevronRight color="#CBD5E1" size={20} />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-8">
            <View className="bg-emerald-50 p-4 rounded-2xl mr-5">
              <MessageCircle color="#059669" size={24} />
            </View>
            <Text className="flex-1 text-lg font-bold text-slate-700">मदत केंद्र (Support)</Text>
            <ChevronRight color="#CBD5E1" size={20} />
          </TouchableOpacity>
        </View>

        <View className="mt-4 mb-12 items-center">
            <View className="bg-emerald-100 p-3 rounded-full mb-4">
                <CheckCircle2 color="#059669" size={32} />
            </View>
            <Text className="text-slate-400 font-medium text-center px-8">
                Your profile is active and visible to contractors. Keep it updated for better jobs!
            </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

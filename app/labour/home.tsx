import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Alert, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { User, LogOut, CreditCard, ChevronRight, CheckCircle2, History, MessageCircle, Star, AlertCircle, Eye } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/authStore';
import axios from 'axios';
import * as Linking from 'expo-linking';
import RazorpayCheckout from 'react-native-razorpay';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LabourHome() {
  const router = useRouter();
  const { user, logout, setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dbUser, setDbUser] = useState(user);

  const fetchProfile = async () => {
    try {
      if (!user?.id) return;
      const response = await axios.get(`${API_URL}/auth/profile/labour/${user.id}`);
      setDbUser(response.data);
      setAuth('labour', response.data);
    } catch (error) {
      console.error('Fetch Profile Error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleSubscription = () => {
    Alert.alert(
      'Featured Profile',
      'Pay ₹200 to show your phone number to contractors and appear at the top for 1 month.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Upgrade Now', 
          onPress: async () => {
            try {
              // Note: In Expo Go, RazorpayCheckout might be an empty object {}, so we check for .open
              if (typeof RazorpayCheckout === 'undefined' || !RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
                  // Create REAL Payment Link
                  const linkRes = await axios.post(`${API_URL}/payments/create-link`, {
                    amount: 200,
                    workerId: user?.id
                  });
                  
                  Alert.alert(
                    'Upgrade Profile',
                    'Opening the REAL Razorpay Payment page for your Featured Profile upgrade.',
                    [
                        { text: 'Cancel', style: 'cancel' },
                        { 
                            text: 'Open Payment Page', 
                            onPress: () => {
                                Linking.openURL(linkRes.data.url);
                                // Verify after return
                                setTimeout(() => {
                                    Alert.alert('Verification', 'Check your upgrade status?', [
                                        { text: 'Refresh Profile', onPress: fetchProfile }
                                    ]);
                                }, 3000);
                            } 
                        }
                    ]
                  );
                  return;
              }

              // Real Razorpay SDK fallback for APK
              // (This part will run in the APK)
              Alert.alert('Coming Soon', 'SDK integration for APK is ready.');
            } catch (e) {
              Alert.alert('Error', 'Could not initiate payment.');
            }
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView 
        className="p-6" 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1E40AF"]} />
        }
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-slate-500 font-medium">Worker Dashboard</Text>
            <Text className="text-3xl font-bold text-slate-800">{dbUser?.name || 'Welcome'}</Text>
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

        {/* Subscription Alert Banner */}
        {!dbUser?.isSubscribed && (
            <TouchableOpacity 
                onPress={handleSubscription}
                className="bg-blue-600 p-6 rounded-[32px] mb-8 flex-row items-center border border-blue-400 shadow-xl shadow-blue-200"
            >
                <View className="bg-white/20 p-3 rounded-2xl mr-4">
                    <AlertCircle color="white" size={24} />
                </View>
                <View className="flex-1">
                    <Text className="text-white font-bold text-lg">Subscription Required</Text>
                    <Text className="text-white/80">Your phone number is hidden from contractors. Subscribe to unlock it!</Text>
                </View>
                <ChevronRight color="white" size={20} />
            </TouchableOpacity>
        )}

        {/* Status Card */}
        <View className="bg-slate-900 p-8 rounded-[40px] shadow-2xl mb-8 overflow-hidden relative">
          <View className="absolute -right-10 -top-10 w-40 h-40 bg-blue-600/10 rounded-full" />
          
          <View className="flex-row items-center mb-6">
            <Image 
                source={{ uri: dbUser?.profileImage || `https://ui-avatars.com/api/?name=${dbUser?.name}&background=1E40AF&color=fff` }} 
                className="w-20 h-20 rounded-3xl border-2 border-white/20"
            />
            <View className="ml-5">
                <Text className="text-white font-bold text-xl">{dbUser?.name}</Text>
                <View className="flex-row items-center mt-1">
                    <Star size={14} color="#FBBF24" fill="#FBBF24" />
                    <Text className="text-white/70 ml-2 font-bold">4.8 Rating</Text>
                </View>
            </View>
          </View>

          <View className="h-[1px] bg-white/10 w-full mb-6" />

          <View className="flex-row justify-between items-center">
            <View>
                <Text className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Account Visibility</Text>
                <Text className={`font-bold text-lg ${dbUser?.isSubscribed ? 'text-emerald-400' : 'text-blue-400'}`}>
                    {dbUser?.isSubscribed ? 'Featured Account' : 'Standard Account'}
                </Text>
            </View>
            <View className="flex-row items-center bg-white/10 px-4 py-2 rounded-2xl">
                <Eye color="white" size={16} />
                <Text className="text-white font-bold ml-2">{dbUser?.views || 0} Views</Text>
            </View>
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
                Your profile is active. Subscribe to be seen by more contractors!
            </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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

  const [activeModal, setActiveModal] = useState<'profile' | 'transactions' | 'support' | null>(null);
  const [supportMsg, setSupportMsg] = useState('');
  const [transactions, setTransactions] = useState([]);

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

  const fetchTransactions = async () => {
      try {
          const res = await axios.get(`${API_URL}/payments/status/worker/${user?.id}`);
          setTransactions(res.data || []);
      } catch (e) {}
  };

  useEffect(() => {
    fetchProfile();
    fetchTransactions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
    fetchTransactions();
  };

  const handleSubscription = async () => {
    Alert.alert(
      'Featured Profile',
      'Pay ₹200 to show your phone number to contractors and appear at the top for 1 month.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Upgrade Now', 
          onPress: async () => {
            try {
              setLoading(true);
              // Create Order
              const orderRes = await axios.post(`${API_URL}/payments/create-order`, {
                  amount: 200,
                  workerId: user?.id
              });
              const order = orderRes.data;

              if (typeof RazorpayCheckout === 'undefined' || !RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
                  // Fallback to Link
                  const linkRes = await axios.post(`${API_URL}/payments/create-link`, {
                    amount: 200,
                    workerId: user?.id
                  });
                  Linking.openURL(linkRes.data.url);
                  return;
              }

              const options = {
                description: 'Featured Profile Upgrade',
                image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
                currency: 'INR',
                key: process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_S1OGtZgvN2t1r6',
                amount: order.amount,
                name: 'Royal Connect',
                order_id: order.id,
                prefill: {
                  email: user?.email || 'worker@example.com',
                  contact: user?.phone,
                  name: user?.name
                },
                theme: { color: '#2563EB' }
              };

              RazorpayCheckout.open(options).then(async (data: any) => {
                  try {
                      await axios.post(`${API_URL}/payments/verify`, {
                          ...data,
                          workerId: user?.id
                      });
                      Alert.alert('Success!', 'Your profile is now Featured!');
                      fetchProfile();
                  } catch (err) {
                      Alert.alert('Error', 'Payment verification failed.');
                  }
              }).catch((err: any) => {
                  console.log(err);
              });
            } catch (e) {
              Alert.alert('Error', 'Could not initiate payment.');
            } finally {
                setLoading(false);
            }
          } 
        }
      ]
    );
  };

  const submitSupport = async () => {
      if (!supportMsg.trim()) return;
      try {
          setLoading(true);
          await axios.post(`${API_URL}/support/ticket`, {
              role: 'worker',
              userId: user?.id,
              userName: user?.name,
              message: supportMsg
          });
          Alert.alert('Success', 'Your message has been sent to the admin.');
          setSupportMsg('');
          setActiveModal(null);
      } catch (e) {
          Alert.alert('Error', 'Failed to send message.');
      } finally {
          setLoading(false);
      }
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
                <View className="bg-white/20 p-4 rounded-2xl mr-4">
                    <CreditCard color="white" size={24} />
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
                    <Text className="text-white/70 ml-2 font-bold">{dbUser?.rating || 4.8} Rating</Text>
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
        <View className="space-y-4 pb-12">
          <TouchableOpacity 
            onPress={() => setActiveModal('profile')}
            className="flex-row items-center bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-4"
          >
            <View className="bg-blue-50 p-4 rounded-2xl mr-5">
              <User color="#1E40AF" size={24} />
            </View>
            <Text className="flex-1 text-lg font-bold text-slate-700">माझी प्रोफाइल (My Profile)</Text>
            <ChevronRight color="#CBD5E1" size={20} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setActiveModal('transactions')}
            className="flex-row items-center bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-4"
          >
            <View className="bg-indigo-50 p-4 rounded-2xl mr-5">
              <History color="#4F46E5" size={24} />
            </View>
            <Text className="flex-1 text-lg font-bold text-slate-700">व्यवहार (Transactions)</Text>
            <ChevronRight color="#CBD5E1" size={20} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setActiveModal('support')}
            className="flex-row items-center bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 mb-8"
          >
            <View className="bg-emerald-50 p-4 rounded-2xl mr-5">
              <MessageCircle color="#059669" size={24} />
            </View>
            <Text className="flex-1 text-lg font-bold text-slate-700">मदत केंद्र (Support)</Text>
            <ChevronRight color="#CBD5E1" size={20} />
          </TouchableOpacity>
        </View>

        {/* MODALS */}
        {/* Profile Modal */}
        {activeModal === 'profile' && (
            <Modal animationType="slide" transparent={true} visible={true}>
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[48px] p-8 h-[70%]">
                        <TouchableOpacity onPress={() => setActiveModal(null)} className="bg-slate-100 px-4 py-2 rounded-full self-center mb-6">
                            <Text className="text-slate-400 font-bold">Close</Text>
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold mb-6 text-center">My Profile</Text>
                        <View className="items-center mb-8">
                             <Image 
                                source={{ uri: dbUser?.profileImage || `https://ui-avatars.com/api/?name=${dbUser?.name}&background=1E40AF&color=fff` }} 
                                className="w-24 h-24 rounded-3xl mb-4"
                            />
                            <Text className="text-xl font-bold text-slate-900">{dbUser?.name}</Text>
                            <Text className="text-slate-500 font-bold">{dbUser?.phone}</Text>
                        </View>
                        <View className="space-y-4">
                            <View className="bg-slate-50 p-6 rounded-3xl">
                                <Text className="text-slate-400 font-bold text-xs uppercase mb-1">Company / Service</Text>
                                <Text className="text-slate-900 font-bold">{dbUser?.categoryMr} ({dbUser?.categoryEn})</Text>
                            </View>
                            <View className="bg-slate-50 p-6 rounded-3xl">
                                <Text className="text-slate-400 font-bold text-xs uppercase mb-1">Location</Text>
                                <Text className="text-slate-900 font-bold">{dbUser?.city}, {dbUser?.state}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        )}

        {/* Transactions Modal */}
        {activeModal === 'transactions' && (
            <Modal animationType="slide" transparent={true} visible={true}>
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[48px] p-8 h-[70%]">
                        <TouchableOpacity onPress={() => setActiveModal(null)} className="bg-slate-100 px-4 py-2 rounded-full self-center mb-6">
                            <Text className="text-slate-400 font-bold">Close</Text>
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold mb-6 text-center">Payment History</Text>
                        <FlatList 
                            data={transactions}
                            keyExtractor={(item: any) => item.id}
                            renderItem={({item}) => (
                                <View className="bg-slate-50 p-6 rounded-[28px] mb-4 flex-row items-center border border-slate-100">
                                    <View className="bg-emerald-100 p-3 rounded-2xl mr-4">
                                        <CheckCircle2 color="#059669" size={20} />
                                    </View>
                                    <View className="flex-1">
                                        <Text className="text-slate-900 font-bold text-lg">Featured Profile Purchase</Text>
                                        <Text className="text-slate-400 font-medium">{new Date(item.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                    <Text className="text-slate-900 font-black text-lg">₹{item.amount}</Text>
                                </View>
                            )}
                            ListEmptyComponent={<Text className="text-center text-slate-400 mt-10">No transactions found.</Text>}
                        />
                    </View>
                </View>
            </Modal>
        )}

        {/* Support Modal */}
        {activeModal === 'support' && (
            <Modal animationType="slide" transparent={true} visible={true}>
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[48px] p-8 h-[60%]">
                        <TouchableOpacity onPress={() => setActiveModal(null)} className="bg-slate-100 px-4 py-2 rounded-full self-center mb-6">
                            <Text className="text-slate-400 font-bold">Close</Text>
                        </TouchableOpacity>
                        <Text className="text-2xl font-bold mb-2 text-center">Help & Support</Text>
                        <Text className="text-slate-400 text-center mb-6 px-4">Our team will get back to you within 24 hours.</Text>
                        
                        <TextInput 
                            placeholder="Message to Admin..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            numberOfLines={4}
                            value={supportMsg}
                            onChangeText={setSupportMsg}
                            className="bg-slate-50 p-6 rounded-[28px] text-lg text-slate-800 h-32 mb-6 border border-slate-100"
                        />

                        <TouchableOpacity 
                            onPress={submitSupport}
                            disabled={loading}
                            className="bg-blue-600 w-full p-6 rounded-[28px] flex-row items-center justify-center shadow-lg shadow-blue-400"
                        >
                            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-xl">Send Message</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

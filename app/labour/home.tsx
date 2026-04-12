import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator, RefreshControl, Modal, FlatList, TextInput, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, LogOut, CreditCard, ChevronRight, CheckCircle2, History, MessageCircle, Star, AlertCircle, Eye, ShieldCheck, CreditCard as CardIcon } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/authStore';
import axios from 'axios';
import * as Linking from 'expo-linking';
import RazorpayCheckout from 'react-native-razorpay';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LabourHome() {
  const insets = useSafeAreaInsets();
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
              const orderRes = await axios.post(`${API_URL}/payments/create-order`, {
                  amount: 200,
                  workerId: user?.id
              });
              const order = orderRes.data;

              if (typeof RazorpayCheckout === 'undefined' || !RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
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
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        className="px-6" 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />
        }
      >
        <View className="flex-row justify-between items-center mt-6 mb-10">
          <View>
            <Text className="text-slate-400 font-inter-bold text-xs uppercase tracking-widest">Worker Network</Text>
            <Text className="text-3xl font-inter-black text-secondary">{dbUser?.name || 'Welcome'}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => {
              logout();
              router.replace('/');
            }}
            className="bg-slate-50 p-4 rounded-[24px] border border-slate-100"
          >
            <LogOut color="#0F172A" size={24} />
          </TouchableOpacity>
        </View>

        {!dbUser?.isSubscribed && (
            <TouchableOpacity 
                onPress={handleSubscription}
                className="bg-primary p-7 rounded-[32px] mb-8 flex-row items-center shadow-2xl shadow-primary/20"
            >
                <View className="bg-white/20 p-3 rounded-2xl mr-4">
                    <ShieldCheck color="white" size={24} />
                </View>
                <View className="flex-1">
                    <Text className="text-white font-inter-bold text-lg">Featured Unlock Available</Text>
                    <Text className="text-white/80 font-inter-medium text-sm">Appear at the top for contractors today.</Text>
                </View>
                <ChevronRight color="white" size={20} />
            </TouchableOpacity>
        )}

        <View className="bg-secondary p-10 rounded-[48px] shadow-2xl mb-12 relative overflow-hidden">
          <View className="absolute -right-10 -top-10 w-48 h-48 bg-primary/10 rounded-full" />
          
          <View className="flex-row items-center mb-8">
            <Image 
                source={{ uri: dbUser?.profileImage || `https://ui-avatars.com/api/?name=${dbUser?.name}&background=2563EB&color=fff` }} 
                className="w-24 h-24 rounded-[32px] border-4 border-white/10 shadow-lg"
            />
            <View className="ml-6 flex-1">
                <Text className="text-white font-inter-black text-2xl truncate">{dbUser?.name}</Text>
                <View className="flex-row items-center mt-2 bg-white/10 self-start px-3 py-1 rounded-xl">
                    <Star size={14} color="#FBBF24" fill="#FBBF24" />
                    <Text className="text-white font-inter-black text-xs ml-2">{dbUser?.rating?.toFixed(1) || 0} Network Rating</Text>
                </View>
            </View>
          </View>

          <View className="h-[1px] bg-white/10 w-full mb-8" />

          <View className="flex-row justify-between items-center">
            <View>
                <Text className="text-white/40 text-[10px] font-inter-bold uppercase tracking-[2px] mb-1">Status</Text>
                <Text className={`font-inter-black text-lg ${dbUser?.isSubscribed ? 'text-emerald-400' : 'text-primary'}`}>
                    {dbUser?.isSubscribed ? 'FEATURED PARTNER' : 'STANDARD PRO'}
                </Text>
            </View>
            <View className="flex-row items-center bg-white/10 px-5 py-3 rounded-2xl">
                <Eye color="white" size={16} />
                <Text className="text-white font-inter-black text-sm ml-2">{dbUser?.views || 0} Views</Text>
            </View>
          </View>
        </View>

        <Text className="text-lg font-inter-black text-secondary mb-6 tracking-tight">Management Suite</Text>
        <View className="space-y-4">
          <TouchableOpacity onPress={() => setActiveModal('profile')} className="flex-row items-center bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 mb-4">
            <View className="bg-slate-50 p-4 rounded-2xl mr-5 font-inter-bold text-secondary text-lg leading-6 px-6"><User color="#0F172A" size={24} /></View>
            <Text className="flex-1 text-xl font-inter-bold text-secondary">My Professional Profile</Text>
            <ChevronRight color="#CBD5E1" size={20} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveModal('transactions')} className="flex-row items-center bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 mb-4">
            <View className="bg-slate-50 p-4 rounded-2xl mr-5"><History color="#0F172A" size={24} /></View>
            <Text className="flex-1 text-xl font-inter-bold text-secondary">Financial History</Text>
            <ChevronRight color="#CBD5E1" size={20} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setActiveModal('support')} className="flex-row items-center bg-white p-7 rounded-[32px] shadow-sm border border-slate-100 mb-8">
            <View className="bg-slate-50 p-4 rounded-2xl mr-5"><MessageCircle color="#0F172A" size={24} /></View>
            <Text className="flex-1 text-xl font-inter-bold text-secondary">Support Desk</Text>
            <ChevronRight color="#CBD5E1" size={20} />
          </TouchableOpacity>
        </View>

        {/* User Modals (Apply same design) */}
        {activeModal === 'profile' && (
            <Modal animationType="slide" transparent={true} visible={true}>
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[48px] p-8 h-[75%]" style={{ paddingBottom: insets.bottom + 20 }}>
                        <View className="w-16 h-1 bg-slate-200 rounded-full self-center mb-8" />
                        <Text className="text-3xl font-inter-black mb-10 text-center text-secondary">Professional Identity</Text>
                        <View className="items-center mb-10">
                             <Image source={{ uri: dbUser?.profileImage || `https://ui-avatars.com/api/?name=${dbUser?.name}&background=2563EB&color=fff` }} className="w-28 h-28 rounded-[36px] shadow-xl mb-6 border-4 border-slate-50" />
                            <Text className="text-2xl font-inter-bold text-secondary mb-1">{dbUser?.name}</Text>
                            <Text className="text-slate-400 font-inter-medium text-lg">{dbUser?.phone}</Text>
                        </View>
                        <View className="space-y-4">
                            <View className="bg-slate-50 p-7 rounded-[32px] border border-slate-100">
                                <Text className="text-slate-400 font-inter-bold text-[10px] uppercase tracking-widest mb-1">Service Tier</Text>
                                <Text className="text-secondary font-inter-bold text-xl">{dbUser?.categoryMr} ({dbUser?.categoryEn})</Text>
                            </View>
                            <View className="bg-slate-50 p-7 rounded-[32px] border border-slate-100">
                                <Text className="text-slate-400 font-inter-bold text-[10px] uppercase tracking-widest mb-1">Active Region</Text>
                                <Text className="text-secondary font-inter-bold text-xl">{dbUser?.city}, {dbUser?.state}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={() => setActiveModal(null)} className="mt-auto bg-slate-900 w-full py-6 rounded-[32px] items-center">
                            <Text className="text-white font-inter-bold text-xl">Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )}

        {/* Transactions Modal */}
        {activeModal === 'transactions' && (
            <Modal animationType="slide" transparent={true} visible={true}>
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[48px] p-8 h-[70%]" style={{ paddingBottom: insets.bottom + 20 }}>
                        <View className="w-16 h-1 bg-slate-200 rounded-full self-center mb-8" />
                        <Text className="text-3xl font-inter-black mb-10 text-center text-secondary">Payment Ledger</Text>
                        <FlatList 
                            data={transactions}
                            keyExtractor={(item: any) => item.id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({item}) => (
                                <View className="bg-slate-50 p-6 rounded-[32px] mb-4 flex-row items-center border border-slate-100">
                                    <View className="bg-emerald-100 p-3 rounded-2xl mr-5"><CheckCircle2 color="#059669" size={24} /></View>
                                    <View className="flex-1">
                                        <Text className="text-secondary font-inter-bold text-lg">Featured Purchase</Text>
                                        <Text className="text-slate-400 font-inter-medium">{new Date(item.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                    <Text className="text-secondary font-inter-black text-xl">₹{item.amount}</Text>
                                </View>
                            )}
                            ListEmptyComponent={
                                <View className="items-center mt-20">
                                    <CardIcon size={48} color="#CBD5E1" />
                                    <Text className="text-slate-400 font-inter-medium text-lg mt-4">No recent activity.</Text>
                                </View>
                            }
                        />
                         <TouchableOpacity onPress={() => setActiveModal(null)} className="mt-6 bg-slate-900 w-full py-6 rounded-[32px] items-center">
                            <Text className="text-white font-inter-bold text-xl">Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )}

        {/* Support Modal */}
        {activeModal === 'support' && (
            <Modal animationType="slide" transparent={true} visible={true}>
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[48px] p-8 h-[65%]" style={{ paddingBottom: insets.bottom + 20 }}>
                        <View className="w-16 h-1 bg-slate-200 rounded-full self-center mb-8" />
                        <Text className="text-3xl font-inter-black mb-4 text-center text-secondary">Help & Concierge</Text>
                        <Text className="text-slate-400 text-center mb-10 font-inter-medium text-lg px-6 leading-6">Describe your issue and we'll respond within 24 hours.</Text>
                        <TextInput placeholder="How can we assist you today?" placeholderTextColor="#94A3B8" multiline numberOfLines={4} value={supportMsg} onChangeText={setSupportMsg} className="bg-slate-50 p-8 rounded-[36px] font-inter-medium text-lg text-secondary h-40 mb-10 border border-slate-100" />
                        <TouchableOpacity onPress={submitSupport} disabled={loading} className="bg-primary w-full py-6 rounded-[32px] flex-row items-center justify-center shadow-2xl shadow-primary/20">
                            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-inter-bold text-xl">Send Direct Message</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )}
      </ScrollView>
    </View>
  );
}

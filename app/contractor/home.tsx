import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, Image, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Filter, Phone, MapPin, Star, CreditCard, ChevronRight, X, LogOut, CheckCircle, Info, ShieldCheck } from 'lucide-react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { CATEGORIES } from '../../src/constants/categories';
import { useAuthStore } from '../../src/store/authStore';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
const RAZORPAY_KEY = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_S1OGtZgvN2t1r6';

export default function ContractorHome() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const { user, setAuth } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLabour, setSelectedLabour] = useState<any>(null);
  const [labours, setLabours] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWorkers();
    fetchProfile();
  }, [selectedCategory, searchQuery]);

  const fetchProfile = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/profile/contractor/${user.id}`);
      setAuth('contractor', response.data);
    } catch (e) {}
  };

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/workers`, {
        params: {
          category: selectedCategory,
          query: searchQuery
        }
      });
      setLabours(response.data);
    } catch (error) {
      console.error("Fetch Workers Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    try {
        setLoading(true);
        // 1. Create Order on Backend
        const orderResponse = await axios.post(`${API_URL}/payments/create-order`, {
            amount: 500,
            contractorId: user?.id || 'default-contractor'
        });

        const order = orderResponse.data;

        // 2. Open Razorpay Checkout
        const options = {
            description: 'Full Access Subscription',
            image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            currency: 'INR',
            key: RAZORPAY_KEY,
            amount: order.amount,
            name: 'Royal Construction',
            order_id: order.id,
            prefill: {
                email: 'contractor@example.com',
                contact: '9999999999',
                name: 'Contractor Name'
            },
            theme: { color: '#1E40AF' }
        };

        RazorpayCheckout.open(options).then(async (data: any) => {
            // 3. Verify on Backend
            try {
                await axios.post(`${API_URL}/payments/verify`, {
                    ...data,
                    contractorId: user?.id || 'default-contractor'
                });
                // Update local auth store with new subscription status
                setAuth('contractor', { ...user, isSubscribed: true });
                Alert.alert('Success!', 'Your subscription is now active! You can now see mobile numbers.');
            } catch (err) {
                Alert.alert('Error', 'Payment verification failed.');
            }
        }).catch((error: any) => {
            console.log('Razorpay Error:', error);
            Alert.alert('Payment Cancelled', 'Please try again to unlock contacts.');
        });

    } catch (error) {
        console.error("Subscription Error:", error);
        Alert.alert('Error', 'Could not initiate payment.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-6 pb-0">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-slate-500 font-medium">Contractor Panel</Text>
            <Text className="text-2xl font-bold text-slate-900">{user?.name || 'Welcome'}</Text>
          </View>
          <TouchableOpacity onPress={() => { logout(); router.replace('/'); }} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <LogOut color="#1E40AF" size={20} />
          </TouchableOpacity>
        </View>

        {/* Subscription Alert Banner */}
        {!user?.isSubscribed && (
            <TouchableOpacity 
                onPress={() => Alert.alert('Subscription', 'Subscribe to unlock worker contact details!')}
                className="bg-blue-600 p-6 rounded-[32px] mb-8 flex-row items-center border border-blue-400 shadow-xl shadow-blue-200"
            >
                <View className="bg-white/20 p-3 rounded-2xl mr-4">
                    <ShieldCheck color="white" size={24} />
                </View>
                <View className="flex-1">
                    <Text className="text-white font-bold text-lg">Subscription Required</Text>
                    <Text className="text-white/80">You cannot see worker phone numbers until you subscribe.</Text>
                </View>
                <ChevronRight color="white" size={20} />
            </TouchableOpacity>
        )}

        {/* Approval Alert if not approved */}
        {!user?.isApproved && (
            <View className="bg-amber-100 p-6 rounded-[32px] mb-8 flex-row items-center border border-amber-200">
                <View className="bg-amber-200 p-3 rounded-2xl mr-4">
                    <CheckCircle color="#D97706" size={24} />
                </View>
                <View className="flex-1">
                    <Text className="text-amber-800 font-bold text-lg">Verification Pending</Text>
                    <Text className="text-amber-700">Admin is currently reviewing your account.</Text>
                </View>
            </View>
        )}

        {/* Search */}
        <View className="flex-row items-center space-x-3 mb-6">
          <View className="flex-1 flex-row items-center bg-white p-5 rounded-[24px] border border-slate-200 shadow-sm">
            <Search size={20} color="#94A3B8" />
            <TextInput 
              placeholder="Search workers or city..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 text-lg"
            />
          </View>
        </View>

        {/* Categories Carousel */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-6 px-6">
          <TouchableOpacity 
            onPress={() => setSelectedCategory(null)}
            className={`mr-3 px-6 py-3 rounded-2xl border ${!selectedCategory ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200 shadow-sm'}`}
          >
            <Text className={`font-bold ${!selectedCategory ? 'text-white' : 'text-slate-600'}`}>All Workers</Text>
          </TouchableOpacity>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              className={`mr-3 px-6 py-3 rounded-2xl border ${selectedCategory === cat.id ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200 shadow-sm'}`}
            >
              <Text className={`font-bold ${selectedCategory === cat.id ? 'text-white' : 'text-slate-600'}`}>
                {cat.en} ({cat.mr})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Subscription Banner */}
      {!user?.isSubscribed && (
        <View className="mx-6 mb-6 bg-slate-900 p-6 rounded-[32px] flex-row items-center justify-between shadow-xl">
          <View className="flex-1 mr-4">
            <Text className="text-white font-bold text-lg mb-1">Unlock All Contacts</Text>
            <Text className="text-slate-400 text-sm">₹500 for 1 month unlimited access</Text>
          </View>
          <TouchableOpacity 
            onPress={handleSubscribe}
            className="bg-blue-600 px-6 py-4 rounded-2xl"
          >
            <Text className="text-white font-bold">Subscribe</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Labour List */}
      <View className="flex-1 px-6">
        {loading && labours.length === 0 ? (
            <ActivityIndicator size="large" color="#1E40AF" className="mt-20" />
        ) : (
            <FlatList
                data={labours}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 120 }}
                renderItem={({ item }) => (
                <TouchableOpacity 
                    onPress={async () => {
                      setSelectedLabour(item);
                      // Increment View Count
                      try { await axios.post(`${API_URL}/workers/view/${item.id}`); } catch (e) {}
                    }}
                    className="bg-white p-5 rounded-[32px] mb-6 shadow-sm border border-slate-100 flex-row items-center"
                >
                    <Image source={{ uri: item.profileImage || `https://ui-avatars.com/api/?name=${item.name}&background=1E40AF&color=fff` }} className="w-20 h-20 rounded-2xl mr-5" />
                    <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-xl font-bold text-slate-900">{item.name}</Text>
                        <View className="flex-row items-center">
                        <Star size={14} color="#FBBF24" fill="#FBBF24" />
                        <Text className="ml-1 text-slate-800 font-bold">{item.rating}</Text>
                        </View>
                    </View>
                    <Text className="text-blue-700 font-bold mb-2 text-xs">
                        {item.categoryMr} ({item.categoryEn})
                    </Text>
                    <View className="flex-row items-center opacity-70">
                        <MapPin size={16} color="#64748B" />
                        <Text className="ml-1 text-slate-600 font-medium italic">{item.city}</Text>
                        <Text className="mx-2 text-slate-300">|</Text>
                        <Text className="text-slate-800 font-bold text-xs">₹{item.wages}/{item.wageType.toLowerCase()}</Text>
                    </View>
                    </View>
                    <ChevronRight color="#CBD5E1" size={24} />
                </TouchableOpacity>
                )}
                ListEmptyComponent={
                <View className="items-center mt-20">
                    <Search size={48} color="#CBD5E1" />
                    <Text className="text-slate-400 mt-4 text-center">No workers found. Try another category.</Text>
                </View>
                }
            />
        )}
      </View>

      {/* Labour Detail Modal */}
      {selectedLabour && (
        <Modal animationType="slide" transparent={true} visible={!!selectedLabour}>
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-[48px] p-8 h-[85%] pb-12 shadow-2xl">
              <TouchableOpacity onPress={() => setSelectedLabour(null)} className="items-center py-2 mb-6 bg-slate-100 w-16 rounded-full self-center">
                <X color="#94A3B8" size={24} />
              </TouchableOpacity>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="items-center mb-8">
                  <Image 
                    source={{ uri: selectedLabour.profileImage || `https://ui-avatars.com/api/?name=${selectedLabour.name}&background=1E40AF&color=fff` }} 
                    className="w-36 h-36 rounded-[48px] mb-6 shadow-2xl border-4 border-blue-50" 
                  />
                  <Text className="text-3xl font-bold text-slate-900">{selectedLabour.name}</Text>
                  <Text className="text-blue-700 font-bold text-lg mb-2">{selectedLabour.categoryMr} ({selectedLabour.categoryEn})</Text>
                  <View className="flex-row items-center bg-blue-50 px-4 py-2 rounded-full">
                    <Star size={20} color="#FBBF24" fill="#FBBF24" />
                    <Text className="ml-2 text-blue-900 text-xl font-bold">{selectedLabour.rating}</Text>
                  </View>
                </View>

                <View className="flex-row justify-between mb-8">
                    <View className="bg-slate-50 p-5 rounded-[28px] flex-1 mr-3 items-center border border-slate-100">
                        <Text className="text-slate-400 font-bold mb-1 uppercase text-[10px] tracking-widest">Experience</Text>
                        <Text className="text-slate-900 font-bold text-lg">{selectedLabour.experienceYears} Years</Text>
                    </View>
                    <View className="bg-slate-50 p-5 rounded-[28px] flex-1 ml-3 items-center border border-slate-100">
                        <Text className="text-slate-400 font-bold mb-1 uppercase text-[10px] tracking-widest">Wages</Text>
                        <Text className="text-blue-700 font-bold text-lg">₹{selectedLabour.wages}/{selectedLabour.wageType.toLowerCase()}</Text>
                    </View>
                </View>

                {/* Contact Area */}
                <View className="bg-slate-900 p-8 rounded-[40px] items-center shadow-2xl mb-10">
                  <Text className="text-white/50 mb-3 font-bold uppercase text-xs tracking-widest text-center">Contact Verified Worker</Text>
                  
                  {user?.isSubscribed && selectedLabour.isSubscribed ? (
                    <Text className="text-white text-4xl font-bold mb-6 tracking-tighter">
                      +91 {selectedLabour.phone}
                    </Text>
                  ) : (
                    <View className="items-center">
                        <Text className="text-white text-4xl font-bold mb-2 blur-md opacity-20">
                        +91 XXXXX XXXXX
                        </Text>
                        <Text className="text-blue-400 text-xs font-bold mb-6 text-center px-4">
                            {!user?.isSubscribed ? "Subscribe to unlock details" : "Worker subscription expired"}
                        </Text>
                    </View>
                  )}
                  
                  {!(user?.isSubscribed && selectedLabour.isSubscribed) ? (
                    <TouchableOpacity 
                        onPress={() => {
                            if (!user?.isSubscribed) {
                                handleSubscribe();
                            } else {
                                Alert.alert("Not Contactable", "This worker's subscription has expired and their contact details are currently hidden.");
                            }
                        }}
                        className="bg-blue-600 w-full p-6 rounded-[28px] flex-row items-center justify-center shadow-lg shadow-blue-400"
                    >
                      <CreditCard color="white" size={24} />
                      <Text className="text-white font-bold text-xl ml-3">
                          {!user?.isSubscribed ? "Subscribe to View" : "Hidden"}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                        onPress={() => Linking.openURL(`tel:+91${selectedLabour.phone}`)}
                        className="bg-emerald-600 w-full p-6 rounded-[28px] flex-row items-center justify-center shadow-lg shadow-green-400"
                    >
                      <Phone color="white" size={24} />
                      <Text className="text-white font-bold text-xl ml-3">Call Now</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View className="mb-20">
                    <Text className="text-xl font-bold text-slate-800 mb-4">About Worker</Text>
                    <View className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <Text className="text-slate-600 text-lg leading-7">
                            <Text className="font-bold text-slate-800">{selectedLabour.name}</Text> is a highly skilled <Text className="text-blue-700 font-bold">{selectedLabour.categoryEn}</Text> based in <Text className="font-bold">{selectedLabour.city}, {selectedLabour.state}</Text>. 
                            With {selectedLabour.experienceYears} years of experience, they specialize in professional construction and maintenance services. Address: {selectedLabour.address || 'Not specified'}.
                        </Text>
                    </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

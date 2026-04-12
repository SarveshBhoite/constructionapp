import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, Image, TextInput, Alert, Modal, ActivityIndicator, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Filter, Phone, MapPin, Star, CreditCard, ChevronRight, X, LogOut, CheckCircle, Info, ShieldCheck, User, History, MessageCircle, Menu } from 'lucide-react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { CATEGORIES } from '../../src/constants/categories';
import { useAuthStore } from '../../src/store/authStore';
import axios from 'axios';
import * as Linking from 'expo-linking';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
const RAZORPAY_KEY = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_S1OGtZgvN2t1r6';

export default function ContractorHome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const { user, setAuth } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLabour, setSelectedLabour] = useState<any>(null);
  const [labours, setLabours] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [showMenu, setShowMenu] = useState(false);
  const [activeModal, setActiveModal] = useState<'profile' | 'transactions' | 'support' | null>(null);
  const [supportMsg, setSupportMsg] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [userRating, setUserRating] = useState(0);

  const fetchProfile = async () => {
    try {
      if (!user?.id) return;
      const response = await axios.get(`${API_URL}/auth/profile/contractor/${user.id}`);
      setAuth('contractor', response.data);
    } catch (e) {}
  };

  const fetchTransactions = async () => {
      try {
          const res = await axios.get(`${API_URL}/payments/status/contractor/${user?.id}`);
          setTransactions(res.data || []);
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

  useEffect(() => {
    fetchWorkers();
    fetchProfile();
    fetchTransactions();
  }, [selectedCategory, searchQuery]);

  const handleRating = async (ratingValue: number) => {
      if (!selectedLabour) return;
      try {
          await axios.post(`${API_URL}/reviews`, {
              workerId: selectedLabour.id,
              contractorId: user?.id,
              contractorName: user?.name,
              rating: ratingValue
          });
          setUserRating(ratingValue);
          Alert.alert('Success', 'Rating submitted!');
          fetchWorkers(); 
      } catch (e) {
          Alert.alert('Error', 'Could not submit rating.');
      }
  };

  const handleSubscribe = async () => {
    try {
        setLoading(true);
        const orderResponse = await axios.post(`${API_URL}/payments/create-order`, {
            amount: 500,
            contractorId: user?.id || 'default-contractor'
        });
        const order = orderResponse.data;

        if (!RazorpayCheckout || typeof RazorpayCheckout.open !== 'function') {
            try {
                const linkRes = await axios.post(`${API_URL}/payments/create-link`, {
                    amount: 500,
                    contractorId: user?.id
                });
                Linking.openURL(linkRes.data.url);
            } catch (e) {
                Alert.alert('Error', 'Could not generate payment link.');
            }
            setLoading(false);
            return;
        }

        const options = {
            description: 'Full Access Subscription',
            image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            currency: 'INR',
            key: RAZORPAY_KEY,
            amount: order.amount,
            name: 'Royal Connect',
            order_id: order.id,
            prefill: {
                email: 'contractor@example.com',
                contact: '919000000000',
                name: user?.name || 'Contractor'
            },
            theme: { color: '#2563EB' }
        };

        RazorpayCheckout.open(options).then(async (data: any) => {
            try {
                await axios.post(`${API_URL}/payments/verify`, {
                    ...data,
                    contractorId: user?.id || 'default-contractor'
                });
                fetchProfile();
                Alert.alert('Success!', 'Your subscription is now active!');
            } catch (err) {
                Alert.alert('Error', 'Payment verification failed.');
            }
        }).catch((error: any) => {
            console.log('Razorpay Error:', error);
        });
    } catch (error) {
        Alert.alert('Error', 'Could not initiate payment.');
    } finally {
        setLoading(false);
    }
  };

  const submitSupport = async () => {
      if (!supportMsg.trim()) return;
      try {
          setLoading(true);
          await axios.post(`${API_URL}/support/ticket`, {
              role: 'contractor',
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
  
  const Sidebar = () => (
      <Modal animationType="fade" transparent={true} visible={showMenu}>
          <View className="flex-1 flex-row">
              <TouchableOpacity activeOpacity={1} onPress={() => setShowMenu(false)} className="bg-black/40 w-1/4 h-full" />
              <View className="bg-white w-3/4 h-full p-8 pt-20 shadow-2xl" style={{ paddingTop: insets.top + 40 }}>
                  <Text className="text-3xl font-inter-black text-secondary mb-12">Menu</Text>
                  
                  <TouchableOpacity onPress={() => { setShowMenu(false); setActiveModal('profile'); }} className="flex-row items-center mb-8">
                      <View className="bg-slate-50 p-4 rounded-2xl mr-4"><User color="#0F172A" size={24} /></View>
                      <Text className="text-xl font-inter-bold text-slate-700">माझी प्रोफाइल (Profile)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => { setShowMenu(false); setActiveModal('transactions'); }} className="flex-row items-center mb-8">
                      <View className="bg-slate-50 p-4 rounded-2xl mr-4"><History color="#0F172A" size={24} /></View>
                      <Text className="text-xl font-inter-bold text-slate-700">व्यवहार (Transactions)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => { setShowMenu(false); setActiveModal('support'); }} className="flex-row items-center mb-12">
                      <View className="bg-slate-50 p-4 rounded-2xl mr-4"><MessageCircle color="#0F172A" size={24} /></View>
                      <Text className="text-xl font-inter-bold text-slate-700">मदत केंद्र (Support)</Text>
                  </TouchableOpacity>

                  <View className="h-[1px] bg-slate-100 w-full mb-12" />

                  <TouchableOpacity onPress={() => { logout(); router.replace('/'); }} className="flex-row items-center">
                      <View className="bg-rose-50 p-4 rounded-2xl mr-4"><LogOut color="#E11D48" size={24} /></View>
                      <Text className="text-xl font-inter-bold text-rose-600">Log Out</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" />
      <Sidebar />
      <View className="p-6 pb-0">
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-slate-400 font-inter-bold text-xs uppercase tracking-widest">Contractor Hub</Text>
            <Text className="text-3xl font-inter-black text-secondary">{user?.name || 'Welcome'}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowMenu(true)} className="bg-slate-50 p-4 rounded-[24px] border border-slate-100">
            <Menu color="#0F172A" size={24} />
          </TouchableOpacity>
        </View>

        {!user?.isSubscribed && (
            <TouchableOpacity 
                onPress={handleSubscribe}
                className="bg-primary p-7 rounded-[32px] mb-8 flex-row items-center shadow-2xl shadow-primary/20"
            >
                <View className="bg-white/20 p-3 rounded-2xl mr-4">
                    <ShieldCheck color="white" size={24} />
                </View>
                <View className="flex-1">
                    <Text className="text-white font-inter-bold text-lg">Subscription Required</Text>
                    <Text className="text-white/80 font-inter-medium text-sm">Unlock contact details of all workers.</Text>
                </View>
                <ChevronRight color="white" size={20} />
            </TouchableOpacity>
        )}

        <View className="flex-row items-center space-x-3 mb-8">
          <View className="flex-1 flex-row items-center bg-slate-50 p-6 rounded-[28px] border border-slate-100">
            <Search size={22} color="#94A3B8" />
            <TextInput 
              placeholder="Search by name or city..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 font-inter-medium text-lg text-secondary"
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 -mx-6 px-6">
          <TouchableOpacity 
            onPress={() => setSelectedCategory(null)}
            className={`mr-3 px-8 py-4 rounded-[22px] ${!selectedCategory ? 'bg-secondary' : 'bg-slate-50 border border-slate-100'}`}
          >
            <Text className={`font-inter-bold ${!selectedCategory ? 'text-white' : 'text-slate-500'}`}>All Talent</Text>
          </TouchableOpacity>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              className={`mr-3 px-8 py-4 rounded-[22px] ${selectedCategory === cat.id ? 'bg-secondary' : 'bg-slate-50 border border-slate-100'}`}
            >
              <Text className={`font-inter-bold ${selectedCategory === cat.id ? 'text-white' : 'text-slate-500'}`}>
                {cat.en}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="flex-1 px-6">
        {loading && labours.length === 0 ? (
            <ActivityIndicator size="large" color="#2563EB" className="mt-20" />
        ) : (
            <FlatList
                data={labours}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
                renderItem={({ item }) => (
                <TouchableOpacity 
                    onPress={async () => {
                      setSelectedLabour(item);
                      setUserRating(0);
                      try { await axios.post(`${API_URL}/workers/view/${item.id}`); } catch (e) {}
                    }}
                    className="bg-white p-6 rounded-[36px] mb-8 shadow-sm border border-slate-100 flex-row items-center"
                >
                    <Image source={{ uri: item.profileImage || `https://ui-avatars.com/api/?name=${item.name}&background=0F172A&color=fff` }} className="w-20 h-20 rounded-[22px] mr-5" />
                    <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-xl font-inter-bold text-secondary">{item.name}</Text>
                        <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-xl">
                            <Star size={12} color="#FBBF24" fill="#FBBF24" />
                            <Text className="ml-1 text-amber-700 font-inter-black text-[10px]">{item.rating?.toFixed(1) || 4.5}</Text>
                        </View>
                    </View>
                    <Text className="text-primary font-inter-bold mb-3 text-xs uppercase tracking-tight">
                        {item.categoryEn}
                    </Text>
                    <View className="flex-row items-center">
                        <MapPin size={14} color="#64748B" />
                        <Text className="ml-1 text-slate-500 font-inter-medium text-xs">{item.city}</Text>
                        <Text className="mx-2 text-slate-200">|</Text>
                        <Text className="text-secondary font-inter-black text-xs">₹{item.wages}/{item.wageType.toLowerCase()}</Text>
                    </View>
                    </View>
                </TouchableOpacity>
                )}
                ListEmptyComponent={
                <View className="items-center mt-24">
                    <Search size={48} color="#CBD5E1" />
                    <Text className="text-slate-400 mt-4 font-inter-medium text-center">No professionals found.</Text>
                </View>
                }
            />
        )}
      </View>

      {/* Profile Modal */}
      {activeModal === 'profile' && (
          <Modal animationType="slide" transparent={true} visible={true}>
              <View className="flex-1 bg-black/60 justify-end">
                  <View className="bg-white rounded-t-[48px] p-8 h-[70%]" style={{ paddingBottom: insets.bottom + 20 }}>
                      <View className="w-16 h-1 bg-slate-200 rounded-full self-center mb-8" />
                      <Text className="text-3xl font-inter-black mb-10 text-center text-secondary">My Profile</Text>
                      <View className="items-center mb-12">
                           <Image 
                              source={{ uri: `https://ui-avatars.com/api/?name=${user?.name}&background=0F172A&color=fff` }} 
                              className="w-28 h-28 rounded-[36px] mb-6 shadow-xl border-4 border-slate-50"
                          />
                          <Text className="text-2xl font-inter-bold text-secondary mb-1">{user?.name}</Text>
                          <Text className="text-slate-400 font-inter-medium text-lg">{user?.phone}</Text>
                      </View>
                      <View className="space-y-6">
                          <View className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                              <Text className="text-slate-400 font-inter-bold text-[10px] uppercase tracking-widest mb-1">Company Entity</Text>
                              <Text className="text-secondary font-inter-bold text-lg">{user?.companyName || 'Individual'}</Text>
                          </View>
                          <View className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                              <Text className="text-slate-400 font-inter-bold text-[10px] uppercase tracking-widest mb-1">Plan Status</Text>
                              <Text className={`font-inter-black text-lg ${user?.isSubscribed ? 'text-emerald-600' : 'text-primary'}`}>
                                  {user?.isSubscribed ? 'Premium Member' : 'Standard Guest'}
                              </Text>
                          </View>
                      </View>
                      <TouchableOpacity onPress={() => setActiveModal(null)} className="mt-auto bg-slate-900 w-full py-6 rounded-[32px] items-center">
                          <Text className="text-white font-inter-bold text-xl text-center">Done</Text>
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
                      <Text className="text-3xl font-inter-black mb-4 text-center text-secondary">Help Center</Text>
                      <Text className="text-slate-400 text-center mb-10 font-inter-medium text-lg leading-6 px-6">Direct line to our premium support team.</Text>
                      
                      <TextInput 
                          placeholder="Describe your inquiry..."
                          placeholderTextColor="#94A3B8"
                          multiline
                          numberOfLines={6}
                          value={supportMsg}
                          onChangeText={setSupportMsg}
                          className="bg-slate-50 p-8 rounded-[36px] font-inter-medium text-lg text-secondary h-40 mb-10 border border-slate-100"
                      />

                      <TouchableOpacity 
                          onPress={submitSupport}
                          disabled={loading}
                          className="bg-primary w-full py-6 rounded-[32px] flex-row items-center justify-center shadow-2xl shadow-primary/20"
                      >
                          {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-inter-bold text-xl">Send Inquiry</Text>}
                      </TouchableOpacity>
                  </View>
              </View>
          </Modal>
      )}

      {/* Worker Detail Modal */}
      {selectedLabour && (
        <Modal animationType="slide" transparent={true} visible={!!selectedLabour}>
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-[56px] h-[92%] shadow-2xl overflow-hidden">
              <TouchableOpacity onPress={() => setSelectedLabour(null)} className="absolute top-6 right-6 z-10 bg-slate-100 p-3 rounded-full">
                <X color="#0F172A" size={24} />
              </TouchableOpacity>

              <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ paddingBottom: insets.bottom + 60 }}
              >
                <View className="p-8">
                    <View className="items-center mt-8 mb-10">
                        <Image 
                            source={{ uri: selectedLabour.profileImage || `https://ui-avatars.com/api/?name=${selectedLabour.name}&background=0F172A&color=fff` }} 
                            className="w-44 h-44 rounded-[48px] mb-8 shadow-2xl border-4 border-slate-50" 
                        />
                        <Text className="text-4xl font-inter-black text-secondary tracking-tight mb-2 text-center">{selectedLabour.name}</Text>
                        <Text className="text-primary font-inter-black text-xl mb-4 text-center uppercase tracking-tighter">{selectedLabour.categoryEn}</Text>
                        <View className="bg-amber-100 px-6 py-2 rounded-full flex-row items-center">
                            <Star size={18} color="#FBBF24" fill="#FBBF24" />
                            <Text className="ml-2 text-amber-900 font-inter-black text-lg">{selectedLabour.rating?.toFixed(1) || 4.5}</Text>
                        </View>
                    </View>

                    <View className="w-full bg-slate-50 p-8 rounded-[48px] items-center border border-slate-100 mb-10">
                        <Text className="text-lg font-inter-bold text-secondary mb-6 tracking-tight">Express your feedback</Text>
                        <View className="flex-row items-center space-x-3 mb-8">
                            {[1,2,3,4,5].map(star => (
                                <TouchableOpacity key={star} onPress={() => setUserRating(star)} className="p-2">
                                    <Star size={36} color="#FBBF24" fill={ (userRating || 0) >= star ? "#FBBF24" : "transparent"} strokeWidth={1.5} />
                                </TouchableOpacity>
                            ))}
                        </View>
                        {userRating > 0 && (
                            <TouchableOpacity 
                                onPress={() => handleRating(userRating)}
                                className="bg-secondary px-10 py-5 rounded-[24px] shadow-xl shadow-secondary/30"
                            >
                                <Text className="text-white font-inter-black uppercase tracking-widest text-xs">Verify {userRating} Star Rating</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View className="flex-row justify-between mb-10 space-x-4">
                        <View className="bg-white p-6 rounded-[36px] flex-1 border border-slate-100 shadow-sm items-center">
                            <Text className="text-slate-400 font-inter-bold mb-1 uppercase text-[10px] tracking-[2px]">Expertise</Text>
                            <Text className="text-secondary font-inter-black text-2xl">{selectedLabour.experienceYears}y</Text>
                        </View>
                        <View className="bg-white p-6 rounded-[36px] flex-1 border border-slate-100 shadow-sm items-center">
                            <Text className="text-slate-400 font-inter-bold mb-1 uppercase text-[10px] tracking-[2px]">Rate card</Text>
                            <Text className="text-primary font-inter-black text-2xl">₹{selectedLabour.wages}</Text>
                        </View>
                    </View>

                    {/* About Section - RESTORED */}
                    <View className="mb-10">
                        <Text className="text-xl font-inter-black text-secondary mb-4 tracking-tight">Professional Profile</Text>
                        <View className="bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                            <Text className="text-slate-500 font-inter-medium text-lg leading-7">
                                {selectedLabour.about || `${selectedLabour.name} is a high-skill professional within the ${selectedLabour.categoryEn} sector. Verified for quality and currently active in ${selectedLabour.city}.`}
                            </Text>
                        </View>
                    </View>

                    {/* Contact Action */}
                    <View className="bg-secondary p-10 rounded-[56px] items-center shadow-2xl relative overflow-hidden">
                      <View className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
                      <Text className="text-white/40 mb-4 font-inter-bold uppercase text-[10px] tracking-[4px]">Secure Contact Line</Text>
                      
                      {user?.isSubscribed ? (
                        <Text className="text-white text-4xl font-inter-black mb-10 tracking-[1px]">
                          +91 {selectedLabour.phone}
                        </Text>
                      ) : (
                        <View className="items-center mb-10">
                            <Text className="text-white text-4xl font-inter-black blur-lg opacity-20">
                            +91 XXXXX XXXXX
                            </Text>
                            <Text className="text-primary font-inter-black text-xs mt-2 uppercase">Subscription Locked</Text>
                        </View>
                      )}
                      
                      {!user?.isSubscribed ? (
                        <TouchableOpacity 
                            onPress={handleSubscribe}
                            className="bg-primary w-full py-7 rounded-[32px] flex-row items-center justify-center shadow-2xl shadow-primary/30"
                        >
                          <ShieldCheck color="white" size={24} strokeWidth={2.5} />
                          <Text className="text-white font-inter-black text-xl ml-3 uppercase tracking-tighter">Premium Access</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity 
                            onPress={() => Linking.openURL(`tel:+91${selectedLabour.phone}`)}
                            className="bg-emerald-600 w-full py-7 rounded-[32px] flex-row items-center justify-center shadow-2xl shadow-emerald-700/40"
                        >
                          <Phone color="white" size={24} fill="white" />
                          <Text className="text-white font-inter-black text-xl ml-3 uppercase tracking-tighter">Direct Call</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

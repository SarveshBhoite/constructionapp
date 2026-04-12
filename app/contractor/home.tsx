import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, Image, TextInput, Alert, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Filter, Phone, MapPin, Star, CreditCard, ChevronRight, X, LogOut, CheckCircle, Info, ShieldCheck, User, History, MessageCircle } from 'lucide-react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { CATEGORIES } from '../../src/constants/categories';
import { useAuthStore } from '../../src/store/authStore';
import axios from 'axios';
import * as Linking from 'expo-linking';

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
          Alert.alert('Thank You', 'Your rating has been submitted!');
          fetchWorkers(); // Refresh list to show new rating
      } catch (e) {
          Alert.alert('Error', 'Could not submit rating.');
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

        // 2. Open Razorpay Checkout (or Use Payment Link for Expo Go)
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
            name: 'Royal Construction',
            order_id: order.id,
            prefill: {
                email: 'contractor@example.com',
                contact: '919000000000',
                name: user?.name || 'Contractor'
            },
            theme: { color: '#1E40AF' }
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
  
  // Sidebar Component
  const Sidebar = () => (
      <Modal animationType="fade" transparent={true} visible={showMenu}>
          <View className="flex-1 flex-row">
              <TouchableOpacity activeOpacity={1} onPress={() => setShowMenu(false)} className="bg-black/50 w-1/4 h-full" />
              <View className="bg-white w-3/4 h-full p-8 pt-20">
                  <Text className="text-3xl font-black text-slate-900 mb-10">Menu</Text>
                  
                  <TouchableOpacity onPress={() => { setShowMenu(false); setActiveModal('profile'); }} className="flex-row items-center mb-8">
                      <View className="bg-blue-50 p-3 rounded-2xl mr-4"><User color="#1E40AF" size={24} /></View>
                      <Text className="text-xl font-bold text-slate-700">माझी प्रोफाइल (Profile)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => { setShowMenu(false); setActiveModal('transactions'); }} className="flex-row items-center mb-8">
                      <View className="bg-indigo-50 p-3 rounded-2xl mr-4"><History color="#4F46E5" size={24} /></View>
                      <Text className="text-xl font-bold text-slate-700">व्यवहार (Transactions)</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => { setShowMenu(false); setActiveModal('support'); }} className="flex-row items-center mb-10">
                      <View className="bg-emerald-50 p-3 rounded-2xl mr-4"><MessageCircle color="#059669" size={24} /></View>
                      <Text className="text-xl font-bold text-slate-700">मदत केंद्र (Support)</Text>
                  </TouchableOpacity>

                  <View className="h-[1px] bg-slate-100 w-full mb-10" />

                  <TouchableOpacity onPress={() => { logout(); router.replace('/'); }} className="flex-row items-center">
                      <View className="bg-rose-50 p-3 rounded-2xl mr-4"><LogOut color="#E11D48" size={24} /></View>
                      <Text className="text-xl font-bold text-rose-600">Log Out</Text>
                  </TouchableOpacity>
              </View>
          </View>
      </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <Sidebar />
      <View className="p-6 pb-0">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-slate-500 font-medium">Contractor Panel</Text>
            <Text className="text-2xl font-bold text-slate-900">{user?.name || 'Welcome'}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowMenu(true)} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <Search color="#1E40AF" size={20} />
          </TouchableOpacity>
        </View>

        {/* Subscription Alert Banner */}
        {!user?.isSubscribed && (
            <TouchableOpacity 
                onPress={handleSubscribe}
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
                      setUserRating(0); // Reset for modal
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
                        <Text className="ml-1 text-slate-800 font-bold">{item.rating || 4.5}</Text>
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

      {/* MODALS */}
      {/* Profile Modal */}
      {activeModal === 'profile' && (
          <Modal animationType="slide" transparent={true} visible={true}>
              <View className="flex-1 bg-black/60 justify-end">
                  <View className="bg-white rounded-t-[48px] p-8 h-[70%]">
                      <TouchableOpacity onPress={() => setActiveModal(null)} className="bg-slate-100 px-4 py-2 rounded-full self-center mb-6">
                          <Text className="text-slate-400 font-bold">Close</Text>
                      </TouchableOpacity>
                      <Text className="text-2xl font-bold mb-6 text-center">Contractor Profile</Text>
                      <View className="items-center mb-8">
                           <Image 
                              source={{ uri: `https://ui-avatars.com/api/?name=${user?.name}&background=1E40AF&color=fff` }} 
                              className="w-24 h-24 rounded-3xl mb-4"
                          />
                          <Text className="text-xl font-bold text-slate-900">{user?.name}</Text>
                          <Text className="text-slate-500 font-bold">{user?.phone}</Text>
                      </View>
                      <View className="space-y-4">
                          <View className="bg-slate-50 p-6 rounded-3xl">
                              <Text className="text-slate-400 font-bold text-xs uppercase mb-1">Company Name</Text>
                              <Text className="text-slate-900 font-bold">{user?.companyName || 'Individual'}</Text>
                          </View>
                          <View className="bg-slate-50 p-6 rounded-3xl">
                              <Text className="text-slate-400 font-bold text-xs uppercase mb-1">Subscription Status</Text>
                              <Text className={`font-bold ${user?.isSubscribed ? 'text-emerald-600' : 'text-blue-600'}`}>
                                  {user?.isSubscribed ? 'Active Subscription' : 'Not Subscribed'}
                              </Text>
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
                                      <CheckCircle color="#059669" size={20} />
                                  </View>
                                  <View className="flex-1">
                                      <Text className="text-slate-900 font-bold text-lg">Unlimited Access Purchase</Text>
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
                      <Text className="text-slate-400 text-center mb-6 px-4">Contact admin for any issues or queries.</Text>
                      
                      <TextInput 
                          placeholder="Tell us what you need help with..."
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
                  
                  {/* INTERACTIVE STARS */}
                  <View className="flex-row items-center space-x-2 mt-2 bg-slate-100 px-6 py-4 rounded-full">
                    {[1,2,3,4,5].map(star => (
                        <TouchableOpacity key={star} onPress={() => handleRating(star)}>
                           <Star size={24} color="#FBBF24" fill={ (userRating || selectedLabour.rating || 4.5) >= star ? "#FBBF24" : "transparent"} />
                        </TouchableOpacity>
                    ))}
                    <Text className="ml-2 text-slate-900 font-bold text-xl">{selectedLabour.rating || 4.5}</Text>
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
                            {selectedLabour.about || `${selectedLabour.name} is a highly skilled ${selectedLabour.categoryEn} based in ${selectedLabour.city}, ${selectedLabour.state}. With ${selectedLabour.experienceYears} years of experience, they specialize in professional construction and maintenance services.`}
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

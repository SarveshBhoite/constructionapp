import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, Image, TextInput, Alert, Modal, ActivityIndicator, StatusBar, Dimensions, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Search, Filter, Phone, MapPin, Star, CreditCard, ChevronRight, X, LogOut, CheckCircle2, ShieldCheck, User, History, MessageCircle, Menu, Wallet, Eye, Edit, Save, Briefcase, CardIcon } from 'lucide-react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { CATEGORIES, STATES } from '../../src/constants/categories';
import { useAuthStore } from '../../src/store/authStore';
import axios from 'axios';
import * as Linking from 'expo-linking';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
const RAZORPAY_KEY = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_S1OGtZgvN2t1r6';
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function LabourHome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const { user, setAuth } = useAuthStore();
  
  const [dbUser, setDbUser] = useState(user);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedMinRating, setSelectedMinRating] = useState<number>(0);
  
  const [selectedContractor, setSelectedContractor] = useState<any>(null);
  const [contractors, setContractors] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [showMenu, setShowMenu] = useState(false);
  const [activeModal, setActiveModal] = useState<'profile' | 'transactions' | 'support' | null>(null);
  const [supportMsg, setSupportMsg] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [userRating, setUserRating] = useState(0);

  // Profile Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});

  const fetchProfile = async () => {
    try {
      if (!user?.id) return;
      const response = await axios.get(`${API_URL}/auth/profile/labour/${user.id}`);
      setDbUser(response.data);
      setEditData(response.data);
      setAuth('labour', response.data);
    } catch (e) {}
  };

  const fetchTransactions = async () => {
      try {
          const res = await axios.get(`${API_URL}/payments/status/worker/${user?.id}`);
          setTransactions(res.data || []);
      } catch (e) {}
  };

  const fetchContractors = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/contractors`, {
        params: {
          category: selectedCategory,
          query: searchQuery,
          gender: selectedGender,
          minRating: selectedMinRating
        }
      });
      setContractors(response.data);
    } catch (error) {
      console.error("Fetch Contractors Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContractors();
    fetchProfile();
    fetchTransactions();
  }, [selectedCategory, searchQuery, selectedGender, selectedMinRating]);

  const handleUpdateProfile = async () => {
      try {
          setLoading(true);
          const res = await axios.put(`${API_URL}/auth/profile/labour/${user?.id}`, editData);
          setDbUser(res.data.user);
          setAuth('labour', res.data.user);
          setIsEditing(false);
          Alert.alert('Success', 'Profile updated successfully!');
      } catch (e) {
          Alert.alert('Error', 'Failed to update profile.');
      } finally {
          setLoading(false);
      }
  };

  const handleRating = async (ratingValue: number) => {
      if (!selectedContractor) return;
      try {
          await axios.post(`${API_URL}/reviews/contractor`, {
              contractorId: selectedContractor.id,
              workerId: user?.id,
              workerName: user?.name,
              rating: ratingValue
          });
          setUserRating(ratingValue);
          Alert.alert('Success', 'Rating submitted!');
          fetchContractors(); 
      } catch (e) {
          Alert.alert('Error', 'Could not submit rating.');
      }
  };

  const handleSubscribe = async () => {
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
                key: RAZORPAY_KEY,
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
  
  const Sidebar = () => (
      <Modal animationType="fade" transparent={true} visible={showMenu}>
          <View className="flex-1 flex-row">
              <TouchableOpacity activeOpacity={1} onPress={() => setShowMenu(false)} className="bg-black/40 w-1/4 h-full" />
              <View className="bg-white w-3/4 h-full p-8 pt-20 shadow-2xl" style={{ paddingTop: insets.top + 40 }}>
                  <Text className="text-3xl font-inter-black text-secondary mb-12">Worker Menu</Text>
                  
                  <TouchableOpacity onPress={() => { setShowMenu(false); setActiveModal('profile'); setIsEditing(false); }} className="flex-row items-center mb-8">
                      <View className="bg-slate-50 p-4 rounded-2xl mr-4"><User color="#0F172A" size={24} /></View>
                      <View>
                          <Text className="text-xl font-inter-bold text-slate-700">Profile</Text>
                          <Text className="text-xs text-slate-400 font-inter-medium">माझी प्रोफाइल</Text>
                      </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => { setShowMenu(false); setActiveModal('transactions'); }} className="flex-row items-center mb-8">
                      <View className="bg-slate-50 p-4 rounded-2xl mr-4"><History color="#0F172A" size={24} /></View>
                      <View>
                          <Text className="text-xl font-inter-bold text-slate-700">Transactions</Text>
                          <Text className="text-xs text-slate-400 font-inter-medium">व्यवहार</Text>
                      </View>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => { setShowMenu(false); setActiveModal('support'); }} className="flex-row items-center mb-12">
                      <View className="bg-slate-50 p-4 rounded-2xl mr-4"><MessageCircle color="#0F172A" size={24} /></View>
                      <View>
                          <Text className="text-xl font-inter-bold text-slate-700">Support</Text>
                          <Text className="text-xs text-slate-400 font-inter-medium">मदत केंद्र</Text>
                      </View>
                  </TouchableOpacity>

                  <View className="h-[1px] bg-slate-100 w-full mb-12" />

                  <TouchableOpacity onPress={() => { logout(); router.replace('/'); }} className="flex-row items-center">
                      <View className="bg-rose-50 p-4 rounded-2xl mr-4"><LogOut color="#E11D48" size={24} /></View>
                      <View>
                          <Text className="text-xl font-inter-bold text-rose-600">Log Out</Text>
                          <Text className="text-xs text-rose-300 font-inter-medium">बाहेर पडा</Text>
                      </View>
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
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-slate-400 font-inter-bold text-xs uppercase tracking-widest">Worker Network</Text>
            <Text className="text-3xl font-inter-black text-secondary">{dbUser?.name || 'Welcome'}</Text>
          </View>
          <TouchableOpacity onPress={() => setShowMenu(true)} className="bg-slate-50 p-4 rounded-[24px] border border-slate-100">
            <Menu color="#0F172A" size={24} />
          </TouchableOpacity>
        </View>

        {!dbUser?.isSubscribed && (
            <TouchableOpacity 
                onPress={handleSubscribe}
                className="bg-primary p-6 rounded-[32px] mb-6 flex-row items-center shadow-2xl shadow-primary/20"
            >
                <View className="bg-white/20 p-3 rounded-2xl mr-4">
                    <ShieldCheck color="white" size={24} />
                </View>
                <View className="flex-1">
                    <Text className="text-white font-inter-bold text-lg">Featured Unlock</Text>
                    <Text className="text-white/80 font-inter-medium text-xs">Be at the top for contractors.</Text>
                </View>
                <ChevronRight color="white" size={20} />
            </TouchableOpacity>
        )}

        <View className="flex-row items-center space-x-3 mb-6">
          <View className="flex-1 flex-row items-center bg-slate-50 p-5 rounded-[24px] border border-slate-100">
            <Search size={22} color="#94A3B8" />
            <TextInput 
              placeholder="Search contractors..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="flex-1 ml-3 font-inter-medium text-base text-secondary"
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4 -mx-6 px-6">
          <TouchableOpacity 
            onPress={() => setSelectedCategory(null)}
            className={`mr-3 px-6 py-3 rounded-[20px] ${!selectedCategory ? 'bg-secondary' : 'bg-slate-50 border border-slate-100'}`}
          >
            <Text className={`font-inter-bold ${!selectedCategory ? 'text-white' : 'text-slate-500'}`}>All Jobs</Text>
          </TouchableOpacity>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              className={`mr-3 px-6 py-3 rounded-[20px] ${selectedCategory === cat.id ? 'bg-secondary' : 'bg-slate-50 border border-slate-100'}`}
            >
              <Text className={`font-inter-bold ${selectedCategory === cat.id ? 'text-white' : 'text-slate-500'}`}>
                {cat.en}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View className="flex-row mb-6 mt-[-10]">
           <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-6 px-6">
                <View className="flex-row items-center mr-3">
                  <Filter size={16} color="#94A3B8" className="mr-2" />
                  <Text className="text-[10px] font-inter-bold text-slate-400 uppercase tracking-widest">Gender</Text>
                </View>
                {['all', 'male', 'female'].map(g => (
                    <TouchableOpacity 
                        key={g} 
                        onPress={() => setSelectedGender(g)}
                        className={`mr-2 px-4 py-2 rounded-xl ${selectedGender === g ? 'bg-blue-600' : 'bg-slate-100'}`}
                    >
                        <Text className={`font-inter-bold capitalize text-xs ${selectedGender === g ? 'text-white' : 'text-slate-600'}`}>{g}</Text>
                    </TouchableOpacity>
                ))}

                <View className="flex-row items-center mx-3">
                   <Star size={16} color="#94A3B8" className="mr-2" />
                   <Text className="text-[10px] font-inter-bold text-slate-400 uppercase tracking-widest">Rating</Text>
                </View>
                {[0, 3, 4, 5].map(r => (
                    <TouchableOpacity 
                        key={r} 
                        onPress={() => setSelectedMinRating(r)}
                        className={`mr-2 px-4 py-2 rounded-xl flex-row items-center ${selectedMinRating === r ? 'bg-amber-500' : 'bg-slate-100'}`}
                    >
                        <Text className={`font-inter-bold mr-1 text-xs ${selectedMinRating === r ? 'text-white' : 'text-slate-600'}`}>{r === 0 ? 'Any' : `${r}+`}</Text>
                        {r > 0 && <Star size={12} color={selectedMinRating === r ? 'white' : '#475569'} fill={selectedMinRating === r ? 'white' : 'transparent'} />}
                    </TouchableOpacity>
                ))}
             </ScrollView>
        </View>
      </View>

      <View className="flex-1 px-6">
        {loading && contractors.length === 0 ? (
            <ActivityIndicator size="large" color="#2563EB" className="mt-20" />
        ) : (
            <FlatList
                data={contractors}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
                renderItem={({ item }) => (
                <TouchableOpacity 
                    onPress={async () => {
                      setSelectedContractor(item);
                      setUserRating(0);
                      try { await axios.post(`${API_URL}/contractors/view/${item.id}`); } catch (e) {}
                    }}
                    className="bg-white p-6 rounded-[32px] mb-6 shadow-sm border border-slate-100 flex-row items-center"
                >
                    <Image source={{ uri: `https://ui-avatars.com/api/?name=${item.companyName || item.name}&background=0F172A&color=fff` }} className="w-16 h-16 rounded-[20px] mr-5" />
                    <View className="flex-1">
                    <View className="flex-row justify-between items-center mb-1">
                        <Text className="text-xl font-inter-bold text-secondary">{item.companyName || item.name}</Text>
                        <View className="flex-row items-center bg-amber-50 px-2 py-1 rounded-xl">
                            <Star size={12} color="#FBBF24" fill="#FBBF24" />
                            <Text className="ml-1 text-amber-700 font-inter-black text-[10px]">{item.rating ? item.rating.toFixed(1) : '0.0'}</Text>
                        </View>
                    </View>
                    <Text className="text-primary font-inter-bold mb-3 text-xs uppercase tracking-tight">
                        {item.categories && item.categories.length > 0 ? `${item.categories.length} Categories` : 'Contractor'}
                    </Text>
                    <View className="flex-row items-center">
                        <MapPin size={14} color="#64748B" />
                        <Text className="ml-1 text-slate-500 font-inter-medium text-xs">{item.city || 'Location N/A'}</Text>
                    </View>
                    </View>
                </TouchableOpacity>
                )}
                ListEmptyComponent={
                <View className="items-center mt-24">
                    <Search size={48} color="#CBD5E1" />
                    <Text className="text-slate-400 mt-4 font-inter-medium text-center">No contractors found.</Text>
                </View>
                }
            />
        )}
      </View>

      {/* Worker Details/Contractor View Modal */}
      {selectedContractor && (
        <Modal animationType="slide" transparent={true} visible={!!selectedContractor}>
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-[56px] shadow-2xl overflow-hidden" style={{ height: SCREEN_HEIGHT * 0.9 }}>
              <TouchableOpacity onPress={() => setSelectedContractor(null)} className="absolute top-6 right-6 z-10 bg-slate-100 p-3 rounded-full">
                <X color="#0F172A" size={24} />
              </TouchableOpacity>

              <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
              >
                <View className="p-8">
                    <View className="items-center mt-8 mb-10">
                        <Image 
                            source={{ uri: `https://ui-avatars.com/api/?name=${selectedContractor.companyName || selectedContractor.name}&background=0F172A&color=fff` }} 
                            className="w-40 h-40 rounded-[44px] mb-6 shadow-2xl border-4 border-slate-50" 
                        />
                        <Text className="text-3xl font-inter-black text-secondary tracking-tight mb-2 text-center">{selectedContractor.companyName || selectedContractor.name}</Text>
                        <Text className="text-slate-500 font-inter-bold text-lg mb-4 text-center tracking-tighter">Owner: {selectedContractor.name}</Text>
                        <View className="bg-amber-100 px-6 py-2 rounded-full flex-row items-center">
                            <Star size={18} color="#FBBF24" fill="#FBBF24" />
                            <Text className="ml-2 text-amber-900 font-inter-black text-lg">{selectedContractor.rating ? selectedContractor.rating.toFixed(1) : '0.0'}</Text>
                        </View>
                    </View>

                    <View className="bg-slate-50 p-8 rounded-[40px] border border-slate-100 mb-8 flex-row items-center">
                         <MapPin size={24} color="#2563EB" />
                         <View className="ml-5">
                             <Text className="text-slate-400 font-inter-bold text-[10px] uppercase tracking-widest">Base Location</Text>
                             <Text className="text-secondary font-inter-bold text-xl">{selectedContractor.city || 'N/A'}</Text>
                         </View>
                    </View>

                    <View className="mb-8">
                        <Text className="text-xl font-inter-black text-secondary mb-4 tracking-tight">Hiring Categories</Text>
                        <View className="flex-row flex-wrap">
                            {selectedContractor.categories && selectedContractor.categories.map((catId: string) => {
                                const catObj = CATEGORIES.find(c => c.id === catId);
                                return (
                                    <View key={catId} className="bg-primary/10 px-4 py-2 rounded-2xl mr-2 mb-2">
                                        <Text className="text-primary font-inter-bold text-sm tracking-tight">{catObj ? catObj.en : catId}</Text>
                                    </View>
                                )
                            })}
                            {(!selectedContractor.categories || selectedContractor.categories.length === 0) && (
                                <Text className="text-slate-500 font-inter-medium">General Construction</Text>
                            )}
                        </View>
                    </View>

                    {/* Rating Section */}
                    <View className="w-full bg-white p-8 rounded-[48px] items-center border border-slate-100 mb-10">
                        <Text className="text-lg font-inter-bold text-secondary mb-6 tracking-tight">Rate this Contractor</Text>
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

                    {/* Contact Action */}
                    <View className="bg-emerald-600 p-10 rounded-[56px] items-center shadow-2xl relative overflow-hidden">
                      <View className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10" />
                      <Text className="text-white/60 mb-2 font-inter-bold uppercase text-[10px] tracking-[4px]">Verified Number</Text>
                      
                      <Text className="text-white text-4xl font-inter-black mb-8 tracking-[1px]">
                        +91 {selectedContractor.phone}
                      </Text>
                      
                      <TouchableOpacity 
                          onPress={() => Linking.openURL(`tel:+91${selectedContractor.phone}`)}
                          className="bg-white w-full py-6 rounded-[32px] flex-row items-center justify-center shadow-2xl shadow-emerald-700/40"
                      >
                        <Phone color="#059669" size={24} fill="#059669" />
                        <Text className="text-emerald-700 font-inter-black text-xl ml-3 uppercase tracking-tighter">Direct Call</Text>
                      </TouchableOpacity>
                    </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}

      {/* Profile Modal - Expanded & Editable */}
      {activeModal === 'profile' && (
            <Modal animationType="slide" transparent={true} visible={true}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[48px] h-[92%] shadow-2xl">
                        <View className="p-8 pb-4 flex-row justify-between items-center border-b border-slate-50">
                            <TouchableOpacity onPress={() => setActiveModal(null)} className="bg-slate-50 p-3 rounded-full">
                                <X color="#94A3B8" size={24} />
                            </TouchableOpacity>
                            <Text className="text-2xl font-inter-black text-secondary">Profile Identity</Text>
                            <TouchableOpacity onPress={() => isEditing ? handleUpdateProfile() : setIsEditing(true)} className={`${isEditing ? 'bg-primary' : 'bg-slate-50'} p-3 rounded-full flex-row items-center px-4`}>
                                {isEditing ? <Save color="white" size={20} /> : <Edit color="#2563EB" size={20} />}
                                <Text className={`ml-2 font-inter-bold ${isEditing ? 'text-white' : 'text-primary'}`}>{isEditing ? 'Save' : 'Edit'}</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="p-8" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                            <View className="items-center mb-10">
                                <Image source={{ uri: dbUser?.profileImage || `https://ui-avatars.com/api/?name=${dbUser?.name}&background=2563EB&color=fff` }} className="w-28 h-28 rounded-[36px] shadow-xl mb-4 border-4 border-slate-50" />
                                <Text className="text-2xl font-inter-black text-secondary">{dbUser?.name}</Text>
                                <Text className="text-slate-400 font-inter-bold">{dbUser?.phone}</Text>
                            </View>

                            <View className="space-y-6">
                                <View className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 mb-4">
                                    <View className="flex-row items-center mb-4">
                                        <Briefcase size={20} color="#2563EB" />
                                        <Text className="ml-3 text-slate-400 font-inter-bold text-[10px] uppercase tracking-widest">Service & Experience</Text>
                                    </View>
                                    <Text className="text-secondary font-inter-bold text-lg mb-2">{dbUser?.categoryEn}</Text>
                                    <View className="flex-row items-center justify-between mt-4">
                                        <Text className="text-slate-500 font-inter-medium">Years of Experience</Text>
                                        {isEditing ? (
                                            <TextInput 
                                                keyboardType="numeric"
                                                value={editData?.experienceYears?.toString()}
                                                onChangeText={(val) => setEditData({...editData, experienceYears: parseInt(val) || 0})}
                                                className="bg-white px-6 py-2 rounded-xl text-primary font-inter-black border border-slate-100"
                                            />
                                        ) : (
                                            <Text className="text-secondary font-inter-black text-lg">{dbUser?.experienceYears || 0} Years</Text>
                                        )}
                                    </View>
                                    <View className="flex-row items-center justify-between mt-4">
                                        <Text className="text-slate-500 font-inter-medium">Daily Wages (₹)</Text>
                                        {isEditing ? (
                                            <TextInput 
                                                keyboardType="numeric"
                                                value={editData?.wages?.toString()}
                                                onChangeText={(val) => setEditData({...editData, wages: parseInt(val) || 0})}
                                                className="bg-white px-6 py-2 rounded-xl text-primary font-inter-black border border-slate-100"
                                            />
                                        ) : (
                                            <Text className="text-secondary font-inter-black text-lg">₹{dbUser?.wages || 0}</Text>
                                        )}
                                    </View>
                                </View>

                                <View className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 mb-4">
                                    <View className="flex-row items-center mb-4">
                                        <MapPin size={20} color="#2563EB" />
                                        <Text className="ml-3 text-slate-400 font-inter-bold text-[10px] uppercase tracking-widest">Operating Location</Text>
                                    </View>
                                    <View className="flex-row space-x-2">
                                        <View className="flex-1">
                                            <Text className="text-[10px] text-slate-400 mb-1 font-inter-bold">CITY</Text>
                                            {isEditing ? (
                                                <TextInput 
                                                    value={editData?.city}
                                                    onChangeText={(val) => setEditData({...editData, city: val})}
                                                    className="bg-white p-4 rounded-2xl font-inter-bold border border-slate-100"
                                                />
                                            ) : (
                                                <Text className="text-secondary font-inter-bold">{dbUser?.city}</Text>
                                            )}
                                        </View>
                                        <View className="flex-1">
                                            <Text className="text-[10px] text-slate-400 mb-1 font-inter-bold">STATE</Text>
                                             {isEditing ? (
                                                <TextInput 
                                                    value={editData?.state}
                                                    onChangeText={(val) => setEditData({...editData, state: val})}
                                                    className="bg-white p-4 rounded-2xl font-inter-bold border border-slate-100"
                                                />
                                            ) : (
                                                <Text className="text-secondary font-inter-bold">{dbUser?.state}</Text>
                                            )}
                                        </View>
                                    </View>
                                </View>

                                <View className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 mb-20">
                                    <Text className="text-slate-400 font-inter-bold text-[10px] uppercase tracking-widest mb-4 leading-4">Professional Bio (About me)</Text>
                                    {isEditing ? (
                                        <TextInput 
                                            multiline
                                            numberOfLines={4}
                                            value={editData?.about}
                                            onChangeText={(val) => setEditData({...editData, about: val})}
                                            className="bg-white p-6 rounded-[28px] font-inter-medium text-slate-700 h-32 border border-slate-100"
                                        />
                                    ) : (
                                        <Text className="text-slate-700 font-inter-medium text-base leading-6">
                                            {dbUser?.about || 'No description provided yet. Add one to attract more contractors!'}
                                        </Text>
                                    )}
                                </View>
                            </View>
                        </ScrollView>
                    </View>
                </View>
                </KeyboardAvoidingView>
            </Modal>
        )}

      {/* Transactions Modal */}
      {activeModal === 'transactions' && (
            <Modal animationType="slide" transparent={true} visible={true}>
                <View className="flex-1 bg-black/60 justify-end">
                    <View className="bg-white rounded-t-[48px] p-8 h-[70%]" style={{ paddingBottom: insets.bottom + 20 }}>
                        <TouchableOpacity onPress={() => setActiveModal(null)} className="bg-slate-50 p-3 rounded-full self-start mb-6">
                            <X color="#94A3B8" size={24} />
                        </TouchableOpacity>
                        <Text className="text-3xl font-inter-black mb-10 text-center text-secondary">Transaction Ledger</Text>
                        <FlatList 
                            data={transactions}
                            keyExtractor={(item: any) => item.id}
                            showsVerticalScrollIndicator={false}
                            renderItem={({item}) => (
                                <View className="bg-slate-50 p-6 rounded-[32px] mb-4 flex-row items-center border border-slate-100">
                                    <View className="bg-emerald-100 p-3 rounded-2xl mr-5"><CheckCircle2 color="#059669" size={24} /></View>
                                    <View className="flex-1">
                                        <Text className="text-secondary font-inter-bold text-lg">Featured Unlock</Text>
                                        <Text className="text-slate-400 font-inter-medium">{new Date(item.createdAt).toLocaleDateString()}</Text>
                                    </View>
                                    <Text className="text-secondary font-inter-black text-xl">₹{item.amount}</Text>
                                </View>
                            )}
                            ListEmptyComponent={
                                <View className="items-center mt-20">
                                    <Wallet size={48} color="#CBD5E1" />
                                    <Text className="text-slate-400 font-inter-medium text-lg mt-4">No recent activity.</Text>
                                </View>
                            }
                        />
                         <TouchableOpacity onPress={() => setActiveModal(null)} className="mt-6 bg-slate-900 w-full py-6 rounded-[32px] items-center">
                            <Text className="text-white font-inter-bold text-xl">Close</Text>
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
                          <View className="flex-row justify-between items-center mb-8">
                             <Text className="text-slate-400 font-inter-bold text-xs uppercase tracking-widest">Support Center</Text>
                             <TouchableOpacity onPress={() => setActiveModal(null)} className="bg-slate-100 px-4 py-2 rounded-full flex-row items-center border border-slate-200">
                                 <X color="#64748B" size={16} />
                                 <Text className="ml-2 text-slate-500 font-inter-bold text-xs">Close</Text>
                             </TouchableOpacity>
                         </View>
                        <Text className="text-3xl font-inter-black mb-4 text-center text-secondary">Concierge Help</Text>
                        <Text className="text-slate-400 text-center mb-10 font-inter-medium text-lg px-6 leading-6">Describe your issue and we'll respond within 24 hours.</Text>
                        <TextInput placeholder="How can we assist you today?" placeholderTextColor="#94A3B8" multiline numberOfLines={4} value={supportMsg} onChangeText={setSupportMsg} className="bg-slate-50 p-8 rounded-[36px] font-inter-medium text-lg text-secondary h-40 mb-10 border border-slate-100" />
                        <TouchableOpacity onPress={submitSupport} disabled={loading} className="bg-primary w-full py-6 rounded-[32px] flex-row items-center justify-center shadow-2xl shadow-primary/20">
                            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-inter-bold text-xl">Inquiry Support</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )}
    </View>
  );
}

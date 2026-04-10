import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, FlatList, Image, TextInput, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Filter, Phone, MapPin, Star, CreditCard, ChevronRight, X, LogOut, CheckCircle, Info } from 'lucide-react-native';
import { CATEGORIES } from '../../src/constants/categories';
import { useAuthStore } from '../../src/store/authStore';

// Mock Data
const MOCK_LABOURS = [
  { id: '1', name: 'Rahul Chavan', category: 'electrician', city: 'Pune', rating: 4.8, experience: '5 yrs', phone: '9876543210', image: 'https://i.pravatar.cc/150?u=1' },
  { id: '2', name: 'Amit Patil', category: 'plumber', city: 'Mumbai', rating: 4.5, experience: '3 yrs', phone: '8877665544', image: 'https://i.pravatar.cc/150?u=2' },
  { id: '3', name: 'Sagar Kamble', category: 'painter', city: 'Pune', rating: 4.9, experience: '7 yrs', phone: '7766554433', image: 'https://i.pravatar.cc/150?u=3' },
  { id: '4', name: 'Vijay Shinde', category: 'carpenter', city: 'Nagpur', rating: 4.2, experience: '4 yrs', phone: '9988776655', image: 'https://i.pravatar.cc/150?u=4' },
];

export default function ContractorHome() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLabour, setSelectedLabour] = useState<any>(null);

  const filteredLabours = MOCK_LABOURS.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? l.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const handleSubscribe = () => {
    Alert.alert(
      'Full Access Subscription',
      'Pay ₹500 to see mobile numbers of all labours for 1 month.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Subscribe Now', 
          onPress: () => {
            setIsSubscribed(true);
            Alert.alert('Success!', 'Your subscription is now active! You can now see mobile numbers.');
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-6 pb-0">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-slate-500 text-lg">Contractor Panel</Text>
            <Text className="text-2xl font-bold text-slate-800">Royal Construction</Text>
          </View>
          <TouchableOpacity onPress={() => { logout(); router.replace('/'); }} className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
            <LogOut color="#64748B" size={20} />
          </TouchableOpacity>
        </View>

        {/* Search & Filter */}
        <View className="flex-row items-center space-x-3 mb-6">
          <View className="flex-1 flex-row items-center bg-white p-4 rounded-2xl border border-slate-200">
            <Search size={20} color="#94A3B8" />
            <TextInput 
              placeholder="Search by name or city"
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
            className={`mr-3 px-6 py-3 rounded-full border ${!selectedCategory ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'}`}
          >
            <Text className={`font-bold ${!selectedCategory ? 'text-white' : 'text-slate-600'}`}>All</Text>
          </TouchableOpacity>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              className={`mr-3 px-6 py-3 rounded-full border ${selectedCategory === cat.id ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'}`}
            >
              <Text className={`font-bold ${selectedCategory === cat.id ? 'text-white' : 'text-slate-600'}`}>{cat.en}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Subscription Banner */}
      {!isSubscribed && (
        <View className="mx-6 mb-6 bg-slate-800 p-5 rounded-3xl flex-row items-center justify-between shadow-xl">
          <View className="flex-1 mr-4">
            <Text className="text-white font-bold text-lg">Unlock Contact Numbers</Text>
            <Text className="text-slate-400">See mobile numbers of all listed labours.</Text>
          </View>
          <TouchableOpacity 
            onPress={handleSubscribe}
            className="bg-blue-500 px-5 py-3 rounded-2xl"
          >
            <Text className="text-white font-bold">₹500 / month</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Labour List */}
      <FlatList
        data={filteredLabours}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity 
            onPress={() => setSelectedLabour(item)}
            className="bg-white p-5 rounded-3xl mb-6 shadow-sm border border-slate-100 flex-row items-center"
          >
            <Image source={{ uri: item.image }} className="w-20 h-20 rounded-2xl mr-5" />
            <View className="flex-1">
              <View className="flex-row justify-between items-center mb-1">
                <Text className="text-xl font-bold text-slate-800">{item.name}</Text>
                <View className="flex-row items-center">
                  <Star size={14} color="#FBBF24" fill="#FBBF24" />
                  <Text className="ml-1 text-slate-600 font-bold">{item.rating}</Text>
                </View>
              </View>
              <Text className="text-blue-600 font-bold mb-2 uppercase text-xs">{item.category}</Text>
              <View className="flex-row items-center opacity-60">
                <MapPin size={16} color="#64748B" />
                <Text className="ml-1 text-slate-600 font-medium italic">{item.city}</Text>
                <Text className="mx-2 text-slate-300">|</Text>
                <Text className="text-slate-600 font-medium capitalize italic">{item.experience}</Text>
              </View>
            </View>
            <ChevronRight color="#CBD5E1" size={24} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Search size={48} color="#CBD5E1" />
            <Text className="text-slate-400 mt-4 text-center">No labours found in this category.</Text>
          </View>
        }
      />

      {/* Labour Detail Modal */}
      {selectedLabour && (
        <Modal animationType="slide" transparent={true} visible={!!selectedLabour}>
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-[40px] p-8 h-[80%] pb-12">
              <TouchableOpacity onPress={() => setSelectedLabour(null)} className="items-center py-2 mb-4 bg-slate-100 w-12 rounded-full self-center">
                <X color="#94A3B8" size={24} />
              </TouchableOpacity>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="items-center mb-8">
                  <Image source={{ uri: selectedLabour.image }} className="w-32 h-32 rounded-[40px] mb-6 shadow-xl" />
                  <Text className="text-3xl font-bold text-slate-800">{selectedLabour.name}</Text>
                  <Text className="text-blue-600 font-bold text-lg mb-1">{selectedLabour.category.toUpperCase()}</Text>
                  <View className="flex-row items-center">
                    <Star size={20} color="#FBBF24" fill="#FBBF24" />
                    <Text className="ml-2 text-slate-600 text-xl font-bold">{selectedLabour.rating} / 5.0</Text>
                  </View>
                </View>

                <View className="flex-row justify-between mb-8">
                    <View className="bg-slate-50 p-4 rounded-3xl flex-1 mr-3 items-center">
                        <Text className="text-slate-400 font-medium mb-1 uppercase text-xs">Experience</Text>
                        <Text className="text-slate-800 font-bold text-lg">{selectedLabour.experience}</Text>
                    </View>
                    <View className="bg-slate-50 p-4 rounded-3xl flex-1 ml-3 items-center">
                        <Text className="text-slate-400 font-medium mb-1 uppercase text-xs">Location</Text>
                        <Text className="text-slate-800 font-bold text-lg">{selectedLabour.city}</Text>
                    </View>
                </View>

                {/* Contact Area */}
                <View className="bg-slate-800 p-8 rounded-[40px] items-center shadow-2xl">
                  <Text className="text-white/60 mb-2 font-medium">Contact Details</Text>
                  {isSubscribed ? (
                    <Text className="text-white text-4xl font-bold mb-4 tracking-tighter">
                      +91 {selectedLabour.phone}
                    </Text>
                  ) : (
                    <Text className="text-white text-4xl font-bold mb-4 blur-sm opacity-20">
                      +91 XXXXX XXXXX
                    </Text>
                  )}
                  
                  {!isSubscribed ? (
                    <TouchableOpacity 
                        onPress={handleSubscribe}
                        className="bg-blue-500 w-full p-5 rounded-3xl flex-row items-center justify-center"
                    >
                      <CreditCard color="white" size={24} />
                      <Text className="text-white font-bold text-xl ml-3">Subscribe to View</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity className="bg-green-500 w-full p-5 rounded-3xl flex-row items-center justify-center">
                      <Phone color="white" size={24} />
                      <Text className="text-white font-bold text-xl ml-3">Call Now</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View className="mt-8 mb-12">
                    <Text className="text-xl font-bold text-slate-800 mb-4">About Worker</Text>
                    <Text className="text-slate-500 text-lg leading-7">
                        Specialized in internal and external {selectedLabour.category} work. Known for punctuality and high-quality finish. Over {selectedLabour.experience} of fieldwork experience across various sites.
                    </Text>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

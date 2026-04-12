import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, FlatList, Image, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, LogOut, CheckCircle2, XCircle, FileText, ChevronRight, Users, Building, AlertTriangle, Activity } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/authStore';
import axios from 'axios';
import { Modal } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';
interface Contractor {
  id: string;
  name: string;
  phone: string;
  companyName?: string;
  idProof?: string;
  isApproved: boolean;
}

  const [activeTab, setActiveTab] = useState<'contractors' | 'support'>('contractors');
  const [tickets, setTickets] = useState<any[]>([]);

  const fetchPendingContractors = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/pending-contractors`);
      setContractors(response.data);
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSupportTickets = async () => {
    try {
        const response = await axios.get(`${API_URL}/support/tickets`);
        setTickets(response.data);
    } catch (e) {}
  };

  useEffect(() => {
    if (activeTab === 'contractors') fetchPendingContractors();
    else fetchSupportTickets();
  }, [activeTab]);

  const onRefresh = () => {
    setRefreshing(true);
    if (activeTab === 'contractors') fetchPendingContractors();
    else fetchSupportTickets();
  };

  const updateTicketStatus = async (id: string, status: string) => {
      try {
          await axios.patch(`${API_URL}/support/ticket/${id}`, { status });
          fetchSupportTickets();
          Alert.alert('Updated', 'Ticket status updated to ' + status);
      } catch (e) {}
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-6 pb-0">
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-slate-500 font-bold uppercase tracking-widest text-xs">System Admin</Text>
            <Text className="text-3xl font-bold text-slate-800">Control Panel</Text>
          </View>
          <TouchableOpacity 
            onPress={() => { logout(); router.replace('/'); }}
            className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100"
          >
            <LogOut color="#EF4444" size={20} />
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View className="flex-row bg-slate-200/50 p-2 rounded-[28px] mb-8">
            <TouchableOpacity 
                onPress={() => setActiveTab('contractors')}
                className={`flex-1 py-4 rounded-3xl items-center ${activeTab === 'contractors' ? 'bg-white shadow-sm' : ''}`}
            >
                <Text className={`font-bold ${activeTab === 'contractors' ? 'text-slate-900' : 'text-slate-500'}`}>Contractors</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => setActiveTab('support')}
                className={`flex-1 py-4 rounded-3xl items-center ${activeTab === 'support' ? 'bg-white shadow-sm' : ''}`}
            >
                <Text className={`font-bold ${activeTab === 'support' ? 'text-slate-900' : 'text-slate-500'}`}>Support</Text>
            </TouchableOpacity>
        </View>

        {activeTab === 'contractors' && <Text className="text-xl font-bold text-slate-800 mb-6">Approval Queue</Text>}
        {activeTab === 'support' && <Text className="text-xl font-bold text-slate-800 mb-6">Support Tickets</Text>}
      </View>

      {activeTab === 'contractors' ? (
          loading ? (
              <View className="flex-1 items-center justify-center">
                  <ActivityIndicator size="large" color="#1E40AF" />
                  <Text className="text-slate-400 mt-4">Loading queue...</Text>
              </View>
          ) : (
              <FlatList
                data={contractors}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1E40AF"]} />}
                renderItem={({ item }) => (
                  <View className="bg-white p-6 rounded-[40px] mb-6 shadow-sm border border-slate-100">
                    <View className="flex-row justify-between items-start mb-6">
                        <View className="flex-row items-center flex-1">
                            <View className="bg-blue-50 p-4 rounded-3xl mr-4">
                                <Building color="#1E40AF" size={28} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-2xl font-bold text-slate-800" numberOfLines={1}>{item.companyName || item.name}</Text>
                                <Text className="text-slate-500 font-medium">Owner: {item.name}</Text>
                            </View>
                        </View>
                    </View>
                    <View className="bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100">
                        <TouchableOpacity onPress={() => setSelectedDoc(item.idProof || null)}>
                            <Image source={{ uri: item.idProof }} className="w-full h-40 rounded-2xl mb-4" />
                        </TouchableOpacity>
                        <Text className="text-slate-400">Phone: {item.phone}</Text>
                    </View>
                    <View className="flex-row space-x-4">
                        <TouchableOpacity onPress={() => handleAction(item.id, 'reject')} className="flex-1 bg-slate-100 p-5 rounded-2xl items-center"><Text className="text-red-500 font-bold">Reject</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => handleAction(item.id, 'approve')} className="flex-1 bg-blue-600 p-5 rounded-2xl items-center"><Text className="text-white font-bold">Approve</Text></TouchableOpacity>
                    </View>
                  </View>
                )}
                ListEmptyComponent={<Text className="text-center text-slate-400 mt-20">No pending contractors.</Text>}
              />
          )
      ) : (
          <FlatList 
            data={tickets}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1E40AF"]} />}
            renderItem={({item}) => (
                <View className="bg-white p-6 rounded-[32px] mb-6 border border-slate-100 shadow-sm">
                    <View className="flex-row justify-between mb-4">
                        <Text className="text-slate-400 font-black uppercase text-[10px] tracking-widest">{item.role}</Text>
                        <View className={`px-3 py-1 rounded-full ${item.status === 'OPEN' ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                            <Text className={`font-bold text-[10px] ${item.status === 'OPEN' ? 'text-amber-600' : 'text-emerald-600'}`}>{item.status}</Text>
                        </View>
                    </View>
                    <Text className="text-xl font-bold text-slate-900 mb-2">{item.userName}</Text>
                    <Text className="text-slate-600 mb-6 text-lg">{item.message}</Text>
                    <View className="flex-row space-x-3">
                        <TouchableOpacity 
                            onPress={() => updateTicketStatus(item.id, 'RESOLVED')}
                            disabled={item.status === 'RESOLVED'}
                            className="bg-emerald-600 px-6 py-3 rounded-2xl flex-row items-center"
                        >
                            <CheckCircle2 color="white" size={16} />
                            <Text className="text-white font-bold ml-2">Resolve</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                             onPress={() => Linking.openURL(`tel:${item.userId}`)} // Assuming userId can be phone or fetched
                             className="bg-slate-100 px-6 py-3 rounded-2xl"
                        >
                            <Text className="text-slate-600 font-bold">Contact User</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
          />
      )}
    </SafeAreaView>
  );
}
      {/* Document Viewer Modal */}
      {selectedDoc && (
        <Modal animationType="fade" transparent={true} visible={!!selectedDoc}>
          <View className="flex-1 bg-black/95 justify-center items-center">
            <TouchableOpacity 
              onPress={() => setSelectedDoc(null)}
              className="absolute top-12 right-6 z-10 bg-white/20 p-3 rounded-full"
            >
              <XCircle color="white" size={32} />
            </TouchableOpacity>
            
            <Image 
              source={{ uri: selectedDoc }} 
              className="w-full h-[80%]" 
              resizeMode="contain" 
            />
            
            <Text className="text-white/60 mt-6 font-medium">Identity Document Verification</Text>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

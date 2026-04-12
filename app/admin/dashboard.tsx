import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, Image, Alert, ActivityIndicator, RefreshControl, Modal, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, LogOut, CheckCircle2, XCircle, FileText, ChevronRight, Users, Building, AlertTriangle, Activity, Phone, MapPin } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/authStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [contractors, setContractors] = useState<any[]>([]);
  const [allWorkers, setAllWorkers] = useState<any[]>([]);
  const [allContractors, setAllContractors] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'verification' | 'users' | 'support'>('verification');
  const [userListType, setUserListType] = useState<'workers' | 'contractors'>('workers');
  const [tickets, setTickets] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingRes, statsRes, workersRes, contrRes, ticketsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/pending-contractors`),
        axios.get(`${API_URL}/admin/stats`),
        axios.get(`${API_URL}/admin/workers`),
        axios.get(`${API_URL}/admin/contractors`),
        axios.get(`${API_URL}/support/tickets`)
      ]);
      setContractors(pendingRes.data);
      setStats(statsRes.data);
      setAllWorkers(workersRes.data);
      setAllContractors(contrRes.data);
      setTickets(ticketsRes.data);
    } catch (error) {
      console.error('Fetch Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Contractor?`,
      `Are you sure you want to ${action} this contractor's application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
              try {
                if (action === 'approve') {
                    await axios.post(`${API_URL}/admin/approve-contractor/${id}`);
                } else {
                    await axios.delete(`${API_URL}/admin/reject-contractor/${id}`);
                }
                fetchData();
                Alert.alert('Success', `Contractor has been ${action}d.`);
              } catch (error) {
                Alert.alert('Error', `Failed to ${action} contractor.`);
              }
          } 
        }
      ]
    );
  };

  const updateTicketStatus = async (id: string, status: string) => {
      try {
          await axios.patch(`${API_URL}/support/ticket/${id}`, { status });
          fetchData();
          Alert.alert('Updated', 'Ticket status updated to ' + status);
      } catch (e) {}
  };

  const renderStats = () => (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-8 -mx-6 px-6">
          <View className="bg-blue-600 p-6 rounded-[32px] w-48 mr-4 shadow-xl shadow-blue-200">
              <Users color="white" size={24} />
              <Text className="text-white/60 mt-3 font-medium">Total Workers</Text>
              <Text className="text-white text-3xl font-black">{stats?.workerCount || 0}</Text>
          </View>
          <View className="bg-slate-800 p-6 rounded-[32px] w-48 mr-4 shadow-xl shadow-slate-300">
              <Building color="#10B981" size={24} />
              <Text className="text-white/60 mt-3 font-medium">Total Contractors</Text>
              <Text className="text-white text-3xl font-black">{stats?.contractorCount || 0}</Text>
          </View>
          <View className="bg-amber-500 p-6 rounded-[32px] w-48 mr-4 shadow-xl shadow-amber-200">
              <AlertTriangle color="white" size={24} />
              <Text className="text-white/60 mt-3 font-medium">Pending Apps</Text>
              <Text className="text-white text-3xl font-black">{stats?.pendingContractors || 0}</Text>
          </View>
          <View className="bg-emerald-600 p-6 rounded-[32px] w-48 mr-4 shadow-xl shadow-emerald-200">
              <Activity color="white" size={24} />
              <Text className="text-white/60 mt-3 font-medium">Active Tickets</Text>
              <Text className="text-white text-3xl font-black">{stats?.openTickets || 0}</Text>
          </View>
      </ScrollView>
  );

  return (
    <View className="flex-1 bg-slate-50" style={{ paddingTop: insets.top }}>
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

        {renderStats()}

        {/* Tab Switcher */}
        <View className="flex-row bg-slate-200/50 p-2 rounded-[28px] mb-8">
            <TouchableOpacity 
                onPress={() => setActiveTab('verification')}
                className={`flex-1 py-4 rounded-3xl items-center ${activeTab === 'verification' ? 'bg-white shadow-sm' : ''}`}
            >
                <Text className={`font-bold ${activeTab === 'verification' ? 'text-slate-900' : 'text-slate-500'}`}>Approvals</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => setActiveTab('users')}
                className={`flex-1 py-4 rounded-3xl items-center ${activeTab === 'users' ? 'bg-white shadow-sm' : ''}`}
            >
                <Text className={`font-bold ${activeTab === 'users' ? 'text-slate-900' : 'text-slate-500'}`}>Users</Text>
            </TouchableOpacity>
            <TouchableOpacity 
                onPress={() => setActiveTab('support')}
                className={`flex-1 py-4 rounded-3xl items-center ${activeTab === 'support' ? 'bg-white shadow-sm' : ''}`}
            >
                <Text className={`font-bold ${activeTab === 'support' ? 'text-slate-900' : 'text-slate-500'}`}>Support</Text>
            </TouchableOpacity>
        </View>

        {activeTab === 'users' && (
            <View className="flex-row space-x-2 mb-6">
                <TouchableOpacity 
                    onPress={() => setUserListType('workers')}
                    className={`px-4 py-2 rounded-full ${userListType === 'workers' ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                    <Text className={`font-bold ${userListType === 'workers' ? 'text-white' : 'text-slate-500'}`}>Workers</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setUserListType('contractors')}
                    className={`px-4 py-2 rounded-full ${userListType === 'contractors' ? 'bg-blue-600' : 'bg-slate-200'}`}
                >
                    <Text className={`font-bold ${userListType === 'contractors' ? 'text-white' : 'text-slate-500'}`}>Contractors</Text>
                </TouchableOpacity>
            </View>
        )}
      </View>

      {loading && !refreshing ? (
          <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#1E40AF" />
              <Text className="text-slate-400 mt-4">Loading data...</Text>
          </View>
      ) : (
          <FlatList
            data={activeTab === 'verification' ? contractors : activeTab === 'support' ? tickets : userListType === 'workers' ? allWorkers : allContractors}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1E40AF"]} />}
            renderItem={({ item }) => {
                if (activeTab === 'verification') {
                    return (
                        <View className="bg-white p-6 rounded-[40px] mb-6 shadow-sm border border-slate-100">
                            <View className="flex-row items-center mb-6">
                                <View className="bg-blue-50 p-4 rounded-3xl mr-4">
                                    <Building color="#1E40AF" size={28} />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-2xl font-bold text-slate-800" numberOfLines={1}>{item.companyName || item.name}</Text>
                                    <Text className="text-slate-500 font-medium">Owner: {item.name}</Text>
                                </View>
                            </View>
                            <View className="bg-slate-50 p-6 rounded-3xl mb-8 border border-slate-100">
                                {item.idProof && (
                                <TouchableOpacity onPress={() => setSelectedDoc(item.idProof || null)}>
                                    <Image source={{ uri: item.idProof }} className="w-full h-40 rounded-2xl mb-4" />
                                </TouchableOpacity>
                                )}
                                <Text className="text-slate-400">Phone: {item.phone}</Text>
                            </View>
                            <View className="flex-row space-x-4">
                                <TouchableOpacity onPress={() => handleAction(item.id, 'reject')} className="flex-1 bg-slate-100 p-5 rounded-2xl items-center"><Text className="text-red-500 font-bold">Reject</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => handleAction(item.id, 'approve')} className="flex-1 bg-blue-600 p-5 rounded-2xl items-center"><Text className="text-white font-bold">Approve</Text></TouchableOpacity>
                            </View>
                        </View>
                    );
                } else if (activeTab === 'support') {
                    return (
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
                                <TouchableOpacity onPress={() => updateTicketStatus(item.id, 'RESOLVED')} disabled={item.status === 'RESOLVED'} className="bg-emerald-600 px-6 py-3 rounded-2xl flex-row items-center"><CheckCircle2 color="white" size={16} /><Text className="text-white font-bold ml-2">Resolve</Text></TouchableOpacity>
                                <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.userId}`)} className="bg-slate-100 px-6 py-3 rounded-2xl"><Text className="text-slate-600 font-bold">Contact</Text></TouchableOpacity>
                            </View>
                        </View>
                    );
                } else {
                    // Users List
                    return (
                        <View className="bg-white p-5 rounded-[32px] mb-4 border border-slate-100 shadow-sm flex-row items-center">
                            <Image 
                                source={{ uri: item.profileImage || `https://ui-avatars.com/api/?name=${item.name}&background=1E40AF&color=fff` }} 
                                className="w-16 h-16 rounded-2xl mr-4" 
                            />
                            <View className="flex-1">
                                <Text className="text-xl font-bold text-slate-900">{item.name}</Text>
                                <Text className="text-slate-500 font-medium">{userListType === 'workers' ? item.categoryEn : item.companyName || 'Individual'}</Text>
                                <View className="flex-row items-center mt-1">
                                    <Phone size={12} color="#94A3B8" />
                                    <Text className="text-slate-400 text-xs ml-1">{item.phone}</Text>
                                    <Text className="mx-2 text-slate-200">|</Text>
                                    <MapPin size={12} color="#94A3B8" />
                                    <Text className="text-slate-400 text-xs ml-1">{item.city}</Text>
                                </View>
                            </View>
                            {userListType === 'contractors' && (
                                <View className={`px-2 py-1 rounded-lg ${item.isApproved ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                    <Text className={`text-[10px] font-bold ${item.isApproved ? 'text-emerald-600' : 'text-amber-600'}`}>{item.isApproved ? 'VERIFIED' : 'PENDING'}</Text>
                                </View>
                            )}
                        </View>
                    );
                }
            }}
            ListEmptyComponent={<Text className="text-center text-slate-400 mt-20">All caught up!</Text>}
          />
      )}

      {/* Document Viewer Modal */}
      {selectedDoc && (
        <Modal animationType="fade" transparent={true} visible={!!selectedDoc}>
          <View className="flex-1 bg-black/95 justify-center items-center">
            <TouchableOpacity onPress={() => setSelectedDoc(null)} className="absolute top-12 right-6 z-10 bg-white/20 p-3 rounded-full"><XCircle color="white" size={32} /></TouchableOpacity>
            <Image source={{ uri: selectedDoc }} className="w-full h-[80%]" resizeMode="contain" />
            <Text className="text-white/60 mt-6 font-medium">Verification Document</Text>
          </View>
        </Modal>
      )}
    </View>
  );
}

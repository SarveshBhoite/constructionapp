import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Alert, Image, StatusBar, RefreshControl, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Users, ShieldCheck, Clock, MessageSquare, LogOut, Search, MapPin, CheckCircle2, ChevronRight, LayoutDashboard, UserCheck, X, FileText, ExternalLink } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/authStore';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  
  const [activeTab, setActiveTab] = useState<'pending' | 'users' | 'support'>('pending');
  const [userTab, setUserTab] = useState<'workers' | 'contractors'>('workers');
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [pendingContractors, setPendingContractors] = useState<any[]>([]);
  const [allWorkers, setAllWorkers] = useState<any[]>([]);
  const [allContractors, setAllContractors] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      if (!refreshing) setLoading(true);
      const [statsRes, pendingRes, workersRes, contractorsRes, ticketsRes] = await Promise.all([
        axios.get(`${API_URL}/admin/stats`),
        axios.get(`${API_URL}/admin/pending-contractors`),
        axios.get(`${API_URL}/admin/workers`),
        axios.get(`${API_URL}/admin/contractors`),
        axios.get(`${API_URL}/admin/support-tickets`)
      ]);
      
      setStats(statsRes.data);
      setPendingContractors(pendingRes.data);
      setAllWorkers(workersRes.data);
      setAllContractors(contractorsRes.data);
      setTickets(ticketsRes.data);
    } catch (error: any) {
      console.error("Admin Fetch Error:", error?.response?.data || error.message);
      Alert.alert('System Error', 'Could not sync with administration server.');
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

  const handleApproval = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      if (action === 'APPROVED') {
          await axios.post(`${API_URL}/admin/approve-contractor/${id}`);
      } else {
          await axios.delete(`${API_URL}/admin/reject-contractor/${id}`);
      }
      Alert.alert('Success', `Contractor ${action.toLowerCase()} successfully`);
      fetchData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update contractor status');
    }
  };

  const StatsSummary = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-10 -mx-6 px-6">
        <View className="bg-secondary p-7 rounded-[40px] mr-4 shadow-xl shadow-secondary/20 w-44">
            <View className="bg-white/10 p-3 rounded-2xl self-start mb-4"><Users color="white" size={20} /></View>
            <Text className="text-white font-inter-black text-3xl mb-1">{stats?.totalWorkers || 0}</Text>
            <Text className="text-white/40 font-inter-bold text-[10px] uppercase tracking-widest">Total Workers</Text>
        </View>
        <View className="bg-primary p-7 rounded-[40px] mr-4 shadow-xl shadow-primary/20 w-44">
            <View className="bg-white/10 p-3 rounded-2xl self-start mb-4"><ShieldCheck color="white" size={20} /></View>
            <Text className="text-white font-inter-black text-3xl mb-1">{stats?.totalContractors || 0}</Text>
            <Text className="text-white/40 font-inter-bold text-[10px] uppercase tracking-widest">Contractors</Text>
        </View>
        <View className="bg-slate-50 p-7 rounded-[40px] mr-4 border border-slate-100 w-44">
            <View className="bg-indigo-100 p-3 rounded-2xl self-start mb-4"><Clock color="#4F46E5" size={20} /></View>
            <Text className="text-secondary font-inter-black text-3xl mb-1">{stats?.pendingContractors || 0}</Text>
            <Text className="text-slate-400 font-inter-bold text-[10px] uppercase tracking-widest">Pending Approv</Text>
        </View>
        <View className="bg-slate-50 p-7 rounded-[40px] border border-slate-100 w-44">
            <View className="bg-emerald-100 p-3 rounded-2xl self-start mb-4"><MessageSquare color="#059669" size={20} /></View>
            <Text className="text-secondary font-inter-black text-3xl mb-1">{stats?.openTickets || 0}</Text>
            <Text className="text-slate-400 font-inter-bold text-[10px] uppercase tracking-widest">Open Tickets</Text>
        </View>
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" />
      <View className="px-6 pt-6 flex-row justify-between items-center mb-10">
        <View>
          <Text className="text-slate-400 font-inter-bold text-[10px] uppercase tracking-[3px]">System Admin</Text>
          <Text className="text-3xl font-inter-black text-secondary">Dashboard</Text>
        </View>
        <TouchableOpacity 
          onPress={() => { logout(); router.replace('/'); }}
          className="bg-rose-50 p-4 rounded-[22px] border border-rose-100"
        >
          <LogOut color="#E11D48" size={20} />
        </TouchableOpacity>
      </View>

      <View className="px-6">
        <StatsSummary />
      </View>

      <View className="px-6 mb-10">
          <View className="flex-row bg-slate-50 p-2 rounded-[32px] border border-slate-100">
            {[
                { id: 'pending', label: 'Approvals', icon: UserCheck },
                { id: 'users', label: 'Directory', icon: Users },
                { id: 'support', label: 'Tickets', icon: MessageSquare }
            ].map(tab => (
                <TouchableOpacity 
                    key={tab.id}
                    onPress={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex-row items-center justify-center py-4 rounded-[26px] ${activeTab === tab.id ? 'bg-white shadow-md' : ''}`}
                >
                    <tab.icon size={18} color={activeTab === tab.id ? '#2563EB' : '#94A3B8'} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
                    <Text className={`ml-2 font-inter-bold text-sm ${activeTab === tab.id ? 'text-secondary' : 'text-slate-400'}`}>
                        {tab.label}
                    </Text>
                </TouchableOpacity>
            ))}
          </View>
      </View>

      <View className="flex-1 px-6">
        {loading ? (
          <View className="items-center mt-20">
              <ActivityIndicator size="large" color="#2563EB" />
              <Text className="text-slate-400 mt-4 font-inter-medium text-center">Loading secure data...</Text>
          </View>
        ) : (
          <View className="flex-1">
            {activeTab === 'pending' && (
              <FlatList
                data={pendingContractors}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />}
                renderItem={({ item }) => (
                  <View className="bg-white p-7 rounded-[40px] mb-6 border border-slate-100 shadow-sm">
                    <View className="flex-row items-center mb-6">
                      <View className="bg-slate-50 p-4 rounded-[22px] mr-5">
                          <ShieldCheck color="#2563EB" size={32} />
                      </View>
                      <View className="flex-1">
                        <Text className="text-xl font-inter-bold text-secondary">{item.ownerName || item.companyName || item.name}</Text>
                        <Text className="text-primary font-inter-black text-[10px] uppercase tracking-[1px]">{item.companyName || 'Private Entity'}</Text>
                      </View>
                    </View>
                    
                    <View className="bg-slate-50 p-6 rounded-[32px] mb-8">
                        <View className="flex-row items-center mb-3">
                            <MapPin size={14} color="#64748B" />
                            <Text className="ml-2 text-slate-500 font-inter-medium text-sm">{item.city || 'Location Pending'}</Text>
                        </View>
                        <View className="flex-row items-center mb-3">
                            <ShieldCheck size={14} color="#64748B" />
                            <Text className="ml-2 text-slate-500 font-inter-medium text-sm">GSTIN: {item.gstin || 'N/A'}</Text>
                        </View>
                        <View className="flex-row items-center mb-4">
                            <User size={14} color="#64748B" />
                            <Text className="ml-2 text-slate-500 font-inter-medium text-sm">Gender: {item.gender || 'Unknown'}</Text>
                        </View>
                        
                        <Text className="text-slate-400 font-inter-bold text-[10px] uppercase tracking-widest mb-2">Categories</Text>
                        <View className="flex-row flex-wrap">
                            {item.categories && item.categories.map((catId: string) => (
                                <View key={catId} className="bg-white px-3 py-1 rounded-full border border-slate-100 mr-2 mb-2">
                                    <Text className="text-slate-500 font-inter-bold text-[10px]">{catId}</Text>
                                </View>
                            ))}
                        </View>

                        <View className="h-[1px] bg-slate-100 w-full my-4" />

                        <View className="flex-row items-center">
                            <FileText size={14} color="#64748B" />
                            <Text className="ml-2 text-slate-500 font-inter-medium text-xs">ID Proof Uploaded</Text>
                            {item.idProof && (
                                <TouchableOpacity onPress={() => Linking.openURL(item.idProof)} className="ml-2 flex-row items-center">
                                    <Text className="text-primary font-inter-bold text-xs">View Docs</Text>
                                    <ExternalLink size={10} color="#2563EB" className="ml-1" />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>

                    <View className="flex-row space-x-4">
                      <TouchableOpacity 
                        onPress={() => Alert.alert('Confirm Reject', 'Are you sure you want to remove this contractor registration?', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Reject', onPress: () => handleApproval(item.id, 'REJECTED'), style: 'destructive' }
                        ])}
                        className="flex-1 py-5 rounded-[24px] border border-rose-100 bg-rose-50"
                      >
                        <Text className="text-rose-600 font-inter-black text-center text-xs uppercase tracking-widest">Deny</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleApproval(item.id, 'APPROVED')}
                        className="flex-2 bg-secondary py-5 rounded-[24px] shadow-lg shadow-secondary/20"
                      >
                        <Text className="text-white font-inter-black text-center text-xs uppercase tracking-widest px-8">Approve Access</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                ListEmptyComponent={<Text className="text-center text-slate-400 mt-20 font-inter-medium px-8">No contractors currently awaiting approval.</Text>}
              />
            )}

            {activeTab === 'users' && (
                <View className="flex-1">
                    <View className="flex-row mb-8 p-1.5 bg-slate-50 rounded-full border border-slate-100">
                        <TouchableOpacity onPress={() => setUserTab('workers')} className={`flex-1 py-3 rounded-full ${userTab === 'workers' ? 'bg-white shadow-sm' : ''}`}>
                            <Text className={`text-center font-inter-bold text-xs ${userTab === 'workers' ? 'text-secondary' : 'text-slate-400'}`}>ALL WORKERS</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setUserTab('contractors')} className={`flex-1 py-3 rounded-full ${userTab === 'contractors' ? 'bg-white shadow-sm' : ''}`}>
                            <Text className={`text-center font-inter-bold text-xs ${userTab === 'contractors' ? 'text-secondary' : 'text-slate-400'}`}>CONTRACTORS</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList 
                        data={userTab === 'workers' ? allWorkers : allContractors}
                        keyExtractor={item => item.id}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />}
                        renderItem={({item}) => (
                            <View className="bg-white p-6 rounded-[32px] mb-4 border border-slate-50 flex-row items-center shadow-sm">
                                <Image source={{ uri: `https://ui-avatars.com/api/?name=${item.name}&background=F1F5F9&color=64748B` }} className="w-14 h-14 rounded-2xl mr-4" />
                                <View className="flex-1">
                                    <Text className="text-lg font-inter-bold text-secondary">{item.name}</Text>
                                    <View className="flex-row items-center">
                                        <Text className="text-slate-400 text-xs font-inter-medium">{item.phone}</Text>
                                        <Text className="mx-2 text-slate-200">|</Text>
                                        <Text className="text-primary font-inter-black text-[10px] uppercase truncate">{userTab === 'workers' ? item.categoryEn : (item.companyName || 'PRO')}</Text>
                                    </View>
                                </View>
                                <ChevronRight color="#CBD5E1" size={18} />
                            </View>
                        )}
                    />
                </View>
            )}

            {activeTab === 'support' && (
              <FlatList
                data={tickets}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563EB"]} />}
                renderItem={({ item }) => (
                  <View className="bg-white p-7 rounded-[40px] mb-6 border border-slate-100 shadow-sm">
                    <View className="flex-row justify-between items-center mb-6">
                        <View className="flex-row items-center">
                            <View className="bg-slate-50 p-3 rounded-2xl mr-4"><MessageSquare color="#0F172A" size={18} /></View>
                            <View>
                                <Text className="text-lg font-inter-bold text-secondary">{item.userName}</Text>
                                <Text className="text-slate-400 font-inter-black text-[10px] uppercase">{item.role}</Text>
                            </View>
                        </View>
                        <Text className="text-slate-300 font-inter-medium text-[10px]">{new Date(item.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <View className="bg-slate-50 p-6 rounded-[32px]">
                        <Text className="text-slate-700 font-inter-medium text-base leading-6">"{item.message}"</Text>
                    </View>
                  </View>
                )}
                ListEmptyComponent={<Text className="text-center text-slate-400 mt-20 font-inter-medium px-8">The support queue is currently empty.</Text>}
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
}

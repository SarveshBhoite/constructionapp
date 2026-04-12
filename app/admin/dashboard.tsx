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

export default function AdminDashboard() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const fetchPendingContractors = async () => {
    try {
      const response = await axios.get(`${API_URL}/admin/pending-contractors`);
      setContractors(response.data);
    } catch (error) {
      console.error('Fetch Error:', error);
      Alert.alert('Error', 'Failed to fetch pending contractors.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingContractors();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPendingContractors();
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
                
                setContractors(prev => prev.filter(c => c.id !== id));
                Alert.alert('Success', `Contractor has been ${action}d.`);
              } catch (error) {
                Alert.alert('Error', `Failed to ${action} contractor.`);
              }
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <View className="p-6 pb-0">
        <View className="flex-row justify-between items-center mb-8">
          <View>
            <Text className="text-slate-500 font-bold uppercase tracking-widest text-xs">System Admin</Text>
            <Text className="text-3xl font-bold text-slate-800">Verification</Text>
          </View>
          <TouchableOpacity 
            onPress={() => { logout(); router.replace('/'); }}
            className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100"
          >
            <LogOut color="#EF4444" size={20} />
          </TouchableOpacity>
        </View>

        {/* Stats Summary */}
        <View className="flex-row justify-between mb-8">
            <View className="bg-blue-600 p-6 rounded-[32px] flex-1 mr-3 shadow-xl shadow-blue-200">
                <Users color="white" size={24} />
                <Text className="text-white/60 mt-3 font-medium">Pending Review</Text>
                <Text className="text-white text-3xl font-black">{contractors.length}</Text>
            </View>
            <View className="bg-slate-800 p-6 rounded-[32px] flex-1 ml-3 shadow-xl shadow-slate-300">
                <Activity color="#10B981" size={24} />
                <Text className="text-white/60 mt-3 font-medium">Status</Text>
                <Text className="text-white text-3xl font-black">Active</Text>
            </View>
        </View>

        <Text className="text-xl font-bold text-slate-800 mb-6">Approval Queue</Text>
      </View>

      {loading ? (
          <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#1E40AF" />
              <Text className="text-slate-400 mt-4">Loading queue...</Text>
          </View>
      ) : (
          <FlatList
            data={contractors}
            keyExtractor={item => item.id}
            contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#1E40AF"]} />
            }
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
                    <View className="flex-row items-center mb-3">
                        <FileText color="#64748B" size={18} />
                        <Text className="text-slate-800 font-bold ml-2 text-lg">Identity Verification</Text>
                    </View>
                    
                    {item.idProof ? (
                        <TouchableOpacity 
                            onPress={() => setSelectedDoc(item.idProof || null)}
                            className="w-full h-40 rounded-2xl overflow-hidden mb-4 border border-slate-200"
                        >
                            <Image source={{ uri: item.idProof }} className="w-full h-full" resizeMode="cover" />
                            <View className="absolute bottom-3 right-3 bg-black/40 px-3 py-1 rounded-full">
                                <Text className="text-white text-[10px] font-bold uppercase">View Full</Text>
                            </View>
                        </TouchableOpacity>
                    ) : (
                        <View className="bg-slate-100 h-40 rounded-2xl items-center justify-center mb-4 border border-dashed border-slate-300">
                            <Text className="text-slate-400">No document uploaded</Text>
                        </View>
                    )}

                    <Text className="text-slate-400 mb-4">Contractor phone: {item.phone}</Text>
                    <View className="flex-row items-center">
                        <AlertTriangle color="#F59E0B" size={16} />
                        <Text className="text-amber-600 text-xs font-bold ml-1 uppercase">Pending Approval</Text>
                    </View>
                </View>

                <View className="flex-row space-x-4">
                    <TouchableOpacity 
                        onPress={() => handleAction(item.id, 'reject')}
                        className="flex-1 bg-white p-5 rounded-2xl items-center justify-center border border-red-200"
                    >
                        <Text className="text-red-500 font-bold text-lg">Reject</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={() => handleAction(item.id, 'approve')}
                        className="flex-1 bg-blue-600 p-5 rounded-2xl items-center justify-center shadow-lg shadow-blue-500/20"
                    >
                        <Text className="text-white font-bold text-lg">Approve</Text>
                    </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
                <View className="items-center mt-20">
                    <View className="bg-emerald-100 p-8 rounded-full mb-6">
                        <ShieldCheck size={64} color="#059669" />
                    </View>
                    <Text className="text-slate-800 font-bold text-2xl mt-4">All Caught Up!</Text>
                    <Text className="text-slate-400 text-center mt-2 px-12 text-lg">
                        There are no pending contractor applications to review at this moment.
                    </Text>
                </View>
            }
          />
      )}
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

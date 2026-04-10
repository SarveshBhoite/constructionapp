import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, FlatList, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck, LogOut, CheckCircle2, XCircle, FileText, ChevronRight, Search, Activity, Users, Building } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/authStore';

// Mock Data for Pending Contractors
const PENDING_CONTRACTORS = [
  { id: '1', name: 'Royal Construction', owner: 'Vikram Singh', city: 'Mumbai', docUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=600', submittedAt: '2h ago' },
  { id: '2', name: 'Shiv Builders', owner: 'Amol Shinde', city: 'Pune', docUrl: 'https://images.unsplash.com/photo-1632833073422-9214d02340d8?auto=format&fit=crop&q=80&w=600', submittedAt: '5h ago' },
  { id: '3', name: 'National Infra', owner: 'John Dsouza', city: 'Nagpur', docUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=600', submittedAt: '1d ago' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const [contractors, setContractors] = useState(PENDING_CONTRACTORS);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Contractor?`,
      `Are you sure you want to ${action} this contractor's application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => {
            setContractors(prev => prev.filter(c => c.id !== id));
            Alert.alert(
                action === 'approve' ? 'Approved!' : 'Rejected!',
                `Contractor has been ${action}d successfully.`
            );
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

        {/* Stats */}
        <View className="flex-row justify-between mb-8">
            <View className="bg-blue-600 p-5 rounded-[32px] flex-1 mr-2 shadow-lg shadow-blue-200">
                <Users color="white" size={24} />
                <Text className="text-white/60 mt-3 font-medium">New Labours</Text>
                <Text className="text-white text-2xl font-bold">124</Text>
            </View>
            <View className="bg-slate-800 p-5 rounded-[32px] flex-1 ml-2 shadow-lg shadow-slate-300">
                <Building color="white" size={24} />
                <Text className="text-white/60 mt-3 font-medium">Contractors</Text>
                <Text className="text-white text-2xl font-bold">{contractors.length} Pending</Text>
            </View>
        </View>

        <Text className="text-xl font-bold text-slate-800 mb-6">Approval Queue</Text>
      </View>

      <FlatList
        data={contractors}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View className="bg-white p-6 rounded-[32px] mb-6 shadow-sm border border-slate-100">
            <View className="flex-row justify-between items-start mb-4">
                <View className="flex-row items-center">
                    <View className="bg-slate-100 p-3 rounded-2xl mr-4">
                        <FileText color="#64748B" size={24} />
                    </View>
                    <View>
                        <Text className="text-xl font-bold text-slate-800">{item.name}</Text>
                        <Text className="text-slate-500 font-medium">{item.owner} • {item.city}</Text>
                    </View>
                </View>
                <Text className="text-xs font-bold text-slate-400">{item.submittedAt}</Text>
            </View>

            <TouchableOpacity 
                onPress={() => setSelectedDoc(item.docUrl)}
                className="w-full bg-slate-50 p-4 rounded-2xl flex-row items-center mb-6 border border-slate-100"
            >
                <Image source={{ uri: item.docUrl }} className="w-12 h-12 rounded-xl" />
                <View className="flex-1 ml-4">
                    <Text className="text-slate-700 font-bold">Registration Doc.jpg</Text>
                    <Text className="text-slate-400 text-xs">Verify business license</Text>
                </View>
                <ChevronRight color="#CBD5E1" size={20} />
            </TouchableOpacity>

            <View className="flex-row space-x-3 gap-2">
                <TouchableOpacity 
                    onPress={() => handleAction(item.id, 'reject')}
                    className="flex-1 bg-red-50 p-4 rounded-2xl flex-row items-center justify-center border border-red-100"
                >
                    <XCircle color="#EF4444" size={20} />
                    <Text className="text-red-600 font-bold ml-2">Reject</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => handleAction(item.id, 'approve')}
                    className="flex-1 bg-green-500 p-4 rounded-2xl flex-row items-center justify-center shadow-lg shadow-green-200"
                >
                    <CheckCircle2 color="white" size={20} />
                    <Text className="text-white font-bold ml-2">Approve</Text>
                </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
            <View className="items-center mt-20">
                <ShieldCheck size={64} color="#10B981" />
                <Text className="text-slate-800 font-bold text-xl mt-6">All Caught Up!</Text>
                <Text className="text-slate-400 text-center mt-2 px-8">There are no pending contractor applications to review at this moment.</Text>
            </View>
        }
      />

      {/* Document Viewer Modal */}
      {selectedDoc && (
          <View className="absolute inset-0 bg-black/90 items-center justify-center p-6" onTouchStart={() => setSelectedDoc(null)}>
              <TouchableOpacity className="absolute top-12 right-6 p-4">
                  <XCircle color="white" size={32} />
              </TouchableOpacity>
              <Image source={{ uri: selectedDoc }} className="w-full h-2/3 rounded-3xl" resizeMode="contain" />
              <Text className="text-white font-bold text-xl mt-8">Reviewing Document</Text>
              <Text className="text-white/60 text-center mt-2">Tap anywhere to close</Text>
          </View>
      )}
    </SafeAreaView>
  );
}

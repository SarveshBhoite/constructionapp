import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { HardHat, Users, ShieldCheck } from 'lucide-react-native';
import { useAuthStore } from '../src/store/authStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const setRole = useAuthStore((state) => state.setRole);

  const handleRoleSelection = (role: 'admin' | 'contractor' | 'labour') => {
    setRole(role);
    if (role === 'labour') {
      router.push('/labour/signup');
    } else if (role === 'contractor') {
      router.push('/contractor/signup');
    } else {
      router.push('/admin/login');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-6">
        <View className="items-center mt-12 mb-8">
          <View className="bg-orange-500 p-4 rounded-3xl mb-4 shadow-lg shadow-orange-300">
            <HardHat color="white" size={48} strokeWidth={2.5} />
          </View>
          <Text className="text-3xl font-bold text-slate-800 text-center">
            Labour-Contractor Connect
          </Text>
          <Text className="text-slate-500 text-center mt-2 text-lg">
            काम शोधणे आणि देणे आता झाले सोपे!
          </Text>
        </View>

        <Text className="text-xl font-semibold text-slate-700 mb-6 text-center">
          तुमची भूमिका निवडा (Choose your role)
        </Text>

        <View className="space-y-4">
          <TouchableOpacity
            onPress={() => handleRoleSelection('labour')}
            activeOpacity={0.8}
            className="flex-row items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-4"
          >
            <View className="bg-orange-100 p-3 rounded-2xl mr-4">
              <Users color="#F97316" size={32} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-slate-800">Labour (मजूर)</Text>
              <Text className="text-slate-500">काम शोधा (Find work)</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleRoleSelection('contractor')}
            activeOpacity={0.8}
            className="flex-row items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-4"
          >
            <View className="bg-blue-100 p-3 rounded-2xl mr-4">
              <HardHat color="#2563EB" size={32} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-slate-800">Contractor (ठेकेदार)</Text>
              <Text className="text-slate-500">मजूर शोधा (Find Labours)</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleRoleSelection('admin')}
            activeOpacity={0.8}
            className="flex-row items-center bg-white p-4 rounded-2xl border border-slate-200 mt-8 opacity-60"
          >
            <ShieldCheck color="#64748B" size={20} />
            <Text className="ml-2 font-medium text-slate-600 flex-1">Admin Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

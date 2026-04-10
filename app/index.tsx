import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { HardHat, Users, ShieldCheck, ArrowRight, UserCircle } from 'lucide-react-native';
import { useAuthStore } from '../src/store/authStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isLoggedIn, role } = useAuthStore();

  // Auto-redirect if logged in
  useEffect(() => {
    if (isLoggedIn && role) {
      if (role === 'labour') router.replace('/labour/home');
      else if (role === 'contractor') router.replace('/contractor/home');
      else if (role === 'admin') router.replace('/admin/dashboard');
    }
  }, [isLoggedIn, role]);

  const handleRoleSelection = (role: 'contractor' | 'labour') => {
    router.push(`/${role}/signup`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-8">
        <View className="items-center mt-12 mb-12">
          <View className="bg-blue-600 p-5 rounded-[40px] mb-6 shadow-2xl shadow-blue-200">
            <HardHat color="white" size={48} strokeWidth={2.5} />
          </View>
          <Text className="text-4xl font-bold text-slate-900 text-center tracking-tight">
            Royal <Text className="text-blue-600">Connect</Text>
          </Text>
          <Text className="text-slate-500 text-center mt-3 text-lg font-medium">
            Building trust between builders and workers.
          </Text>
        </View>

        <Text className="text-xl font-bold text-slate-800 mb-8">Get Started</Text>

        <View className="space-y-6">
          {/* Labour Option */}
          <TouchableOpacity
            onPress={() => handleRoleSelection('labour')}
            activeOpacity={0.9}
            className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex-row items-center mb-6"
          >
            <View className="bg-blue-100 p-4 rounded-3xl mr-5">
              <Users color="#1E40AF" size={32} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-slate-900">For Workers</Text>
              <Text className="text-slate-500 font-medium">Find work & register (मजूर नोंदणी)</Text>
            </View>
            <ArrowRight color="#CBD5E1" size={20} />
          </TouchableOpacity>

          {/* Contractor Option */}
          <TouchableOpacity
            onPress={() => handleRoleSelection('contractor')}
            activeOpacity={0.9}
            className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 flex-row items-center mb-10"
          >
            <View className="bg-blue-700 p-4 rounded-3xl mr-5">
              <HardHat color="white" size={32} />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-slate-900">For Contractors</Text>
              <Text className="text-slate-500 font-medium">Hire workers (ठेकेदार)</Text>
            </View>
            <ArrowRight color="#CBD5E1" size={20} />
          </TouchableOpacity>
        </View>

        {/* Login Area */}
        <View className="mt-8 border-t border-slate-100 pt-10 items-center">
            <Text className="text-slate-400 font-medium mb-4 uppercase tracking-widest text-xs">Already have an account?</Text>
            <TouchableOpacity 
                onPress={() => router.push('/login')}
                className="bg-slate-900 w-full p-6 rounded-[32px] flex-row items-center justify-center shadow-xl mb-4"
            >
                <UserCircle color="white" size={24} />
                <Text className="text-white font-bold text-xl ml-3">Log In Now</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                onPress={() => router.push('/admin/login')}
                className="p-4"
            >
                <Text className="text-slate-500 font-bold">Admin Portal</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

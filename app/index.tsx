import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HardHat, Users, ShieldCheck, ArrowRight, UserCircle } from 'lucide-react-native';
import { useAuthStore } from '../src/store/authStore';

export default function WelcomeScreen() {
  const router = useRouter();
  const { isLoggedIn, role } = useAuthStore();

  // Auto-redirect if logged in
  useEffect(() => {
    if (isLoggedIn && role) {
      // Use a small delay to ensure the layout is mounted
      const timer = setTimeout(() => {
        if (role === 'labour') router.replace('/labour/home');
        else if (role === 'contractor') router.replace('/contractor/home');
        else if (role === 'admin') router.replace('/admin/dashboard');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, role]);

  const handleRoleSelection = (role: 'contractor' | 'labour') => {
    router.push(`/${role}/signup`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-8" showsVerticalScrollIndicator={false}>
        {/* Splash/Logo Area */}
        <View className="items-center mt-8 mb-16">
          <View className="bg-blue-600 p-6 rounded-[45px] mb-6 shadow-2xl shadow-blue-300">
            <HardHat color="white" size={64} strokeWidth={2.5} />
          </View>
          <Text className="text-5xl font-extrabold text-slate-900 text-center tracking-tighter">
            Royal <Text className="text-blue-600">Connect</Text>
          </Text>
          <Text className="text-slate-500 text-center mt-4 text-lg font-medium px-4">
            The premium platform for construction excellence.
          </Text>
        </View>

        {/* PRIMARY ACTION: LOGIN */}
        <View className="mb-12">
            <Text className="text-slate-400 font-bold mb-5 uppercase tracking-widest text-xs text-center">Welcome Back</Text>
            <TouchableOpacity 
                onPress={() => router.push('/login')}
                activeOpacity={0.9}
                className="bg-slate-900 w-full p-7 rounded-[35px] flex-row items-center justify-center shadow-2xl shadow-slate-400"
            >
                <UserCircle color="white" size={28} />
                <Text className="text-white font-bold text-2xl ml-4">Log In Now</Text>
            </TouchableOpacity>
        </View>

        <View className="flex-row items-center mb-12">
            <View className="flex-1 h-[1px] bg-slate-100" />
            <Text className="mx-6 text-slate-300 font-bold uppercase text-[10px] tracking-widest">New to Royal Connect?</Text>
            <View className="flex-1 h-[1px] bg-slate-100" />
        </View>

        {/* SECONDARY ACTIONS: SIGNUP */}
        <Text className="text-2xl font-black text-slate-900 mb-8 px-2 tracking-tight">Create Account</Text>

        <View className="space-y-6">
          {/* Labour Option */}
          <TouchableOpacity
            onPress={() => handleRoleSelection('labour')}
            activeOpacity={0.8}
            className="bg-blue-50/50 p-6 rounded-[35px] border border-blue-100 flex-row items-center mb-6"
          >
            <View className="bg-blue-600 p-4 rounded-3xl mr-5 shadow-lg shadow-blue-200">
                <Users color="white" size={32} />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-slate-900 mb-1">Worker (मजूर)</Text>
              <Text className="text-blue-600/70 font-bold text-sm tracking-wide">Register to find work</Text>
            </View>
            <ArrowRight color="#2563EB" size={24} />
          </TouchableOpacity>

          {/* Contractor Option */}
          <TouchableOpacity
            onPress={() => handleRoleSelection('contractor')}
            activeOpacity={0.8}
            className="bg-slate-50 p-6 rounded-[35px] border border-slate-100 flex-row items-center mb-12"
          >
            <View className="bg-slate-800 p-4 rounded-3xl mr-5 shadow-lg shadow-slate-200">
                <HardHat color="white" size={32} />
            </View>
            <View className="flex-1">
              <Text className="text-2xl font-bold text-slate-900 mb-1">Contractor (ठेकेदार)</Text>
              <Text className="text-slate-500 font-bold text-sm tracking-wide">Hire professional labor</Text>
            </View>
            <ArrowRight color="#64748B" size={24} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="mt-auto items-center pb-8 pt-4">
            <TouchableOpacity 
                onPress={() => router.push('/admin/login')}
                className="bg-slate-100 px-8 py-4 rounded-full"
            >
                <Text className="text-slate-500 font-black uppercase text-[10px] tracking-[4px]">Admin Portal</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

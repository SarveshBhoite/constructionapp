import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { HardHat, Users, ShieldCheck, ArrowRight, UserCircle, Shield, Briefcase, ChevronRight } from 'lucide-react-native';
import { useAuthStore } from '../src/store/authStore';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isLoggedIn, role } = useAuthStore();

  useEffect(() => {
    if (isLoggedIn && role) {
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
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <StatusBar barStyle="dark-content" />
      
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 40 }} 
        className="px-8" 
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="items-center mt-12 mb-16">
          <View className="bg-primary p-6 rounded-[40px] mb-8 shadow-2xl shadow-primary/30">
            <Shield color="white" size={56} strokeWidth={2} />
          </View>
          <Text className="text-5xl font-inter-black text-secondary text-center tracking-tighter">
            ROYAL<Text className="text-primary truncate">CONNECT</Text>
          </Text>
          <Text className="text-slate-500 text-center mt-4 text-lg font-inter-medium leading-7 px-6">
            The premium network for high-end construction professionals.
          </Text>
        </View>

        {/* Action Section */}
        <View className="bg-slate-50 p-8 rounded-[48px] border border-slate-100 mb-12">
            <Text className="text-slate-400 font-inter-bold mb-6 uppercase tracking-[3px] text-[10px] text-center">Authentication</Text>
            
            <TouchableOpacity 
                onPress={() => router.push('/login')}
                activeOpacity={0.9}
                className="bg-secondary w-full py-6 rounded-[32px] flex-row items-center justify-center shadow-xl shadow-secondary/20 mb-4"
            >
                <UserCircle color="white" size={24} />
                <Text className="text-white font-inter-bold text-xl ml-3">Log In Now</Text>
            </TouchableOpacity>

            <View className="flex-row items-center my-6">
                <View className="flex-1 h-[1px] bg-slate-200" />
                <Text className="mx-4 text-slate-300 font-inter-bold text-[10px] tracking-widest uppercase">or join the network</Text>
                <View className="flex-1 h-[1px] bg-slate-200" />
            </View>

            {/* Role Buttons */}
            <View className="space-y-4">
                <TouchableOpacity
                    onPress={() => handleRoleSelection('labour')}
                    activeOpacity={0.8}
                    className="bg-white p-5 rounded-[28px] border border-slate-100 flex-row items-center mb-4 shadow-sm"
                >
                    <View className="bg-primary/10 p-3 rounded-2xl mr-4">
                        <Briefcase color="#2563EB" size={24} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-inter-bold text-secondary">Join as Worker</Text>
                        <Text className="text-slate-400 font-inter-medium text-xs">Find premium projects</Text>
                    </View>
                    <ChevronRight color="#CBD5E1" size={20} />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => handleRoleSelection('contractor')}
                    activeOpacity={0.8}
                    className="bg-white p-5 rounded-[28px] border border-slate-100 flex-row items-center shadow-sm"
                >
                    <View className="bg-secondary/5 p-3 rounded-2xl mr-4">
                        <HardHat color="#0F172A" size={24} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-lg font-inter-bold text-secondary">Join as Contractor</Text>
                        <Text className="text-slate-400 font-inter-medium text-xs">Hire certified talent</Text>
                    </View>
                    <ChevronRight color="#CBD5E1" size={20} />
                </TouchableOpacity>
            </View>
        </View>

        {/* Footer / Admin Link */}
        <View className="items-center mt-auto">
            <TouchableOpacity 
                onPress={() => router.push('/admin/login')}
                className="bg-slate-100/50 px-8 py-4 rounded-full border border-slate-100"
            >
                <Text className="text-slate-400 font-inter-black uppercase text-[10px] tracking-[4px]">System Administrator</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

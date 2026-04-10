import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Phone, ChevronLeft, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { useAuthStore } from '../src/store/authStore';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!/^\d{10}$/.test(phone)) {
      Alert.alert('Invalid Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { phone });
      const { role, user } = response.data;

      // Set user session in store
      setAuth(role, user);

      // Redirect based on role
      if (role === 'labour') {
        router.replace('/labour/home');
      } else if (role === 'contractor') {
        router.replace('/contractor/home');
      }
    } catch (error: any) {
      console.error('Login Error:', error);
      const msg = error.response?.data?.error || 'Login failed. Are you registered?';
      Alert.alert('Access Denied', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="p-8 pt-12">
        <TouchableOpacity onPress={() => router.back()} className="mb-12">
          <ChevronLeft color="#1E40AF" size={28} />
        </TouchableOpacity>

        <View className="mb-12">
          <Text className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Welcome Back</Text>
          <Text className="text-slate-500 text-lg font-medium leading-7">
            Enter your mobile number to access your workspace.
          </Text>
        </View>

        <View className="space-y-6">
          <View>
            <Text className="text-slate-800 font-bold mb-3 ml-1 text-lg">Mobile Number</Text>
            <View className="bg-slate-50 p-6 rounded-[32px] border border-slate-200 flex-row items-center shadow-sm">
              <Phone color="#1E40AF" size={24} />
              <TextInput
                placeholder="00000 00000"
                keyboardType="phone-pad"
                maxLength={10}
                value={phone}
                onChangeText={setPhone}
                className="flex-1 ml-4 text-xl font-bold text-slate-900"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
            className="bg-blue-600 p-6 rounded-[32px] items-center flex-row justify-center shadow-2xl shadow-blue-300 mt-6"
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white text-xl font-bold mr-3">Access Account</Text>
                <ArrowRight color="white" size={20} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View className="mt-auto items-center pb-8">
            <View className="flex-row items-center bg-slate-50 px-5 py-3 rounded-2xl">
                <ShieldCheck color="#64748B" size={16} />
                <Text className="text-slate-500 ml-2 font-medium">Secure Phone Verification</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/index')} className="mt-4">
                <Text className="text-blue-600 font-bold">New user? Sign up here</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

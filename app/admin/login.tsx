import React, { useState } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldAlert, Lock, ChevronLeft, UserCircle } from 'lucide-react-native';
import { useAuthStore } from '../../src/store/authStore';

export default function AdminLogin() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (username === 'admin' && password === 'admin123') {
      setLoading(true);
      setTimeout(() => {
        login();
        router.replace('/admin/dashboard');
        setLoading(false);
      }, 1000);
    } else {
      Alert.alert('Invalid Credentials', 'Please check your admin username and password.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-900">
      <View className="p-8 pt-12 flex-1">
        <TouchableOpacity onPress={() => router.back()} className="mb-12">
            <ChevronLeft color="white" size={28} />
        </TouchableOpacity>

        <View className="items-center mb-12">
            <View className="bg-red-500/20 p-6 rounded-[40px] mb-6">
                <ShieldAlert color="#EF4444" size={48} strokeWidth={2.5} />
            </View>
            <Text className="text-white text-3xl font-bold mb-2">Admin Portal</Text>
            <Text className="text-slate-400 text-lg">Secure Access Only</Text>
        </View>

        <View className="space-y-6">
            <View className="bg-slate-800 p-5 rounded-3xl border border-slate-700 flex-row items-center mb-4">
                <UserCircle color="#94A3B8" size={20} />
                <TextInput 
                    placeholder="Username"
                    placeholderTextColor="#64748B"
                    value={username}
                    onChangeText={setUsername}
                    className="flex-1 ml-4 text-white text-lg"
                    autoCapitalize="none"
                />
            </View>

            <View className="bg-slate-800 p-5 rounded-3xl border border-slate-700 flex-row items-center mb-12">
                <Lock color="#94A3B8" size={20} />
                <TextInput 
                    placeholder="Password"
                    placeholderTextColor="#64748B"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    className="flex-1 ml-4 text-white text-lg"
                />
            </View>

            <TouchableOpacity 
                onPress={handleLogin}
                disabled={loading}
                className="bg-red-600 p-5 rounded-3xl items-center shadow-xl shadow-red-900/20"
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white text-xl font-bold">Authenticate</Text>
                )}
            </TouchableOpacity>
        </View>

        <View className="mt-auto items-center">
            <Text className="text-slate-500 font-medium">© 2026 Admin Control Panel</Text>
            <Text className="text-slate-700 mt-2 italic">v1.2.4 Production</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

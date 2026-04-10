import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Check, ChevronLeft, Zap, Droplet, PaintBucket, Hammer, Layout, Flame, Users, Grid, Box, Scissors } from 'lucide-react-native';
import { CATEGORIES } from '../../src/constants/categories';
import { uploadImage } from '../../src/services/cloudinary';
import { useAuthStore } from '../../src/store/authStore';

const ICON_MAP = {
  zap: Zap,
  droplet: Droplet,
  'paint-bucket': PaintBucket,
  hammer: Hammer,
  layout: Layout,
  flame: Flame,
  users: Users,
  grid: Grid,
  box: Box,
  scissors: Scissors,
} as any;

export default function LabourSignup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSignup = async () => {
    if (!name || !phone || !city || !selectedCategory || !image) {
      Alert.alert('Error', 'कृपया सर्व माहिती भरा (Please fill all details)');
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await uploadImage(image);
      // Here you would normally save to your backend (Supabase/Firebase)
      console.log('Signup Successful:', { name, phone, city, selectedCategory, imageUrl });
      
      router.push('/labour/home');
    } catch (error) {
      Alert.alert('Error', 'नोंदणी अयशस्वी. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-white p-6 pt-12">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <ChevronLeft color="#64748B" size={28} />
      </TouchableOpacity>

      <Text className="text-3xl font-bold text-slate-800 mb-2">नोंदणी (Registration)</Text>
      <Text className="text-slate-500 mb-8 text-lg">तुमची माहिती भरा (Fill your details)</Text>

      {/* Profile Pic */}
      <View className="items-center mb-8">
        <TouchableOpacity onPress={pickImage} className="relative shadow-lg">
          <View className="w-32 h-32 rounded-full bg-slate-100 border-4 border-orange-100 items-center justify-center overflow-hidden">
            {image ? (
              <Image source={{ uri: image }} className="w-full h-full" />
            ) : (
              <Camera color="#94A3B8" size={40} />
            )}
          </View>
          <View className="absolute bottom-0 right-0 bg-orange-500 p-2 rounded-full border-2 border-white">
            <Camera color="white" size={16} />
          </View>
        </TouchableOpacity>
        <Text className="text-slate-600 mt-2 font-medium">फोटो निवडा (Select Photo)</Text>
      </View>

      {/* Inputs */}
      <View className="space-y-4 mb-8">
        <View>
          <Text className="text-slate-700 font-bold mb-2 ml-1 text-lg">पूर्ण नाव (Full Name)</Text>
          <TextInput
            placeholder="उदा. राहुल चव्हाण"
            value={name}
            onChangeText={setName}
            className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-lg mb-4"
          />
        </View>

        <View>
          <Text className="text-slate-700 font-bold mb-2 ml-1 text-lg">मोबाईल नंबर (Mobile Number)</Text>
          <TextInput
            placeholder="10 अंकी नंबर"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-lg mb-4"
          />
        </View>

        <View>
          <Text className="text-slate-700 font-bold mb-2 ml-1 text-lg">शहर (City)</Text>
          <TextInput
            placeholder="उदा. पुणे"
            value={city}
            onChangeText={setCity}
            className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-lg mb-8"
          />
        </View>
      </View>

      {/* Category Selection */}
      <Text className="text-xl font-bold text-slate-800 mb-4 ml-1">तुमचे काम निवडा (Choose your work)</Text>
      <View className="flex-row flex-wrap justify-between pb-12">
        {CATEGORIES.map((cat) => {
          const Icon = ICON_MAP[cat.icon];
          const isSelected = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              className={`w-[48%] p-5 rounded-3xl mb-4 items-center justify-center border-2 ${
                isSelected ? 'bg-orange-50 border-orange-500' : 'bg-slate-50 border-slate-100 shadow-sm shadow-slate-100'
              }`}
            >
              <View className={`p-3 rounded-2xl mb-2 ${isSelected ? 'bg-orange-200' : 'bg-white'}`}>
                <Icon size={28} color={isSelected ? '#F97316' : '#64748B'} />
              </View>
              <Text className={`text-center font-bold text-[15px] ${isSelected ? 'text-orange-700' : 'text-slate-700'}`}>
                {cat.mr}
              </Text>
              <Text className={`text-center text-[12px] opacity-70 ${isSelected ? 'text-orange-600' : 'text-slate-500'}`}>
                ({cat.en})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Submit Button */}
      <TouchableOpacity
        onPress={handleSignup}
        disabled={loading}
        activeOpacity={0.8}
        className="bg-orange-500 p-5 rounded-3xl items-center mb-20 shadow-lg shadow-orange-300"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-xl font-bold">साइन अप करा (Sign Up)</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { Camera, Check, ChevronLeft, Zap, Droplet, PaintBucket, Hammer, Layout, Flame, Users, Grid, Box, Scissors, Clipboard, Tool, Briefcase, Ruler } from 'lucide-react-native';
import { CATEGORIES, STATES } from '../../src/constants/categories';
import { uploadImage } from '../../src/services/cloudinary';
import axios from 'axios';

const ICON_MAP = {
  clipboard: Clipboard,
  users: Users,
  layout: Layout,
  tool: Tool,
  hammer: Hammer,
  zap: Zap,
  'paint-bucket': PaintBucket,
  droplet: Droplet,
  flame: Flame,
  briefcase: Briefcase,
  ruler: Ruler,
} as any;

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LabourSignup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState(STATES[0]);
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [experience, setExperience] = useState('');
  const [wages, setWages] = useState('');
  const [wageType, setWageType] = useState<'HOUR' | 'DAY'>('DAY');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [about, setAbout] = useState('');
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
    // Validations
    if (!name || !phone || !city || !selectedCategory || !image || !wages) {
      Alert.alert('Error', 'Please fill all mandatory details (कृपया सर्व माहिती भरा)');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      Alert.alert('Error', 'Phone number must be 10 digits (मोबाईल नंबर 10 अंकी असावा)');
      return;
    }

    setLoading(true);
    try {
      const imageUrl = await uploadImage(image);
      const categoryObj = CATEGORIES.find(c => c.id === selectedCategory);
      if (!categoryObj) throw new Error('Invalid Category');

      const payload = {
        name,
        phone,
        city,
        state,
        address,
        email,
        category: selectedCategory,
        categoryEn: categoryObj.en,
        categoryMr: categoryObj.mr,
        experienceYears: parseInt(experience) || 0,
        wages: parseFloat(wages),
        wageType,
        profileImage: imageUrl,
        about: about || `Experienced ${categoryObj.en.toLowerCase()} specializing in professional construction services.`
      };

      await axios.post(`${API_URL}/workers/register`, payload);
      
      Alert.alert('Success', 'Registration Successful! (नोंदणी यशस्वी झाली)');
      router.push('/labour/home');
    } catch (error: any) {
      console.error('Signup Error:', error);
      const msg = error.response?.data?.error || 'Registration failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView showsVerticalScrollIndicator={false} className="p-6">
        <TouchableOpacity onPress={() => router.back()} className="mb-4">
          <ChevronLeft color="#1E40AF" size={28} />
        </TouchableOpacity>

        <Text className="text-3xl font-bold text-slate-900 mb-2">Worker Registration</Text>
        <Text className="text-slate-500 mb-8 text-lg">Create your professional profile</Text>

        {/* Profile Pic */}
        <View className="items-center mb-10">
          <TouchableOpacity onPress={pickImage} className="relative">
            <View className="w-32 h-32 rounded-[40px] bg-slate-100 border-4 border-blue-50 items-center justify-center overflow-hidden shadow-xl">
              {image ? (
                <Image source={{ uri: image }} className="w-full h-full" />
              ) : (
                <Camera color="#94A3B8" size={40} />
              )}
            </View>
            <View className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-2xl border-4 border-white">
              <Camera color="white" size={18} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Form Fields */}
        <View className="space-y-6 mb-10">
          <View>
            <Text className="text-slate-800 font-bold mb-2 ml-1 text-lg">Full Name *</Text>
            <TextInput
              placeholder="e.g. Rahul Chavan"
              value={name}
              onChangeText={setName}
              className="bg-slate-50 p-5 rounded-3xl border border-slate-200 text-lg"
            />
          </View>

          <View>
            <Text className="text-slate-800 font-bold mb-2 ml-1 text-lg">Mobile Number *</Text>
            <TextInput
              placeholder="10 digit number"
              keyboardType="phone-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
              className="bg-slate-50 p-5 rounded-3xl border border-slate-200 text-lg"
            />
          </View>

          <View>
            <Text className="text-slate-800 font-bold mb-2 ml-1 text-lg">Experience (Years)</Text>
            <TextInput
              placeholder="e.g. 5"
              keyboardType="numeric"
              value={experience}
              onChangeText={setExperience}
              className="bg-slate-50 p-5 rounded-3xl border border-slate-200 text-lg"
            />
          </View>

          <View className="flex-row space-x-4">
             <View className="flex-1">
                <Text className="text-slate-800 font-bold mb-2 ml-1 text-lg">Wages *</Text>
                <TextInput
                    placeholder="e.g. 500"
                    keyboardType="numeric"
                    value={wages}
                    onChangeText={setWages}
                    className="bg-slate-50 p-5 rounded-3xl border border-slate-200 text-lg"
                />
             </View>
             <View className="w-32">
                <Text className="text-slate-800 font-bold mb-2 text-lg text-center">Unit</Text>
                <TouchableOpacity 
                    onPress={() => setWageType(wageType === 'DAY' ? 'HOUR' : 'DAY')}
                    className="bg-blue-600 p-5 rounded-3xl items-center justify-center"
                >
                    <Text className="text-white font-bold">{wageType === 'DAY' ? '/ Day' : '/ Hour'}</Text>
                </TouchableOpacity>
             </View>
          </View>

          <View>
            <Text className="text-slate-800 font-bold mb-2 ml-1 text-lg">City *</Text>
            <TextInput
              placeholder="e.g. Pune"
              value={city}
              onChangeText={setCity}
              className="bg-slate-50 p-5 rounded-3xl border border-slate-200 text-lg"
            />
          </View>

          <View>
            <Text className="text-slate-800 font-bold mb-2 ml-1 text-lg">State *</Text>
            <View className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden">
                <Picker
                    selectedValue={state}
                    onValueChange={(itemValue) => setState(itemValue)}
                >
                    {STATES.map(s => <Picker.Item key={s} label={s} value={s} />)}
                </Picker>
            </View>
          </View>

          <View>
            <Text className="text-slate-800 font-bold mb-2 ml-1 text-lg">Address</Text>
            <TextInput
              placeholder="Area / Landmark"
              value={address}
              onChangeText={setAddress}
              className="bg-slate-50 p-5 rounded-3xl border border-slate-200 text-lg"
            />
          </View>

          <View>
            <Text className="text-slate-800 font-bold mb-2 ml-1 text-lg">Email (Optional)</Text>
            <TextInput
              placeholder="email@example.com"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              className="bg-slate-50 p-5 rounded-3xl border border-slate-200 text-lg"
            />
          </View>
        </View>

        {/* Category Selection */}
        <Text className="text-xl font-bold text-slate-900 mb-4 ml-1">Work Category *</Text>
        <View className="flex-row flex-wrap justify-between pb-12">
            {CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.icon] || Clipboard;
            const isSelected = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                className={`w-[48%] p-6 rounded-[32px] mb-4 items-center justify-center border-2 ${
                  isSelected ? 'bg-blue-50 border-blue-600' : 'bg-slate-50 border-slate-100 shadow-sm'
                }`}
              >
                <View className={`p-4 rounded-2xl mb-3 ${isSelected ? 'bg-blue-200/50' : 'bg-white shadow-sm'}`}>
                  <Icon size={32} color={isSelected ? '#1E40AF' : '#64748B'} />
                </View>
                <Text className={`text-center font-bold text-[16px] ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                  {cat.mr}
                </Text>
                <Text className={`text-center text-[12px] opacity-60 ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>
                  ({cat.en})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* About You Section */}
        <View className="mb-10">
          <Text className="text-slate-800 font-bold mb-2 ml-1 text-lg">About You (तुमच्या बद्दल माहिती)</Text>
          <TextInput
            placeholder="e.g. 5+ years of experience in high-quality plumbing..."
            value={about}
            onChangeText={setAbout}
            multiline
            numberOfLines={4}
            className="bg-slate-50 p-5 rounded-3xl border border-slate-200 text-lg min-h-[120px] text-top"
          />
        </View>

        <TouchableOpacity
          onPress={handleSignup}
          disabled={loading}
          activeOpacity={0.8}
          className="bg-blue-600 p-6 rounded-[32px] items-center mb-24 shadow-xl shadow-blue-200"
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white text-xl font-bold">Complete Registration</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

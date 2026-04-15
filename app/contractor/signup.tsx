import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { FileText, Camera, ChevronLeft, Building2 } from 'lucide-react-native';
import { uploadImage } from '../../src/services/cloudinary';
import { CATEGORIES } from '../../src/constants/categories';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function ContractorSignup() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [gstin, setGstin] = useState('');
  const [gender, setGender] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [document, setDocument] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const pickDocument = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setDocument(result.assets[0].uri);
    }
  };

  const handleSignup = async () => {
    if (!companyName || !phone || !city || !document || selectedCategories.length === 0 || !gender) {
      Alert.alert('Details Required', 'Please fill all mandatory fields including categories, gender, and upload a business document.');
      return;
    }

    console.log('--- SIGNUP BUTTON CLICKED ---');
    console.log('Company:', companyName);
    console.log('Phone:', phone);

    setLoading(true);
    try {
      console.log('1. Starting Cloudinary Upload...');
      const docUrl = await uploadImage(document);
      console.log('2. Cloudinary Success:', docUrl);
      
      const payload = {
        name: companyName,
        phone,
        companyName,
        city,
        gstin,
        gender,
        categories: selectedCategories,
        idProof: docUrl
      };

      console.log('3. Sending to Backend:', `${API_URL}/auth/register/contractor`);
      console.log('Payload:', payload);

      // SAVE TO DATABASE
      const response = await axios.post(`${API_URL}/auth/register/contractor`, payload);

      console.log('4. Backend Success:', response.data);
      router.push('/contractor/pending');
    } catch (error) {
      Alert.alert('Upload Failed', 'There was an issue uploading your documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50 p-6 pt-12">
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <ChevronLeft color="#64748B" size={28} />
      </TouchableOpacity>

      <Text className="text-3xl font-bold text-slate-800 mb-2">Contractor Signup</Text>
      <Text className="text-slate-500 mb-8 text-lg">Register your business to find skilled labours.</Text>

      <View className="space-y-4 mb-8">
        <View className="mb-4">
          <Text className="text-slate-700 font-bold mb-2 ml-1 text-lg">Company/Business Name</Text>
          <View className="flex-row items-center bg-white p-4 rounded-2xl border border-slate-200">
            <Building2 size={20} color="#94A3B8" />
            <TextInput
              placeholder="e.g. Royal Construction"
              value={companyName}
              onChangeText={setCompanyName}
              className="flex-1 ml-3 text-lg"
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-slate-700 font-bold mb-2 ml-1 text-lg">Mobile Number</Text>
          <TextInput
            placeholder="10 digit number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            className="bg-white p-4 rounded-2xl border border-slate-200 text-lg"
          />
        </View>

        <View className="mb-4">
          <Text className="text-slate-700 font-bold mb-2 ml-1 text-lg">City</Text>
          <TextInput
            placeholder="e.g. Mumbai"
            value={city}
            onChangeText={setCity}
            className="bg-white p-4 rounded-2xl border border-slate-200 text-lg"
          />
        </View>

        <View className="mb-4">
          <Text className="text-slate-700 font-bold mb-2 ml-1 text-lg">Gender *</Text>
          <View className="flex-row gap-4">
            <TouchableOpacity onPress={() => setGender('male')} className={`flex-1 p-4 rounded-2xl border ${gender === 'male' ? 'bg-blue-50 border-blue-600' : 'bg-white border-slate-200'}`}>
                <Text className={`text-center font-bold ${gender === 'male' ? 'text-blue-900' : 'text-slate-500'}`}>Male</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setGender('female')} className={`flex-1 p-4 rounded-2xl border ${gender === 'female' ? 'bg-blue-50 border-blue-600' : 'bg-white border-slate-200'}`}>
                <Text className={`text-center font-bold ${gender === 'female' ? 'text-blue-900' : 'text-slate-500'}`}>Female</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-slate-700 font-bold mb-2 ml-1 text-lg">GSTIN Number (Optional)</Text>
          <TextInput
            placeholder="e.g. 22AAAAA0000A1Z5"
            value={gstin}
            onChangeText={setGstin}
            autoCapitalize="characters"
            className="bg-white p-4 rounded-2xl border border-slate-200 text-lg"
          />
        </View>
      </View>

      {/* Category Selection */}
      <Text className="text-xl font-bold text-slate-800 mb-2 ml-1">Work Categories *</Text>
      <Text className="text-slate-500 mb-4 ml-1">Select multiple categories you handle projects for.</Text>
      <View className="flex-row flex-wrap justify-between pb-8">
          {CATEGORIES.map((cat) => {
          const isSelected = selectedCategories.includes(cat.id);
          return (
            <TouchableOpacity
              key={cat.id}
              onPress={() => toggleCategory(cat.id)}
              className={`w-[48%] p-4 rounded-[24px] mb-4 items-center justify-center border-2 ${
                isSelected ? 'bg-blue-50 border-blue-600' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <Text className={`text-center font-bold text-lg ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                {cat.en}
              </Text>
              <Text className={`text-center text-xs opacity-60 ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>
                ({cat.mr})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Document Upload */}
      <Text className="text-xl font-bold text-slate-800 mb-2 ml-1">Business Verification</Text>
      <Text className="text-slate-500 mb-2 ml-1">Upload ID or Business License for Admin approval.</Text>
      <Text className="text-slate-400 text-sm mb-4 ml-1">Accepted: GSTIN Certificate, Shop Act, Udyam, Any Govt ID</Text>
      
      <TouchableOpacity 
        onPress={pickDocument}
        className={`w-full aspect-video rounded-3xl border-2 border-dashed border-slate-300 items-center justify-center mb-12 overflow-hidden ${document ? 'bg-white' : 'bg-slate-100'}`}
      >
        {document ? (
          <Image source={{ uri: document }} className="w-full h-full" />
        ) : (
          <View className="items-center">
            <FileText size={48} color="#94A3B8" />
            <Text className="text-slate-500 mt-2 font-medium">Click to upload document</Text>
          </View>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSignup}
        disabled={loading}
        className="bg-blue-600 p-5 rounded-3xl items-center mb-20 shadow-lg shadow-blue-200"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white text-xl font-bold text-center">Submit for Approval</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

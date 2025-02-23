import React, { useState, useEffect, useRef } from "react";
import { SafeAreaView, TouchableOpacity, View, Text, Image, TextInput, ActivityIndicator, Alert, StyleSheet } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Pocketbase from 'pocketbase';
import * as ImagePicker from 'expo-image-picker';

interface Props {
    navigation: NavigationProp<any>;
    onSignOut: () => void;
}

const Profile = ({ navigation, onSignOut }: Props) => {
    const [loading, setLoading] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [userLastName, setUserLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [location, setLocation] = useState<string>('');
    const [avatarUrl, setAvatarUrl] = useState<string>('');
    const [editable, setEditable] = useState<boolean>(false);
    const textInputRef = useRef<TextInput>(null);

    // Fetch user data
    const fetchData = async () => {
        setLoading(true);
        const pb = new Pocketbase('https://mathiasdb.em1t.me/');
        const user = await AsyncStorage.getItem('user');

        if (user) {
            await pb.collection('users').authWithPassword(JSON.parse(user).email, JSON.parse(user).password);
            const userPb = await pb.collection('users').getOne(JSON.parse(user).record.id);
            const userAvatar = pb.files.getUrl(userPb, userPb.avatar, {'thumb': '100x250'});
            setUserName(userPb.username);
            setFirstName(userPb.full_name ? userPb.full_name.split(' ')[0] : 'Meno');
            setUserLastName(userPb.full_name ? userPb.full_name.split(' ')[1] : 'Priezvisko');
            setEmail(userPb.email);
            setLocation(userPb.address);
            setAvatarUrl(userAvatar);
            setLoading(false);
        }
    };

    // Enable editing
    const enableEditing = () => {
        setEditable(true);

        setTimeout(() => {
            textInputRef.current?.focus();
        }, 0);
    };

    // Save changes
    const saveChanges = async () => {
        setEditable(false); // Disable editing

        const pb = new Pocketbase('https://mathiasdb.em1t.me/');
        const userFullName = `${firstName} ${userLastName}`;
        
        const user = await AsyncStorage.getItem('user');
        
        if (user){
            try{
                const parsedUser = JSON.parse(user);
                parsedUser.record.full_name = userFullName; // Update user full name

                await AsyncStorage.setItem('user', JSON.stringify(parsedUser)); // Save user data to async storage

                await pb.collection('users').authWithPassword(parsedUser.email, parsedUser.password);

                // Update user full name in database
                await pb.collection('users').update(parsedUser.record.id, {
                    'username': userName,
                    'full_name': userFullName,
                    'address': location,
                });

                parsedUser.record.username = userName;
                parsedUser.record.full_name = userFullName;
                parsedUser.record.address = location;
                await AsyncStorage.setItem('user', JSON.stringify(parsedUser));

                Alert.alert('Zmeny boli úspešne uložené');
            } catch (error){
                Alert.alert('Nepodarilo sa uložiť zmeny');

                // Fetch original user data
                const originalUser = await AsyncStorage.getItem('user');
                if (originalUser) {
                    const parsedOriginalUser = JSON.parse(originalUser);
                    setFirstName(parsedOriginalUser.record.full_name.split(' ')[0]);
                    setUserLastName(parsedOriginalUser.record.full_name.split(' ')[1]);
                    setUserName(parsedOriginalUser.record.username);
                    setLocation(parsedOriginalUser.record.address);
                    setEmail(parsedOriginalUser.email);
                }
            }
        }
    };

    // Log out
    const handleLogOut = async () => {
        await AsyncStorage.removeItem('user');
        onSignOut();
        Alert.alert('Boli ste úspešne odhlásený');
    };

    // Handle avatar pick
    const handleAvatarPick = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const pb = new Pocketbase('https://mathiasdb.em1t.me/');

        if (status !== 'granted') {
            Alert.alert('Chyba', 'Nemáte povolenie na prístup k galérii');
            return;
        }
        
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            quality: 1,
        });
        
        if (!result.canceled) {
            setLoading(true);
            const uri = result.assets[0].uri;

            try{
                const user = await AsyncStorage.getItem('user');

                const formData = new FormData();
                formData.append('avatar', {
                    uri: uri,
                    name: 'avatar',
                    type: 'image/jpeg'
                } as any);

                setAvatarUrl(uri);

                if(user){
                    const userData = JSON.parse(user);
                    const userEmail = userData.email;
                    const userPassword = userData.password;

                    await pb.collection('users').authWithPassword(userEmail, userPassword);

                    await pb.collection('users').update(userData.record.id, formData);
                    const updatedUser = {
                        ...userData,
                        record: {
                            ...userData.record,
                            avatar: formData.get('avatar')
                        }
                    };
                    await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
                    Alert.alert('Úspešne', 'Profilová fotka bola úspešne nahratá!');
                }
                setLoading(false);
            }catch(error) {
                console.log(error);
                Alert.alert('Chyba', 'Nepodarilo sa nahrať profilový fotku!');
            }
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <SafeAreaView style={{flex: 1}}>
            { loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#084575" />
                </View>
            ) :(
                <View>
                    <View style={{flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 10}}>
                        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 10}} onPress={() => navigation.navigate('Home')}>
                            <Ionicons name='arrow-back' size={18} color='#084575' />
                            <Text style={{fontSize: 16, fontWeight: 500, color: '#084575'}}>Späť</Text>
                        </TouchableOpacity>
                        <View style={{gap: 5}}>
                            <TouchableOpacity onPress={handleLogOut}>
                                <Text style={{fontSize: 16, fontWeight: 500, color: '#F62F2F', textAlign: 'right'}}>Odhlásiť sa</Text>
                            </TouchableOpacity>
                            {!editable ? (
                                <TouchableOpacity onPress={enableEditing}>
                                    <Text style={{fontSize: 16, fontWeight: 500, color: '#084575', textAlign: 'right'}}>Upraviť</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity onPress={saveChanges}>
                                    <Text style={{fontSize: 16, fontWeight: 500, color: '#084575', textAlign: 'right'}}>Uložiť</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    <View style={{flexDirection: 'row', alignItems: 'center', paddingHorizontal: 25, paddingBottom: 30, marginBottom: 10, borderRadius: 20, shadowColor: '#808080', shadowOffset: {width: 0, height: 5}, shadowOpacity: .5, shadowRadius: 3, backgroundColor: '#F0F0F0'}}>
                        <View style={{position: 'relative'}}>
                            <Image 
                                source={avatarUrl ? { uri: avatarUrl } : require('../assets/images/avatar.png')}
                                style={{width: 90, height: 90, borderRadius: 50, marginRight: 15}}
                            />
                            <TouchableOpacity style={{position: 'absolute', bottom: 0, right: 15, padding: 5, backgroundColor: '#E7D5A7', borderRadius: 25}} onPress={handleAvatarPick}>
                                <Ionicons name='camera-outline' size={20} color='black'/>
                            </TouchableOpacity>
                        </View>
                        <View style={{flex: 1}}>
                            <TextInput
                              ref={textInputRef}
                              value={firstName.toUpperCase()}
                              onChangeText={setFirstName}
                              editable={editable}
                              style={{fontSize: 28, fontWeight: '700', marginBottom: -3}}
                            />
                            <TextInput
                              value={userLastName.toUpperCase()}
                              onChangeText={setUserLastName}
                              editable={editable}
                              style={{fontSize: 28, fontWeight: '700', color: '#808080', textTransform: 'uppercase'}}
                            />
                        </View>
                    </View>
                    <View>
                        <View style={styles.input}>
                            <Ionicons 
                              name='person-outline'
                              size={45}
                              color='black'
                              style={{marginRight: 15}}
                            />
                            <View>
                                <Text style={{fontSize: 16, fontWeight: 500, textTransform: 'uppercase'}}>Username</Text>
                                <View style={{flexDirection: 'row'}}>
                                    <Text style={{fontSize: 16, color: '#808080'}}>@</Text>
                                    <TextInput 
                                      value={userName}
                                      onChangeText={setUserName}
                                      editable={editable}
                                      style={{fontSize: 16, color: '#808080'}}
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={styles.input}>
                            <Ionicons 
                              name='mail-outline'
                              size={45}
                              color='black'
                              style={{marginRight: 15}}
                            />
                            <View>
                                <Text style={{fontSize: 16, fontWeight: 500, textTransform: 'uppercase'}}>Email</Text>
                                <TextInput 
                                  value={email}
                                  onChangeText={setEmail}
                                  editable={false}
                                  style={{fontSize: 16, color: '#808080'}}
                                />
                            </View>
                        </View>
                        <View style={styles.input}>
                            <Ionicons 
                              name='location-outline'
                              size={45}
                              color='black'
                              style={{marginRight: 15}}
                            />
                            <View>
                                <Text style={{fontSize: 16, fontWeight: 500, textTransform: 'uppercase'}}>Adresa</Text>
                                <TextInput 
                                  placeholder='Vaša adresa'
                                  value={location}
                                  onChangeText={setLocation}
                                  editable={editable}
                                  placeholderTextColor={'#808080'}
                                  style={{fontSize: 16, color: '#808080'}}
                                />
                            </View>
                        </View>
                        <View style={styles.input}>
                            <TouchableOpacity style={{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}} onPress={() => navigation.navigate('Licenses')}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Ionicons 
                                      name='image-outline'
                                      size={45}
                                      color='black'
                                      style={{marginRight: 15}}
                                    />
                                    <Text style={{fontSize: 16, fontWeight: 500, textTransform: 'uppercase'}}>Kapitánsky preukaz</Text>
                                </View>
                                <Ionicons 
                                  name='chevron-forward-outline'
                                  size={30}
                                  color='#808080'
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </SafeAreaView>
    )
};

export default Profile;

const styles = StyleSheet.create({
    input: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#808080',
        borderRadius: 10,
    }
});
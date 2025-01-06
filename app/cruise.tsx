import React, { useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Image, Modal, Button, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Pocketbase from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Cruise = ({ route, navigation }: any) => {
    const { cruise } = route.params;
    const { day } = route.params;

    // Modal for adding new day
    const [isModalVisible, setModalVisible] = useState(false);
    const [dayName, setDayName] = useState('');
    const [dayDate, setDayDate] = useState<Date>();
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Reset day date
    const resetDayDate = () => {
        setDayDate(undefined);
        setDayName('');
    };

    // Open and close modal
    const handleOpenModal = () => {
        setModalVisible(true);
    }
    const handleCloseModal = () => {
        setModalVisible(false);
        resetDayDate();
    }

    // Date picker
    const [mode, setMode] = useState<'date' | 'time'>('date');
    const handleDateChange = ({ type }: any, selectedDate: Date | undefined) => {
        if (type === 'set' && selectedDate) {
            setDayDate(new Date(selectedDate));
            const dayName = new Intl.DateTimeFormat('sk-SK', { weekday: 'long' }).format(selectedDate);
            setDayName(dayName);
        } else {
            setShowDatePicker(false);
        }
    };
    const showModeFrom = (currentMode: any) => {
        setShowDatePicker(true);
        setMode(currentMode);
    };
    const showDayDatePicker = () => {
        showModeFrom('date');
    };

    // Add new day
    const handleAddDay = async() => {
        // Auth user with Pocketbase
        const pb = new Pocketbase('https://mathiasdb.em1t.xyz/');
        const user = await AsyncStorage.getItem('user');
        if(user){
            const userData = JSON.parse(user);
            const userEmail = userData.email;
            const userPassword = userData.password;
            await pb.collection('users').authWithPassword(userEmail, userPassword);

            try{
                // Add new day
                const dayData = {
                    date: dayDate?.toISOString().split('T')[0].split('-').reverse().join('.'),
                    day: dayName?.charAt(0).toUpperCase() + dayName?.slice(1),
                    engine: 0,
                    sails: 0,
                    time: '00:00:00',
                    total: 0,
                };
            
                const oldDayCruise = cruise.day_cruise;
                const newDayCruise = [...oldDayCruise, dayData];

                await pb.collection('cruises').update(cruise.id, { day_cruise: newDayCruise });
                handleCloseModal();
                navigation.navigate('Cruise', { cruise });

                cruise.day_cruise = newDayCruise;
                const updatedUser = {
                    ...userData,
                    cruises: userData.cruises?.map((c: any) => 
                        c.id === cruise.id ? { ...c, day_cruise: newDayCruise } : c
                    )
                };
                await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

                Alert.alert('Info', 'Nový deň bol pridaný');

                resetDayDate();
            }catch(err){
                Alert.alert('Chyba', 'Nepodarilo sa pridať nový deň');
                console.log(err);
            };
        };
    };

    return (
        <SafeAreaView style={{flex: 1}}>
            <View style={{flex: 1}}>
                <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', gap: 2, paddingInline: 10, marginBottom: 5}} onPress={() => navigation.navigate('Home')}>
                    <Ionicons name='arrow-back' size={18} color='#084575' />
                    <Text style={{fontSize: 16, fontWeight: 500, color: '#084575'}}>Späť</Text>
                </TouchableOpacity>
                <View style={{flexDirection: 'row', paddingRight: 10, paddingBottom: 10, alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.2)'}}>
                    <View style={{paddingInline: 10}}>
                        <Text style={{width: '100%', fontSize: 24, fontWeight: 600, textTransform: 'uppercase'}}>{cruise.country}</Text>
                        <Text style={{fontWeight: 500, color: '#808080'}}>{cruise.date}</Text>
                    </View>
                    <Image 
                        source={require('../assets/images/imgage.png')}
                        style={{width: 55, aspectRatio: 1}}    
                    />
                </View>
                <ScrollView>
                    {cruise.day_cruise.length > 0 ?
                        cruise.day_cruise.map((day: any) => (
                            <TouchableOpacity key={day.date} style={{flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.2)'}} onPress={() => navigation.navigate('Day', { day })}>
                                <View>
                                    <Text style={{fontSize: 16, fontWeight: 500, letterSpacing: 1}}>{day.day}</Text>
                                    <Text>{day.date}</Text>
                                </View>
                                <Ionicons 
                                  name='chevron-forward-outline'
                                  size={30}
                                  color='#808080'
                                />
                            </TouchableOpacity>
                        )) : (
                            <View style={{ padding: 10, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.2)'}}>
                                <Text>Nemáte žiaden záznam</Text>
                            </View>
                        )
                    }
                </ScrollView>
                <TouchableOpacity onPress={handleOpenModal} style={{width: '100%', alignItems: 'center', position: 'absolute', bottom: 0, left: 0, marginBottom: 10}}>
                  <Text style={{width: '100%', textAlign: 'center', textTransform: 'uppercase', fontWeight: 600}}>Pridať denný záznam</Text>
                </TouchableOpacity>
            </View>
                <Modal
                    animationType='fade'
                    transparent={true}
                    visible={isModalVisible}
                    onRequestClose={handleCloseModal}
                    presentationStyle='overFullScreen'
                >
                    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                        <View style={{width: '80%', padding: 20, backgroundColor: '#fff', borderRadius: 10}}>
                            <Text style={{fontSize: 16, fontWeight: 500, marginBottom: 10}}>Zadajte deň plavby</Text>
                            <TouchableOpacity onPress={showDayDatePicker}>
                                <TextInput
                                    placeholder="Vyberte dátum"
                                    value={dayDate ? dayDate.toISOString().split('T')[0].split('-').reverse().join('.') : ''}
                                    editable={false}
                                    onPressIn={showDayDatePicker}
                                />
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={dayDate ? dayDate : new Date()}
                                    mode="date"
                                    display="default"
                                    onChange={handleDateChange}
                                />
                            )}
                            <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 10}}>
                                <Button title="Zrušiť" onPress={handleCloseModal} color="red" />
                                <Button title="Pridať" onPress={handleAddDay} />
                            </View>
                        </View>
                    </View>
                </Modal>
        </SafeAreaView>
    );
}

export default Cruise;
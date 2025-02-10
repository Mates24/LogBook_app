import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Button, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Pocketbase from 'pocketbase';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const DayCruise = ({ route, navigation }: any) => {
    const { cruise, dayCruise } = route.params;

    const [loading, setLoading] = useState(true);
    const [reload, setReload] = useState(false);

    // Get hour records
    var [hourRecords, setHourRecords] = useState<any[]>([]);

    const getHourRecords = async () => {
        const pb = new Pocketbase('https://mathiasdb.em1t.me/');
        const user = await AsyncStorage.getItem('user');
        if(user){
            try{
                const userData = JSON.parse(user);
                const userEmail = userData.email;
                const userPassword = userData.password;
                await pb.collection('users').authWithPassword(userEmail, userPassword);

                const record = await pb.collection('day_cruise').getOne(dayCruise.id);

                if(record){
                    setHourRecords(record.hour_record);
                    setLoading(false);
                };
                
            }catch(err){
                console.log(err);
            };
        };
    };

    // Modal for adding new hour record
    const [isModalVisible, setModalVisible] = useState(false);
    const [hour, setHour] = useState('');

    // Reset inputs
    const resetInputs = () => {
        setHour('');
    };

    // Open and close modal
    const handleOpenModal = () => {
        setModalVisible(true);
    }
    const handleCloseModal = () => {
        setModalVisible(false);
        resetInputs();
    }

    // Add new hour record
    const handleAddRecord = async() => {
        const pb = new Pocketbase('https://mathiasdb.em1t.me/');
        const user = await AsyncStorage.getItem('user');
        
        if(user){
            const userData = JSON.parse(user);
            const userEmail = userData.email;
            const userPassword = userData.password;
            await pb.collection('users').authWithPassword(userEmail, userPassword);

            try{
                const hourData = {
                    hour: hour,
                    lat: "",
                    long: "",
                    compass_course: "",
                    bottom_course: "",
                    deviation: 0,
                    speed: 0,
                    sails: "",
                    engine: 0,
                    wind: "",
                    cloudiness: 0,
                    visibility: 0,
                    temperature: 0,
                    cruise: cruise.id,
                };
                await pb.collection('day_cruise').update(dayCruise.id, {
                    hour_record: [...hourRecords, hourData],
                });
                handleCloseModal();
                Alert.alert('Info', 'Nový záznam bol pridaný');                
                setReload(!reload);
                resetInputs();
            }catch(err){
                Alert.alert('Chyba', 'Nepodarilo sa pridať nový záznam');
                console.log(err);
            };
        };
    };

    useEffect(() => {
        getHourRecords();
    }, [reload]);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            { loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#084575" />
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', gap: 2, paddingInline: 10, marginBottom: 5}} onPress={() => navigation.navigate('Cruise', { cruise })}>
                            <Ionicons name='arrow-back' size={18} color='#084575' />
                            <Text style={{fontSize: 16, fontWeight: 500, color: '#084575'}}>Späť</Text>
                        </TouchableOpacity>
                        <View style={{flexDirection: 'row', paddingRight: 10, paddingBottom: 15, paddingTop: 5, alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.2)'}}>
                            <View style={{paddingInline: 10}}>
                                <Text style={{width: '100%', fontSize: 26, fontWeight: 700, textTransform: 'uppercase'}}>{dayCruise.day}</Text>
                                <Text style={{fontWeight: 500, color: '#808080'}}>{dayCruise.date}</Text>
                            </View>
                            <View>
                                <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                                    <Text style={{fontSize: 16, fontWeight: 500}}>Z prístavu:</Text>
                                    <Text style={{fontSize: 16}}>{dayCruise.from_port}</Text>
                                </View>
                                <View style={{flexDirection: 'row', alignItems: 'center', gap: 5}}>
                                    <Text style={{fontSize: 16, fontWeight: 500}}>Do prístavu:</Text>
                                    <Text style={{fontSize: 16}}>{dayCruise.to_port}</Text>
                                </View>
                            </View>
                        </View>
                        <ScrollView>
                            {hourRecords.length > 0 ? 
                                hourRecords.map((hourRecord : any) => (
                                    <TouchableOpacity key={hourRecord.hour} style={{flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.2)'}} onPress={() => navigation.navigate('HourRecord', { ...route.params, hourRecord })}>
                                        <View>
                                            <Text style={{fontSize: 16, fontWeight: 500, letterSpacing: 1}}>{hourRecord.hour}</Text>
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
                          <Text style={{color: '#808080', width: '100%', textAlign: 'center', textTransform: 'uppercase', fontWeight: 600}}>Pridať záznam</Text>
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
                                <Text style={{fontSize: 18, fontWeight: 600, marginBottom: 15, textTransform: 'uppercase'}}>Zadajte čas záznamu</Text>
                                <View style={{flexDirection: 'row', gap: 10, marginTop: 5}}>
                                    <Text style={{fontWeight: 600}}>Čas:</Text>
                                    <TextInput
                                        placeholder="Čas"
                                        value={hour}
                                        onChangeText={setHour}
                                    />
                                </View>
                                <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 10}}>
                                    <Button title="Zrušiť" onPress={handleCloseModal} color="red" />
                                    <Button title="Pridať" onPress={handleAddRecord} />
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            )}
        </SafeAreaView>
    );
}

export default DayCruise;
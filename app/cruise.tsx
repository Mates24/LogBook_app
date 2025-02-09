import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, Image, Modal, Button, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Pocketbase from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Cruise = ({ route, navigation }: any) => {
    const { cruise } = route.params;

    const [loading, setLoading] = useState(true);
    const [reaload, setReload] = useState(false);

    // Get cruise image
    const [url, setUrl] = useState<string>('');

    const getCruiseImg = async () => {
        const pb = new Pocketbase('https://mathiasdb.em1t.me/');
        const user = await AsyncStorage.getItem('user');
        if(user){
            const userData = JSON.parse(user);
            const userEmail = userData.email;
            const userPassword = userData.password;
            await pb.collection('users').authWithPassword(userEmail, userPassword);
            const record = await pb.collection('cruises').getOne(cruise.id);
            const cruiseImgUrl = pb.files.getUrl(record, record.image);
            setUrl(cruiseImgUrl);
        }
    }

    // Get day cruise
    var [dayCruises, setDayCruises] = useState<any[]>([]);

    const getDayCruises = async() => {
        const pb = new Pocketbase('https://mathiasdb.em1t.me/');
        const user = await AsyncStorage.getItem('user');
        if(user){
            try{
                const userData = JSON.parse(user);
                const userEmail = userData.email;
                const userPassword = userData.password;
                await pb.collection('users').authWithPassword(userEmail, userPassword);

                const record = await pb.collection('cruises').getOne(cruise.id);
                
                if(record){
                    const dayCruisesPb = await pb.collection('day_cruise').getFullList({
                        filter: `cruise = '${cruise.id}'`,
                        sort: 'date',
                    });

                    const formattedDayCruises = dayCruisesPb.map(dayCruise => ({
                        id: dayCruise.id,
                        date: dayCruise.date.split(' ')[0].split('-').reverse().join('.'),
                        day: dayCruise.day,
                        from_port: dayCruise.from_port,
                        to_port: dayCruise.to_port,
                        hourRecord: dayCruise.hour_record,
                        engine: dayCruise.engine,
                        sails: dayCruise.sails,
                        total: dayCruise.total,
                        time: dayCruise.time,
                    }));

                    setDayCruises(formattedDayCruises);
                    setLoading(false);
                };
            }catch(err){
                console.log(err);
            };
        };
    };

    // Modal for adding new day
    const [isModalVisible, setModalVisible] = useState(false);
    const [dayName, setDayName] = useState('');
    const [dayDate, setDayDate] = useState<Date>();
    const [fromPort, setFromPort] = useState('');
    const [toPort, setToPort] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Reset inputs
    const resetInputs = () => {
        setDayDate(undefined);
        setDayName('');
        setFromPort('');
        setToPort('');
    };

    // Open and close modal
    const handleOpenModal = () => {
        setModalVisible(true);
    }
    const handleCloseModal = () => {
        setModalVisible(false);
        resetInputs();
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
        const pb = new Pocketbase('https://mathiasdb.em1t.me/');
        const user = await AsyncStorage.getItem('user');
        
        if(user){
            const userData = JSON.parse(user);
            const userEmail = userData.email;
            const userPassword = userData.password;
            await pb.collection('users').authWithPassword(userEmail, userPassword);

            try{
                const dayData = {
                    date: dayDate?.toISOString(),
                    day: dayName?.charAt(0).toUpperCase() + dayName?.slice(1),
                    from_port: fromPort,
                    to_port: toPort,
                    hour_record: [],
                    engine: 0,
                    sails: 0,
                    total: 0,
                    time: '00:00:00',
                    cruise: cruise.id,
                };
                await pb.collection('day_cruise').create(dayData);
                handleCloseModal();
                Alert.alert('Info', 'Nový deň bol pridaný');                
                setReload(!reaload);
                resetInputs();
            }catch(err){
                Alert.alert('Chyba', 'Nepodarilo sa pridať nový deň');
                console.log(err);
            };
        };
    };

    useEffect(() => {
        getDayCruises();
        getCruiseImg();
    }, [reaload]);

    return (
        <SafeAreaView style={{flex: 1}}>
            { loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#084575" />
                </View>
            ) : (
                <View style={{flex: 1}}>
                    <View style={{flex: 1}}>
                        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', gap: 2, paddingInline: 10, marginBottom: 5}} onPress={() => navigation.navigate('Home')}>
                            <Ionicons name='arrow-back' size={18} color='#084575' />
                            <Text style={{fontSize: 16, fontWeight: 500, color: '#084575'}}>Späť</Text>
                        </TouchableOpacity>
                        <View style={{flexDirection: 'row', paddingRight: 10, paddingBottom: 15, paddingTop: 5, alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.2)'}}>
                            <View style={{paddingInline: 10}}>
                                <Text style={{width: '100%', fontSize: 26, fontWeight: 700, textTransform: 'uppercase'}}>{cruise.country}</Text>
                                <Text style={{fontWeight: 500, color: '#808080'}}>{cruise.date}</Text>
                            </View>
                            <Image 
                                source={url ? { uri: url } : require('../assets/images/imgage.png')}
                                style={{width: 55, aspectRatio: 1, borderRadius: 5}}    
                            />
                        </View>
                        <ScrollView>
                            {dayCruises.length > 0 ?
                                dayCruises.map((dayCruise: any) => (
                                    <TouchableOpacity key={dayCruise.date} style={{flexDirection:'row', alignItems: 'center', justifyContent: 'space-between', padding: 10, borderBottomWidth: 1, borderColor: 'rgba(0,0,0,0.2)'}} onPress={() => navigation.navigate('DayCruise', { ...route.params, dayCruise })}>
                                        <View>
                                            <Text style={{fontSize: 16, fontWeight: 500, letterSpacing: 1}}>{dayCruise.day}</Text>
                                            <Text>{dayCruise.date}</Text>
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
                          <Text style={{color: '#808080', width: '100%', textAlign: 'center', textTransform: 'uppercase', fontWeight: 600}}>Pridať denný záznam</Text>
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
                                <Text style={{fontSize: 18, fontWeight: 600, marginBottom: 15, textTransform: 'uppercase'}}>Zadajte deň plavby</Text>
                                <TouchableOpacity style={{flexDirection: 'row', gap: 10}} onPress={showDayDatePicker}>
                                    <Text style={{fontWeight: 600}}>Dátum:</Text>
                                    <TextInput
                                        placeholder="Vyberte dátum"
                                        value={dayDate ? dayDate.toISOString().split('T')[0].split('-').reverse().join('.') : ''}
                                        editable={false}
                                        onPressIn={showDayDatePicker}
                                        placeholderTextColor={'#808080'}
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
                                <View style={{flexDirection: 'row', gap: 10, marginTop: 5}}>
                                    <Text style={{fontWeight: 600}}>Z prístavu:</Text>
                                    <TextInput
                                        placeholder="Prístav"
                                        value={fromPort}
                                        onChangeText={setFromPort}
                                    />
                                </View>
                                <View style={{flexDirection: 'row', gap: 10, marginTop: 5}}>
                                    <Text style={{fontWeight: 600}}>Do prístavu:</Text>
                                    <TextInput
                                        placeholder="Prístav"
                                        value={toPort}
                                        onChangeText={setToPort}
                                    />
                                </View>
                                <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 10}}>
                                    <Button title="Zrušiť" onPress={handleCloseModal} color="red" />
                                    <Button title="Pridať" onPress={handleAddDay} />
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            )}
        </SafeAreaView>
    );
}

export default Cruise;
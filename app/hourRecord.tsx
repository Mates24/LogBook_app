import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Pocketbase from 'pocketbase';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

const HourRecord = ({ route, navigation }: any) => {
    const { cruise, dayCruise, hourRecord } = route.params;

    const [loading, setLoading] = useState(true);
    const [updatedRecord, setUpdatedRecord] = useState<any[]>([]);

    // Inputs for navigation
    const [lat, setLat] = useState('');
    const [long, setLong] = useState('');
    const [compassCourse, setCompassCourse] = useState('');
    const [bottomCourse, setBottomCourse] = useState('');
    const [deviation, setDeviation] = useState('');
    const [speed, setSpeed] = useState('');
    const [sails, setSails] = useState('');
    const [engine, setEngine] = useState('');

    // Inputs for weather
    const [wind, setWind] = useState('');
    const [cloudiness, setCloudiness] = useState('');
    const [visibility, setVisibility] = useState('');
    const [temperature, setTemperature] = useState('');

    // Inputs for notes
    const [notes, setNotes] = useState('');

    // Get data
    const getData = async () => {
        const pb = new Pocketbase('https://mathiasdb.em1t.me/');
        const user = await AsyncStorage.getItem('user');

        if(user){
            const userData = JSON.parse(user);
            const userEmail = userData.email;
            const userPassword = userData.password;
            await pb.collection('users').authWithPassword(userEmail, userPassword);

            try {
                const record = await pb.collection('day_cruise').getOne(dayCruise.id);
                const hourData = record.hour_record.find((hr: any) => hr.hour === hourRecord.hour);
                if (hourData) {
                    const data = {
                        lat: hourData.lat,
                        long: hourData.long,
                        compassCourse: hourData.compass_course,
                        bottomCourse: hourData.bottom_course,
                        deviation: hourData.deviation,
                        speed: hourData.speed,
                        sails: hourData.sails,
                        engine: hourData.engine,
                        wind: hourData.wind,
                        cloudiness: hourData.cloudiness,
                        visibility: hourData.visibility,
                        temperature: hourData.temperature,
                        notes: hourData.notes
                    };
                    setLat(data.lat);
                    setLong(data.long);
                    setCompassCourse(data.compassCourse);
                    setBottomCourse(data.bottomCourse);
                    setDeviation(data.deviation);
                    setSpeed(data.speed);
                    setSails(data.sails);
                    setEngine(data.engine);
                    setWind(data.wind);
                    setCloudiness(data.cloudiness);
                    setVisibility(data.visibility);
                    setTemperature(data.temperature);
                    setNotes(data.notes);
                    setInitialData(data);
                }
            } catch (err) {
                console.log(err);
            }
        }

        setLoading(false);
    };

    // Store initial data to compare changes
    const [initialData, setInitialData] = useState({});
    const [showButtons, setShowButtons] = useState(false);

    // Update database
    const updateRecord = async() => {
        const pb = new Pocketbase('https://mathiasdb.em1t.me/');
        const user = await AsyncStorage.getItem('user');

        if(user){
            const userData = JSON.parse(user);
            const userEmail = userData.email;
            const userPassword = userData.password;
            await pb.collection('users').authWithPassword(userEmail, userPassword);

            try{
                // Získanie aktuálnych údajov o DayCruise
                const existingDayCruise = await pb.collection('day_cruise').getOne(dayCruise.id);
                
                // Skopírovanie existujúcich záznamov
                const updatedHourRecords = existingDayCruise.hour_record.map((record: any) => 
                    record.hour === hourRecord.hour 
                        ? { 
                            ...record,
                            lat,
                            long,
                            compass_course: compassCourse,
                            bottom_course: bottomCourse,
                            deviation,
                            speed,
                            sails,
                            engine,
                            wind,
                            cloudiness,
                            visibility,
                            temperature,
                            notes
                        } 
                        : record
                );

                setUpdatedRecord(updatedHourRecords);

                await pb.collection('day_cruise').update(dayCruise.id, {
                    "hour_record": updatedHourRecords,
                });

                setShowButtons(false);
                Alert.alert('Záznam bol úspešne upravený');
            }catch(err){
                console.log(err);
            };
        };
    };

    useEffect(() => {
        const hasChanges = JSON.stringify(initialData) !== JSON.stringify({
            lat, long, compassCourse, bottomCourse, deviation, speed, sails, engine, wind, cloudiness, visibility, temperature, notes
        });
        setShowButtons(hasChanges);
    }, [lat, long, compassCourse, bottomCourse, deviation, speed, sails, engine, wind, cloudiness, visibility, temperature, notes]);

    useEffect(() => {
        getData();
    }, []);

    return (
        <SafeAreaView style={{flex: 1}}>
            { loading ? (
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <ActivityIndicator size="large" color="#084575" />
                </View>
            ) : (
                <View style={{flex: 1}}>
                    <View style={{paddingBottom: 15}}>
                        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center', gap: 2, paddingInline: 10, marginBottom: 5}} onPress={() => navigation.navigate('DayCruise', { cruise, dayCruise: { ...dayCruise, hour_record: updatedRecord } })}>
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
                    </View>
                    <View style={{paddingHorizontal: 10, paddingBottom: 15}}>
                        <Text style={styles.labels}>Navigácia</Text>
                        <View style={styles.inputs}>
                            <TextInput 
                              placeholder='Zemepisná šírka' 
                              placeholderTextColor={'#808080'} 
                              value={lat}
                              onChangeText={setLat}
                              style={styles.input}
                            />
                            <TextInput 
                              placeholder='Zemepisná dĺžka' 
                              placeholderTextColor={'#808080'} 
                              value={long}
                              onChangeText={setLong}
                              style={styles.input}
                            />
                            <TextInput 
                              placeholder='Kurz kompasový' 
                              placeholderTextColor={'#808080'} 
                              value={compassCourse}
                              onChangeText={setCompassCourse}
                              style={styles.input}
                            />
                            <TextInput 
                              placeholder='Kurz dnový' 
                              placeholderTextColor={'#808080'} 
                              value={bottomCourse}
                              onChangeText={setBottomCourse}
                              style={styles.input}
                            />
                            <TextInput 
                              placeholder='Deviace' 
                              placeholderTextColor={'#808080'} 
                              value={deviation}
                              onChangeText={setDeviation}
                              style={styles.input}
                            />
                            <TextInput 
                              placeholder='Rýchlosť' 
                              placeholderTextColor={'#808080'} 
                              value={speed}
                              onChangeText={setSpeed}
                              style={styles.input}
                            />
                            <TextInput 
                              placeholder='Plachty' 
                              placeholderTextColor={'#808080'} 
                              value={sails}
                              onChangeText={setSails}
                              style={styles.input}
                            />
                            <TextInput 
                              placeholder='Motor' 
                              placeholderTextColor={'#808080'} 
                              value={engine}
                              onChangeText={setEngine}
                              style={styles.input}
                            />
                        </View>
                    </View>
                    <View style={{paddingHorizontal: 10, paddingBottom: 15}}>
                        <Text style={styles.labels}>Počasie</Text>
                        <View style={styles.inputs}>
                            <TextInput 
                              placeholder='Vietor' 
                              placeholderTextColor={'#808080'} 
                              value={wind}
                              onChangeText={setWind}
                              style={styles.input}
                            />
                            <TextInput 
                              placeholder='Oblačnosť' 
                              placeholderTextColor={'#808080'} 
                              value={cloudiness}
                              onChangeText={setCloudiness}
                              style={styles.input}
                            />
                            <TextInput 
                              placeholder='Viditeľnosť' 
                              placeholderTextColor={'#808080'} 
                              value={visibility}
                              onChangeText={setVisibility}
                              style={styles.input}
                            />
                            <TextInput 
                              placeholder='Teplota' 
                              placeholderTextColor={'#808080'} 
                              value={temperature}
                              onChangeText={setTemperature}
                              style={styles.input}
                            />
                        </View>
                    </View>
                    <View style={{paddingHorizontal: 10}}>
                        <Text style={styles.labels}>Poznámky</Text>
                        <View style={styles.inputs}>
                            <TextInput 
                              placeholder='Poznámky...' 
                              placeholderTextColor={'#808080'}
                              multiline
                              value={notes}
                              onChangeText={setNotes}
                              style={styles.inputArea}
                            />
                        </View>
                    </View>
                    { showButtons && (
                        <View style={{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'absolute', bottom: 0, left: 0, marginBottom: 10, gap: 10}}>
                            <TouchableOpacity /*onPress={cancelCruise}*/>
                                <Text style={{fontSize: 16, fontWeight: 500, color: '#F62F2F'}}>Zrušiť</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={updateRecord}>
                                <Text style={{fontSize: 16, fontWeight: 500, color: '#084575'}}>Uložiť</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}

export default HourRecord;

const styles = StyleSheet.create({
    labels: {
        fontSize: 18,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 10
    },

    inputs:{
        flexWrap: 'wrap', 
        flexDirection: 'row', 
        justifyContent: 'space-between',
    },

    input: {
        width: '45%',
        marginBottom: 15,
        fontSize: 16,
        color: '#000',
        borderBottomWidth: 1,
        borderColor: '#808080',
    },

    inputArea: {
        width: '100%',
        height: 164,
        padding: 10,
        fontSize: 16,
        color: '#000',
        borderWidth: 1,
        borderRadius: 10,
        borderColor: '#808080',
    }
});
import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Pocketbase from 'pocketbase';

const DayCruise = ({ route, navigation }: any) => {
    const { cruise, dayCruise } = route.params;

    const [loading, setLoading] = useState(false);

    useEffect(() => {
    }, []);

    return (
        <SafeAreaView style={{ flex: 1 }}>
            { loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#084575" />
                </View>
            ) : (
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
                </View>
            )}
        </SafeAreaView>
    );
}

export default DayCruise;
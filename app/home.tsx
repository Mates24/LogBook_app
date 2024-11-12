import React, { useState, useEffect, useCallback } from 'react';
import { NavigationProp, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView, ScrollView, View, TouchableOpacity, Image, Text, Dimensions, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import Pocketbase from 'pocketbase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { API_KEY } from '@/constants/WeatherAPIKey';

interface Props {
    navigation: NavigationProp<any>;
};

interface Cruise {
    id: string;
    country: string;
    date: string;
    sails: number;
    engine: number;
    time: number;
};

const Home = ({ navigation }: Props) => {
    const [loading, setLoading] = useState(true);
    const [cruises, setCruises] = useState<Cruise[]>([]);
    const [weatherData, setWeatherData] = useState<any>(null);
    const [loadingWeather, setLoadingWeather] = useState(true);
    const [locationError, setLocationError] = useState<string | null>(null);
    const [url, setUrl] = useState<string>('');

    
    // Get users avatar
    const getUserAvatar = async () => {
        const pb = new Pocketbase('https://mathiasdb.em1t.xyz/');
        const user = await AsyncStorage.getItem('user');
        if(user){
            const userData = JSON.parse(user);
            const userEmail = userData.email;
            const userPassword = userData.password;
            await pb.collection('users').authWithPassword(userEmail, userPassword);
            const userAvatar = pb.files.getUrl(userData.record, userData.record.avatar);
            setUrl(userAvatar);
        }
    }

    // Weather API
    const fetchWeather = async (lat: number, lon: number) => {
        try {
            const response = await fetch(
                `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&exclude=hourly&appid=${API_KEY}&units=metric`
            );
            const json = await response.json();
            if (json) {
                setWeatherData(json);
            } else {
                console.warn('Failed to fetch weather data');
            }
            setLoadingWeather(false);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            setLoadingWeather(false);
        }
    };
    const hour = new Date().getHours();
    const isDay = hour >= 6 && hour < 18;
    const getWeatherIcon = (weather: string, isDay: boolean) => {
        switch (weather) {
            case 'clear sky':
                return isDay ? 'weather-sunny' : 'weather-night';
            case 'few clouds':
                return 'weather-partly-cloudy';
            case 'scattered clouds':
                return 'weather-cloudy';
            case 'broken clouds':
                return 'weather-cloudy';
            case 'shower rain':
                return 'weather-rainy';
            case 'rain':
                return 'weather-pouring';
            case 'thunderstorm':
                return 'weather-lightning';
            case 'snow':
                return 'weather-snowy';
            case 'mist':
                return 'weather-fog';
            default:
                return isDay ? 'weather-sunny' : 'weather-night';
        }
    };

    // Cruises
    const getCruise = async () => {
        setLoading(true);
        const pb = new Pocketbase('https://mathiasdb.em1t.xyz/');
        const user = await AsyncStorage.getItem('user');

        if(!user){
            console.log('User not found');
            return;
        }else{
            try{
                const userData = JSON.parse(user);
                const userEmail = userData.email;
                const userPassword = userData.password;
                
                await pb.collection('users').authWithPassword(userEmail, userPassword);

                const record = await pb.collection('users').getOne(userData.record.id);

                
                if (record) {
                    const records = await pb.collection('cruises').getFullList(10000, {
                        filter: `user = '${userData.record.id}'`,
                        expand: 'country,day_cruise,image,from,to',
                        sort: '-from',
                    });


                    const formattedCruises = records.map(record => ({
                        id: record.id,
                        country: record.country,
                        date: record.from.split(' ')[0].split('-').reverse().join('.') + ' - ' + record.to.split(' ')[0].split('-').reverse().join('.'),
                        sails: record.day_cruise ? record.day_cruise.sails || 0 : 0,
                        engine: record.day_cruise ? record.day_cruise.engine || 0 : 0,
                        time: record.day_cruise ? record.day_cruise.time || 0 : 0,
                    }));

                    setCruises(formattedCruises);
                } else {
                    console.log('No cruises found for the user');
                }
            }catch(err){
                console.log(err);
            }finally{
                setLoading(false);
            }
        };
    };

    // Chart
    const currentDayIndex = new Date().getDay();
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const getShiftedDays = () => {
      return [...daysOfWeek.slice(currentDayIndex), ...daysOfWeek.slice(0, currentDayIndex)];
    };
    
    const screenWidth = Dimensions.get('window').width;
    const chartConfig = {
        backgroundGradientFrom: "#FFF",
        backgroundGradientTo: "#fff",
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(8,69,117,${opacity})`,
        fillShadowGradienFrom: "#084575",
        fillShadowGradientTo: "#084575",
        fillShadowGradientFromOpacity: 1,
        fillShadowGradientToOpacity: 1,
        labelColor: () => `#000`,
        barPercentage: 0.8,
        barRadius: 5,
        propsForBackgroundLines: {
            strokeWidth: 0,
        },
        propsForLabels: {
            fontSize: 16,
            fontWeight: '600',
        }
    };
    const chartData = {
        labels: getShiftedDays(),
        datasets: [
          {
            data: [20, 45, 28, 80, 120, 43, 14]
          }
        ]
    };

    useEffect(() => {
        // Get location for weather data
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationError('Permission to access location was denied');
                setLoadingWeather(false);
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            fetchWeather(location.coords.latitude, location.coords.longitude);
        })();

        getUserAvatar();
        getCruise();
    }, []);

    useFocusEffect(
        useCallback(() => {
            getUserAvatar();
            getCruise();
        }, [])
    );
    
    return (
        <SafeAreaView style={{flex: 1}}>
            { loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#084575" />
                </View>
            ) : (
                <View style={{flex: 1}}>
                    <View style={{position: 'relative', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 10, marginBottom: 20}}>
                        <View style={{position: 'absolute', left: 10, width: '81.5%', height: 60, borderWidth: 2, borderColor: '#555', borderRightWidth: 0, borderTopStartRadius: 15, borderBottomStartRadius: 15, padding: 10, justifyContent: 'center'}}>
                            {loadingWeather ? (
                                <Text style={{fontSize: 16, fontWeight: 600, color: '#808080'}}>Loading weather...</Text>
                            ) : locationError ? (
                                <Text>{locationError}</Text>
                            ) : weatherData && weatherData.list ? (
                                <View>
                                    <Text style={{ fontSize: 16, fontWeight: '600' }}>{weatherData.city?.name || 'Unknown location'}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={{ fontSize: 16, fontWeight: '600', marginEnd: 10 }}>
                                            {weatherData.list[0].main.temp !== undefined ? `${Math.round(weatherData.list[0].main.temp)}°C` : 'N/A'}
                                        </Text>
                                        <MaterialCommunityIcons name={getWeatherIcon(weatherData.list[0].weather[0]?.main || '', isDay)} size={24} color="black" style={{marginEnd: 5}}/>
                                        {weatherData.list.slice(0, 6).map((forecast: any, index: any) => (
                                            <MaterialCommunityIcons
                                                key={index}
                                                name={getWeatherIcon(forecast.weather[0]?.main || '', isDay)}
                                                size={24}
                                                color="black"
                                                style={{marginEnd: 5}}
                                            />
                                        ))}
                                    </View>
                                </View>
                            ) : (
                                <Text>Weather data unavailable</Text>
                            )}
                        </View>
                        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                            <Image 
                                source={url ? { uri: url } : require('../assets/images/avatar.png')}
                                style={{width: 75, height: 75, borderRadius: 50}}
                            />
                        </TouchableOpacity>
                    </View>
                    <View style={{alignItems: 'center'}}>
                        <Text style={{fontSize: 18, fontWeight: 600, textTransform: 'uppercase', marginBottom: 10}}>Sailed miles this week</Text>
                        <BarChart 
                           style={{ borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 1 }}
                           data={chartData}
                           width={screenWidth - 20}
                           height={180}
                           yAxisLabel=''
                           yAxisSuffix=''
                           chartConfig={chartConfig}
                           showBarTops={false}
                           withHorizontalLabels={false}
                           fromZero={true}
                           showValuesOnTopOfBars={true}
                        />
                    </View>
                    <View style={{flex: 1, marginTop: 20, paddingHorizontal: 10}}>
                        <View style={{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5}}>
                            <Text style={{fontSize: 18, fontWeight: 600, textTransform: 'uppercase'}}>Cruises</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Cruise')}>
                                <Text style={{fontSize: 16, fontWeight: 600, textTransform: 'uppercase', color: '#808080'}}>Pridať plabu</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{borderTopWidth: 0.2, borderColor: 'rgba(0,0,0,0.2)', paddingTop: 5}}>
                            {cruises.length > 0 ?
                                cruises.map(cruise => (
                                    <TouchableOpacity style={{width: '100%', height: 125, borderWidth: 2, borderRadius: 16, padding: 10, marginBottom: 10}} key={cruise.id} onPress={() => navigation.navigate('Cruise', { cruise })}>
                                        <View style={{flexDirection: 'row', flex: 1.5, gap: 10}}>
                                            <Image 
                                                source={require('../assets/images/imgage.png')}
                                                style={{height: '100%', width: 50}}    
                                            />
                                            <View style={{display: 'flex'}}>
                                                <Text style={{fontSize: 22, fontWeight: 600}}>{cruise.country}</Text>
                                                <Text style={{fontSize: 12, paddingLeft: 1}}>{cruise.date}</Text>
                                            </View>
                                        </View>
                                        <View style={{flexDirection: 'row', flex: 1, gap: 15, alignItems: 'flex-end'}}>
                                            <View>
                                                <Text style={{fontSize: 14, fontWeight: 600, textAlign: 'center'}}>Plachty</Text>
                                                <Text style={{fontSize: 13, textAlign: 'center'}}>{cruise.sails} mi</Text>
                                            </View>
                                            <View>
                                                <Text style={{fontSize: 14, fontWeight: 600, textAlign: 'center'}}>Motor</Text>
                                                <Text style={{fontSize: 13, textAlign: 'center'}}>{cruise.engine} mi</Text>
                                            </View>
                                            <View>
                                                <Text style={{fontSize: 14, fontWeight: 600, textAlign: 'center'}}>Čas</Text>
                                                <Text style={{fontSize: 13, textAlign: 'center'}}>{cruise.time}</Text>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )) : (
                                    <Text style={{fontSize: 16, fontWeight: 600, textAlign: 'center'}}>No cruises found</Text>
                                )
                            }    
                        </ScrollView>
                    </View>  
                </View>
            )}
        </SafeAreaView>
    );
}

export default Home;
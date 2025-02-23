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
    total: number;
    image: any;
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
        const pb = new Pocketbase('https://mathiasdb.em1t.me/');
        const user = await AsyncStorage.getItem('user');
        if(user){
            const userData = JSON.parse(user);
            const userEmail = userData.email;
            const userPassword = userData.password;
            await pb.collection('users').authWithPassword(userEmail, userPassword);
            const userAvatar = pb.files.getUrl(userData.record, userData.record.avatar);
            setUrl(userAvatar);
        }
    };

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
        const pb = new Pocketbase('https://mathiasdb.em1t.me/');
        const user = await AsyncStorage.getItem('user');
    
        if (!user) {
            console.log('User not found');
            setLoading(false);
            return;
        }
    
        try {
            const userData = JSON.parse(user);
            const userEmail = userData.email;
            const userPassword = userData.password;
    
            await pb.collection('users').authWithPassword(userEmail, userPassword);
    
            const userRecord = await pb.collection('users').getOne(userData.record.id);
    
            if (userRecord) {
                const cruises = await pb.collection('cruises').getFullList({
                    filter: `user = '${userData.record.id}'`,
                    sort: '-from',
                });
    
                const formattedCruises = [];

                for (const cruise of cruises) {
                  let sailsTotal = 0;
                  let engineTotal = 0;
                  let overallTotal = 0;
                
                  try {
                    const dailyRecords = await pb.collection('day_cruise').getFullList({
                      filter: `cruise = '${cruise.id}'`,
                    });
                
                    dailyRecords.forEach((dailyRecord) => {
                      sailsTotal += dailyRecord.sails;
                      engineTotal += dailyRecord.engine;
                      overallTotal += dailyRecord.sails + dailyRecord.engine;
                    });
                  } catch (err) {
                    console.error(`Error fetching daily records for cruise ${cruise.id}:`, err);
                  }
              
                  const formatDate = (date: any) => {
                    if (!date) return 'Neznámy dátum';
                    return date.split(' ')[0].split('-').reverse().join('.');
                  };
              
                  formattedCruises.push({
                    id: cruise.id,
                    country: cruise.country,
                    date: `${formatDate(cruise.from)} - ${formatDate(cruise.to)}`,
                    sails: sailsTotal,
                    engine: engineTotal,
                    total: overallTotal,
                    image: cruise.image
                      ? { uri: pb.files.getUrl(cruise, cruise.image) }
                      : require('../assets/images/image.png'),
                  });
                }
                setCruises(formattedCruises);
            } else {
                console.log('No user record found');
            }
        } catch (err) {
            console.log('Error fetching cruises:', err);
        } finally {
            setLoading(false);
        }
    };    

    // Chart
    const currentDayIndex = new Date().getDay();
    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // Získaj dátumy za posledných 7 dní
    const getLast7DaysDates = () => {
      const dates = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date.toISOString().split('T')[0]);
      }
      return dates;
    };

    // Funkcia na dynamické načítanie dát
    const loadChartData = async () => {
        const pb = new Pocketbase('https://mathiasdb.em1t.me/');
        const user = await AsyncStorage.getItem('user');
      
        if (!user) {
          console.log('User not found');
          return;
        }
      
        const userData = JSON.parse(user);
        await pb.collection('users').authWithPassword(userData.email, userData.password);
      
        // Získame cruises používateľa
        const cruises = await pb.collection('cruises').getFullList({
          filter: `user = '${userData.record.id}'`,
        });
      
        const cruiseIds = cruises.map(cruise => cruise.id);
        const last7Days = getLast7DaysDates();
        const dataPerDay = [];
      
        for (const day of last7Days) {
          let totalMiles = 0;
      
          for (const cruiseId of cruiseIds) {
            const records = await pb.collection('day_cruise').getFullList({
              filter: `cruise = '${cruiseId}' && date >= '${day} 00:00:00' && date <= '${day} 23:59:59'`,
            });
      
            records.forEach(rec => {
              totalMiles += rec.total;
            });
          }
          dataPerDay.push(totalMiles);
        }
      
        setChartData({
          labels: daysOfWeek.slice(currentDayIndex).concat(daysOfWeek.slice(0, currentDayIndex)),
          datasets: [{ data: dataPerDay }]
        });
    };

    const [chartData, setChartData] = useState({
      labels: daysOfWeek,
      datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
    });

    const screenWidth = Dimensions.get('window').width;
    const chartConfig = {
        backgroundGradientFrom: "#FFF",
        backgroundGradientFromOpacity: 0,
        backgroundGradientTo: "#FFF",
        backgroundGradientToOpacity: 0,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(8,69,117,${opacity})`,
        fillShadowGradienFrom: "#084575",
        fillShadowGradientFromOpacity: 1,
        fillShadowGradientTo: "#084575",
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

    useEffect(() => {
        // Získanie polohy pre zobrazenie počasia
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

        loadChartData();
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
                        <Text style={{fontSize: 18, fontWeight: 600, textTransform: 'uppercase', marginBottom: 10}}>Naplávané míle za posledný týždeň</Text>
                        <View style={{borderRadius: 16, justifyContent: 'center', alignItems: 'center', paddingInline: 25, paddingBlock: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 1, overflowX: 'hidden', backgroundColor: '#FFF'}}>
                            <BarChart
                               style={{marginLeft: -65}}
                               data={chartData}
                               width={screenWidth - 20}
                               height={180}
                               yAxisLabel='mi'
                               yAxisSuffix=''
                               chartConfig={chartConfig}
                               showBarTops={false}
                               withHorizontalLabels={false}
                               fromZero={true}
                               showValuesOnTopOfBars={true}
                            />
                        </View>
                    </View>
                    <View style={{flex: 1, marginTop: 20, paddingHorizontal: 10}}>
                        <View style={{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5}}>
                            <Text style={{fontSize: 18, fontWeight: 600, textTransform: 'uppercase'}}>Plavby</Text>
                            <TouchableOpacity onPress={() => navigation.navigate('AddCruise')}>
                                <Text style={{fontSize: 16, fontWeight: 600, textTransform: 'uppercase', color: '#808080'}}>Pridať plabu</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{borderTopWidth: 0.2, borderColor: 'rgba(0,0,0,0.2)', paddingTop: 5}}>
                            {cruises.length > 0 ?
                                cruises.map(cruise => (
                                    <TouchableOpacity style={{width: '100%', height: 115, borderWidth: 2, borderRadius: 16, padding: 10, marginBottom: 10}} key={cruise.id} onPress={() => navigation.navigate('Cruise', { cruise })}>
                                        <View style={{flexDirection: 'row', flex: 1, gap: 10, alignItems: 'center'}}>
                                            <Image 
                                                source={cruise.image}
                                                style={{width: 90, aspectRatio: 1, borderRadius: 10}}    
                                            />
                                            <View style={{display: 'flex', justifyContent: 'space-between', height: 90, paddingTop: 1, paddingBottom: 3}}>
                                                <View>
                                                    <Text style={{fontSize: 22, fontWeight: 600}}>{cruise.country}</Text>
                                                    <Text style={{fontSize: 12, paddingLeft: 1}}>{cruise.date}</Text>
                                                </View>
                                                <View style={{flexDirection: 'row', gap: 15, alignItems: 'flex-end'}}>
                                                    <View>
                                                        <Text style={{fontSize: 14, fontWeight: 600, textAlign: 'center'}}>Plachty</Text>
                                                        <Text style={{fontSize: 13, textAlign: 'center'}}>{cruise.sails ? cruise.sails : '0'} mi</Text>
                                                    </View>
                                                    <View>
                                                        <Text style={{fontSize: 14, fontWeight: 600, textAlign: 'center'}}>Motor</Text>
                                                        <Text style={{fontSize: 13, textAlign: 'center'}}>{cruise.engine ? cruise.engine : '0'} mi</Text>
                                                    </View>
                                                    <View>
                                                        <Text style={{fontSize: 14, fontWeight: 600, textAlign: 'center'}}>Celkom</Text>
                                                        <Text style={{fontSize: 13, textAlign: 'center'}}>{cruise.total ? cruise.total : '0'} mi</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                )) : (
                                    <Text style={{fontSize: 16, fontWeight: 600, textAlign: 'center'}}>Nenašli sa žiadne plavby</Text>
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
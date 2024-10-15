import * as React from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image } from 'react-native';

const Cruise = () => {
    <SafeAreaView>
        <View>
            <TouchableOpacity>
                <Image />
                <Text>Späť</Text>
            </TouchableOpacity>
        </View>
        <View>
            <Text>Plavba</Text>
            <TextInput />
            <TextInput />
            <TextInput />
        </View>
        <View>
            <Text>Plavidlo</Text>
            <TextInput />
            <TextInput />
            <TextInput />
            <TextInput />
            <TextInput />
            <TextInput />
        </View>
        <View>
            <Text>Skipper</Text>
            <TextInput />
            <TextInput />
        </View>
        <View>
            <Text>Posádka</Text>
            <TextInput />
            <TextInput />
            <TextInput />
            <TouchableOpacity>
                <Text>Pridať člena</Text>
            </TouchableOpacity>
        </View>
        <View>
            <TouchableOpacity>
                <Text>Zrušiť</Text>
            </TouchableOpacity>
            <TouchableOpacity>
                <Text>Pridať</Text>
            </TouchableOpacity>
        </View>
    </SafeAreaView>
}
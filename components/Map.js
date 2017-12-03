import React, { Component } from 'react';
import Icon from 'react-native-vector-icons/Ionicons'
import MapView from 'react-native-maps'
import {
    Platform,
    StyleSheet,
    Text,
    View,      
    Dimensions,
    PermissionsAndroid,
} from 'react-native'

class Map extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            permissionState: false,
            latitude: null,
            longitude: null,
            error: null,
        };
    }
    
    componentDidMount() {
        Platform.OS === 'android' && Platform.Version >= 23 ? this.requestMapPermission() : this.requestMap()
    }
    
    async requestMapPermission() {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Granted');
                this.watchId = navigator.geolocation.getCurrentPosition(
                    (position) => {
                        console.log('Position is watched');
                        this.setState({
                            permissionState: true,
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            error: null,
                        });
                    },
                    (error) => this.setState({error: error.message}),
                    {enableHighAccuracy: false, timeout: 20000, maximumAge: 1000},
                );
    
            } else {
                console.log('not Granted');
                this.setState({
                    permissionState: false,
                });
            }
        } catch (err) {
            console.warn(err)
        }
    }
    
    requestMap() {
        this.watchId = navigator.geolocation.watchPosition(
            (position) => {
                this.setState({
                    permissionState: true,
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    error: null,
                });
            },
            (error) => this.setState({error: error.message, permissionState: false,}),
            {enableHighAccuracy: false, timeout: 20000, maximumAge: 1000},
        );
    }
    
    
    componentWillUnmount() {
        navigator.geolocation.clearWatch(this.watchID);
    }
    
    render() {
        var {height, width} = Dimensions.get('window');
        return (
            <View style={{height: 150, justifyContent: 'center'}}>
                {
                    this.state.permissionState === true ?
                        <MapView
                            minZoomLevel={16}
                            style={{height: 150, marginBottom: 5, marginTop: 5}}
                            region={{
                                latitude: this.state.latitude,
                                longitude: this.state.longitude,
                                latitudeDelta: 0.0922,
                                longitudeDelta: 0.0421
                            }}>
                            <MapView.Marker
                                coordinate={{
                                    latitude: (this.state.latitude + 0.00000),
                                    longitude: (this.state.longitude + 0.00000),
                                }}>
                                <View>
                                    <Icon name="place" size={40} color="#038FC0"/>
                                </View>
                            </MapView.Marker>
                        </MapView> :
                        <View style={{
                            borderWidth: 1,
                            borderColor: '#6f6f6f',
                            height: 150,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Text>No Permission for location</Text>
    
                        </View>
    
    
                }
    
            </View>
        );
    }
    }
    
    const styles = StyleSheet.create({
    map: {
        left:0,
        right:0,
        top:0,
        bottom:0,
        position:'absolute'
     }
    });
    
    export default Map;
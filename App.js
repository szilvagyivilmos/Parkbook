/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    View,
    AppRegistry,  
    Dimensions,
    PermissionsAndroid,
    Button,
    Linking 
} from 'react-native';
import MapView from 'react-native-maps'

const LAT_D = 0.0922
const LON_D = LAT_D*0.56 
var glat=0
var glon=0


//const localhost ="192.168.2.134"
const localhost ="192.168.43.60"
//const localhost="10.0.2.2"

const instructions = Platform.select({
    ios: 'Press Cmd+R to reload,\n' +
        'Cmd+D or shake for dev menu',
    android: 'Double tap R on your keyboard to reload,\n' +
        'Shake or press menu button for dev menu',
});

export default class App extends Component<{}> {

    constructor(props){
        super(props)

        this.state={
            initialPosition:{
                latitude:47.5,
                longitude:19,
                latitudeDelta:LAT_D,
                longitudeDelta:LON_D
            },
            ownPosition:{
                latitude:47.5,
                longitude:19
            },
            markers:[]
        }

        this.getSpots = this.getSpots.bind(this);
        this.sendPos = this.sendPos.bind(this);
        this.reload = this.reload.bind(this);
        this.getLocation = this.getLocation.bind(this);
        this.clearMarkers = this.clearMarkers.bind(this);  
        this.mapOnPress = this.mapOnPress.bind(this);        
        this.onMarkerPress = this.onMarkerPress.bind(this);        
        
        
    }

    watchID: ?number =null

    getLocation(){

        this.watchID= navigator.geolocation.watchPosition((position)=>{
            var lat=parseFloat(position.coords.latitude)
            var lon=parseFloat(position.coords.longitude)

            glat=lat
            glon=lon

            var lastRegion ={
                latitude: lat,
                longitude: lon,
                longitudeDelta: LON_D,
                latitudeDelta: LAT_D
            }

            alert(JSON.stringify(lastRegion))
            this.setState({initialPosition:lastRegion})
            this.setState({ownPosition:lastRegion})
        },(error)=>alert(error),{enableHighAccuracy:true,timeout:20000,maximumAge:10000})

    }

    componentDidMount(){

        //  this.getLocation()

        /////////////////////////////
        //FusedLocation.off(this.subscription);
        // FusedLocation.off(this.errSubscription);
        //FusedLocation.stopLocationUpdates();
        this.watchID= navigator.geolocation.watchPosition((position)=>{
            var lat=parseFloat(position.coords.latitude)
            var lon=parseFloat(position.coords.longitude)

            glat=lat
            glon=lon

            var lastRegion ={
                latitude: lat,
                longitude: lon,
                longitudeDelta: LON_D,
                latitudeDelta: LAT_D

            }
            alert(JSON.stringify(lastRegion))
            this.setState({initialPosition:lastRegion})
            this.setState({ownPosition:lastRegion})
        },(error)=>alert(error),{enableHighAccuracy:true,timeout:20,maximumAge:10})

    }

    componentWillUnount(){
        navigator.geolocation.clearWatch(this.watchID)
    }

    clearMarkers(){
        asd=[]
        this.setState({markers:asd})
    }

    getSpots(){

        fetch('http://'+localhost+':8000/api/park/', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        }).then((res) => {return res.json()})
        .then((json) => {
            this.setState({markers:json})
        }).catch((error) => {
        alert("Error:"+error);
        })

    }
    sendPos(){
        alert("Lat: "+glat+"\nLon: "+glon)
        fetch('http://'+localhost+':8000/api/addpark/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },


            body: JSON.stringify({
                lat: glat,
                lon: glon,
                uploaded_by:"react"})
        }).catch((error) => {
            alert(error.message);
        });

    }

    reload(){
        console.log("asd")
        this.getLocation()
        this.asd()     
    }

    mapOnPress(e){
        
        fetch('http://'+localhost+':8000/api/parkinrange/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }, 
            body: JSON.stringify({
                lon: e.nativeEvent.coordinate.longitude,
                lat: e.nativeEvent.coordinate.latitude,
                accuracy:0.1                             
            })
        })
        .then((res) => {return res.json()})
        .then((json) => {
            this.setState({markers:json})
            alert(this.state.markers)
        }).catch((error) => {
            alert("Error:"+error);
        })

    }   

    onMarkerPress(i){
        //alert(JSON.stringify(this.state.markers[i]))

        url="google.navigation:q="+this.state.markers[i].latitude+","+this.state.markers[i].longitude

        Linking.canOpenURL(url).then(supported => {
            if (supported) {
              Linking.openURL(url);
            } else {
             alert('Don\'t know how to open URI: ' + url);
            }
          });
        }
    render() {
        return (


            <View style={styles.container}>
                <MapView
                style={styles.map}
                region={this.state.initialPosition}
                showsMyLocationButton={true}
                loadingEnabled={true}
                onRegionChange={(region)=> this.setState({ initialPosition:region })}
                onLongPress={this.mapOnPress}
                showsUserLocation={true}
                >

                    {this.state.markers.map((marker,i) => (
                    <MapView.Marker
                        style={styles.marker}
                        coordinate={marker}
                        key={marker.key}
                        rotation={45}
                        onPress={(e) => {e.stopPropagation(); this.onMarkerPress(i)}}
                        />
                    ))}
                </MapView>


                <View style={{
                flex: 1,
                flexDirection: 'column',
                height:50

                }}>

                <Button
                style={{width: 50, height: 50, backgroundColor: 'powderblue'}}
                onPress={this.getSpots}
                title="Get Markers"
                />
                <Button
                 style={{width: 50, height: 50, backgroundColor: 'powderblue'}}
                 onPress={this.clearMarkers}
                 title="Clear Markers"
                />

                <Button
                style={{width: 50, height: 50, backgroundColor: 'powderblue'}}
                  onPress={this.sendPos}
                  title="setPos"
                />
                <Button
                style={{width: 50, height: 50, backgroundColor: 'powderblue'}}
                  onPress={this.reload}
                  title="Reload"
                />

                </View>
            </View>
          );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  button:{
    height:20,
    width:50
  },
  
  marker:{
    height:10,
    width:10,
    borderRadius:5,
    overflow:'hidden',
    alignItems: 'center',
    backgroundColor:'rgba(100,122,255,0.8)'

  },
  map:{
      left:0,
      right:0,
      top:0,
      bottom:0,
      position:'absolute'
  },
});

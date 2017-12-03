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
    Linking,
    TouchableHighlight
} from 'react-native';
import MapView from 'react-native-maps'
import ActionButton from 'react-native-action-button'
import Icon from 'react-native-vector-icons/Ionicons'
import RNGooglePlaces from 'react-native-google-places';
import Map from './components/Map.js'
import SearchBar from 'react-native-searchbar'

const LAT_D = 0.0922
const LON_D = LAT_D*0.56 
var glat=0
var glon=0
var window 

items = [
    1337,
    'janeway',
    {
      lots: 'of',
      different: {
        types: 0,
        data: false,
        that: {
          can: {
            be: {
              quite: {
                complex: {
                  hidden: [ 'gold!' ],
                },
              },
            },
          },
        },
      },
    },
    [ 4, 2, 'tree' ],
  ];
//const localhost ="192.168.2.141"
const localhost ="192.168.2.108"
//const localhost="10.0.2.2"


const BLUE="#2196f3"

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
                longitude:19.001,
                latitudeDelta:LAT_D,
                longitudeDelta:LON_D
            },
            ownPosition:{
                latitude:47.5,
                longitude:19
            },
            markers:[],
            destinationMarker:{
                coordinate:{
                    latitude:0,
                    longitude:0
                },
                shown:false
            },
            items,
            results: []

        }
        
        window = Dimensions.get('screen');

        
      
        this.sendPos = this.sendPos.bind(this);
        this.reload = this.reload.bind(this);
        this.getLocation = this.getLocation.bind(this);
        this.clearMarkers = this.clearMarkers.bind(this);  
        this.mapOnPress = this.mapOnPress.bind(this);        
        this.onMarkerPress = this.onMarkerPress.bind(this);     
        this.getSpots = this.getSpots.bind(this);     
        this.getAllSpots = this.getAllSpots.bind(this); 
        this.getNearestSpots = this.getNearestSpots.bind(this);      
        this._handleResults = this._handleResults.bind(this); 
        
        
        
        
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
        this.setState({destinationMarker:{shown:false}})
    }

    getAllSpots(){

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

    getSpots(latitude,longitude,acc,lim){

        fetch('http://'+localhost+':8000/api/parkinrange/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }, 
            body: JSON.stringify({
                lat: latitude,
                lon: longitude,
                accuracy:acc,
                limit:lim                             
            })
        })
        .then((res) => {return res.json()})
        .then((json) => {
            this.setState({markers:json})           
        }).catch((error) => {
            alert("Error:"+error);
        })
    }

    getNearestSpots(){
        
        this.getSpots(this.state.ownPosition.latitude,this.state.ownPosition.longitude,10,1)

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

        this.getSpots(e.nativeEvent.coordinate.latitude , e.nativeEvent.coordinate.longitude,0.1,200)

        dest={coordinate:e.nativeEvent.coordinate,
              shown:true
        }
        this.setState({destinationMarker:dest})

    }   

    onMarkerPress(i){

        var key=this.state.markers[i].key

        alert(key)

        fetch('http://'+localhost+':8000/api/delspot/', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               id:key})
        }).catch((error) => {
            alert(error.message);
        });
        
        url="google.navigation:q="+this.state.markers[i].latitude+","+this.state.markers[i].longitude

        Linking.canOpenURL(url).then(supported => {
            if (supported) {
              Linking.openURL(url);
            } else { alert('Don\'t know how to open URI: ' + url);}
        });

     
        
        
    }




    
      
      
      _handleResults(results) {
        this.setState({ results });
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
                        pinColor="#2088FF"
                        onPress={(e) => {e.stopPropagation(); this.onMarkerPress(i)}}
                        />
                    ))}


                   {(this.state.destinationMarker.shown)? <MapView.Marker   coordinate={this.state.destinationMarker.coordinate} /> :null}
                </MapView>

                <SearchBar
                ref={(ref) => this.searchBar = ref}
                data={items}
                handleResults={this._handleResults}
                showOnLoad
                />


                <View style={{
                flex: 1,
                flexDirection: 'column',
                height:50,
                justifyContent:"flex-end",
                paddingBottom:50

                }}>                
               
                    <Button style={{width: 50, height: 50, backgroundColor: 'powderblue'}}
                    onPress={this.reload}
                    title="Reload"
                    />
                    </View>
                                  
              
                    <ActionButton
                    buttonColor= {BLUE}                        
                    buttonText="P"
                    outRangeScale={2}
                    onLongPress={this.sendPos}
                    degrees={-25}
                    >

                        <ActionButton.Item buttonColor='#39a1f4' title="Nearest spot" onPress={this.getNearestSpots}>
                                <Text   style={styles.bubbleMenuText}>N</Text>
                        </ActionButton.Item>

                        <ActionButton.Item buttonColor='#39a1f4' title="Clear Markers" onPress={this.clearMarkers}>
                            <Text    style={styles.bubbleMenuText}>C</Text>
                        </ActionButton.Item>

                        <ActionButton.Item buttonColor='#39a1f4' title="Get Markers" onPress={this.getAllSpots}>
                            <Text   style={styles.bubbleMenuText}>G</Text>
                        </ActionButton.Item>

                    </ActionButton>

                
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
    bubbleMenuText:{
        color: 'white',
        fontSize:30.0
    }
});


/*
                <TouchableHighlight onPress={(e) => {e.stopPropagation();this.sendPos()}} style={{borderRadius: (window.width)/4,position: "absolute", bottom: -(window.width)/4, right: -(window.width*0.8)/4,}}>
                    <View style={{
                        
                        backgroundColor: BLUE,
                        width: (window.width)/2, 
                        height: (window.width)/2, 
                        borderRadius: (window.width)/4,                   
                    }} 
                     />
                </TouchableHighlight>
                <TouchableHighlight onPress={(e) => {e.stopPropagation();this.clearMarkers()}} style={{borderRadius: (window.width)/4, position: "absolute", bottom: -(window.width)/4, left: -(window.width*0.8)/4, }}>
                    <View style={{
                        
                        backgroundColor: BLUE,
                        width: (window.width)/2, 
                        height: (window.width)/2, 
                        borderRadius: (window.width)/4,                   
                    }} 
                     />
                </TouchableHighlight>
                <ActionButton
                        buttonColor= {BLUE}                        
                        buttonText="P"
                        outRangeScale={2}
                        onLongPress={this.sendPos}
                        degrees={-25}
                    >

                        <ActionButton.Item buttonColor='#39a1f4' title="Nearest spot" onPress={this.getNearestSpots}>
                                    <Icon name="android-notifications-none"  />
                        </ActionButton.Item>

                        <ActionButton.Item buttonColor='#39a1f4' title="Clear Markers" onPress={this.clearMarkers}>
                                    <Icon name="md-done-all"  />
                        </ActionButton.Item>

                        <ActionButton.Item buttonColor='#39a1f4' title="Get Markers" onPress={this.getAllSpots}>
                                <Icon name="android-create" />
                        </ActionButton.Item>
                
                
                    </ActionButton>

*/

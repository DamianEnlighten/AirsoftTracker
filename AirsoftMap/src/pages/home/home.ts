import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Device } from '@ionic-native/device';

import { LocationService } from '../../services/location.service';
import { OptionsPage } from '../options/options'

declare var google;

@Component({
    selector: 'home-page',
    templateUrl: 'home.html'
})
export class HomePage implements OnInit {

    @ViewChild('map') mapElement: ElementRef;
    map: any;
    player: any;
    updateTimer: any;
    deviceId: string;
    locations: any;
    code: string;
    errorMessage: string;
    name: string;
    markers: any;
    interval: number;
    updateLocation: string;
    updateInterval: any;

    iconBase = './assets/img/';
    icons = {
        self: {
            icon: {
                url: this.iconBase + 'self.png',
                scaledSize: new google.maps.Size(25, 25), // scaled size
                origin: new google.maps.Point(0, 0), // origin
                anchor: new google.maps.Point(12, 12) // anchor
            }
        },
        squad: {
            icon: {
                url: this.iconBase + 'squad.png',
                scaledSize: new google.maps.Size(25, 25), // scaled size
                origin: new google.maps.Point(0, 0), // origin
                anchor: new google.maps.Point(12, 12) // anchor
            }
        }
    };


    constructor(
        public navCtrl: NavController,
        public geolocation: Geolocation,
        private device: Device,
        private platform: Platform,
        private locationService: LocationService, ) {

        platform.ready().then(() => {
            if (device && device.uuid) {
                this.deviceId = device.uuid;
            }
            else {
                this.deviceId = "ID10T";
            }
        }, (err) => {
            console.log(err);
        });
    }

    ngOnInit(): void {
        this.code = localStorage.getItem('code');
        this.interval = parseInt(localStorage.getItem('interval'));
        this.name = localStorage.getItem('name');
        this.updateLocation = localStorage.getItem('update');
        if (!this.code) {
            this.code = '';
        }
        if (!this.interval) {
            this.interval = 60;
        }
        if (!this.name) {
            this.name = '';
        }
        if (!this.updateLocation) {
            this.updateLocation = 'true';
        }
        //read settings from localstorage

        this.markers = [];
    }

    ionViewDidLoad() {
        this.loadMap();
    }

    //North indicator->
    //lock to north or rotate map on rotate device.

    loadMap() {

        this.geolocation.getCurrentPosition().then((position) => {

            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            let mapOptions = {
                center: latLng,
                zoom: 18,
                mapTypeId: google.maps.MapTypeId.SATELLITE,
                disableDefaultUI: true
            }

            this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

            this.addPlayer(latLng);

            let location = {
                deviceId: this.deviceId,
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                code: this.code,
                name: this.name
            }

            //send updated user info to API
            if (this.updateLocation == 'true') {
                this.sendUpdatedLocation(location);
            }

            //get group locations
            this.getUpdateLocations(this.code);

            //start update timer
            this.updateInterval = setInterval(() => {
                //send updated user info to API
                if (this.updateLocation == 'true') {
                    this.updateMyLocation();
                }
                this.getUpdateLocations(this.code);
            }, 1000 * this.interval);

        }, (err) => {
            console.log(err);
        });

    }

    addPlayer(latLng) {

        this.player = new google.maps.Marker({
            map: this.map,
            icon: this.icons['self'].icon,
            label: {
                text: this.name,
                color: '#fff'
            },
            animation: google.maps.Animation.DROP,
            position: latLng
        });

    }

    updateMyLocation() {
        this.geolocation.getCurrentPosition().then((position) => {

            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            this.player.setPosition(latLng)

            let location = {
                deviceId: this.deviceId,
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                code: this.code,
                name: this.name
            }

            //send updated user info to API
            if (this.updateLocation == 'true') {
                this.sendUpdatedLocation(location);
            }

        }, (err) => {
            console.log(err);
        });
    }

    plotLocation(location) {

        let found = false;
        let index = 0;
        //Don't plot self
        if (location.deviceId === this.deviceId) {
            return;
        }

        for (var i = 0; i < this.markers.length; i++) {
            if (this.markers[i].id == location.deviceId) {
                found = true;
                index = i;
                break;
            }
        }

        let latLng = new google.maps.LatLng(location.lat, location.lng);

        //if marker exists move it otherwise add it to the map
        if (found) {
            this.markers[index].setPosition(latLng);
        }
        else {
            new google.maps.Marker({
                map: this.map,
                label: {
                    text: location.name,
                    color: '#fff'
                },
                icon: this.icons['squad'].icon,
                animation: google.maps.Animation.DROP,
                position: latLng,
                id: location.deviceId
            });
        }

    }

    resetPos() {
        //reset map center to user pin

        this.geolocation.getCurrentPosition().then((position) => {

            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            this.map.setCenter(latLng);

            //update pin 
            this.player.setPosition(latLng);

            let location = {
                deviceId: this.deviceId,
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                code: this.code,
                name: this.name
            }

            //send updated user info to API
            if (this.updateLocation == 'true') {
                this.sendUpdatedLocation(location);
            }

            this.getUpdateLocations(this.code);

        }, (err) => {
            console.log(err);
        });
    }

    options() {
        this.navCtrl.setRoot(OptionsPage);
    }

    getUpdateLocations(code) {
        this.locationService.getLocations(code).subscribe(
            (response) => {
                if (response.status == "200") {
                    this.locations = response.locations;
                    for (var i = 0; i < this.locations.length; i++) {
                        this.plotLocation(this.locations[i]);
                    }
                }
                else {
                    console.log(response)
                }
            },
            (error) => {
                this.errorMessage = <any>error
            }
        )
    }

    sendUpdatedLocation(location) {
        this.locationService.setLocation(location).subscribe(
            (response) => {
                if (response.status == "200") { }
                else {
                    console.log(response);
                }
            },
            (error) => {
                this.errorMessage = <any>error
            }
        );
    }
}
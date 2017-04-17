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
                this.name = "PC"
            }
        }, (err) => {
            console.log(err);
        });
    }

    ngOnInit(): void {
        //read settings from localstorage
        this.code = 'ghost';
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
            this.sendUpdatedLocation(location);

            //get group locations
            this.getUpdateLocations(this.code);

        }, (err) => {
            console.log(err);
        });

    }

    addPlayer(latLng) {

        this.player = new google.maps.Marker({
            map: this.map,
            icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 3
            },
            label: 'Name',
            animation: google.maps.Animation.DROP,
            position: latLng
        });

    }

    plotLocation(location) {
        //check if marker exists if yes move it, otherwise plot it
        //marker.setPosition(results[0].geometry.location);
        console.log("plotting locations");
        console.log(location);

        let found = false;
        let index = 0;

        for (var i = 0; i < this.markers.length; i++) {
            if (this.markers[i].id == location.deviceId) {
                found = true;
                index = i;
                break;
            }
        }

        let latLng = new google.maps.LatLng(location.lat, location.lng);

        if (found) {
            this.markers[index].setPosition(latLng);
        }
        else {
            new google.maps.Marker({
                map: this.map,
                label: location.name,
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
            this.sendUpdatedLocation(location);

        }, (err) => {
            console.log(err);
        });
    }

    options() {
        //open options menu
        this.navCtrl.push(OptionsPage);
    }

    getUpdateLocations(code): void {
        this.locationService.getLocations(code).subscribe(
            (response) => {
                console.log('get',response);
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
                console.log('send',response);
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
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Device } from '@ionic-native/device';

import { LocationService } from '../../services/location.service';

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

    constructor(
        public navCtrl: NavController,
        public geolocation: Geolocation,
        private device: Device,
        private platform: Platform,
        private locationService: LocationService) {

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
        this.code = 'ghost';
    }

    ionViewDidLoad() {
        this.loadMap();
    }

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

            this.addMarker(latLng);
            
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

    addMarker(latLng) {

        this.player = new google.maps.Marker({
            map: this.map,
            icon: {
                path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 3,
                fillColor: 'green'
            },
            labelContent: 'Name',
            labelAnchor: new google.maps.Point(15, 100),
            labelClass: "self", // the CSS class for the label
            animation: google.maps.Animation.DROP,
            position: latLng
        });

    }

    resetPos() {
        //reset map center to user pin

        this.geolocation.getCurrentPosition().then((position) => {

            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            this.map.setCenter(latLng);

            //update pin 
            this.player.setPosition(latLng);

        }, (err) => {
            console.log(err);
        });
    }

    options() {
        //open options menu
    }

    getUpdateLocations(code): void {
        this.locationService.getLocations(code).subscribe(
            (locations) => {
                this.locations = locations;
                console.log(this.locations);
            },
            (error) => {
                this.errorMessage = <any>error
            }
        )
    }

    sendUpdatedLocation(location) {
        this.locationService.setLocation(location).subscribe(
            (locations) => {
                this.locations = locations;
                console.log(this.locations);
            },
            (error) => {
                this.errorMessage = <any>error
            }
        );
    }
}
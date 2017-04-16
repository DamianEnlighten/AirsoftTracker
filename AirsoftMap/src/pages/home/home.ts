import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Platform } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';
import { Device } from '@ionic-native/device';

declare var google;

@Component({
    selector: 'home-page',
    templateUrl: 'home.html'
})
export class HomePage {

    @ViewChild('map') mapElement: ElementRef;
    map: any;
    player: any;
    updateTimer: any;
    deviceID: string;

    constructor(
        public navCtrl: NavController,
        public geolocation: Geolocation,
        private device: Device,
        private platform: Platform) {

        platform.ready().then(() => {
            this.deviceID = "ID10T"
            if (device) {
                this.deviceID = device.uuid;
            }
        }, (err) => {
            console.log(err);
        });
    }

    ionViewDidLoad() {
        this.loadMap();
    }

    loadMap() {

        this.geolocation.getCurrentPosition().then((position) => {

            let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            let mapOptions = {
                center: latLng,
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.SATELLITE,
                disableDefaultUI: true
            }

            this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

            this.addMarker(latLng);

            //send updated user info to API
            this.sendUpdatedLocation();

            //get group locations
            this.getUpdateLocations

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

    getUpdateLocations() {
        //get group locations
    }

    sendUpdatedLocation() {

    }
}
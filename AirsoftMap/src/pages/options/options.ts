import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { HomePage } from '../home/home';

/**
 * Generated class for the Options page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    templateUrl: 'options.html'
})
export class OptionsPage {
    name: string = localStorage.getItem('name');
    code: string = localStorage.getItem('code');
    updateLocation: string = localStorage.getItem('update');
    interval: string = localStorage.getItem('interval');

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams
    ) {

    }

    ionViewDidLoad() {
        if (this.updateLocation == null) {
            this.updateLocation = 'true';
        }
        if (!this.interval) {
            this.interval = '60';
        }
        if (!this.code) {
            this.code = '';
        }
        if (!this.name) {
            this.name = '';
        }
    }

    toggleLocation() {
        if (this.updateLocation !== 'true') {
            this.updateLocation = 'true';
        }
        else {
            this.updateLocation = 'false';
        }
    }

    resetSettings() {
        this.code = '';
        this.name = '';
        this.interval = '60';
        this.updateLocation = 'true';
    }

    saveSettings() {
        //update code
        localStorage.setItem('code', this.code);
        //update name
        localStorage.setItem('name', this.name);
        //update interval
        localStorage.setItem('interval', this.interval.toString());
        //Zoom level
        //Turn off location updates/ watch mode
        localStorage.setItem('update', this.updateLocation);

        this.back();
    }

    back() {
        this.navCtrl.setRoot(HomePage);
    }


}

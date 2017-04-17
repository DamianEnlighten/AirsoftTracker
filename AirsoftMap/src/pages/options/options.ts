import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

/**
 * Generated class for the Options page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
    selector: 'page-options',
    templateUrl: 'options.html',
})
export class OptionsPage {

    constructor(
        public navCtrl: NavController,
        public navParams: NavParams
    ) {

    }

    ionViewDidLoad() {
        //load options from local storage
    }

    //update code
    //update name
    //update interval
    //Zoom level
    //Turn off location updates/ watch mode

}

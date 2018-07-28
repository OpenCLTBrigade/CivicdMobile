import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { DatePicker } from '@ionic-native/date-picker';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { UserApiService } from "../../services/user-api.service";
import { EventsApiService } from "../../services/events-api.service";
import { TagsApiService } from "../../services/tags-api.service";
import { OrgApiService } from "../../services/org-api.service";

@IonicPage()
@Component({
  selector: 'page-org-post-event',
  templateUrl: 'org-post-event.html',
})
export class OrgPostEventPage {

  placeImage= "";
  imageLoad = false;
  imageUploaded = false;
  allTagsArr = [{Name:"Liberal"}, {Name:"Conservative"}, {Name:"Moderate"}, {Name:"Activism"}, {Name:"Transit"}, {Name:"Feminism"}, {Name:"Civil Rights"}, {Name:"Town Hall"}, {Name:"Net Neutrality"}, {Name:"Taxes"}, {Name:"Voting Rights"}, {Name:"Inequality"}, {Name:"Income Gap"}, {Name:"Socialism"}, {Name:"Libertarism"}, {Name:"Affordable Housing"}, {Name:"Healthcare"}, {Name:"Obesity"}, {Name:"Mental Health"}, {Name:"Entitlements"}, {Name:"Police"}, {Name:"Privacy"}, {Name:"Internet Connectivity"}, {Name:"Nutrition"}, {Name:"Social Media"}, {Name:"Grassroots"}, {Name:"Small Business"}];
  searchArr = [];
  selectedTagsArr = [];
  myInput = "";

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              private datePicker: DatePicker,
              public actionSheetCtrl: ActionSheetController,
              private camera: Camera,
              private userApiService: UserApiService,
              private eventsApiService: EventsApiService,
              private tagsApiService: TagsApiService,
              private orgApiService: OrgApiService) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad OrgPostEventPage');
    this.eventDate = "";

    this.tagsApiService.getTags()
    .subscribe(
      (data) => {
        console.log("data", data);
      },
      (err) => console.log("there was an error getting tags", err)
    )

    

  }

  ionViewCanEnter() {
    return this.userApiService.isLoggedIn();
  }

  eventDate;

  selectDate() {
    this.datePicker.show({
  titleText: "Select Event Date",
  date: new Date(),
  mode: 'datetime',
  androidTheme: this.datePicker.ANDROID_THEMES.THEME_HOLO_DARK
}).then(
  date => {
     console.log('Got date: ', date);
     this.eventDate = date;

  },
  err => {
    console.log("Got Error: ", err)
  }
);
  }

  // This function creates an action sheet with buttons for getting an image from phone library or taking one with the camera on their phone.
  uploadPic() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Image Source',
      buttons: [
        {
          text: "From Library",
          icon: "folder",
          handler: () => {
            this.imageLoad = true;
            const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            sourceType: 0
            }

            this.camera.getPicture(options).then((imageData) => {
             // imageData is either a base64 encoded string or a file URI
             // If it's base64:
             console.log("image data: ", imageData);
             let base64Image = 'data:image/jpeg;base64,' + imageData;
             console.log("Base64Img: ", base64Image);
             this.placeImage = base64Image;
             this.imageLoad = false;
             this.imageUploaded = true;
            }, (err) => {
             // Handle error
             console.log("got an error", err);
             this.imageLoad = false;
            });
          }
        },
        {
          text: "From Camera",
          icon: "camera",
          handler: () => {
            this.imageLoad = true;
            const options: CameraOptions = {
            quality: 100,
            destinationType: this.camera.DestinationType.DATA_URL,
            encodingType: this.camera.EncodingType.JPEG,
            mediaType: this.camera.MediaType.PICTURE,
            cameraDirection: 1,
            allowEdit: true
            }

            this.camera.getPicture(options).then((imageData) => {
             // imageData is either a base64 encoded string or a file URI
             // If it's base64:
             console.log("image data: ", imageData);
             let base64Image = 'data:image/jpeg;base64,' + imageData;
             console.log("Base64Img: ", base64Image);
             this.placeImage = base64Image;
             this.imageLoad = false;
             this.imageUploaded = true;
            }, (err) => {
             // Handle error
             console.log("got an error", err);
             this.imageLoad = false;
            });
          }
        },
        {
          text: "Cancel",
          role: "cancel"
        }
      ]
    });
    actionSheet.present();
  }

  setSearchItems() {
    //for putting the tags in the array that the search bar is pulling from.
    this.searchArr = [];
    for (var i = 0; i < this.allTagsArr.length; i++) {
      this.searchArr.push(this.allTagsArr[i]);
    }
    //removes tags that have already been selected from the search array.
    for(var j = 0; j < this.selectedTagsArr.length; j++) {
      this.searchArr = this.searchArr.filter((index) => index != this.selectedTagsArr[j]);
    }
  }

  //function being ran during each event like a keystrok in the search input field.
  onInput(event) {
    console.log("Got Input");
    let val = event.target.value;
    console.log(event.target.value);
    //if statement is to prevent the array being reset when we are doing a cancel event.
    if (val != undefined) {
    this.setSearchItems();
    }
    //checks to remove tags that do not match the string entered in the search input.
    if (val && val.trim() !== '') {
      this.searchArr = this.searchArr.filter(function(item) {
        return item.toLowerCase().includes(val.toLowerCase());
      });
    }
  }

  onCancel() {
    this.searchArr = [];
    console.log("GOT CANCEL");
  }
  onBlur() {
    setTimeout(() => {this.searchArr = []}, 0);
    this.myInput = "";
  }

  addTag(tag) {
    for (var i = 0; i < this.selectedTagsArr.length; i++) {
      if (tag == this.selectedTagsArr[i]) {
        var newSelectArray = this.selectedTagsArr.filter((index) => index != tag);
        this.selectedTagsArr = newSelectArray;
        return;
      }
    }
    this.selectedTagsArr.push(tag);
    this.searchArr=[];
  }

  isActive(tag) {
    //add or remove class depending on if the tag has been selected. set to tags displayed at the top of the page.
    for (var i = 0; i < this.selectedTagsArr.length; i++) {
      if (tag == this.selectedTagsArr[i]) {
        return true;
      }
    }
      return false;
  }

  submitEvent(form) {
    var postEventObj = {
      DisplayTitle: form.value.DisplayTitle,
      Description: form.value.Description,
      CategoryName: parseInt(form.value.CategoryName),
      PhotoUrl: "testPhotoUrl",
      StartTime: Date.now(),
      EndTime: "Test End Time",
      AddressDisplayName: form.value.AddressDisplayName,
      StreetAddressOne: form.value.StreetAddressOne,
      StreetAddressTwo: form.value.StreetAddressTwo,
      City: form.value.City,
      State: form.value.State,
      ZipCode: parseInt(form.value.ZipCode),
      Tags: this.selectedTagsArr
    };

    console.log(postEventObj);

    this.eventsApiService.postEvent(postEventObj)
    .subscribe(
      (info) => {
        console.log("success: ", info);
      },
      (err) => {
        console.log("there was an error creating the event", err);
      }
    )


  }

}

// (c) 2016 Markus Jochim <markus.jochim@phonetik.uni-muenchen.de>

import {Component, OnInit} from "@angular/core";
import {Router, ActivatedRoute} from "@angular/router";
import {
  ConferenceStoreService,
  Conference,
  isTextInputItem,
  isMultipleChoiceItem,
  isSingleChoiceItem
} from "../core/conference-store.service";

// TextDecoder is an experimental browser API
interface TextDecoder {
  decode(dataView:DataView);
}
interface TextDecoderConstructor {
  new (utfLabel?:string, options?:{fatal:boolean}):TextDecoder;
}
declare var TextDecoder:TextDecoderConstructor;

@Component({
  selector: 'app-conference',
  templateUrl: 'conference.component.html',
  styleUrls: ['conference.component.css'],
})
export class ConferenceComponent implements OnInit {
  conference:Conference;
  inputModel:Object = {};
  labels:Object = {
    headline: 'Anmeldung',
    submit: 'Abschicken',
    abort: 'Abbrechen',
    back: 'Zurück',
    submitQuestion: 'Soll die Anmeldung abgeschickt werden?'
  };

  sub:any;

  constructor(private router:Router, private route:ActivatedRoute, private _conferenceStore:ConferenceStoreService) {
  }

  ngOnInit() {
    // Get conference data
    this.sub = this.route.params.subscribe(params => {
      this.conference = this._conferenceStore.getConference(params['key']);
      this.sub = null;
    });

    if (this.conference === null) {
      // Go back if conference data could not be loaded
      this.router.navigate(['/']);
    } else {
      //////////
      // Initialise labels
      //
      for (let key in this.conference.labels) {
        this.labels[key] = this.conference.labels[key];
        console.log(key);
      }
      //
      //////////

      //////////
      // Initialise inputModel
      //
      this.inputModel['conferenceKey'] = this.conference.key;

      for (let i = 0; i < this.conference.registration.length; ++i) {
        let item = this.conference.registration[i];
        if (isTextInputItem(item)) {
          this.inputModel[item.key] = '';
        }

        if (isSingleChoiceItem(item)) {
          this.inputModel[item.key] = item.choices[0].key;
        }

        if (isMultipleChoiceItem(item)) {
          for (let j = 0; j < item.choices.length; ++j) {
            this.inputModel[item.choices[j].key] = false;
          }
        }
      }
      //
      //////////
    }
  }

  private submitToServer():Promise<string> {
    return new Promise<string>((resolve, reject) => {
      var request:XMLHttpRequest = new XMLHttpRequest();
      request.timeout = 20000; // milliseconds
      request.responseType = 'arraybuffer';

      request.open('GET', 'https://anmeldung.stuts.de/register.php?registration=' + JSON.stringify(this.inputModel));

      request.addEventListener('load', () => {
        if (request.response === null) {
          reject('Request repsonse is null');
        } else if (request.status < 200 || request.status >= 300) {
          reject('HTTP error: ' + request.status + '/' + request.statusText);
        } else {
          // @todo TextDecoder not supported in IE
          var dataView = new DataView(request.response);
          var decoder = new TextDecoder();
          var status = decoder.decode(dataView);

          if (status.substr(0,7) === 'SUCCESS') {
            resolve(decoder.decode(dataView));
          } else {
            reject();
          }
        }
      });

      request.addEventListener('error', () => {
        reject('Unknown error');
      });

      request.addEventListener('timeout', () => {
        reject('Timeout')
      });

      request.send();
    });
  }

  private submit() {
    console.log(JSON.stringify(this.inputModel));
    this.submitToServer().then((value) => {
      alert('Die Anmeldung wurde gespeichert.');
    }).catch((reason) => {
      alert('Die Anmeldung wurde NICHT gespeichert.');
    });
  }

  private navigateBack() {
    this.router.navigate(['/']);
  }
}

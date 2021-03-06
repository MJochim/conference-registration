// (c) 2016-2020 Markus Jochim <markus.jochim@phonetik.uni-muenchen.de>

import {Component, OnInit} from "@angular/core";
import {ActivatedRoute, Router} from "@angular/router";
import {ConferenceStoreService} from "../core/conference-store.service";
import {Conference} from "../core/conference.interface";
import {LabelList} from "../core/label-list.interface";
import { MatDialog } from "@angular/material/dialog";
import {UserConfirmationComponent} from "../user-confirmation/user-confirmation.component";
import {UserAlertComponent} from "../user-alert/user-alert.component";

// TextDecoder is an experimental browser API
interface TextDecoder {
	decode(dataView: DataView);
}
interface TextDecoderConstructor {
	new (utfLabel?: string, options?: { fatal: boolean }): TextDecoder;
}
declare var TextDecoder: TextDecoderConstructor;

@Component({
	selector: 'app-conference',
	templateUrl: 'conference.component.html',
	styleUrls: ['conference.component.css'],
})
export class ConferenceComponent implements OnInit {
	conference: Conference;
	inputModel = {};
	labels: LabelList = {
		headline: 'Anmeldung',
		submit: 'Abschicken',
		abort: 'Abbrechen',
		back: 'Zurück',
		submitQuestion: 'Soll die Anmeldung abgeschickt werden?',
		errorInvalidForm: 'Das Formular ist nicht richtig ausgefüllt. Bitte' +
		' noch einmal überprüfen!',
		errorDuringSubmission: 'Fehler bei der Anmeldung. Bitte noch einmal' +
		' versuchen!',
		registrationSuccessful: 'Vielen Dank für die Anmeldung. Du wirst in' +
		' Kürze eine E-Mail  erhalten.'
	};
	readonly: boolean = false;
	succesfullySaved: boolean = false;

	sub: any;

	constructor(private router: Router,
	            private route: ActivatedRoute,
	            private _conferenceStore: ConferenceStoreService,
	            private dialog: MatDialog) {
	}

	ngOnInit() {
		// Get conference data
		this.sub = this.route.params.subscribe(params => {
			this._conferenceStore.getConference(params['key'])
				.then(value => {
					this.conference = value;

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
					}
				})
				.catch(error => {
					this.router.navigate(['/']);
				});
			this.sub = null;
		});
	}

	private submitToServer(): Promise<void> {
		if (this.succesfullySaved) {
			// The app should never be in a state where successfullySaved is
			// true but submitToServer() is called
			return Promise.reject('Registration already sent');
		}

		return this._conferenceStore.register(this.conference.key, this.inputModel);
	}

	public confirm(form) {
		/**
		 * Try different APIs (reportValidity [which informs the user] and
		 * checkValidity [which does not inform the user]) for checking the
		 * user input
		 */
		if (form.reportValidity) {
			if (form.reportValidity() === false) {
				return;
			}
		} else {
			if (form.checkValidity === false) {
				this.dialog.open(UserAlertComponent, {
					data: {
						message: this.labels.errorInvalidForm
					}
				});
				return;
			}
		}

		// Validity checks have passed - ask user for final confirmation
		let dialogRef = this.dialog.open(UserConfirmationComponent, {
			data: {
				submitQuestion: this.labels.submitQuestion,
				submit: this.labels.submit,
				abort: this.labels.abort
			}
		});

		// Once user confirms, send data to server
		dialogRef.afterClosed().subscribe(result => {
			if (result === true) {
				console.log(JSON.stringify(this.inputModel));
				this.readonly = true;

				this.submitToServer().then((value) => {
					this.succesfullySaved = true;
					window.scrollTo(0, 0);
				}).catch((reason) => {
					this.readonly = false;

					this.dialog.open(UserAlertComponent, {
						data: {
							message: this.labels.errorDuringSubmission
						}
					});
				});
			}
		});
	}
}

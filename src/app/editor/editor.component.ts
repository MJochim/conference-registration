import {Component, OnInit} from "@angular/core";
import {ConferenceStoreService} from "../core/conference-store.service";
import {Conference} from "../core/conference.interface";
import {Subscription} from "rxjs/Subscription";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
	selector: 'confreg-editor',
	templateUrl: './editor.component.html',
	styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
	public conference: Conference;
	public previewMode: boolean = false;

	private sub: Subscription;

	constructor(private conferenceStoreService: ConferenceStoreService,
	            private route: ActivatedRoute,
	            private router: Router) {
		this.conference = {
			name: '',
			key: '',
			place: '',
			date: '',
			avatar: '',
			showBackButton: true,
			labels: {},
			registration: []
		};
	}

	async ngOnInit() {
		// Get conference data
		this.sub = this.route.params.subscribe(params => {
			this.conferenceStoreService.getConference(params['key'])
				.then(value => {
					if (value) {
						this.conference = value;
					} else {
						// Go back if conference data could not be loaded
						this.router.navigate(['/']);
					}
				})
				.catch(() => {
					this.router.navigate(['/']);
				});
		});
	}

	edited(event) {
		this.conference.registration = event;
		if (this.conference.key) {
			this.conferenceStoreService.pushConference(this.conference);
		}
	}
}

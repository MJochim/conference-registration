// (c) 2016-2020 Markus Jochim <markus.jochim@phonetik.uni-muenchen.de>

import {Component, Inject, OnInit} from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
	selector: 'confreg-user-alert',
	templateUrl: './user-alert.component.html',
	styleUrls: ['./user-alert.component.css']
})
export class UserAlertComponent implements OnInit {

	constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
	}

	ngOnInit() {
	}

}

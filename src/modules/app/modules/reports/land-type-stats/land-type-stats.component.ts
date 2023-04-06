import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ApiService } from '../../../../api/api.service';
import { IRegion } from '../../../../api/models/region.model';
import { IConton } from '../../../../api/models/conton.model';
import { IDistrict } from '../../../../api/models/district.model';
import { ILandType } from '../../../../api/models/land-type.model';
import { MessagesService } from '../../../../ui/components/services/messages.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-land-type-stats',
  templateUrl: './land-type-stats.component.html',
  styleUrls: ['./land-type-stats.component.scss'],
})
export class LandTypeStatsComponent implements OnInit {
  land_type: FormControl = new FormControl<number | null>({
    value: 2,
    disabled: true,
  });

  form: FormGroup = new FormGroup({
    region: new FormControl<string | null>(null),
    district: new FormControl<string | null>(null),
    conton: new FormControl<string | null>(null),
  });

  regions: IRegion[] = [];
  contons: IConton[] = [];
  districts: IDistrict[] = [];
  landTypes: ILandType[] = [];

  subscriptions: Subscription[] = [
    this.form.get('region')?.valueChanges.subscribe((value) => {
      this.handleRegionChange(value);
    }) as Subscription,
  ];

  constructor(private api: ApiService, private messages: MessagesService) {}

  ngOnInit() {
    this.getRegions();
    this.getDistricts();
    this.getContons();
    this.getLandTypes();
  }

  async getRegions(): Promise<void> {
    try {
      this.regions = await this.api.dictionary.getRegions();
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async getDistricts(regionId?: number) {
    const query = {
      ...(regionId && { region_id: regionId }),
    };
    try {
      this.districts = await this.api.dictionary.getDistricts(query);
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async getContons() {
    try {
      this.contons = await this.api.dictionary.getContons();
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async getLandTypes() {
    try {
      this.landTypes = await this.api.dictionary.getLandType();
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async handleRegionChange(value: number | null) {
    if (value != null) {
      await this.getDistricts(value);
    } else {
      await this.getDistricts();
    }
  }
}

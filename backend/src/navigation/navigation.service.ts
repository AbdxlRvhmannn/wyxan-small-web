import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PeopleService } from '../people/people.service.js';
import { Site, SiteDocument } from '../sites/schemas/site.schema.js';

export type NavigationGoBody = {
  personId?: string;
  address?: string;
};

export type NavigationGoResponse = {
  address: string;
  website: {
    address: string;
    title: string;
    html: string;
  };
  navigation: {
    canGoBack: boolean;
    canGoForward: boolean;
  };
};

@Injectable()
export class NavigationService {
  constructor(
    private readonly peopleService: PeopleService,
    @InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>,
  ) {}

  async go(body: NavigationGoBody): Promise<NavigationGoResponse> {
    const personId = body.personId?.trim();
    const rawAddress = body.address?.trim();

    if (!personId) {
      throw new BadRequestException('personId is required');
    }

    if (!rawAddress) {
      throw new BadRequestException('address is required');
    }

    await this.peopleService.findById(personId);

    const address = rawAddress.toLowerCase();
    const site = await this.siteModel.findOne({ address }).exec();
    if (!site) {
      throw new NotFoundException('Address not found');
    }

    return {
      address: site.address,
      website: {
        address: site.address,
        title: site.title,
        html: site.html,
      },
      navigation: {
        canGoBack: false,
        canGoForward: false,
      },
    };
  }
}

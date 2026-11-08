import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PeopleService } from '../people/people.service.js';
import { normalizeSiteAddress } from './address.validator.js';
import { extractSearchText } from './html-text-extractor.js';
import { sanitizePublishedHtml } from './html-sanitizer.js';
import { extractSiteTitle } from './html-title-extractor.js';
import { Site, SiteDocument } from './schemas/site.schema.js';

const MAX_HTML_BYTES = 512_000;

export type PublishSiteBody = {
  personId?: string;
  address?: string;
  html?: string;
};

export type PublishSiteResponse = {
  id: string;
  address: string;
  title: string;
  authorId: string;
  createdAt: string;
};

@Injectable()
export class SitesService {
  constructor(
    private readonly peopleService: PeopleService,
    @InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>,
  ) {}

  async publish(body: PublishSiteBody): Promise<PublishSiteResponse> {
    const personIdRaw = body.personId?.trim();
    if (!personIdRaw) {
      throw new BadRequestException('personId is required');
    }
    if (!Types.ObjectId.isValid(personIdRaw)) {
      throw new BadRequestException('Invalid person ID');
    }
    await this.peopleService.findById(personIdRaw);

    const address = normalizeSiteAddress(body.address ?? '');
    const htmlRaw = body.html?.trim() ?? '';
    if (!htmlRaw) {
      throw new BadRequestException('html is required');
    }
    const htmlBytes = Buffer.byteLength(htmlRaw, 'utf8');
    if (htmlBytes > MAX_HTML_BYTES) {
      throw new BadRequestException('html is too large');
    }

    const sanitizedHtml = sanitizePublishedHtml(htmlRaw);
    if (!sanitizedHtml.trim()) {
      throw new BadRequestException('html has no displayable content after sanitization');
    }

    const title = extractSiteTitle(sanitizedHtml, address);
    const searchText = extractSearchText(sanitizedHtml);

    try {
      const created = await this.siteModel.create({
        address,
        title,
        html: sanitizedHtml,
        searchText,
        authorId: new Types.ObjectId(personIdRaw),
      });

      return {
        id: created._id.toString(),
        address: created.address,
        title: created.title,
        authorId: personIdRaw,
        createdAt: (created.createdAt ?? new Date()).toISOString(),
      };
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException('Address already exists');
      }
      throw error;
    }
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code?: number }).code === 11000
    );
  }
}

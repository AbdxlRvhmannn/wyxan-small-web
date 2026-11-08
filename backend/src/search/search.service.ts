import {
  BadRequestException,
  Injectable,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Site, SiteDocument } from '../sites/schemas/site.schema.js';
import { extractSearchText } from '../sites/html-text-extractor.js';

const MAX_QUERY_LENGTH = 120;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

export type SearchResultItem = {
  siteId: string;
  address: string;
  title: string;
  excerpt: string;
  score: number;
};

export type SearchResponse = {
  query: string;
  total: number;
  results: SearchResultItem[];
};

type SiteSearchDocument = SiteDocument & { score?: number };

@Injectable()
export class SearchService implements OnModuleInit {
  constructor(
    @InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>,
  ) {}

  async onModuleInit(): Promise<void> {
    await this.siteModel.syncIndexes();
    await this.backfillSearchText();
  }

  async search(qRaw?: string, limitRaw?: string, pageRaw?: string): Promise<SearchResponse> {
    const query = this.normalizeQuery(qRaw);
    const limit = this.normalizeLimit(limitRaw);
    const page = this.normalizePage(pageRaw);
    const skip = (page - 1) * limit;

    const filter = { $text: { $search: query } };

    const [results, total] = await Promise.all([
      this.siteModel
        .find(filter, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit)
        .lean<SiteSearchDocument[]>(),
      this.siteModel.countDocuments(filter),
    ]);

    return {
      query,
      total,
      results: results.map((site) => ({
        siteId: String(site._id),
        address: site.address,
        title: site.title,
        excerpt: this.buildExcerpt(site.searchText || '', query),
        score: site.score ?? 0,
      })),
    };
  }

  async backfillSearchText(): Promise<void> {
    const sites = await this.siteModel
      .find({
        $or: [
          { searchText: { $exists: false } },
          { searchText: null },
          { searchText: '' },
        ],
      })
      .exec();

    if (sites.length === 0) {
      return;
    }

    await Promise.all(
      sites.map(async (site) => {
        site.searchText = extractSearchText(site.html);
        await site.save();
      }),
    );
  }

  private normalizeQuery(qRaw?: string): string {
    const trimmed = qRaw?.trim() ?? '';
    if (!trimmed) {
      throw new BadRequestException('Query is required');
    }
    if (trimmed.length > MAX_QUERY_LENGTH) {
      throw new BadRequestException('Query is too long');
    }
    if (!/[\p{L}\p{N}]/u.test(trimmed)) {
      throw new BadRequestException('Query is invalid');
    }
    return trimmed.replace(/"/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private normalizeLimit(limitRaw?: string): number {
    const parsed = limitRaw ? parseInt(limitRaw, 10) : DEFAULT_LIMIT;
    if (Number.isNaN(parsed) || parsed < 1) {
      return DEFAULT_LIMIT;
    }
    return Math.min(parsed, MAX_LIMIT);
  }

  private normalizePage(pageRaw?: string): number {
    const parsed = pageRaw ? parseInt(pageRaw, 10) : 1;
    if (Number.isNaN(parsed) || parsed < 1) {
      return 1;
    }
    return parsed;
  }

  private buildExcerpt(text: string, query: string): string {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (!normalized) {
      return '';
    }
    const tokens = query
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token.length > 0);
    const haystack = normalized.toLowerCase();
    let index = -1;
    let matchLength = 0;
    for (const token of tokens) {
      const found = haystack.indexOf(token);
      if (found !== -1) {
        index = found;
        matchLength = token.length;
        break;
      }
    }
    if (index === -1) {
      return normalized.slice(0, 160).trim();
    }
    const start = Math.max(0, index - 60);
    const end = Math.min(normalized.length, index + matchLength + 80);
    const prefix = start > 0 ? '…' : '';
    const suffix = end < normalized.length ? '…' : '';
    return `${prefix}${normalized.slice(start, end).trim()}${suffix}`;
  }
}

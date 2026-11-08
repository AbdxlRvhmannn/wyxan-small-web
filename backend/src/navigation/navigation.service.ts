import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import { Model, Types } from 'mongoose';
import { PeopleService } from '../people/people.service.js';
import { Site, SiteDocument } from '../sites/schemas/site.schema.js';
import {
  NavigationSession,
  NavigationSessionDocument,
} from './schemas/navigation-session.schema.js';
import { NavigationStackEntry } from './schemas/navigation-stack-entry.schema.js';
import {
  VisitHistory,
  VisitHistoryDocument,
  VisitNavigationType,
} from './schemas/visit-history.schema.js';

export type NavigationActionBody = {
  personId?: string;
  address?: string;
  scrollY?: number;
};

export type NavigationActionResponse = {
  entryId: string;
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
  scrollY: number;
};

export type NavigationCurrentResponse = NavigationActionResponse | {
  entryId: null;
  address: string;
  website: null;
  navigation: {
    canGoBack: boolean;
    canGoForward: boolean;
  };
  scrollY: number;
};

@Injectable()
export class NavigationService {
  constructor(
    private readonly peopleService: PeopleService,
    @InjectModel(Site.name) private readonly siteModel: Model<SiteDocument>,
    @InjectModel(NavigationSession.name)
    private readonly sessionModel: Model<NavigationSessionDocument>,
    @InjectModel(VisitHistory.name)
    private readonly visitHistoryModel: Model<VisitHistoryDocument>,
  ) {}

  async current(personIdRaw: string): Promise<NavigationCurrentResponse> {
    const personId = await this.requirePerson(personIdRaw);
    const session = await this.sessionModel
      .findOne({ personId })
      .exec();
    if (!session || session.currentIndex < 0 || session.stack.length === 0) {
      return {
        entryId: null,
        address: '',
        website: null,
        navigation: { canGoBack: false, canGoForward: false },
        scrollY: 0,
      };
    }
    return this.formatResponse(session);
  }

  async go(body: NavigationActionBody): Promise<NavigationActionResponse> {
    const personId = await this.requirePerson(body.personId);
    const rawAddress = body.address?.trim();
    if (!rawAddress) {
      throw new BadRequestException('address is required');
    }

    const site = await this.resolveSite(rawAddress);
    const scrollY = this.normalizeScrollY(body.scrollY);

    const session = await this.getOrCreateSession(personId);
    this.persistScrollOnCurrentEntry(session, scrollY);

    const truncated = session.stack.slice(0, session.currentIndex + 1);
    const entry = this.createStackEntry(site);
    truncated.push(entry);
    session.stack = truncated;
    session.currentIndex = truncated.length - 1;
    session.markModified('stack');
    await session.save();

    await this.appendVisitHistory(personId, entry, 'go');

    return this.formatResponse(session);
  }

  async jumpToVisit(
    personIdRaw: string,
    visitId: string,
    scrollY?: number,
  ): Promise<NavigationActionResponse> {
    const personId = await this.requirePerson(personIdRaw);
    const trimmedVisitId = visitId?.trim();
    if (!trimmedVisitId) {
      throw new BadRequestException('visitId is required');
    }

    const history = await this.visitHistoryModel.findOne({ personId }).exec();
    if (!history) {
      throw new NotFoundException('Visit not found');
    }

    const visit = history.visits.find(
      (item) =>
        item.visitId === trimmedVisitId || item.entryId === trimmedVisitId,
    );
    if (!visit) {
      throw new NotFoundException('Visit not found');
    }

    const site = await this.resolveSite(visit.address);
    const normalizedScrollY = this.normalizeScrollY(scrollY);

    const session = await this.getOrCreateSession(personId);
    this.persistScrollOnCurrentEntry(session, normalizedScrollY);

    const truncated = session.stack.slice(0, session.currentIndex + 1);
    const entry = this.createStackEntry(site);
    truncated.push(entry);
    session.stack = truncated;
    session.currentIndex = truncated.length - 1;
    session.markModified('stack');
    await session.save();

    await this.appendVisitHistory(personId, entry, 'jump');

    return this.formatResponse(session);
  }

  async back(body: NavigationActionBody): Promise<NavigationActionResponse> {
    const personId = await this.requirePerson(body.personId);
    const scrollY = this.normalizeScrollY(body.scrollY);

    const session = await this.getOrCreateSession(personId);
    if (session.stack.length === 0 || session.currentIndex <= 0) {
      if (session.stack.length === 0) {
        return this.emptyActionResponse();
      }
      return this.formatResponse(session);
    }

    this.persistScrollOnCurrentEntry(session, scrollY);
    session.currentIndex -= 1;
    session.markModified('stack');
    await session.save();

    return this.formatResponse(session);
  }

  async forward(body: NavigationActionBody): Promise<NavigationActionResponse> {
    const personId = await this.requirePerson(body.personId);
    const scrollY = this.normalizeScrollY(body.scrollY);

    const session = await this.getOrCreateSession(personId);
    if (session.stack.length === 0) {
      return this.emptyActionResponse();
    }
    if (session.currentIndex >= session.stack.length - 1) {
      return this.formatResponse(session);
    }

    this.persistScrollOnCurrentEntry(session, scrollY);
    session.currentIndex += 1;
    session.markModified('stack');
    await session.save();

    return this.formatResponse(session);
  }

  private async requirePerson(personIdRaw?: string): Promise<Types.ObjectId> {
    const id = personIdRaw?.trim();
    if (!id) {
      throw new BadRequestException('personId is required');
    }
    await this.peopleService.findById(id);
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid person ID');
    }
    return new Types.ObjectId(id);
  }

  private normalizeScrollY(scrollY?: number): number {
    if (typeof scrollY !== 'number' || Number.isNaN(scrollY) || scrollY < 0) {
      return 0;
    }
    return Math.floor(scrollY);
  }

  private async resolveSite(rawAddress: string): Promise<SiteDocument> {
    const address = rawAddress.toLowerCase();
    const site = await this.siteModel.findOne({ address }).exec();
    if (!site) {
      throw new NotFoundException('Address not found');
    }
    return site;
  }

  private async getOrCreateSession(
    personId: Types.ObjectId,
  ): Promise<NavigationSessionDocument> {
    let session = await this.sessionModel.findOne({ personId }).exec();
    if (!session) {
      session = await this.sessionModel.create({
        personId,
        stack: [],
        currentIndex: -1,
      });
    }
    return session;
  }

  private persistScrollOnCurrentEntry(
    session: NavigationSessionDocument,
    scrollY: number,
  ): void {
    if (session.currentIndex < 0 || session.currentIndex >= session.stack.length) {
      return;
    }
    session.stack[session.currentIndex].scrollY = scrollY;
  }

  private createStackEntry(site: SiteDocument): NavigationStackEntry {
    return {
      entryId: randomUUID(),
      address: site.address,
      website: {
        address: site.address,
        title: site.title,
        html: site.html,
      },
      scrollY: 0,
    };
  }

  private async appendVisitHistory(
    personId: Types.ObjectId,
    entry: NavigationStackEntry,
    navigationType: VisitNavigationType,
  ): Promise<void> {
    await this.visitHistoryModel.findOneAndUpdate(
      { personId },
      {
        $push: {
          visits: {
            visitId: randomUUID(),
            entryId: entry.entryId,
            address: entry.address,
            title: entry.website.title,
            visitedAt: new Date(),
            navigationType,
          },
        },
      },
      { upsert: true },
    );
  }

  private emptyActionResponse(): NavigationActionResponse {
    return {
      entryId: '',
      address: '',
      website: { address: '', title: '', html: '' },
      navigation: { canGoBack: false, canGoForward: false },
      scrollY: 0,
    };
  }

  private formatResponse(
    session: NavigationSessionDocument,
  ): NavigationActionResponse {
    const index = session.currentIndex;
    if (index < 0 || index >= session.stack.length) {
      return this.emptyActionResponse();
    }
    const entry = session.stack[index];
    return {
      entryId: entry.entryId,
      address: entry.address,
      website: {
        address: entry.website.address,
        title: entry.website.title,
        html: entry.website.html,
      },
      navigation: {
        canGoBack: index > 0,
        canGoForward: index >= 0 && index < session.stack.length - 1,
      },
      scrollY: entry.scrollY,
    };
  }
}

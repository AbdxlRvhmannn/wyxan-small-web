import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PeopleService } from '../people/people.service.js';
import { NavigationService } from '../navigation/navigation.service.js';
import {
  VisitHistory,
  VisitHistoryDocument,
  VisitHistoryEntry,
  VisitNavigationType,
} from '../navigation/schemas/visit-history.schema.js';

export type HistoryVisitDto = {
  visitId: string;
  address: string;
  title: string;
  visitedAt: string;
  navigationType: VisitNavigationType;
};

export type HistoryListResponse = {
  totalCount: number;
  visits: HistoryVisitDto[];
  nextCursor: string | null;
};

export type HistoryJumpBody = {
  visitId?: string;
  scrollY?: number;
};

type NormalizedVisit = VisitHistoryEntry & {
  visitId: string;
  title: string;
  navigationType: VisitNavigationType;
  visitedAt: Date;
};

@Injectable()
export class HistoryService {
  constructor(
    private readonly peopleService: PeopleService,
    private readonly navigationService: NavigationService,
    @InjectModel(VisitHistory.name)
    private readonly visitHistoryModel: Model<VisitHistoryDocument>,
  ) {}

  async list(
    personIdRaw: string,
    limitRaw?: string,
    cursor?: string,
  ): Promise<HistoryListResponse> {
    const personId = await this.requirePerson(personIdRaw);
    const limit = this.normalizeLimit(limitRaw);

    const history = await this.visitHistoryModel.findOne({ personId }).exec();
    if (!history || history.visits.length === 0) {
      return { totalCount: 0, visits: [], nextCursor: null };
    }

    const normalized = history.visits
      .map((visit) => this.normalizeVisit(visit))
      .filter((visit): visit is NormalizedVisit => visit !== null);
    normalized.sort((a, b) => {
      const timeDiff = b.visitedAt.getTime() - a.visitedAt.getTime();
      if (timeDiff !== 0) {
        return timeDiff;
      }
      return b.visitId.localeCompare(a.visitId);
    });

    const totalCount = normalized.length;
    let filtered = normalized;

    if (cursor) {
      const parsed = this.parseCursor(cursor);
      filtered = normalized.filter((visit) => this.isBeforeCursor(visit, parsed));
    }

    const slice = filtered.slice(0, limit + 1);
    const hasMore = slice.length > limit;
    const page = hasMore ? slice.slice(0, limit) : slice;

    return {
      totalCount,
      visits: page.map((visit) => this.toDto(visit)),
      nextCursor: hasMore ? this.encodeCursor(page[page.length - 1]) : null,
    };
  }

  async jump(personIdRaw: string, body: HistoryJumpBody) {
    const visitId = body.visitId?.trim();
    if (!visitId) {
      throw new BadRequestException('visitId is required');
    }

    await this.requirePerson(personIdRaw);
    const personObjectId = new Types.ObjectId(personIdRaw);

    const history = await this.visitHistoryModel.findOne({ personId: personObjectId }).exec();
    if (!history) {
      throw new NotFoundException('Visit not found');
    }

    const owned = history.visits.some(
      (visit) => visit.visitId === visitId || visit.entryId === visitId,
    );
    if (!owned) {
      throw new NotFoundException('Visit not found');
    }

    return this.navigationService.jumpToVisit(
      personIdRaw,
      visitId,
      body.scrollY,
    );
  }

  private async requirePerson(personIdRaw: string): Promise<Types.ObjectId> {
    const id = personIdRaw?.trim();
    if (!id || !Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid person ID');
    }
    await this.peopleService.findById(id);
    return new Types.ObjectId(id);
  }

  private normalizeLimit(limitRaw?: string): number {
    const parsed = limitRaw ? parseInt(limitRaw, 10) : 20;
    if (Number.isNaN(parsed) || parsed < 1) {
      return 20;
    }
    return Math.min(parsed, 50);
  }

  private normalizeVisit(visit: VisitHistoryEntry): NormalizedVisit | null {
    if (!visit?.address?.trim() || !visit?.entryId?.trim()) {
      return null;
    }
    const visitedAt = this.coerceVisitedAt(visit.visitedAt);
    if (!visitedAt) {
      return null;
    }
    return {
      ...visit,
      visitId: visit.visitId?.trim() || visit.entryId,
      title: visit.title?.trim() || visit.address,
      navigationType: visit.navigationType ?? 'go',
      visitedAt,
    };
  }

  private coerceVisitedAt(value: unknown): Date | null {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value;
    }
    if (typeof value === 'string' || typeof value === 'number') {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        return parsed;
      }
    }
    return null;
  }

  private toDto(visit: NormalizedVisit): HistoryVisitDto {
    return {
      visitId: visit.visitId,
      address: visit.address,
      title: visit.title,
      visitedAt: visit.visitedAt.toISOString(),
      navigationType: visit.navigationType,
    };
  }

  private encodeCursor(visit: NormalizedVisit): string {
    return `${visit.visitedAt.toISOString()}|${visit.visitId}`;
  }

  private parseCursor(cursor: string): { visitedAt: Date; visitId: string } {
    const [visitedAtRaw, visitId] = cursor.split('|');
    if (!visitedAtRaw || !visitId) {
      throw new BadRequestException('Invalid cursor');
    }
    const visitedAt = new Date(visitedAtRaw);
    if (Number.isNaN(visitedAt.getTime())) {
      throw new BadRequestException('Invalid cursor');
    }
    return { visitedAt, visitId };
  }

  private isBeforeCursor(
    visit: NormalizedVisit,
    cursor: { visitedAt: Date; visitId: string },
  ): boolean {
    const visitTime = visit.visitedAt.getTime();
    const cursorTime = cursor.visitedAt.getTime();
    if (visitTime < cursorTime) {
      return true;
    }
    if (visitTime > cursorTime) {
      return false;
    }
    return visit.visitId < cursor.visitId;
  }
}

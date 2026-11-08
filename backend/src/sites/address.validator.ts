import { BadRequestException } from '@nestjs/common';

const MAX_ADDRESS_LENGTH = 200;

const ADDRESS_PATTERN =
  /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+|wyxan:\/\/[a-z0-9][a-z0-9._/-]*)$/;

export function normalizeSiteAddress(raw: string): string {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) {
    throw new BadRequestException('address is required');
  }
  if (trimmed.length > MAX_ADDRESS_LENGTH) {
    throw new BadRequestException('address is too long');
  }
  if (!ADDRESS_PATTERN.test(trimmed)) {
    throw new BadRequestException('address is invalid');
  }
  return trimmed;
}

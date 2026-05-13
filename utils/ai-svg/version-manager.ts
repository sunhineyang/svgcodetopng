import { SvgVersion } from './types';
import { VERSION_CONFIG } from './constants';

export const createVersion = (
  code: string,
  description: string,
  isAiModified: boolean = false
): SvgVersion => {
  return {
    id: Date.now().toString(),
    code,
    timestamp: Date.now(),
    description,
    isCurrent: true,
    isAiModified,
  };
};

export const addVersion = (
  versions: SvgVersion[],
  newVersion: SvgVersion
): SvgVersion[] => {
  const updated = versions.map((v) => ({ ...v, isCurrent: false }));
  const withNew = [...updated, newVersion];

  if (withNew.length > VERSION_CONFIG.MAX_VERSIONS) {
    return withNew.slice(-VERSION_CONFIG.MAX_VERSIONS);
  }

  return withNew;
};

export const rollbackToVersion = (
  versions: SvgVersion[],
  versionId: string
): { versions: SvgVersion[]; code: string } | null => {
  const targetVersion = versions.find((v) => v.id === versionId);

  if (!targetVersion) {
    return null;
  }

  const updated = versions.map((v) => ({
    ...v,
    isCurrent: v.id === versionId,
  }));

  return {
    versions: updated,
    code: targetVersion.code,
  };
};

export const getCurrentVersion = (
  versions: SvgVersion[]
): SvgVersion | null => {
  return versions.find((v) => v.isCurrent) || null;
};
